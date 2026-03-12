// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { escapeXml } from "../utils/xml.js";

/**
 * Generate xl/workbook.xml content.
 * @param {Array<{ name: string }>} sheets
 * @returns {string}
 */
export function generateWorkbookXml(sheets) {
  const parts = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
    "<sheets>",
  ];

  for (let i = 0; i < sheets.length; i++) {
    parts.push(
      `<sheet name="${escapeXml(sheets[i].name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`,
    );
  }

  parts.push("</sheets>");
  parts.push("</workbook>");
  return parts.join("");
}

/**
 * Generate xl/_rels/workbook.xml.rels content.
 * @param {number} sheetCount
 * @param {boolean} hasSharedStrings
 * @returns {string}
 */
export function generateWorkbookRels(sheetCount, hasSharedStrings) {
  const parts = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
  ];

  for (let i = 0; i < sheetCount; i++) {
    parts.push(
      `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`,
    );
  }

  let nextId = sheetCount + 1;

  // Styles relationship
  parts.push(
    `<Relationship Id="rId${nextId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>`,
  );
  nextId++;

  if (hasSharedStrings) {
    parts.push(
      `<Relationship Id="rId${nextId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>`,
    );
  }

  parts.push("</Relationships>");
  return parts.join("");
}
