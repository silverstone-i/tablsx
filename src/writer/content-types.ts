// Copyright © 2026 – present NapSoft LLC. All rights reserved.
/**
 * Generate [Content_Types].xml content.
 * @param {number} sheetCount
 * @param {boolean} hasSharedStrings
 * @returns {string}
 */
export function generateContentTypes(sheetCount, hasSharedStrings) {
  const parts = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
    '<Default Extension="xml" ContentType="application/xml"/>',
    '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>',
  ];

  for (let i = 0; i < sheetCount; i++) {
    parts.push(
      `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
    );
  }

  parts.push(
    '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>',
  );

  if (hasSharedStrings) {
    parts.push(
      '<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>',
    );
  }

  parts.push("</Types>");
  return parts.join("");
}
