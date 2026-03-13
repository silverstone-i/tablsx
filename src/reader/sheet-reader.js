// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { rowsFromSheet } from "../tabular/parser.js";
import { createCell } from "../model/workbook.js";

/**
 * Read-only wrapper around a parsed Worksheet, providing convenient
 * accessors for rows, values, and object conversion.
 */
export class SheetReader {
  /** @type {string} */
  #name;

  /** @type {Array<Array<{ value: *, formula: string|null, type: string }>>} */
  #rows;

  /**
   * @param {{ name: string, rows: Array<Array<object>> }} worksheet
   */
  constructor(worksheet) {
    this.#name = worksheet.name;
    this.#rows = worksheet.rows;
  }

  /** @returns {string} */
  get name() {
    return this.#name;
  }

  /** @returns {Array<Array<{ value: *, formula: string|null, type: string }>>} */
  get rows() {
    return this.#rows;
  }

  /** @returns {number} */
  get rowCount() {
    return this.#rows.length;
  }

  /** @returns {number} */
  get columnCount() {
    return this.#rows.length > 0 ? this.#rows[0].length : 0;
  }

  /**
   * Get a single row by zero-based index.
   * @param {number} index
   * @returns {Array<{ value: *, formula: string|null, type: string }>}
   */
  getRow(index) {
    if (index < 0 || index >= this.#rows.length) {
      throw new RangeError(
        `Row index ${index} out of bounds (0..${this.#rows.length - 1})`,
      );
    }
    return this.#rows[index];
  }

  /**
   * Get a single cell by zero-based row and column index.
   * @param {number} row
   * @param {number} col
   * @returns {{ value: *, formula: string|null, type: string }}
   */
  getCell(row, col) {
    const r = this.getRow(row);
    if (col < 0 || col >= r.length) {
      throw new RangeError(
        `Column index ${col} out of bounds (0..${r.length - 1})`,
      );
    }
    return r[col];
  }

  /**
   * Return all cell values as a 2D array (stripping Cell metadata).
   * @returns {Array<Array<*>>}
   */
  toValues() {
    return this.#rows.map((row) => row.map((cell) => cell.value));
  }

  /**
   * Treat the first row as headers and convert remaining rows to objects.
   * Delegates to rowsFromSheet() for duplicate-header disambiguation,
   * column type overrides, vector deserialization, and date coercion.
   * @param {{ headers?: string[], columns?: Record<string, { type: string }> }} [options]
   * @returns {Object[]}
   */
  toObjects(options = {}) {
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
