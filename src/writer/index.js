// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import {
  buildSharedStrings,
  generateSharedStringsXml,
} from "./shared-strings-writer.js";
import { generateWorksheetXml } from "./worksheet-writer.js";
import {
  generateWorkbookXml,
  generateWorkbookRels,
} from "./workbook-writer.js";
import { generateContentTypes } from "./content-types.js";
import { generateStylesXml } from "./styles-writer.js";
import { normalizeRows, validateSheetNames } from "../model/workbook.js";
import { createZip } from "./zip.js";

/**
 * Write a normalized workbook object to an `.xlsx` buffer.
 *
 * @param {import("../model/workbook.js").Workbook} workbook
 * @returns {Uint8Array}
 * @throws {Error} Thrown when sheet names or cell values are invalid for XLSX.
 */
export function writeXlsx(workbook) {
  validateSheetNames(workbook.sheets);

  // Enforce row-length consistency before writing
  const normalizedWorkbook = {
    sheets: workbook.sheets.map((sheet) => ({
      name: sheet.name,
      rows: normalizeRows(sheet.rows),
    })),
  };

  // Build shared strings table
  const { map: sharedStringsMap, strings } =
    buildSharedStrings(normalizedWorkbook);
  const hasSharedStrings = strings.length > 0;

  // Generate XML files
  const files = new Map();

  // Root relationships
  files.set(
    "_rels/.rels",
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
      "</Relationships>",
  );

  // Content types
  files.set(
    "[Content_Types].xml",
    generateContentTypes(normalizedWorkbook.sheets.length, hasSharedStrings),
  );

  // Workbook
  files.set("xl/workbook.xml", generateWorkbookXml(normalizedWorkbook.sheets));

  // Workbook relationships
  files.set(
    "xl/_rels/workbook.xml.rels",
    generateWorkbookRels(normalizedWorkbook.sheets.length, hasSharedStrings),
  );

  // Styles
  files.set("xl/styles.xml", generateStylesXml());

  // Shared strings
  if (hasSharedStrings) {
    files.set("xl/sharedStrings.xml", generateSharedStringsXml(strings));
  }

  // Worksheets
  for (let i = 0; i < normalizedWorkbook.sheets.length; i++) {
    files.set(
      `xl/worksheets/sheet${i + 1}.xml`,
      generateWorksheetXml(normalizedWorkbook.sheets[i], sharedStringsMap),
    );
  }

  return createZip(files);
}
