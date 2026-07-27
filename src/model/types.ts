// Copyright © 2026 – present NapSoft LLC. All rights reserved.

/**
 * Supported normalized cell types in the public workbook model.
 */
export const CellType = {
  STRING: "string",
  NUMBER: "number",
  BOOLEAN: "boolean",
  DATE: "date",
  EMPTY: "empty",
  FORMULA: "formula",
  VECTOR: "vector",
} as const;

/**
 * Union of the normalized cell type strings.
 */
export type CellType = (typeof CellType)[keyof typeof CellType];

/**
 * Raw JavaScript values representable in a cell.
 */
export type CellValue = string | number | boolean | Date | number[] | null;

/**
 * A normalized cell in the `tablsx` workbook model.
 */
export interface Cell {
  /** Raw JavaScript value for the cell. */
  value: CellValue;
  /** Excel formula without a leading `=`, or `null`. */
  formula: string | null;
  /** Normalized cell type from {@link CellType}. */
  type: CellType;
}

/**
 * A single row of cells in row-major sheet data.
 */
export type Row = Cell[];

/**
 * A worksheet in the `tablsx` workbook model.
 */
export interface Worksheet {
  /** Excel-visible worksheet name. */
  name: string;
  /** Rectangular row-major cell data. */
  rows: Row[];
}

/**
 * A workbook in the `tablsx` workbook model.
 */
export interface Workbook {
  /** Worksheets in workbook order. */
  sheets: Worksheet[];
}

/**
 * Binary .xlsx input accepted by the readers.
 *
 * Node `Buffer` values are accepted as `Uint8Array` subclasses.
 */
export type XlsxInput = Uint8Array | ArrayBuffer;

/**
 * Check whether a string is a supported cell type.
 */
export function isCellType(type: string): type is CellType {
  return (Object.values(CellType) as string[]).includes(type);
}

/**
 * Infer a normalized cell type from a JavaScript value.
 *
 * Strings become `string`, finite numbers become `number`, booleans become
 * `boolean`, `Date` instances become `date`, numeric arrays become `vector`,
 * and nullish values become `empty`.
 *
 * @throws {Error} Thrown when a number is `NaN`, `Infinity`, or `-Infinity`.
 */
export function inferType(value: unknown): CellType {
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
