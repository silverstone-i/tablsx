// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { describe, it, expect } from "vitest";
import {
  readXlsx,
  writeXlsx,
  createWorkbook,
  createWorksheet,
  createCell,
} from "../../src/index.js";
import { createZip } from "../../src/writer/zip.js";

/**
 * Helper to build a zip from a plain object of path → string pairs.
 */
function makeZip(obj) {
  return createZip(new Map(Object.entries(obj)));
}

describe("readXlsx error handling", () => {
  it("throws for missing [Content_Types].xml", () => {
    const zip = makeZip({ "_rels/.rels": "<Relationships/>" });
    expect(() => readXlsx(zip)).toThrow("Missing [Content_Types].xml");
  });

  it("throws for missing _rels/.rels", () => {
    const zip = makeZip({ "[Content_Types].xml": "<Types/>" });
    expect(() => readXlsx(zip)).toThrow("Missing _rels/.rels");
  });

  it("throws for missing xl/workbook.xml", () => {
    const zip = makeZip({
      "[Content_Types].xml": "<Types/>",
      "_rels/.rels": "<Relationships/>",
    });
    expect(() => readXlsx(zip)).toThrow("Missing xl/workbook.xml");
  });

  it("throws for missing xl/_rels/workbook.xml.rels", () => {
    const zip = makeZip({
      "[Content_Types].xml": "<Types/>",
      "_rels/.rels": "<Relationships/>",
      "xl/workbook.xml":
        '<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="S1" sheetId="1" r:id="rId1"/></sheets></workbook>',
    });
    expect(() => readXlsx(zip)).toThrow("Missing xl/_rels/workbook.xml.rels");
  });

  it("reads a valid xlsx written by writeXlsx without errors", () => {
    const wb = createWorkbook([createWorksheet("Test", [[createCell("ok")]])]);
    const buffer = writeXlsx(wb);
    const result = readXlsx(buffer);
    expect(result.sheets[0].rows[0][0].value).toBe("ok");
  });

  it("resolves relationship targets with .. path segments", () => {
    const zip = makeZip({
      "[Content_Types].xml": "<Types/>",
      "_rels/.rels": "<Relationships/>",
      "xl/workbook.xml":
        '<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets></workbook>',
      "xl/_rels/workbook.xml.rels":
        '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="../worksheets/sheet1.xml"/></Relationships>',
      "worksheets/sheet1.xml":
        '<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>hello</t></is></c></row></sheetData></worksheet>',
    });
    const result = readXlsx(zip);
    expect(result.sheets[0].name).toBe("Sheet1");
    expect(result.sheets[0].rows[0][0].value).toBe("hello");
  });
});
