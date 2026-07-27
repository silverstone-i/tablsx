// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { CellType, inferType } from "./types.js";
import type { Cell, CellValue, Row, Workbook, Worksheet } from "./types.js";

/**
 * Create a normalized cell object.
 *
 * If `type` is omitted, the function infers it from `value`. When `formula`
 * is provided without an explicit type, the cell type becomes `formula`.
 *
 * @param value Raw JavaScript value to store in the cell.
 * @param formula Excel formula text without a leading `=`.
 * @param type Explicit cell type from {@link CellType}.
 */
export function createCell(
  value: CellValue = null,
  formula: string | null = null,
  type?: CellType,
): Cell {
  if (!type) {
    if (formula) {
      type = CellType.FORMULA;
    } else {
      type = inferType(value);
    }
  }
  // An empty-string formula normalizes to null.
  if (formula === "") formula = null;
  return { value, formula, type };
}

/**
 * Create a worksheet object.
 */
export function createWorksheet(name: string, rows: Row[] = []): Worksheet {
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
 * @throws {Error} Thrown when any worksheet name violates Excel constraints.
 */
export function validateSheetNames(sheets: { name: string }[]): void {
  const names = new Set<string>();
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
    const match = INVALID_SHEET_NAME_CHARS.exec(name);
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
 */
export function createWorkbook(sheets: Worksheet[] = []): Workbook {
  validateSheetNames(sheets);
  return { sheets };
}

/**
 * Normalize worksheet rows into a rectangular grid.
 *
 * Short rows are padded with empty cells so every row has the same column
 * count. Existing cell objects are preserved.
 */
export function normalizeRows(rows: Row[]): Row[] {
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
