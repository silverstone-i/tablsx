// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { readXlsx } from "./index.js";
import { SheetReader } from "./sheet-reader.js";
import type { Workbook, XlsxInput } from "../model/types.js";

/**
 * A worksheet lookup key: sheet name or zero-based index.
 */
export type SheetIdentifier = string | number;

/**
 * Read-only wrapper around a parsed Workbook, providing convenient
 * access to sheets by name or index.
 */
export class WorkbookReader {
  #sheets = new Map<string, SheetReader>();
  #sheetNames: string[] = [];

  constructor(workbook: Workbook) {
    for (const ws of workbook.sheets) {
      const reader = new SheetReader(ws);
      this.#sheets.set(ws.name, reader);
      this.#sheetNames.push(ws.name);
    }
  }

  /**
   * Create a reader from an `.xlsx` buffer.
   */
  static fromBuffer(buffer: XlsxInput): WorkbookReader {
    return new WorkbookReader(readXlsx(buffer));
  }

  /**
   * Wrap an existing normalized workbook object.
   */
  static fromWorkbook(workbook: Workbook): WorkbookReader {
    return new WorkbookReader(workbook);
  }

  /**
   * Get sheet names in workbook order.
   */
  get sheetNames(): string[] {
    return [...this.#sheetNames];
  }

  /**
   * Get the number of worksheets in the workbook.
   */
  get sheetCount(): number {
    return this.#sheetNames.length;
  }

  /**
   * Get a SheetReader by name or zero-based index.
   *
   * @throws {RangeError} Thrown when a numeric index is out of bounds.
   * @throws {Error} Thrown when a named sheet does not exist.
   */
  sheet(nameOrIndex: SheetIdentifier): SheetReader {
    if (typeof nameOrIndex === "number") {
      const name = nameOrIndex >= 0 ? this.#sheetNames[nameOrIndex] : undefined;
      const reader = name === undefined ? undefined : this.#sheets.get(name);
      if (reader === undefined) {
        throw new RangeError(
          `Sheet index ${nameOrIndex} out of bounds (0..${this.#sheetNames.length - 1})`,
        );
      }
      return reader;
    }
    const reader = this.#sheets.get(nameOrIndex);
    if (!reader) {
      throw new Error(`Sheet "${nameOrIndex}" not found`);
    }
    return reader;
  }
}
