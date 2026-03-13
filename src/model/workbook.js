// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { CellType, inferType } from "./types.js";

/**
 * Create a Cell object.
 * @param {*} value
 * @param {string|null} [formula]
 * @param {string} [type]
 * @returns {{ value: *, formula: string|null, type: string }}
 */
export function createCell(value = null, formula = null, type) {
  if (!type) {
    if (formula) {
      type = CellType.FORMULA;
    } else {
      type = inferType(value);
    }
  }
  return { value, formula: formula || null, type };
}

/**
 * Create a Worksheet object.
 * @param {string} name
 * @param {Array<Array<object>>} [rows]
 * @returns {{ name: string, rows: Array<Array<object>> }}
 */
export function createWorksheet(name, rows = []) {
  return { name, rows };
}

/** Characters that Excel forbids in sheet names. */
const INVALID_SHEET_NAME_CHARS = /[[\]:*?/\\]/;

/**
 * Validate sheet names for Excel compatibility.
 * Checks for duplicates, length > 31, and invalid characters.
 * @param {Array<{ name: string }>} sheets
 * @throws {Error} if any name is invalid
 */
export function validateSheetNames(sheets) {
  const names = new Set();
  for (const sheet of sheets) {
    const name = sheet.name;
    if (names.has(name)) {
      throw new Error(`Duplicate sheet name: "${name}"`);
    }
    if (name.length > 31) {
      throw new Error(
        `Sheet name "${name}" exceeds Excel's 31-character limit`,
      );
    }
    const match = name.match(INVALID_SHEET_NAME_CHARS);
    if (match) {
      throw new Error(
        `Sheet name "${name}" contains invalid character: "${match[0]}"`,
      );
    }
    names.add(name);
  }
}

/**
 * Create a Workbook object.
 * @param {Array<object>} [sheets]
 * @returns {{ sheets: Array<object> }}
 */
export function createWorkbook(sheets = []) {
  validateSheetNames(sheets);
  return { sheets };
}

/**
 * Normalize rows so all rows have the same length, padded with empty cells.
 * @param {Array<Array<object>>} rows
 * @returns {Array<Array<object>>}
 */
export function normalizeRows(rows) {
  if (rows.length === 0) return rows;
  const maxCols = Math.max(...rows.map((r) => r.length));
  return rows.map((row) => {
    if (row.length === maxCols) return row;
    const padded = [...row];
    while (padded.length < maxCols) {
      padded.push(createCell(null, null, CellType.EMPTY));
    }
    return padded;
  });
}
