// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { createWorkbook } from "../model/workbook.js";
import type { Workbook, Worksheet } from "../model/types.js";
import { SheetBuilder } from "./sheet-builder.js";

/**
 * Builder for constructing Workbook objects with a fluent API.
 * Wraps the internal data model and produces the same plain objects
 * used by the reader and writer.
 */
export class WorkbookBuilder {
  #sheets = new Map<string, SheetBuilder>();

  /**
   * Create a new builder instance.
   */
  static create(): WorkbookBuilder {
    return new WorkbookBuilder();
  }

  /**
   * Get or create a SheetBuilder for the given sheet name.
   * If a sheet with this name already exists, the existing builder is returned.
   */
  sheet(name: string): SheetBuilder {
    let builder = this.#sheets.get(name);
    if (!builder) {
      builder = new SheetBuilder(name);
      this.#sheets.set(name, builder);
    }
    return builder;
  }

  /**
   * Build a normalized workbook object from the configured sheets.
   */
  build(): Workbook {
    const sheets: Worksheet[] = [];
    for (const builder of this.#sheets.values()) {
      sheets.push(builder.build());
    }
    return createWorkbook(sheets);
  }
}
