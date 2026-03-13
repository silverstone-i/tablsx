// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { createCell, normalizeRows } from "../model/workbook.js";
import { CellType } from "../model/types.js";
import { sheetFromRows } from "../tabular/serializer.js";

/**
 * Builder for constructing Worksheet objects with a fluent API.
 * Wraps the internal data model and produces the same plain objects
 * used by the reader and writer.
 */
export class SheetBuilder {
  /** @type {string} */
  #name;

  /** @type {string[]|null} */
  #headers = null;

  /** @type {Array<Array<{ value: *, formula: string|null, type: string }>>} */
  #rows = [];

  /**
   * @param {string} name Worksheet name.
   */
  constructor(name) {
    this.#name = name;
  }

  /**
   * Explicitly set column headers. Must be called before adding any rows.
   *
   * @param {string[]} headers
   * @returns {this}
   */
  setHeaders(headers) {
    if (this.#rows.length > 0) {
      throw new Error("Cannot set headers after rows have been added");
    }
    this.#headers = [...headers];
    return this;
  }

  /**
   * Append a single row of raw JavaScript values.
   * Each value is converted to a cell with automatic type inference.
   *
   * @param {any[]} values
   * @returns {this}
   */
  addRow(values) {
    this.#rows.push(values.map((v) => createCell(v)));
    return this;
  }

  /**
   * Append multiple rows of raw JavaScript values.
   *
   * @param {any[][]} rows
   * @returns {this}
   */
  addRows(rows) {
    for (const row of rows) {
      this.addRow(row);
    }
    return this;
  }

  /**
   * Append rows from plain objects. On the first call, headers are derived
   * from the key union of all provided objects (unless setHeaders was called).
   * Subsequent calls match values to existing headers.
   * Delegates to sheetFromRows() for column type overrides, vector
   * serialization, date coercion, and nested-object handling.
   *
   * @param {Object[]} objects
   * @param {{ columns?: Record<string, { type: string }> }} [options]
   * @returns {this}
   */
  addObjects(objects, options = {}) {
    if (objects.length === 0) return this;

    const sheet = sheetFromRows(objects, { name: this.#name, ...options });

    if (!this.#headers) {
      if (this.#rows.length > 0) {
        throw new Error(
          "Cannot derive headers from objects after rows have been added",
        );
      }
      this.#headers = sheet.rows[0].map((cell) => cell.value);
    }

    // Map sheetFromRows columns to match existing header order
    const srcHeaders = sheet.rows[0].map((cell) => cell.value);
    const srcIndexMap = new Map(srcHeaders.map((h, i) => [h, i]));
    for (let i = 1; i < sheet.rows.length; i++) {
      const row = this.#headers.map((h) => {
        const srcIdx = srcIndexMap.get(h);
        return srcIdx !== undefined
          ? sheet.rows[i][srcIdx]
          : createCell(null, null, CellType.EMPTY);
      });
      this.#rows.push(row);
    }

    return this;
  }

  /**
   * Build a normalized worksheet object.
   *
   * @returns {import("../model/workbook.js").Worksheet}
   */
  build() {
    const allRows = [];

    if (this.#headers) {
      allRows.push(this.#headers.map((h) => createCell(h)));
    }

    allRows.push(...this.#rows);

    return { name: this.#name, rows: normalizeRows(allRows) };
  }
}
