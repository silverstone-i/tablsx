// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { XMLParser } from "fast-xml-parser";

/**
 * Parse xl/workbook.xml to extract sheet names and rIds.
 * @param {string} xml
 * @returns {Array<{ name: string, rId: string }>}
 */
export function parseWorkbook(xml) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    isArray: (name) => name === "sheet",
  });

  const parsed = parser.parse(xml);
  const sheets = parsed?.workbook?.sheets?.sheet;
  if (!sheets) return [];

  return sheets.map((s) => ({
    name: s["@_name"],
    rId: s["@_r:id"],
  }));
}

/**
 * Parse xl/_rels/workbook.xml.rels to map rId → target file path.
 * @param {string} xml
 * @returns {Map<string, string>}
 */
export function parseWorkbookRels(xml) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    isArray: (name) => name === "Relationship",
  });

  const parsed = parser.parse(xml);
  const rels = parsed?.Relationships?.Relationship;
  if (!rels) return new Map();

  const map = new Map();
  for (const rel of rels) {
    map.set(rel["@_Id"], rel["@_Target"]);
  }
  return map;
}
