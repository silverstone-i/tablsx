// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { extractZip, readFileAsString } from "./zip.js";
import { parseSharedStrings } from "./shared-strings.js";
import { parseWorkbook, parseWorkbookRels } from "./workbook-parser.js";
import { parseWorksheet } from "./worksheet-parser.js";
import { parseDateStyles } from "./styles-parser.js";
import { posix } from "node:path";
import {
  createWorkbook,
  createWorksheet,
  normalizeRows,
} from "../model/workbook.js";

/**
 * Read an `.xlsx` file from a buffer and return a normalized workbook object.
 *
 * @param {Buffer|Uint8Array} buffer
 * @returns {import("../model/workbook.js").Workbook}
 * @throws {Error} Thrown when required XLSX package parts are missing.
 */
export function readXlsx(buffer) {
  const files = extractZip(buffer);

  // Validate required package parts
  const contentTypesXml = readFileAsString(files, "[Content_Types].xml");
  if (!contentTypesXml) throw new Error("Missing [Content_Types].xml");
  const rootRelsXml = readFileAsString(files, "_rels/.rels");
  if (!rootRelsXml) throw new Error("Missing _rels/.rels");

  // Parse shared strings
  const sharedStringsXml = readFileAsString(files, "xl/sharedStrings.xml");
  const sharedStrings = parseSharedStrings(sharedStringsXml);

  // Parse styles for date detection
  const stylesXml = readFileAsString(files, "xl/styles.xml");
  const dateStyles = parseDateStyles(stylesXml);

  // Parse workbook structure
  const workbookXml = readFileAsString(files, "xl/workbook.xml");
  if (!workbookXml) throw new Error("Missing xl/workbook.xml");
  const sheetEntries = parseWorkbook(workbookXml);

  // Parse workbook relationships
  const relsXml = readFileAsString(files, "xl/_rels/workbook.xml.rels");
  if (!relsXml) throw new Error("Missing xl/_rels/workbook.xml.rels");
  const relsMap = parseWorkbookRels(relsXml);

  // Parse each worksheet
  const sheets = [];
  for (const entry of sheetEntries) {
    const target = relsMap.get(entry.rId);
    if (!target) {
      throw new Error(
        `Missing relationship for sheet "${entry.name}" (rId: ${entry.rId})`,
      );
    }

    const sheetPath = target.startsWith("/")
      ? target.slice(1)
      : posix.normalize(`xl/${target}`);
    const sheetXml = readFileAsString(files, sheetPath);
    if (!sheetXml) {
      throw new Error(
        `Missing worksheet XML for sheet "${entry.name}" at ${sheetPath}`,
      );
    }

    const rows = parseWorksheet(sheetXml, sharedStrings, dateStyles);
    const normalizedRows = normalizeRows(rows);
    sheets.push(createWorksheet(entry.name, normalizedRows));
  }

  return createWorkbook(sheets);
}
