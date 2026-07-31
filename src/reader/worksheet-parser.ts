// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { XMLParser } from "fast-xml-parser";
import { createCell } from "../model/workbook.js";
import { CellType } from "../model/types.js";
import type { CellValue, Row } from "../model/types.js";
import { decodeCellRef } from "../utils/cell-ref.js";
import { excelDateToJS } from "../utils/dates.js";
import type { XmlCell, XmlText, XmlWorksheetDoc } from "./xml-types.js";

/** A parsed cell with its resolved grid position. */
interface PositionedCell {
  row: number;
  col: number;
  cell: XmlCell;
}

/**
 * Extract the plain text from a parsed `<t>` value.
 */
function textValue(val: XmlText | undefined): string {
  return typeof val === "object"
    ? String(val["#text"] ?? "")
    : String(val ?? "");
}

/**
 * Parse a worksheet XML and return a 2D array of Cell objects.
 *
 * @param xml The worksheet XML string.
 * @param sharedStrings The shared strings table.
 * @param dateStyles Set of xf indices that are date-formatted.
 */
export function parseWorksheet(
  xml: string,
  sharedStrings: string[],
  dateStyles = new Set<number>(),
): Row[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    isArray: (name): boolean => name === "row" || name === "c",
    // Preserve leading/trailing whitespace in values
    trimValues: false,
  });

  const parsed = parser.parse(xml) as XmlWorksheetDoc;
  const sheetData = parsed?.worksheet?.sheetData;
  if (!sheetData) return [];

  const xmlRows = sheetData.row;
  if (!xmlRows) return [];

  // First pass: determine dimensions
  let maxRow = -1;
  let maxCol = 0;
  const cellData: PositionedCell[] = [];

  for (const xmlRow of xmlRows) {
    const cells = xmlRow.c;
    if (!cells) continue;

    // Track implicit column position for cells missing the r attribute.
    // The row index comes from the row's r attribute (1-based) or from
    // document order when the row also lacks an r attribute.
    const rowRef = xmlRow["@_r"];
    const implicitRow = rowRef ? Number(rowRef) - 1 : maxRow + 1;
    let nextCol = 0;

    for (const cell of cells) {
      const ref = cell["@_r"];
      let row: number, col: number;
      if (ref) {
        ({ row, col } = decodeCellRef(ref));
        nextCol = col + 1;
      } else {
        row = implicitRow;
        col = nextCol++;
      }
      maxRow = Math.max(maxRow, row);
      maxCol = Math.max(maxCol, col);
      cellData.push({ row, col, cell });
    }
  }

  if (cellData.length === 0) return [];

  // Safety: prevent OOM from sparse workbooks with far-out cell refs.
  // A single cell at XFD1048576 would otherwise allocate a dense grid
  // of ~17 billion cells. Cap to a reasonable maximum.
  const MAX_DENSE_CELLS = 10_000_000;
  const denseSize = (maxRow + 1) * (maxCol + 1);
  if (denseSize > MAX_DENSE_CELLS) {
    // Compact the grid to only span the actual data extent
    const usedRows = new Set(cellData.map((d) => d.row));
    const usedCols = new Set(cellData.map((d) => d.col));
    const sortedRows = [...usedRows].sort((a, b) => a - b);
    const sortedCols = [...usedCols].sort((a, b) => a - b);
    const rowMap = new Map(sortedRows.map((r, i) => [r, i]));
    const colMap = new Map(sortedCols.map((c, i) => [c, i]));
    maxRow = sortedRows.length - 1;
    maxCol = sortedCols.length - 1;
    for (const d of cellData) {
      // Every d.row/d.col was collected into the maps above.
      d.row = rowMap.get(d.row)!;
      d.col = colMap.get(d.col)!;
    }
  }

  // Build the 2D array
  const rows: Row[] = [];
  for (let r = 0; r <= maxRow; r++) {
    const row: Row = [];
    for (let c = 0; c <= maxCol; c++) {
      row.push(createCell(null, null, CellType.EMPTY));
    }
    rows.push(row);
  }

  // Second pass: populate cells
  for (const { row, col, cell } of cellData) {
    const t = cell["@_t"];
    const s = cell["@_s"] !== undefined ? Number(cell["@_s"]) : -1;
    const v = cell.v;
    const f = cell.f;

    let value: CellValue = null;
    let formula: string | null = null;
    let type: CellType = CellType.EMPTY;

    // Handle formula
    if (f !== undefined) {
      if (typeof f === "object") {
        const text = f["#text"];
        formula = text === undefined ? null : String(text);
      } else {
        formula = String(f);
      }
      // Formula can be an empty string for shared formulas, etc.
      if (formula === "") formula = null;
    }

    if (t === "s") {
      // Shared string
      const idx = parseInt(String(v), 10);
      value = sharedStrings[idx] ?? "";
      type = CellType.STRING;
    } else if (t === "inlineStr") {
      // Inline string
      const is = cell.is;
      if (is?.t !== undefined) {
        value = textValue(Array.isArray(is.t) ? is.t[0] : is.t);
      } else if (is?.r) {
        const runs = Array.isArray(is.r) ? is.r : [is.r];
        let text = "";
        for (const run of runs) {
          text += textValue(Array.isArray(run.t) ? run.t[0] : run.t);
        }
        value = text;
      } else {
        value = "";
      }
      type = CellType.STRING;
    } else if (t === "b") {
      // Boolean
      value = String(v) === "1";
      type = CellType.BOOLEAN;
    } else if (t === "e") {
      // Error
      value = String(v ?? "");
      type = CellType.STRING;
    } else if (t === "str") {
      // Formula string result
      value = String(v ?? "");
      type = formula ? CellType.FORMULA : CellType.STRING;
    } else {
      // Number or date (t="n" or absent)
      if (v !== undefined && v !== null && v !== "") {
        const num = Number(v);
        if (!isNaN(num)) {
          if (s >= 0 && dateStyles.has(s)) {
            value = excelDateToJS(num);
            type = CellType.DATE;
          } else {
            value = num;
            type = CellType.NUMBER;
          }
        } else {
          value = String(v);
          type = CellType.STRING;
        }
      }
    }

    // If we have a formula, override type
    if (formula) {
      type = CellType.FORMULA;
    }

    // If value is still null and no formula, it's empty
    if (value === null && !formula) {
      type = CellType.EMPTY;
    }

    // The dense grid spans every collected row/col index.
    rows[row]![col] = createCell(value, formula, type);
  }

  return rows;
}
