// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { createCell, normalizeRows } from "../model/workbook.js";
import { CellType } from "../model/types.js";
import type { CellValue, Row, Worksheet } from "../model/types.js";
import { sheetFromRows } from "../tabular/serializer.js";
import type { SheetFromRowsOptions } from "../tabular/serializer.js";

/**
 * Options for {@link SheetBuilder.addObjects}.
 */
export type AddObjectsOptions = Omit<SheetFromRowsOptions, "name">;

/**
 * Builder for constructing Worksheet objects with a fluent API.
 * Wraps the internal data model and produces the same plain objects
 * used by the reader and writer.
 */
export class SheetBuilder {
  #name: string;
  #headers: string[] | null = null;
  #rows: Row[] = [];

  constructor(name: string) {
    this.#name = name;
  }

  /**
   * Explicitly set column headers. Must be called before adding any rows.
   *
   * @throws {Error} Thrown when rows have already been added.
   */
  setHeaders(headers: string[]): this {
    if (this.#rows.length > 0) {
      throw new Error("Cannot set headers after rows have been added");
    }
    this.#headers = [...headers];
    return this;
  }

  /**
   * Append a single row of raw JavaScript values.
   * Each value is converted to a cell with automatic type inference.
   */
  addRow(values: CellValue[]): this {
    this.#rows.push(values.map((v) => createCell(v)));
    return this;
  }

  /**
   * Append multiple rows of raw JavaScript values.
   */
  addRows(rows: CellValue[][]): this {
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
   * @throws {Error} Thrown when headers must be derived after rows were added.
   */
  addObjects(
    objects: Record<string, unknown>[],
    options: AddObjectsOptions = {},
  ): this {
    if (objects.length === 0) return this;

    const sheet = sheetFromRows(objects, { name: this.#name, ...options });

    // sheetFromRows always emits a header row for a non-empty input.
    const srcHeaderRow = sheet.rows[0];
    if (!srcHeaderRow) return this;
    const srcHeaders = srcHeaderRow.map((cell) => String(cell.value));

    let headers = this.#headers;
    if (!headers) {
      if (this.#rows.length > 0) {
        throw new Error(
          "Cannot derive headers from objects after rows have been added",
        );
      }
      headers = [...srcHeaders];
      this.#headers = headers;
    }

    // Map sheetFromRows columns to match existing header order
    const srcIndexMap = new Map(srcHeaders.map((h, i) => [h, i]));
    for (let i = 1; i < sheet.rows.length; i++) {
      const srcRow = sheet.rows[i];
      if (!srcRow) continue;
      const row = headers.map((h) => {
        const srcIdx = srcIndexMap.get(h);
        const cell = srcIdx !== undefined ? srcRow[srcIdx] : undefined;
        return cell ?? createCell(null, null, CellType.EMPTY);
      });
      this.#rows.push(row);
    }

    return this;
  }

  /**
   * Build a normalized worksheet object.
   */
  build(): Worksheet {
    const allRows: Row[] = [];

    if (this.#headers) {
      allRows.push(this.#headers.map((h) => createCell(h)));
    }

    allRows.push(...this.#rows);

    return { name: this.#name, rows: normalizeRows(allRows) };
  }
}
