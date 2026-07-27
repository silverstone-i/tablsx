// Copyright © 2026 – present NapSoft LLC. All rights reserved.
/**
 * Public package entry point for `tablsx`.
 *
 * The package exposes a small normalized workbook model, direct read/write
 * functions, tabular conversion helpers, builder APIs, and low-level utilities
 * for dates, cell references, vectors, and XML escaping.
 *
 * @module tablsx
 */
export { readXlsx } from "./reader/index.js";
export { writeXlsx } from "./writer/index.js";
export {
  createWorkbook,
  createWorksheet,
  createCell,
  normalizeRows,
} from "./model/workbook.js";
export { CellType, inferType, isCellType } from "./model/types.js";
export {
  encodeCellRef,
  decodeCellRef,
  columnToLetter,
  letterToColumn,
} from "./utils/cell-ref.js";
export { escapeXml } from "./utils/xml.js";
export { excelDateToJS, jsDateToExcel } from "./utils/dates.js";
export {
  serializeVector,
  deserializeVector,
  isVectorString,
} from "./utils/vectors.js";
export { sheetFromRows, rowsFromSheet, inferSchema } from "./tabular/index.js";
export { WorkbookBuilder, SheetBuilder } from "./builder/index.js";
export { WorkbookReader } from "./reader/workbook-reader.js";
export { SheetReader } from "./reader/sheet-reader.js";

export type {
  Cell,
  CellValue,
  Row,
  Worksheet,
  Workbook,
  XlsxInput,
} from "./model/types.js";
export type { CellRef } from "./utils/cell-ref.js";
export type {
  RowObject,
  ColumnOverride,
  ColumnTypeOverrides,
  RowsFromSheetOptions,
} from "./tabular/parser.js";
export type { SheetFromRowsOptions } from "./tabular/serializer.js";
export type { Schema, SchemaColumn } from "./tabular/schema.js";
export type { AddObjectsOptions } from "./builder/sheet-builder.js";
export type { SheetIdentifier } from "./reader/workbook-reader.js";
export type { SheetToObjectsOptions } from "./reader/sheet-reader.js";
