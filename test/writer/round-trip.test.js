// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { describe, it, expect } from "vitest";
import {
  readXlsx,
  writeXlsx,
  createWorkbook,
  createWorksheet,
  createCell,
} from "../../src/index.js";

describe("round-trip", () => {
  it("round-trips string cells", () => {
    const wb = createWorkbook([
      createWorksheet("Sheet1", [
        [createCell("Hello"), createCell("World")],
        [createCell("Foo"), createCell("Bar")],
      ]),
    ]);

    const buffer = writeXlsx(wb);
    const result = readXlsx(buffer);

    expect(result.sheets.length).toBe(1);
    expect(result.sheets[0].name).toBe("Sheet1");
    expect(result.sheets[0].rows[0][0].value).toBe("Hello");
    expect(result.sheets[0].rows[0][0].type).toBe("string");
    expect(result.sheets[0].rows[0][1].value).toBe("World");
    expect(result.sheets[0].rows[1][0].value).toBe("Foo");
    expect(result.sheets[0].rows[1][1].value).toBe("Bar");
  });

  it("round-trips number cells", () => {
    const wb = createWorkbook([
      createWorksheet("Numbers", [
        [createCell(1), createCell(2.5), createCell(0)],
        [createCell(-10), createCell(3.14159), createCell(1e10)],
      ]),
    ]);

    const buffer = writeXlsx(wb);
    const result = readXlsx(buffer);

    expect(result.sheets[0].rows[0][0].value).toBe(1);
    expect(result.sheets[0].rows[0][0].type).toBe("number");
    expect(result.sheets[0].rows[0][1].value).toBe(2.5);
    expect(result.sheets[0].rows[1][0].value).toBe(-10);
    expect(result.sheets[0].rows[1][1].value).toBeCloseTo(3.14159);
    expect(result.sheets[0].rows[1][2].value).toBe(1e10);
  });

  it("round-trips boolean cells", () => {
    const wb = createWorkbook([
      createWorksheet("Booleans", [[createCell(true), createCell(false)]]),
    ]);

    const buffer = writeXlsx(wb);
    const result = readXlsx(buffer);

    expect(result.sheets[0].rows[0][0].value).toBe(true);
    expect(result.sheets[0].rows[0][0].type).toBe("boolean");
    expect(result.sheets[0].rows[0][1].value).toBe(false);
    expect(result.sheets[0].rows[0][1].type).toBe("boolean");
  });

  it("round-trips empty cells", () => {
    const wb = createWorkbook([
      createWorksheet("Mixed", [
        [createCell("A"), createCell(null, null, "empty"), createCell("C")],
      ]),
    ]);

    const buffer = writeXlsx(wb);
    const result = readXlsx(buffer);

    expect(result.sheets[0].rows[0][0].value).toBe("A");
    expect(result.sheets[0].rows[0][1].type).toBe("empty");
    expect(result.sheets[0].rows[0][1].value).toBe(null);
    expect(result.sheets[0].rows[0][2].value).toBe("C");
  });

  it("round-trips mixed type cells", () => {
    const wb = createWorkbook([
      createWorksheet("Mixed", [
        [createCell("Name"), createCell("Age"), createCell("Active")],
        [createCell("Alice"), createCell(30), createCell(true)],
        [createCell("Bob"), createCell(25), createCell(false)],
      ]),
    ]);

    const buffer = writeXlsx(wb);
    const result = readXlsx(buffer);

    expect(result.sheets[0].rows[0][0].value).toBe("Name");
    expect(result.sheets[0].rows[1][0].value).toBe("Alice");
    expect(result.sheets[0].rows[1][1].value).toBe(30);
    expect(result.sheets[0].rows[1][1].type).toBe("number");
    expect(result.sheets[0].rows[1][2].value).toBe(true);
    expect(result.sheets[0].rows[1][2].type).toBe("boolean");
    expect(result.sheets[0].rows[2][0].value).toBe("Bob");
    expect(result.sheets[0].rows[2][1].value).toBe(25);
    expect(result.sheets[0].rows[2][2].value).toBe(false);
  });

  it("round-trips multi-sheet workbooks", () => {
    const wb = createWorkbook([
      createWorksheet("Sheet1", [[createCell("A1"), createCell("B1")]]),
      createWorksheet("Sheet2", [
        [createCell(100), createCell(200)],
        [createCell(300), createCell(400)],
      ]),
      createWorksheet("Sheet3", [[createCell(true)]]),
    ]);

    const buffer = writeXlsx(wb);
    const result = readXlsx(buffer);

    expect(result.sheets.length).toBe(3);
    expect(result.sheets[0].name).toBe("Sheet1");
    expect(result.sheets[1].name).toBe("Sheet2");
    expect(result.sheets[2].name).toBe("Sheet3");

    expect(result.sheets[0].rows[0][0].value).toBe("A1");
    expect(result.sheets[1].rows[0][0].value).toBe(100);
    expect(result.sheets[1].rows[1][1].value).toBe(400);
    expect(result.sheets[2].rows[0][0].value).toBe(true);
  });

  it("round-trips an empty worksheet", () => {
    const wb = createWorkbook([createWorksheet("Empty", [])]);

    const buffer = writeXlsx(wb);
    const result = readXlsx(buffer);

    expect(result.sheets.length).toBe(1);
    expect(result.sheets[0].name).toBe("Empty");
    expect(result.sheets[0].rows).toEqual([]);
  });

  it("round-trips a single-cell worksheet", () => {
    const wb = createWorkbook([
      createWorksheet("Single", [[createCell("only")]]),
    ]);

    const buffer = writeXlsx(wb);
    const result = readXlsx(buffer);

    expect(result.sheets[0].rows.length).toBe(1);
    expect(result.sheets[0].rows[0].length).toBe(1);
    expect(result.sheets[0].rows[0][0].value).toBe("only");
  });

  it("round-trips special XML characters in strings", () => {
    const wb = createWorkbook([
      createWorksheet("Special", [
        [createCell("<tag>"), createCell("A&B"), createCell('"quoted"')],
      ]),
    ]);

    const buffer = writeXlsx(wb);
    const result = readXlsx(buffer);

    expect(result.sheets[0].rows[0][0].value).toBe("<tag>");
    expect(result.sheets[0].rows[0][1].value).toBe("A&B");
    expect(result.sheets[0].rows[0][2].value).toBe('"quoted"');
  });

  it("round-trips a workbook with only headers (no data rows)", () => {
    const wb = createWorkbook([
      createWorksheet("Headers", [
        [createCell("Name"), createCell("Age"), createCell("Email")],
      ]),
    ]);

    const buffer = writeXlsx(wb);
    const result = readXlsx(buffer);

    expect(result.sheets[0].rows.length).toBe(1);
    expect(result.sheets[0].rows[0][0].value).toBe("Name");
    expect(result.sheets[0].rows[0][1].value).toBe("Age");
    expect(result.sheets[0].rows[0][2].value).toBe("Email");
  });

  it("preserves deduplicated shared strings", () => {
    const wb = createWorkbook([
      createWorksheet("Dedup", [
        [createCell("repeat"), createCell("repeat"), createCell("unique")],
        [createCell("repeat"), createCell("other"), createCell("unique")],
      ]),
    ]);

    const buffer = writeXlsx(wb);
    const result = readXlsx(buffer);

    expect(result.sheets[0].rows[0][0].value).toBe("repeat");
    expect(result.sheets[0].rows[0][1].value).toBe("repeat");
    expect(result.sheets[0].rows[0][2].value).toBe("unique");
    expect(result.sheets[0].rows[1][0].value).toBe("repeat");
    expect(result.sheets[0].rows[1][1].value).toBe("other");
  });

  it("round-trips date cells", () => {
    const d1 = new Date("2024-06-15T00:00:00Z");
    const d2 = new Date("2000-01-01T00:00:00Z");
    const wb = createWorkbook([
      createWorksheet("Dates", [[createCell(d1), createCell(d2)]]),
    ]);

    const buffer = writeXlsx(wb);
    const result = readXlsx(buffer);

    expect(result.sheets[0].rows[0][0].type).toBe("date");
    expect(result.sheets[0].rows[0][0].value).toBeInstanceOf(Date);
    expect(result.sheets[0].rows[0][0].value.toISOString()).toBe(
      d1.toISOString(),
    );
    expect(result.sheets[0].rows[0][1].type).toBe("date");
    expect(result.sheets[0].rows[0][1].value.toISOString()).toBe(
      d2.toISOString(),
    );
  });

  it("round-trips a workbook with many columns (beyond Z)", () => {
    const row = [];
    for (let i = 0; i < 30; i++) {
      row.push(createCell(`Col${i}`));
    }
    const wb = createWorkbook([createWorksheet("Wide", [row])]);

    const buffer = writeXlsx(wb);
    const result = readXlsx(buffer);

    expect(result.sheets[0].rows[0].length).toBe(30);
    expect(result.sheets[0].rows[0][0].value).toBe("Col0");
    expect(result.sheets[0].rows[0][26].value).toBe("Col26");
    expect(result.sheets[0].rows[0][29].value).toBe("Col29");
  });
});
