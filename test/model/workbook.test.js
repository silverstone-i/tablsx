// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { describe, it, expect } from "vitest";
import {
  createCell,
  createWorksheet,
  createWorkbook,
  normalizeRows,
} from "../../src/model/workbook.js";

describe("createCell", () => {
  it("creates an empty cell by default", () => {
    const cell = createCell();
    expect(cell).toEqual({ value: null, formula: null, type: "empty" });
  });

  it("infers string type", () => {
    const cell = createCell("hello");
    expect(cell.type).toBe("string");
    expect(cell.value).toBe("hello");
  });

  it("infers number type", () => {
    const cell = createCell(42);
    expect(cell.type).toBe("number");
  });

  it("infers boolean type", () => {
    const cell = createCell(true);
    expect(cell.type).toBe("boolean");
  });

  it("infers date type", () => {
    const cell = createCell(new Date("2024-01-01"));
    expect(cell.type).toBe("date");
  });

  it("creates a formula cell", () => {
    const cell = createCell(42, "SUM(A1:A10)");
    expect(cell.type).toBe("formula");
    expect(cell.formula).toBe("SUM(A1:A10)");
    expect(cell.value).toBe(42);
  });

  it("accepts explicit type override", () => {
    const cell = createCell(42, null, "number");
    expect(cell.type).toBe("number");
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
    expect(normalized[1][1].type).toBe("empty");
    expect(normalized[1][2].type).toBe("empty");
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
