// Copyright © 2026 – present NapSoft LLC. All rights reserved.
/** @enum {string} */
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
 * Check if a value is a valid CellType.
 * @param {string} type
 * @returns {boolean}
 */
export function isCellType(type) {
  return Object.values(CellType).includes(type);
}

/**
 * Infer the CellType from a JavaScript value.
 * @param {*} value
 * @returns {string}
 */
export function inferType(value) {
  if (value === null || value === undefined) return CellType.EMPTY;
  if (typeof value === "string") return CellType.STRING;
  if (typeof value === "number") return CellType.NUMBER;
  if (typeof value === "boolean") return CellType.BOOLEAN;
  if (value instanceof Date) return CellType.DATE;
  if (Array.isArray(value) && value.every((v) => typeof v === "number"))
    return CellType.VECTOR;
  return CellType.STRING;
}
