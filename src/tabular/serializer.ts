// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import {
  createCell,
  createWorksheet,
  normalizeRows,
} from "../model/workbook.js";
import { CellType } from "../model/types.js";
import { isVectorString, deserializeVector } from "../utils/vectors.js";
import { excelDateToJS } from "../utils/dates.js";

/**
 * Convert an array of plain objects into a worksheet.
 *
 * The union of object keys becomes the header row. Nested objects are encoded
 * as JSON strings. You can override column typing for cases such as vectors or
 * date coercion.
 *
 * @param {Array<Object>} rows Array of row objects.
 * @param {{ name?: string, columns?: Record<string, { type: string }> }} [options]
 * @returns {import("../model/workbook.js").Worksheet}
 */
export function sheetFromRows(rows, options = {}) {
  const sheetName = options.name ?? "Sheet1";

  if (rows.length === 0) {
    return createWorksheet(sheetName, []);
  }

  // Build column union from all rows so keys absent from the first row are not lost
  const columnSet = new Set();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      columnSet.add(key);
    }
  }
  const columnNames = [...columnSet];
  const columnOverrides = options.columns ?? {};

  const headerRow = columnNames.map((name) => createCell(name));

  const dataRows = rows.map((row) =>
    columnNames.map((colName) => {
      const value = row[colName];

      if (value === null || value === undefined) {
        return createCell(null, null, CellType.EMPTY);
      }

      const override = columnOverrides[colName];
      if (override) {
        return applyOverride(value, override.type);
      }

      // Handle nested objects/non-primitives by JSON-stringifying
      if (
        typeof value === "object" &&
        !(value instanceof Date) &&
        !Array.isArray(value)
      ) {
        return createCell(JSON.stringify(value));
      }

      return createCell(value);
    }),
  );

  const allRows = normalizeRows([headerRow, ...dataRows]);
  return createWorksheet(sheetName, allRows);
}

/**
 * Apply a column type override to a value before writing it into the workbook.
 *
 * @param {*} value
 * @param {string} type
 * @returns {import("../model/workbook.js").Cell}
 */
function applyOverride(value, type) {
  switch (type) {
    case CellType.VECTOR: {
      if (Array.isArray(value)) {
        return createCell(value, null, CellType.VECTOR);
      }
      if (typeof value === "string" && isVectorString(value)) {
        return createCell(deserializeVector(value), null, CellType.VECTOR);
      }
      return createCell(value, null, CellType.VECTOR);
    }
    case CellType.DATE: {
      if (value instanceof Date) {
        return createCell(value, null, CellType.DATE);
      }
      if (typeof value === "string") {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          throw new Error(`Invalid date string: "${value}"`);
        }
        return createCell(date, null, CellType.DATE);
      }
      if (typeof value === "number") {
        return createCell(excelDateToJS(value), null, CellType.DATE);
      }
      return createCell(value, null, CellType.DATE);
    }
    default:
      return createCell(value, null, type);
  }
}
