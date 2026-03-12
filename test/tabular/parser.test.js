// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { describe, it, expect } from "vitest";
import { rowsFromSheet } from "../../src/tabular/parser.js";
import { createCell } from "../../src/model/workbook.js";
import { CellType } from "../../src/model/types.js";

describe("rowsFromSheet", () => {
  it("returns empty array for empty sheet", () => {
    expect(rowsFromSheet({ name: "Sheet1", rows: [] })).toEqual([]);
  });

  it("returns empty array for header-only sheet", () => {
    const sheet = {
      name: "Sheet1",
      rows: [[createCell("Name"), createCell("Age")]],
    };
    expect(rowsFromSheet(sheet)).toEqual([]);
  });

  it("parses STRING cells to string values", () => {
    const sheet = {
      name: "Sheet1",
      rows: [[createCell("Name")], [createCell("Alice")]],
    };
    const rows = rowsFromSheet(sheet);
    expect(rows).toEqual([{ Name: "Alice" }]);
  });

  it("parses NUMBER cells to number values", () => {
    const sheet = {
      name: "Sheet1",
      rows: [[createCell("Age")], [createCell(30)]],
    };
    const rows = rowsFromSheet(sheet);
    expect(rows[0].Age).toBe(30);
  });

  it("parses BOOLEAN cells to boolean values", () => {
    const sheet = {
      name: "Sheet1",
      rows: [[createCell("Active")], [createCell(true)]],
    };
    const rows = rowsFromSheet(sheet);
    expect(rows[0].Active).toBe(true);
  });

  it("parses DATE cells to Date objects", () => {
    const date = new Date("2024-01-15T00:00:00.000Z");
    const sheet = {
      name: "Sheet1",
      rows: [[createCell("Created")], [createCell(date)]],
    };
    const rows = rowsFromSheet(sheet);
    expect(rows[0].Created).toEqual(date);
    expect(rows[0].Created).toBeInstanceOf(Date);
  });

  it("parses EMPTY cells to null", () => {
    const sheet = {
      name: "Sheet1",
      rows: [[createCell("Name")], [createCell(null, null, CellType.EMPTY)]],
    };
    const rows = rowsFromSheet(sheet);
    expect(rows[0].Name).toBeNull();
  });

  it("parses FORMULA cells using cached value", () => {
    const sheet = {
      name: "Sheet1",
      rows: [
        [createCell("Total")],
        [createCell(42, "SUM(A1:A10)", CellType.FORMULA)],
      ],
    };
    const rows = rowsFromSheet(sheet);
    expect(rows[0].Total).toBe(42);
  });

  it("deserializes vector STRING cells with vector override", () => {
    const sheet = {
      name: "Sheet1",
      rows: [[createCell("Embedding")], [createCell("[0.1,0.2,0.3]")]],
    };
    const rows = rowsFromSheet(sheet, {
      columns: { Embedding: { type: "vector" } },
    });
    expect(rows[0].Embedding).toEqual([0.1, 0.2, 0.3]);
  });

  it("passes through VECTOR cell values with vector override", () => {
    const sheet = {
      name: "Sheet1",
      rows: [
        [createCell("Embedding")],
        [createCell([0.1, 0.2, 0.3], null, CellType.VECTOR)],
      ],
    };
    const rows = rowsFromSheet(sheet, {
      columns: { Embedding: { type: "vector" } },
    });
    expect(rows[0].Embedding).toEqual([0.1, 0.2, 0.3]);
  });

  it("keeps vector strings as strings without override", () => {
    const sheet = {
      name: "Sheet1",
      rows: [[createCell("Embedding")], [createCell("[0.1,0.2,0.3]")]],
    };
    const rows = rowsFromSheet(sheet);
    expect(rows[0].Embedding).toBe("[0.1,0.2,0.3]");
  });

  it("converts NUMBER cells to Date with date override", () => {
    const sheet = {
      name: "Sheet1",
      rows: [[createCell("Created")], [createCell(45307)]],
    };
    const rows = rowsFromSheet(sheet, {
      columns: { Created: { type: "date" } },
    });
    expect(rows[0].Created).toBeInstanceOf(Date);
  });

  it("parses multiple data rows", () => {
    const sheet = {
      name: "Sheet1",
      rows: [
        [createCell("Name"), createCell("Age")],
        [createCell("Alice"), createCell(30)],
        [createCell("Bob"), createCell(25)],
      ],
    };
    const rows = rowsFromSheet(sheet);
    expect(rows).toEqual([
      { Name: "Alice", Age: 30 },
      { Name: "Bob", Age: 25 },
    ]);
  });

  it("handles header names with spaces and special chars", () => {
    const sheet = {
      name: "Sheet1",
      rows: [
        [createCell("First Name"), createCell("age (years)")],
        [createCell("Alice"), createCell(30)],
      ],
    };
    const rows = rowsFromSheet(sheet);
    expect(rows[0]["First Name"]).toBe("Alice");
    expect(rows[0]["age (years)"]).toBe(30);
  });
});
