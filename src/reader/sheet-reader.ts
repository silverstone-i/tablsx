// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { rowsFromSheet } from "../tabular/parser.js";
import type { RowObject, RowsFromSheetOptions } from "../tabular/parser.js";
import { createCell } from "../model/workbook.js";
import type { Cell, CellValue, Row, Worksheet } from "../model/types.js";

/**
 * Options for {@link SheetReader.toObjects}.
 */
export interface SheetToObjectsOptions extends RowsFromSheetOptions {
  /** Explicit headers to use instead of the sheet's first row. */
  headers?: string[];
}

/**
 * Read-only wrapper around a parsed Worksheet, providing convenient
 * accessors for rows, values, and object conversion.
 */
export class SheetReader {
  #name: string;
  #rows: Row[];

  constructor(worksheet: Worksheet) {
    this.#name = worksheet.name;
    this.#rows = worksheet.rows;
  }

  /**
   * Get the worksheet name.
   */
  get name(): string {
    return this.#name;
  }

  /**
   * Get the normalized cell grid.
   */
  get rows(): Row[] {
    return this.#rows;
  }

  /**
   * Get the number of rows in the worksheet.
   */
  get rowCount(): number {
    return this.#rows.length;
  }

  /**
   * Get the width of the worksheet after row normalization.
   */
  get columnCount(): number {
    return this.#rows[0]?.length ?? 0;
  }

  /**
   * Get a single row by zero-based index.
   *
   * @throws {RangeError} Thrown when the index is out of bounds.
   */
  getRow(index: number): Row {
    const row = index >= 0 ? this.#rows[index] : undefined;
    if (row === undefined) {
      throw new RangeError(
        `Row index ${index} out of bounds (0..${this.#rows.length - 1})`,
      );
    }
    return row;
  }

  /**
   * Get a single cell by zero-based row and column index.
   *
   * @throws {RangeError} Thrown when either index is out of bounds.
   */
  getCell(row: number, col: number): Cell {
    const r = this.getRow(row);
    const cell = col >= 0 ? r[col] : undefined;
    if (cell === undefined) {
      throw new RangeError(
        `Column index ${col} out of bounds (0..${r.length - 1})`,
      );
    }
    return cell;
  }

  /**
   * Return all cell values as a 2D array without cell metadata.
   */
  toValues(): CellValue[][] {
    return this.#rows.map((row) => row.map((cell) => cell.value));
  }

  /**
   * Treat the first row as headers and convert remaining rows to objects.
   * Delegates to rowsFromSheet() for duplicate-header disambiguation,
   * column type overrides, vector deserialization, and date coercion.
   */
  toObjects(options: SheetToObjectsOptions = {}): RowObject[] {
    if (this.#rows.length === 0 && !options.headers) {
      throw new Error(
        "Cannot convert to objects: sheet has no rows to derive headers from",
      );
    }
    const rows = options.headers
      ? [options.headers.map((h) => createCell(h)), ...this.#rows]
      : this.#rows;
    return rowsFromSheet({ name: this.#name, rows }, options);
  }
}
