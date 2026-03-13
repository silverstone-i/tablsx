// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { describe, it, expect } from "vitest";
import { parseDateStyles } from "../../src/reader/styles-parser.js";

/**
 * Helper to build a minimal styles.xml with the given cellXfs and optional custom numFmts.
 */
function buildStylesXml({ xfs = [], numFmts = [] } = {}) {
  const parts = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">',
  ];

  if (numFmts.length > 0) {
    parts.push(`<numFmts count="${numFmts.length}">`);
    for (const nf of numFmts) {
      parts.push(`<numFmt numFmtId="${nf.id}" formatCode="${nf.code}"/>`);
    }
    parts.push("</numFmts>");
  }

  parts.push(`<cellXfs count="${xfs.length}">`);
  for (const xf of xfs) {
    parts.push(`<xf numFmtId="${xf}"/>`);
  }
  parts.push("</cellXfs>");
  parts.push("</styleSheet>");

  return parts.join("");
}

describe("parseDateStyles", () => {
  it("returns empty set for null/undefined input", () => {
    expect(parseDateStyles(null).size).toBe(0);
    expect(parseDateStyles(undefined).size).toBe(0);
    expect(parseDateStyles("").size).toBe(0);
  });

  it("returns empty set for XML with no styleSheet", () => {
    const xml = '<?xml version="1.0"?><root></root>';
    expect(parseDateStyles(xml).size).toBe(0);
  });

  it("returns empty set for XML with no cellXfs", () => {
    const xml =
      '<?xml version="1.0"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"></styleSheet>';
    expect(parseDateStyles(xml).size).toBe(0);
  });

  it("detects built-in date format ID 14", () => {
    const xml = buildStylesXml({ xfs: [0, 14] });
    const result = parseDateStyles(xml);
    expect(result.has(0)).toBe(false);
    expect(result.has(1)).toBe(true);
  });

  it("detects multiple built-in date format IDs", () => {
    // 14=m/d/yyyy, 22=m/d/yyyy h:mm, 45=mm:ss, 0=General
    const xml = buildStylesXml({ xfs: [0, 14, 22, 45] });
    const result = parseDateStyles(xml);
    expect(result.has(0)).toBe(false); // General
    expect(result.has(1)).toBe(true); // 14
    expect(result.has(2)).toBe(true); // 22
    expect(result.has(3)).toBe(true); // 45
  });

  it("detects custom date format codes", () => {
    const xml = buildStylesXml({
      xfs: [0, 164],
      numFmts: [{ id: 164, code: "yyyy-mm-dd" }],
    });
    const result = parseDateStyles(xml);
    expect(result.has(0)).toBe(false);
    expect(result.has(1)).toBe(true);
  });

  it("detects custom format with time components", () => {
    const xml = buildStylesXml({
      xfs: [165],
      numFmts: [{ id: 165, code: "m/d/yy h:mm" }],
    });
    const result = parseDateStyles(xml);
    expect(result.has(0)).toBe(true);
  });

  it("does not flag non-date numeric formats", () => {
    const xml = buildStylesXml({
      xfs: [164, 165, 166],
      numFmts: [
        { id: 164, code: "#,##0.00" },
        { id: 165, code: "0%" },
        { id: 166, code: "0.00E+00" },
      ],
    });
    const result = parseDateStyles(xml);
    expect(result.size).toBe(0);
  });

  it("handles format strings with quoted sections", () => {
    const xml = buildStylesXml({
      xfs: [164],
      numFmts: [{ id: 164, code: 'yyyy"年"mm"月"dd"日"' }],
    });
    const result = parseDateStyles(xml);
    expect(result.has(0)).toBe(true);
  });

  it("handles format strings with color tokens", () => {
    const xml = buildStylesXml({
      xfs: [164],
      numFmts: [{ id: 164, code: "[Red]yyyy-mm-dd" }],
    });
    const result = parseDateStyles(xml);
    expect(result.has(0)).toBe(true);
  });

  it("does not flag format with only color and number tokens", () => {
    const xml = buildStylesXml({
      xfs: [164],
      numFmts: [{ id: 164, code: "[Red]#,##0.00" }],
    });
    const result = parseDateStyles(xml);
    expect(result.size).toBe(0);
  });
});
