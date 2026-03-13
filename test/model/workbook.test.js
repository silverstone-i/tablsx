// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { describe, it, expect } from "vitest";
import {
  createCell,
  createWorksheet,
  createWorkbook,
  normalizeRows,
} from "../../src/model/workbook.js";
import { CellType } from "../../src/model/types.js";

describe("createCell", () => {
  it("creates an empty cell by default", () => {
    const cell = createCell();
    expect(cell).toEqual({ value: null, formula: null, type: CellType.EMPTY });
  });

  it("infers string type", () => {
    const cell = createCell("hello");
    expect(cell.type).toBe(CellType.STRING);
    expect(cell.value).toBe("hello");
  });

  it("infers number type", () => {
    const cell = createCell(42);
    expect(cell.type).toBe(CellType.NUMBER);
  });

  it("infers boolean type", () => {
    const cell = createCell(true);
    expect(cell.type).toBe(CellType.BOOLEAN);
  });

  it("infers date type", () => {
    const cell = createCell(new Date("2024-01-01"));
    expect(cell.type).toBe(CellType.DATE);
  });

  it("creates a formula cell", () => {
    const cell = createCell(42, "SUM(A1:A10)");
    expect(cell.type).toBe(CellType.FORMULA);
    expect(cell.formula).toBe("SUM(A1:A10)");
    expect(cell.value).toBe(42);
  });

  it("accepts explicit type override", () => {
    const cell = createCell(42, null, CellType.NUMBER);
    expect(cell.type).toBe(CellType.NUMBER);
  });
});

describe("createWorksheet", () => {
  it("creates a worksheet with a name", () => {
    const ws = createWorksheet("Sheet1");
    expect(ws.name).toBe("Sheet1");
    expect(ws.rows).toEqual([]);
  });

  it("creates a worksheet with rows", () => {
    const rows = [[createCell("A"), createCell("B")]];
    const ws = createWorksheet("Data", rows);
    expect(ws.rows).toBe(rows);
  });
});

describe("createWorkbook", () => {
  it("creates an empty workbook", () => {
    const wb = createWorkbook();
    expect(wb.sheets).toEqual([]);
  });

  it("throws on duplicate sheet names", () => {
    expect(() =>
      createWorkbook([createWorksheet("Sheet1"), createWorksheet("Sheet1")]),
    ).toThrow('Duplicate sheet name: "Sheet1"');
  });

  it("allows distinct sheet names", () => {
    const wb = createWorkbook([
      createWorksheet("Sheet1"),
      createWorksheet("Sheet2"),
    ]);
    expect(wb.sheets.length).toBe(2);
  });

  it("throws on sheet name exceeding 31 characters", () => {
    const longName = "A".repeat(32);
    expect(() => createWorkbook([createWorksheet(longName)])).toThrow(
      "exceeds Excel's 31-character limit",
    );
  });

  it("allows sheet name of exactly 31 characters", () => {
    const name = "A".repeat(31);
    const wb = createWorkbook([createWorksheet(name)]);
    expect(wb.sheets.length).toBe(1);
  });

  it.each(["[", "]", ":", "*", "?", "/", "\\"])(
    "throws on sheet name containing '%s'",
    (char) => {
      expect(() => createWorkbook([createWorksheet(`Sheet${char}1`)])).toThrow(
        `contains invalid character: "${char}"`,
      );
    },
  );
});

describe("normalizeRows", () => {
  it("pads short rows with empty cells", () => {
    const rows = [
      [createCell("A"), createCell("B"), createCell("C")],
      [createCell("D")],
    ];
    const normalized = normalizeRows(rows);
    expect(normalized[0].length).toBe(3);
    expect(normalized[1].length).toBe(3);
    expect(normalized[1][1].type).toBe(CellType.EMPTY);
    expect(normalized[1][2].type).toBe(CellType.EMPTY);
  });

  it("handles empty rows array", () => {
    expect(normalizeRows([])).toEqual([]);
  });

  it("does not modify already-uniform rows", () => {
    const rows = [
      [createCell("A"), createCell("B")],
      [createCell("C"), createCell("D")],
    ];
    const normalized = normalizeRows(rows);
    expect(normalized[0].length).toBe(2);
    expect(normalized[1].length).toBe(2);
  });
});
