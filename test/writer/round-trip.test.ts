// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { describe, it, expect } from "vitest";
import {
  readXlsx,
  writeXlsx,
  createWorkbook,
  createWorksheet,
  createCell,
  CellType,
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
    expect(result.sheets[0].rows[0][0].type).toBe(CellType.STRING);
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
    expect(result.sheets[0].rows[0][0].type).toBe(CellType.NUMBER);
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
    expect(result.sheets[0].rows[0][0].type).toBe(CellType.BOOLEAN);
    expect(result.sheets[0].rows[0][1].value).toBe(false);
    expect(result.sheets[0].rows[0][1].type).toBe(CellType.BOOLEAN);
  });

  it("round-trips empty cells", () => {
    const wb = createWorkbook([
      createWorksheet("Mixed", [
        [
          createCell("A"),
          createCell(null, null, CellType.EMPTY),
          createCell("C"),
        ],
      ]),
    ]);

    const buffer = writeXlsx(wb);
    const result = readXlsx(buffer);

    expect(result.sheets[0].rows[0][0].value).toBe("A");
    expect(result.sheets[0].rows[0][1].type).toBe(CellType.EMPTY);
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
    expect(result.sheets[0].rows[1][1].type).toBe(CellType.NUMBER);
    expect(result.sheets[0].rows[1][2].value).toBe(true);
    expect(result.sheets[0].rows[1][2].type).toBe(CellType.BOOLEAN);
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

    expect(result.sheets[0].rows[0][0].type).toBe(CellType.DATE);
    expect(result.sheets[0].rows[0][0].value).toBeInstanceOf(Date);
    expect(result.sheets[0].rows[0][0].value.toISOString()).toBe(
      d1.toISOString(),
    );
    expect(result.sheets[0].rows[0][1].type).toBe(CellType.DATE);
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

  it("round-trips formula cells with numeric cached value", () => {
    const wb = createWorkbook([
      createWorksheet("Formulas", [
        [createCell(10), createCell(20), createCell(30, "SUM(A1:B1)")],
      ]),
    ]);

    const buffer = writeXlsx(wb);
    const result = readXlsx(buffer);

    expect(result.sheets[0].rows[0][2].type).toBe(CellType.FORMULA);
    expect(result.sheets[0].rows[0][2].formula).toBe("SUM(A1:B1)");
    expect(result.sheets[0].rows[0][2].value).toBe(30);
  });

  it("round-trips formula cells with string cached value", () => {
    const wb = createWorkbook([
      createWorksheet("Formulas", [
        [createCell("hello world", 'CONCATENATE("hello"," ","world")')],
      ]),
    ]);

    const buffer = writeXlsx(wb);
    const result = readXlsx(buffer);

    expect(result.sheets[0].rows[0][0].type).toBe(CellType.FORMULA);
    expect(result.sheets[0].rows[0][0].formula).toBe(
      'CONCATENATE("hello"," ","world")',
    );
    expect(result.sheets[0].rows[0][0].value).toBe("hello world");
  });

  it("round-trips vector cells (read back as STRING in Phase 1)", () => {
    const wb = createWorkbook([
      createWorksheet("Vectors", [
        [createCell([1.5, 2.5, 3.5]), createCell([0, -1, 1e10])],
      ]),
    ]);

    const buffer = writeXlsx(wb);
    const result = readXlsx(buffer);

    // Phase 1: reader does not deserialize vectors, they come back as STRING
    expect(result.sheets[0].rows[0][0].type).toBe(CellType.STRING);
    expect(result.sheets[0].rows[0][0].value).toBe("[1.5,2.5,3.5]");
    expect(result.sheets[0].rows[0][1].type).toBe(CellType.STRING);
    expect(result.sheets[0].rows[0][1].value).toBe("[0,-1,10000000000]");
  });

  it("round-trips date+time values preserving hours/minutes/seconds", () => {
    const d = new Date("2024-06-15T14:30:45Z");
    const wb = createWorkbook([createWorksheet("DateTime", [[createCell(d)]])]);

    const buffer = writeXlsx(wb);
    const result = readXlsx(buffer);

    expect(result.sheets[0].rows[0][0].type).toBe(CellType.DATE);
    const rt = result.sheets[0].rows[0][0].value;
    expect(rt.getUTCFullYear()).toBe(2024);
    expect(rt.getUTCMonth()).toBe(5);
    expect(rt.getUTCDate()).toBe(15);
    expect(rt.getUTCHours()).toBe(14);
    expect(rt.getUTCMinutes()).toBe(30);
    expect(rt.getUTCSeconds()).toBe(45);
  });

  it("round-trips dates near the 1900 leap year bug boundary", () => {
    // 1900-02-28 is the last date before the phantom leap day
    const d1 = new Date(Date.UTC(1900, 1, 28));
    // 1900-03-01 is the first date after the phantom leap day
    const d2 = new Date(Date.UTC(1900, 2, 1));
    const wb = createWorkbook([
      createWorksheet("1900Bug", [[createCell(d1), createCell(d2)]]),
    ]);

    const buffer = writeXlsx(wb);
    const result = readXlsx(buffer);

    expect(result.sheets[0].rows[0][0].type).toBe(CellType.DATE);
    expect(result.sheets[0].rows[0][0].value.toISOString()).toBe(
      "1900-02-28T00:00:00.000Z",
    );
    expect(result.sheets[0].rows[0][1].type).toBe(CellType.DATE);
    expect(result.sheets[0].rows[0][1].value.toISOString()).toBe(
      "1900-03-01T00:00:00.000Z",
    );
  });

  it("round-trips epoch boundary dates", () => {
    const d1 = new Date(Date.UTC(1900, 0, 1)); // Excel epoch start
    const d2 = new Date(Date.UTC(2099, 11, 31)); // Far future
    const wb = createWorkbook([
      createWorksheet("Epochs", [[createCell(d1), createCell(d2)]]),
    ]);

    const buffer = writeXlsx(wb);
    const result = readXlsx(buffer);

    expect(result.sheets[0].rows[0][0].value.toISOString()).toBe(
      "1900-01-01T00:00:00.000Z",
    );
    expect(result.sheets[0].rows[0][1].value.toISOString()).toBe(
      "2099-12-31T00:00:00.000Z",
    );
  });

  it("round-trips all supported types in a single row", () => {
    const date = new Date("2024-03-15T00:00:00Z");
    const wb = createWorkbook([
      createWorksheet("AllTypes", [
        [
          createCell("text"),
          createCell(42),
          createCell(true),
          createCell(date),
          createCell(100, "SUM(A1:A10)"),
          createCell(null, null, CellType.EMPTY),
          createCell([1.1, 2.2, 3.3]),
        ],
      ]),
    ]);

    const buffer = writeXlsx(wb);
    const result = readXlsx(buffer);

    const row = result.sheets[0].rows[0];
    expect(row[0].type).toBe(CellType.STRING);
    expect(row[0].value).toBe("text");
    expect(row[1].type).toBe(CellType.NUMBER);
    expect(row[1].value).toBe(42);
    expect(row[2].type).toBe(CellType.BOOLEAN);
    expect(row[2].value).toBe(true);
    expect(row[3].type).toBe(CellType.DATE);
    expect(row[3].value.toISOString()).toBe("2024-03-15T00:00:00.000Z");
    expect(row[4].type).toBe(CellType.FORMULA);
    expect(row[4].formula).toBe("SUM(A1:A10)");
    expect(row[4].value).toBe(100);
    expect(row[5].type).toBe(CellType.EMPTY);
    expect(row[6].type).toBe(CellType.STRING); // vectors read as STRING
    expect(row[6].value).toBe("[1.1,2.2,3.3]");
  });

  it("round-trips numeric precision edge cases", () => {
    const wb = createWorkbook([
      createWorksheet("Precision", [
        [
          createCell(Number.MAX_SAFE_INTEGER),
          createCell(0.1 + 0.2), // IEEE 754 classic
          createCell(1e-15),
          createCell(-0),
        ],
      ]),
    ]);

    const buffer = writeXlsx(wb);
    const result = readXlsx(buffer);

    expect(result.sheets[0].rows[0][0].value).toBe(Number.MAX_SAFE_INTEGER);
    expect(result.sheets[0].rows[0][1].value).toBe(0.1 + 0.2);
    expect(result.sheets[0].rows[0][2].value).toBe(1e-15);
    expect(result.sheets[0].rows[0][3].type).toBe(CellType.NUMBER);
  });

  it("round-trips vector precision through JSON serialization", () => {
    const vec = [0.123456789012345, -1e-10, 3.141592653589793];
    const wb = createWorkbook([
      createWorksheet("VecPrecision", [[createCell(vec)]]),
    ]);

    const buffer = writeXlsx(wb);
    const result = readXlsx(buffer);

    // Vectors round-trip as JSON strings, so parse back to verify precision
    const parsed = JSON.parse(result.sheets[0].rows[0][0].value);
    expect(parsed).toEqual(vec);
  });

  it("round-trips formula with null cached value", () => {
    const cell = createCell(null, "NOW()", CellType.FORMULA);
    const wb = createWorkbook([createWorksheet("F", [[cell]])]);

    const buffer = writeXlsx(wb);
    const result = readXlsx(buffer);

    expect(result.sheets[0].rows[0][0].type).toBe(CellType.FORMULA);
    expect(result.sheets[0].rows[0][0].formula).toBe("NOW()");
  });
});
