// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { describe, it, expect } from "vitest";
import { parseWorksheet } from "../../src/reader/worksheet-parser.js";
import { CellType } from "../../src/model/types.js";

/**
 * Helper to wrap cell XML in a minimal worksheet structure.
 */
function wrapSheet(rowsXml) {
  return [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">',
    "<sheetData>",
    rowsXml,
    "</sheetData>",
    "</worksheet>",
  ].join("");
}

describe("parseWorksheet", () => {
  it("returns empty array for empty sheetData", () => {
    const xml = wrapSheet("");
    expect(parseWorksheet(xml, [])).toEqual([]);
  });

  it("returns empty array for missing worksheet element", () => {
    const xml = '<?xml version="1.0"?><root></root>';
    expect(parseWorksheet(xml, [])).toEqual([]);
  });

  it("parses shared string cells", () => {
    const xml = wrapSheet(
      '<row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c></row>',
    );
    const strings = ["Hello", "World"];
    const rows = parseWorksheet(xml, strings);

    expect(rows.length).toBe(1);
    expect(rows[0][0].value).toBe("Hello");
    expect(rows[0][0].type).toBe(CellType.STRING);
    expect(rows[0][1].value).toBe("World");
  });

  it("parses inline string cells", () => {
    const xml = wrapSheet(
      '<row r="1"><c r="A1" t="inlineStr"><is><t>Inline</t></is></c></row>',
    );
    const rows = parseWorksheet(xml, []);

    expect(rows[0][0].value).toBe("Inline");
    expect(rows[0][0].type).toBe(CellType.STRING);
  });

  it("parses rich text inline strings", () => {
    const xml = wrapSheet(
      '<row r="1"><c r="A1" t="inlineStr"><is><r><t>Hello </t></r><r><t>World</t></r></is></c></row>',
    );
    const rows = parseWorksheet(xml, []);

    expect(rows[0][0].value).toBe("Hello World");
    expect(rows[0][0].type).toBe(CellType.STRING);
  });

  it("parses boolean cells", () => {
    const xml = wrapSheet(
      '<row r="1"><c r="A1" t="b"><v>1</v></c><c r="B1" t="b"><v>0</v></c></row>',
    );
    const rows = parseWorksheet(xml, []);

    expect(rows[0][0].value).toBe(true);
    expect(rows[0][0].type).toBe(CellType.BOOLEAN);
    expect(rows[0][1].value).toBe(false);
    expect(rows[0][1].type).toBe(CellType.BOOLEAN);
  });

  it("parses numeric cells with explicit t='n'", () => {
    const xml = wrapSheet('<row r="1"><c r="A1" t="n"><v>42</v></c></row>');
    const rows = parseWorksheet(xml, []);

    expect(rows[0][0].value).toBe(42);
    expect(rows[0][0].type).toBe(CellType.NUMBER);
  });

  it("parses numeric cells with absent t attribute", () => {
    const xml = wrapSheet('<row r="1"><c r="A1"><v>3.14</v></c></row>');
    const rows = parseWorksheet(xml, []);

    expect(rows[0][0].value).toBe(3.14);
    expect(rows[0][0].type).toBe(CellType.NUMBER);
  });

  it("parses date cells using style index", () => {
    const dateStyles = new Set([1]);
    const xml = wrapSheet('<row r="1"><c r="A1" s="1"><v>45292</v></c></row>');
    const rows = parseWorksheet(xml, [], dateStyles);

    expect(rows[0][0].type).toBe(CellType.DATE);
    expect(rows[0][0].value).toBeInstanceOf(Date);
    expect(rows[0][0].value.toISOString()).toBe("2024-01-01T00:00:00.000Z");
  });

  it("parses numeric cell when style is not a date style", () => {
    const dateStyles = new Set([1]);
    const xml = wrapSheet('<row r="1"><c r="A1" s="0"><v>45292</v></c></row>');
    const rows = parseWorksheet(xml, [], dateStyles);

    expect(rows[0][0].type).toBe(CellType.NUMBER);
    expect(rows[0][0].value).toBe(45292);
  });

  it("parses formula cells with numeric cached value", () => {
    const xml = wrapSheet(
      '<row r="1"><c r="A1"><f>SUM(B1:B10)</f><v>100</v></c></row>',
    );
    const rows = parseWorksheet(xml, []);

    expect(rows[0][0].type).toBe(CellType.FORMULA);
    expect(rows[0][0].formula).toBe("SUM(B1:B10)");
    expect(rows[0][0].value).toBe(100);
  });

  it("parses formula cells with string result (t='str')", () => {
    const xml = wrapSheet(
      '<row r="1"><c r="A1" t="str"><f>A2&amp;B2</f><v>hello</v></c></row>',
    );
    const rows = parseWorksheet(xml, []);

    expect(rows[0][0].type).toBe(CellType.FORMULA);
    expect(rows[0][0].formula).toBe("A2&B2");
    expect(rows[0][0].value).toBe("hello");
  });

  it("parses error cells (t='e')", () => {
    const xml = wrapSheet('<row r="1"><c r="A1" t="e"><v>#REF!</v></c></row>');
    const rows = parseWorksheet(xml, []);

    expect(rows[0][0].value).toBe("#REF!");
    expect(rows[0][0].type).toBe(CellType.STRING);
  });

  it("handles empty cells (no value or formula)", () => {
    const xml = wrapSheet('<row r="1"><c r="A1"></c></row>');
    const rows = parseWorksheet(xml, []);

    expect(rows[0][0].type).toBe(CellType.EMPTY);
    expect(rows[0][0].value).toBe(null);
  });

  it("handles sparse rows with gaps", () => {
    const xml = wrapSheet(
      '<row r="1"><c r="A1"><v>1</v></c><c r="C1"><v>3</v></c></row>',
    );
    const rows = parseWorksheet(xml, []);

    expect(rows[0].length).toBe(3);
    expect(rows[0][0].value).toBe(1);
    expect(rows[0][1].type).toBe(CellType.EMPTY);
    expect(rows[0][2].value).toBe(3);
  });

  it("handles sparse rows with gap between row indices", () => {
    const xml = wrapSheet(
      '<row r="1"><c r="A1"><v>1</v></c></row><row r="3"><c r="A3"><v>3</v></c></row>',
    );
    const rows = parseWorksheet(xml, []);

    expect(rows.length).toBe(3);
    expect(rows[0][0].value).toBe(1);
    expect(rows[1][0].type).toBe(CellType.EMPTY);
    expect(rows[2][0].value).toBe(3);
  });

  it("handles inline string with empty <is> element", () => {
    const xml = wrapSheet(
      '<row r="1"><c r="A1" t="inlineStr"><is></is></c></row>',
    );
    const rows = parseWorksheet(xml, []);

    expect(rows[0][0].value).toBe("");
    expect(rows[0][0].type).toBe(CellType.STRING);
  });

  it("handles shared string index out of bounds gracefully", () => {
    const xml = wrapSheet('<row r="1"><c r="A1" t="s"><v>999</v></c></row>');
    const rows = parseWorksheet(xml, ["only_one"]);

    // Out of bounds should return undefined from array, falling back to ""
    expect(rows[0][0].type).toBe(CellType.STRING);
  });

  it("handles formula with empty string (shared formula marker)", () => {
    const xml = wrapSheet('<row r="1"><c r="A1"><f></f><v>42</v></c></row>');
    const rows = parseWorksheet(xml, []);

    // Empty formula string is treated as null formula
    expect(rows[0][0].value).toBe(42);
  });

  it("handles non-numeric value in numeric cell as string", () => {
    const xml = wrapSheet('<row r="1"><c r="A1"><v>not-a-number</v></c></row>');
    const rows = parseWorksheet(xml, []);

    expect(rows[0][0].value).toBe("not-a-number");
    expect(rows[0][0].type).toBe(CellType.STRING);
  });

  it("parses cells without r attribute using positional order", () => {
    const xml = wrapSheet(
      '<row r="1"><c t="s"><v>0</v></c><c t="s"><v>1</v></c></row>',
    );
    const rows = parseWorksheet(xml, ["Hello", "World"]);

    expect(rows.length).toBe(1);
    expect(rows[0].length).toBe(2);
    expect(rows[0][0].value).toBe("Hello");
    expect(rows[0][1].value).toBe("World");
  });

  it("handles mix of cells with and without r attribute", () => {
    const xml = wrapSheet(
      '<row r="1"><c r="A1"><v>1</v></c><c><v>2</v></c><c><v>3</v></c></row>',
    );
    const rows = parseWorksheet(xml, []);

    expect(rows[0].length).toBe(3);
    expect(rows[0][0].value).toBe(1);
    expect(rows[0][1].value).toBe(2);
    expect(rows[0][2].value).toBe(3);
  });

  it("positions implicit cells after the last explicit ref", () => {
    const xml = wrapSheet(
      '<row r="1"><c r="C1"><v>10</v></c><c><v>20</v></c></row>',
    );
    const rows = parseWorksheet(xml, []);

    expect(rows[0][2].value).toBe(10);
    expect(rows[0][3].value).toBe(20);
  });
});
