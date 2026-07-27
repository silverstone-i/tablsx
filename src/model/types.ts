// Copyright © 2026 – present NapSoft LLC. All rights reserved.
/**
 * Supported normalized cell types in the public workbook model.
 * @enum {string}
 */
export const CellType = {
  STRING: "string",
  NUMBER: "number",
  BOOLEAN: "boolean",
  DATE: "date",
  EMPTY: "empty",
  FORMULA: "formula",
  VECTOR: "vector",
};

/**
 * Check whether a string is a supported cell type.
 *
 * @param {string} type
 * @returns {boolean}
 */
export function isCellType(type) {
  return Object.values(CellType).includes(type);
}

/**
 * Infer a normalized cell type from a JavaScript value.
 *
 * Strings become `string`, finite numbers become `number`, booleans become
 * `boolean`, `Date` instances become `date`, numeric arrays become `vector`,
 * and nullish values become `empty`.
 *
 * @param {*} value
 * @returns {string}
 * @throws {Error} Thrown when a number is `NaN`, `Infinity`, or `-Infinity`.
 */
export function inferType(value) {
  if (value === null || value === undefined) return CellType.EMPTY;
  if (typeof value === "string") return CellType.STRING;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error(
        `Non-finite number (${value}) cannot be represented in XLSX`,
      );
    }
    return CellType.NUMBER;
  }
  if (typeof value === "boolean") return CellType.BOOLEAN;
  if (value instanceof Date) return CellType.DATE;
  if (Array.isArray(value) && value.every((v) => typeof v === "number"))
    return CellType.VECTOR;
  return CellType.STRING;
}
