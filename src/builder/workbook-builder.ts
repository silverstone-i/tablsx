// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { createWorkbook } from "../model/workbook.js";
import { SheetBuilder } from "./sheet-builder.js";

/**
 * Builder for constructing Workbook objects with a fluent API.
 * Wraps the internal data model and produces the same plain objects
 * used by the reader and writer.
 */
export class WorkbookBuilder {
  /** @type {Map<string, SheetBuilder>} */
  #sheets = new Map();

  /**
   * Create a new builder instance.
   *
   * @returns {WorkbookBuilder}
   */
  static create() {
    return new WorkbookBuilder();
  }

  /**
   * Get or create a SheetBuilder for the given sheet name.
   * If a sheet with this name already exists, the existing builder is returned.
   *
   * @param {string} name
   * @returns {SheetBuilder}
   */
  sheet(name) {
    if (!this.#sheets.has(name)) {
      this.#sheets.set(name, new SheetBuilder(name));
    }
    return this.#sheets.get(name);
  }

  /**
   * Build a normalized workbook object from the configured sheets.
   *
   * @returns {import("../model/workbook.js").Workbook}
   */
  build() {
    const sheets = [];
    for (const builder of this.#sheets.values()) {
      sheets.push(builder.build());
    }
    return createWorkbook(sheets);
  }
}
