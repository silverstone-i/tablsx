// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { XMLParser } from "fast-xml-parser";
import { createCell } from "../model/workbook.js";
import { CellType } from "../model/types.js";
import { decodeCellRef } from "../utils/cell-ref.js";
import { excelDateToJS } from "../utils/dates.js";

/**
 * Parse a worksheet XML and return a 2D array of Cell objects.
 * @param {string} xml - The worksheet XML string
 * @param {string[]} sharedStrings - The shared strings table
 * @param {Set<number>} [dateStyles] - Set of xf indices that are date-formatted
 * @returns {Array<Array<object>>}
 */
export function parseWorksheet(xml, sharedStrings, dateStyles = new Set()) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    isArray: (name) => name === "row" || name === "c",
    // Preserve leading/trailing whitespace in values
    trimValues: false,
  });

  const parsed = parser.parse(xml);
  const sheetData = parsed?.worksheet?.sheetData;
  if (!sheetData) return [];

  const xmlRows = sheetData.row;
  if (!xmlRows) return [];

  // First pass: determine dimensions
  let maxRow = 0;
  let maxCol = 0;
  const cellData = [];

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
      let row, col;
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
      d.row = rowMap.get(d.row);
      d.col = colMap.get(d.col);
    }
  }

  // Build the 2D array
  const rows = [];
  for (let r = 0; r <= maxRow; r++) {
    const row = [];
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

    let value = null;
    let formula = null;
    let type = CellType.EMPTY;

    // Handle formula
    if (f !== undefined) {
      formula = typeof f === "object" ? (f["#text"] ?? null) : String(f);
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
        const tVal = Array.isArray(is.t) ? is.t[0] : is.t;
        value =
          typeof tVal === "object"
            ? String(tVal["#text"] ?? "")
            : String(tVal ?? "");
      } else if (is?.r) {
        const runs = Array.isArray(is.r) ? is.r : [is.r];
        value = "";
        for (const run of runs) {
          const tVal = Array.isArray(run.t) ? run.t[0] : run.t;
          value +=
            typeof tVal === "object"
              ? String(tVal["#text"] ?? "")
              : String(tVal ?? "");
        }
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

    rows[row][col] = createCell(value, formula, type);
  }

  return rows;
}
