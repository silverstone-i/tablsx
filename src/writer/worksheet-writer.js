// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { encodeCellRef } from "../utils/cell-ref.js";
import { escapeXml } from "../utils/xml.js";
import { CellType } from "../model/types.js";
import { jsDateToExcel } from "../utils/dates.js";
import { serializeVector } from "../utils/vectors.js";
import { DATE_STYLE_INDEX } from "./styles-writer.js";

/**
 * Generate xl/worksheets/sheetN.xml content.
 * @param {{ rows: Array<Array<{ value: *, formula: string|null, type: string }>> }} sheet
 * @param {Map<string, number>} sharedStringsMap
 * @returns {string}
 */
export function generateWorksheetXml(sheet, sharedStringsMap) {
  const parts = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
    "<sheetData>",
  ];

  for (let r = 0; r < sheet.rows.length; r++) {
    const row = sheet.rows[r];
    parts.push(`<row r="${r + 1}">`);

    for (let c = 0; c < row.length; c++) {
      const cell = row[c];
      const ref = encodeCellRef(r, c);

      if (cell.type === CellType.EMPTY) {
        continue;
      }

      if (cell.type === CellType.STRING) {
        const idx = sharedStringsMap.get(String(cell.value));
        if (idx !== undefined) {
          parts.push(`<c r="${ref}" t="s"><v>${idx}</v></c>`);
        } else {
          // String not in shared strings table (e.g. null value) — write inline
          parts.push(
            `<c r="${ref}" t="inlineStr"><is><t>${escapeXml(String(cell.value ?? ""))}</t></is></c>`,
          );
        }
      } else if (cell.type === CellType.NUMBER) {
        parts.push(`<c r="${ref}"><v>${cell.value}</v></c>`);
      } else if (cell.type === CellType.BOOLEAN) {
        parts.push(`<c r="${ref}" t="b"><v>${cell.value ? 1 : 0}</v></c>`);
      } else if (cell.type === CellType.DATE) {
        const serial =
          cell.value instanceof Date
            ? jsDateToExcel(cell.value)
            : Number(cell.value);
        parts.push(
          `<c r="${ref}" s="${DATE_STYLE_INDEX}"><v>${serial}</v></c>`,
        );
      } else if (cell.type === CellType.VECTOR) {
        const str = Array.isArray(cell.value)
          ? serializeVector(cell.value)
          : String(cell.value);
        const idx = sharedStringsMap.get(str);
        if (idx !== undefined) {
          parts.push(`<c r="${ref}" t="s"><v>${idx}</v></c>`);
        } else {
          parts.push(
            `<c r="${ref}" t="inlineStr"><is><t>${escapeXml(str)}</t></is></c>`,
          );
        }
      } else if (cell.type === CellType.FORMULA) {
        let cellXml = `<c r="${ref}"`;
        if (typeof cell.value === "string") {
          cellXml += ' t="str"';
        }
        cellXml += ">";
        if (cell.formula) {
          cellXml += `<f>${escapeXml(cell.formula)}</f>`;
        }
        if (cell.value !== null && cell.value !== undefined) {
          cellXml += `<v>${escapeXml(String(cell.value))}</v>`;
        }
        cellXml += "</c>";
        parts.push(cellXml);
      } else {
        throw new Error(`Unsupported cell type: ${cell.type}`);
      }
    }

    parts.push("</row>");
  }

  parts.push("</sheetData>");
  parts.push("</worksheet>");
  return parts.join("");
}
