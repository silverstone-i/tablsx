// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { CellType } from "../model/types.js";
import { isVectorString, deserializeVector } from "../utils/vectors.js";
import { excelDateToJS } from "../utils/dates.js";

/**
 * Convert a Worksheet into an array of plain objects.
 * The first row is used as property keys.
 * @param {{ name: string, rows: Array<Array<{ value: *, formula: string|null, type: string }>> }} sheet
 * @param {{ columns?: Record<string, { type: string }> }} [options]
 * @returns {Array<Object>}
 */
export function rowsFromSheet(sheet, options = {}) {
  if (!sheet.rows || sheet.rows.length <= 1) {
    return [];
  }

  const headers = sheet.rows[0].map((cell) => String(cell.value));
  const columnOverrides = options.columns ?? {};
  const dataRows = sheet.rows.slice(1);

  return dataRows.map((row) => {
    const obj = {};
    for (let i = 0; i < headers.length; i++) {
      const key = headers[i];
      const cell = row[i];

      if (!cell || cell.type === CellType.EMPTY) {
        obj[key] = null;
        continue;
      }

      const override = columnOverrides[key];
      if (override) {
        obj[key] = resolveWithOverride(cell, override.type);
        continue;
      }

      obj[key] = cell.value;
    }
    return obj;
  });
}

/**
 * Resolve a cell value with a column type override applied.
 * @param {{ value: *, type: string }} cell
 * @param {string} overrideType
 * @returns {*}
 */
function resolveWithOverride(cell, overrideType) {
  switch (overrideType) {
    case CellType.VECTOR: {
      if (cell.type === CellType.VECTOR) {
        return cell.value;
      }
      if (cell.type === CellType.STRING && isVectorString(cell.value)) {
        return deserializeVector(cell.value);
      }
      return cell.value;
    }
    case CellType.DATE: {
      if (cell.type === CellType.DATE) {
        return cell.value;
      }
      if (cell.type === CellType.NUMBER) {
        return excelDateToJS(cell.value);
      }
      return cell.value;
    }
    default:
      return cell.value;
  }
}
