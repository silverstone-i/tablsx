// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { escapeXml } from "../utils/xml.js";
import { CellType } from "../model/types.js";
import type { Workbook } from "../model/types.js";
import { serializeVector } from "../utils/vectors.js";

/**
 * A deduplicated shared strings table.
 */
export interface SharedStringsTable {
  /** String → index into `strings`. */
  map: Map<string, number>;
  /** Unique strings in insertion order. */
  strings: string[];
}

/**
 * Build a deduplicated shared strings table from a workbook.
 * Collects STRING and VECTOR cells (vectors are serialized as JSON strings).
 */
export function buildSharedStrings(workbook: Workbook): SharedStringsTable {
  const map = new Map<string, number>();
  const strings: string[] = [];

  for (const sheet of workbook.sheets) {
    for (const row of sheet.rows) {
      for (const cell of row) {
        let str: string | undefined;
        if (cell.type === CellType.STRING && cell.value !== null) {
          str = String(cell.value);
        } else if (cell.type === CellType.VECTOR && cell.value !== null) {
          str = Array.isArray(cell.value)
            ? serializeVector(cell.value)
            : String(cell.value);
        }
        if (str !== undefined && !map.has(str)) {
          map.set(str, strings.length);
          strings.push(str);
        }
      }
    }
  }

  return { map, strings };
}

/**
 * Generate xl/sharedStrings.xml content.
 */
export function generateSharedStringsXml(strings: string[]): string {
  const parts = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    `<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" uniqueCount="${strings.length}">`,
  ];

  for (const str of strings) {
    const escaped = escapeXml(str);
    if (/^\s|\s$/.test(str)) {
      parts.push(`<si><t xml:space="preserve">${escaped}</t></si>`);
    } else {
      parts.push(`<si><t>${escaped}</t></si>`);
    }
  }

  parts.push("</sst>");
  return parts.join("");
}
