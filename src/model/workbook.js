// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { CellType, inferType } from "./types.js";

/**
 * A normalized cell in the `tablsx` workbook model.
 * @typedef {object} Cell
 * @property {*} value Raw JavaScript value for the cell.
 * @property {string|null} formula Excel formula without a leading `=`, or `null`.
 * @property {string} type Normalized cell type from {@link CellType}.
 */

/**
 * A worksheet in the `tablsx` workbook model.
 * @typedef {object} Worksheet
 * @property {string} name Excel-visible worksheet name.
 * @property {Array<Array<Cell>>} rows Rectangular row-major cell data.
 */

/**
 * A workbook in the `tablsx` workbook model.
 * @typedef {object} Workbook
 * @property {Array<Worksheet>} sheets Worksheets in workbook order.
 */

/**
 * Create a normalized cell object.
 *
 * If `type` is omitted, the function infers it from `value`. When `formula`
 * is provided without an explicit type, the cell type becomes `formula`.
 *
 * @param {*} [value=null] Raw JavaScript value to store in the cell.
 * @param {string|null} [formula=null] Excel formula text without a leading `=`.
 * @param {string} [type] Explicit cell type from {@link CellType}.
 * @returns {Cell}
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
 * Create a worksheet object.
 *
 * @param {string} name
 * @param {Array<Array<Cell>>} [rows=[]]
 * @returns {Worksheet}
 */
export function createWorksheet(name, rows = []) {
  return { name, rows };
}

/** Characters that Excel forbids in sheet names. */
const INVALID_SHEET_NAME_CHARS = /[[\]:*?/\\]/;

/**
 * Validate worksheet names for Excel compatibility.
 *
 * Checks for duplicate names, names longer than 31 characters, and invalid
 * characters forbidden by Excel.
 *
 * @param {Array<{ name: string }>} sheets Worksheets to validate.
 * @throws {Error} Thrown when any worksheet name violates Excel constraints.
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
 * Create a workbook object and validate sheet naming rules.
 *
 * @param {Array<Worksheet>} [sheets=[]]
 * @returns {Workbook}
 */
export function createWorkbook(sheets = []) {
  validateSheetNames(sheets);
  return { sheets };
}

/**
 * Normalize worksheet rows into a rectangular grid.
 *
 * Short rows are padded with empty cells so every row has the same column
 * count. Existing cell objects are preserved.
 *
 * @param {Array<Array<Cell>>} rows
 * @returns {Array<Array<Cell>>}
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
