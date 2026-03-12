// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { createCell, normalizeRows } from "../model/workbook.js";
import { CellType } from "../model/types.js";

/**
 * Builder for constructing Worksheet objects with a fluent API.
 * Wraps the internal data model — produces the same plain objects
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
   * @param {string} name - worksheet name
   */
  constructor(name) {
    this.#name = name;
  }

  /**
   * Explicitly set column headers. Must be called before adding any rows.
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
   * Each value is converted to a Cell via createCell (with automatic type inference).
   * @param {any[]} values
   * @returns {this}
   */
  addRow(values) {
    this.#rows.push(values.map((v) => createCell(v)));
    return this;
  }

  /**
   * Append multiple rows of raw JavaScript values.
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
   * @param {Object[]} objects
   * @returns {this}
   */
  addObjects(objects) {
    if (objects.length === 0) return this;

    if (!this.#headers) {
      const columnSet = new Set();
      for (const obj of objects) {
        for (const key of Object.keys(obj)) {
          columnSet.add(key);
        }
      }
      this.#headers = [...columnSet];
    }

    for (const obj of objects) {
      const row = this.#headers.map((header) => {
        const value = obj[header];
        if (value === null || value === undefined) {
          return createCell(null, null, CellType.EMPTY);
        }
        if (
          typeof value === "object" &&
          !(value instanceof Date) &&
          !Array.isArray(value)
        ) {
          return createCell(JSON.stringify(value));
        }
        return createCell(value);
      });
      this.#rows.push(row);
    }

    return this;
  }

  /**
   * Build the Worksheet object.
   * @returns {{ name: string, rows: Array<Array<{ value: *, formula: string|null, type: string }>> }}
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
