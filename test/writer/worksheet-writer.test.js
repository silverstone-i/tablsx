// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { describe, it, expect } from "vitest";
import { generateWorksheetXml } from "../../src/writer/worksheet-writer.js";
import { createCell } from "../../src/model/workbook.js";
import { CellType } from "../../src/model/types.js";
import { DATE_STYLE_INDEX } from "../../src/writer/styles-writer.js";

describe("generateWorksheetXml", () => {
  it("generates empty worksheet with no rows", () => {
    const sheet = { rows: [] };
    const xml = generateWorksheetXml(sheet, new Map());
    expect(xml).toContain("<sheetData>");
    expect(xml).toContain("</sheetData>");
    expect(xml).not.toContain("<row");
  });

  it("skips empty cells in output", () => {
    const sheet = {
      rows: [[createCell(null, null, CellType.EMPTY)]],
    };
    const xml = generateWorksheetXml(sheet, new Map());
    expect(xml).toContain("<row");
    expect(xml).not.toContain("<c ");
  });

  it("generates string cells referencing shared strings map", () => {
    const map = new Map([["Hello", 0]]);
    const sheet = { rows: [[createCell("Hello")]] };
    const xml = generateWorksheetXml(sheet, map);

    expect(xml).toContain('t="s"');
    expect(xml).toContain("<v>0</v>");
  });

  it("generates inline string when not in shared strings map", () => {
    const sheet = { rows: [[createCell("Inline")]] };
    const xml = generateWorksheetXml(sheet, new Map());

    expect(xml).toContain('t="inlineStr"');
    expect(xml).toContain("<is><t>Inline</t></is>");
  });

  it("generates number cells", () => {
    const sheet = { rows: [[createCell(42)]] };
    const xml = generateWorksheetXml(sheet, new Map());

    expect(xml).toContain("<v>42</v>");
    expect(xml).not.toContain('t="');
  });

  it("generates boolean cells with t='b'", () => {
    const sheet = {
      rows: [[createCell(true), createCell(false)]],
    };
    const xml = generateWorksheetXml(sheet, new Map());

    expect(xml).toContain('t="b"');
    expect(xml).toContain("<v>1</v>");
    expect(xml).toContain("<v>0</v>");
  });

  it("generates date cells with style index and serial number", () => {
    const date = new Date("2024-01-01T00:00:00Z");
    const sheet = { rows: [[createCell(date)]] };
    const xml = generateWorksheetXml(sheet, new Map());

    expect(xml).toContain(`s="${DATE_STYLE_INDEX}"`);
    expect(xml).toContain("<v>45292</v>");
  });

  it("generates formula cells with <f> and <v>", () => {
    const sheet = {
      rows: [[createCell(100, "SUM(A1:A10)")]],
    };
    const xml = generateWorksheetXml(sheet, new Map());

    expect(xml).toContain("<f>SUM(A1:A10)</f>");
    expect(xml).toContain("<v>100</v>");
  });

  it("generates formula cells with string value using t='str'", () => {
    const sheet = {
      rows: [[createCell("hello", "A1&B1")]],
    };
    const xml = generateWorksheetXml(sheet, new Map());

    expect(xml).toContain('t="str"');
    expect(xml).toContain("<f>A1&amp;B1</f>");
    expect(xml).toContain("<v>hello</v>");
  });

  it("generates formula cells with null cached value (no <v>)", () => {
    const cell = createCell(null, "NOW()", CellType.FORMULA);
    const sheet = { rows: [[cell]] };
    const xml = generateWorksheetXml(sheet, new Map());

    expect(xml).toContain("<f>NOW()</f>");
    expect(xml).not.toContain("<v>");
  });

  it("generates vector cells as shared string JSON", () => {
    const vec = [1.5, 2.5, 3.5];
    const jsonStr = "[1.5,2.5,3.5]";
    const map = new Map([[jsonStr, 0]]);
    const sheet = { rows: [[createCell(vec, null, CellType.VECTOR)]] };
    const xml = generateWorksheetXml(sheet, map);

    expect(xml).toContain('t="s"');
    expect(xml).toContain("<v>0</v>");
  });

  it("generates vector cells as inline string when not in shared strings", () => {
    const vec = [1, 2, 3];
    const sheet = { rows: [[createCell(vec, null, CellType.VECTOR)]] };
    const xml = generateWorksheetXml(sheet, new Map());

    expect(xml).toContain('t="inlineStr"');
    expect(xml).toContain("[1,2,3]");
  });

  it("uses correct cell references (A1, B1, A2, etc.)", () => {
    const sheet = {
      rows: [
        [createCell("A1"), createCell("B1")],
        [createCell("A2"), createCell("B2")],
      ],
    };
    const map = new Map([
      ["A1", 0],
      ["B1", 1],
      ["A2", 2],
      ["B2", 3],
    ]);
    const xml = generateWorksheetXml(sheet, map);

    expect(xml).toContain('r="A1"');
    expect(xml).toContain('r="B1"');
    expect(xml).toContain('r="A2"');
    expect(xml).toContain('r="B2"');
  });

  it("throws for unsupported cell type", () => {
    const cell = { value: "x", formula: null, type: "unsupported" };
    const sheet = { rows: [[cell]] };

    expect(() => generateWorksheetXml(sheet, new Map())).toThrow(
      "Unsupported cell type",
    );
  });

  it("adds xml:space='preserve' for inline strings with leading/trailing whitespace", () => {
    const sheet = { rows: [[createCell(" padded ")]] };
    const xml = generateWorksheetXml(sheet, new Map());
    expect(xml).toContain('xml:space="preserve"');
    expect(xml).toContain(" padded ");
  });

  it("omits xml:space for inline strings without surrounding whitespace", () => {
    const sheet = { rows: [[createCell("no-pad")]] };
    const xml = generateWorksheetXml(sheet, new Map());
    expect(xml).toContain('t="inlineStr"');
    expect(xml).not.toContain("xml:space");
  });

  it("throws for DATE cells with non-finite serial", () => {
    const cell = createCell("not-a-date", null, CellType.DATE);
    const sheet = { rows: [[cell]] };
    expect(() => generateWorksheetXml(sheet, new Map())).toThrow(
      "non-finite serial",
    );
  });
});
