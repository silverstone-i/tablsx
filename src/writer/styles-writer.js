// Copyright © 2026 – present NapSoft LLC. All rights reserved.
/**
 * Style index for date-formatted cells (xf index 1 with numFmtId 14 = "m/d/yyyy").
 */
export const DATE_STYLE_INDEX = 1;

/**
 * Generate a minimal xl/styles.xml.
 * Includes a default xf (index 0) and a date xf (index 1, numFmtId 14).
 * @returns {string}
 */
export function generateStylesXml() {
  return [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">',
    '<fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>',
    '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>',
    '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>',
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>',
    '<cellXfs count="2">',
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>',
    '<xf numFmtId="14" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>',
    "</cellXfs>",
    "</styleSheet>",
  ].join("");
}
