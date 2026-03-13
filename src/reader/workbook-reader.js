// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { readXlsx } from "./index.js";
import { SheetReader } from "./sheet-reader.js";

/**
 * Read-only wrapper around a parsed Workbook, providing convenient
 * access to sheets by name or index.
 */
export class WorkbookReader {
  /** @type {Map<string, SheetReader>} */
  #sheets = new Map();

  /** @type {string[]} */
  #sheetNames = [];

  /**
   * @param {import("../model/workbook.js").Workbook} workbook
   */
  constructor(workbook) {
    for (const ws of workbook.sheets) {
      const reader = new SheetReader(ws);
      this.#sheets.set(ws.name, reader);
      this.#sheetNames.push(ws.name);
    }
  }

  /**
   * Create a reader from an `.xlsx` buffer.
   *
   * @param {Buffer|Uint8Array} buffer
   * @returns {WorkbookReader}
   */
  static fromBuffer(buffer) {
    return new WorkbookReader(readXlsx(buffer));
  }

  /**
   * Wrap an existing normalized workbook object.
   *
   * @param {import("../model/workbook.js").Workbook} workbook
   * @returns {WorkbookReader}
   */
  static fromWorkbook(workbook) {
    return new WorkbookReader(workbook);
  }

  /**
   * Get sheet names in workbook order.
   * @returns {string[]}
   */
  get sheetNames() {
    return [...this.#sheetNames];
  }

  /**
   * Get the number of worksheets in the workbook.
   * @returns {number}
   */
  get sheetCount() {
    return this.#sheetNames.length;
  }

  /**
   * Get a SheetReader by name or zero-based index.
   *
   * @param {string|number} nameOrIndex
   * @returns {SheetReader}
   */
  sheet(nameOrIndex) {
    if (typeof nameOrIndex === "number") {
      if (nameOrIndex < 0 || nameOrIndex >= this.#sheetNames.length) {
        throw new RangeError(
          `Sheet index ${nameOrIndex} out of bounds (0..${this.#sheetNames.length - 1})`,
        );
      }
      return this.#sheets.get(this.#sheetNames[nameOrIndex]);
    }
    const reader = this.#sheets.get(nameOrIndex);
    if (!reader) {
      throw new Error(`Sheet "${nameOrIndex}" not found`);
    }
    return reader;
  }
}
