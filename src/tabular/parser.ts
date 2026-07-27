// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { CellType } from "../model/types.js";
import { isVectorString, deserializeVector } from "../utils/vectors.js";
import { excelDateToJS } from "../utils/dates.js";

/**
 * Convert a worksheet into an array of plain objects.
 *
 * The first row is treated as headers. Duplicate header names are
 * disambiguated with `_2`, `_3`, and so on.
 *
 * @param {import("../model/workbook.js").Worksheet} sheet
 * @param {{ columns?: Record<string, { type: string }> }} [options]
 * @returns {Array<Object>}
 */
export function rowsFromSheet(sheet, options = {}) {
  if (!sheet.rows || sheet.rows.length <= 1) {
    return [];
  }

  const rawHeaders = sheet.rows[0].map((cell) =>
    cell.value == null ? "" : String(cell.value),
  );

  // Disambiguate duplicate header names by appending _2, _3, etc.
  const seen = new Map();
  const headers = rawHeaders.map((name) => {
    const count = seen.get(name) ?? 0;
    seen.set(name, count + 1);
    return count === 0 ? name : `${name}_${count + 1}`;
  });

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
