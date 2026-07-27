// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { XMLParser } from "fast-xml-parser";
import type { XmlRelsDoc, XmlWorkbookDoc } from "./xml-types.js";

/**
 * A worksheet entry from xl/workbook.xml.
 */
export interface SheetEntry {
  /** Excel-visible worksheet name. */
  name: string;
  /** Relationship id pointing at the worksheet part. */
  rId: string;
}

/**
 * Parse xl/workbook.xml to extract sheet names and rIds.
 */
export function parseWorkbook(xml: string): SheetEntry[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    isArray: (name) => name === "sheet",
  });

  const parsed = parser.parse(xml) as XmlWorkbookDoc;
  const sheets = parsed?.workbook?.sheets?.sheet;
  if (!sheets) return [];

  return sheets.map((s) => ({
    name: String(s["@_name"] ?? ""),
    rId: String(s["@_r:id"] ?? ""),
  }));
}

/**
 * Parse xl/_rels/workbook.xml.rels to map rId → target file path.
 */
export function parseWorkbookRels(xml: string): Map<string, string> {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    isArray: (name) => name === "Relationship",
  });

  const parsed = parser.parse(xml) as XmlRelsDoc;
  const rels = parsed?.Relationships?.Relationship;
  if (!rels) return new Map();

  const map = new Map<string, string>();
  for (const rel of rels) {
    const id = rel["@_Id"];
    const target = rel["@_Target"];
    if (id !== undefined && target !== undefined) {
      map.set(id, target);
    }
  }
  return map;
}
