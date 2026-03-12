// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { describe, it, expect } from "vitest";
import { inferSchema } from "../../src/tabular/schema.js";
import { createCell } from "../../src/model/workbook.js";
import { CellType } from "../../src/model/types.js";

describe("inferSchema", () => {
  it("returns empty columns for empty sheet", () => {
    const result = inferSchema({ name: "Sheet1", rows: [] });
    expect(result).toEqual({ columns: [] });
  });

  it("returns columns with default STRING type for header-only sheet", () => {
    const sheet = {
      name: "Sheet1",
      rows: [[createCell("Name"), createCell("Age")]],
    };
    const result = inferSchema(sheet);
    expect(result).toEqual({
      columns: [
        { name: "Name", type: "string", nullable: true },
        { name: "Age", type: "string", nullable: true },
      ],
    });
  });

  it("detects uniform string column", () => {
    const sheet = {
      name: "Sheet1",
      rows: [[createCell("Name")], [createCell("Alice")], [createCell("Bob")]],
    };
    const result = inferSchema(sheet);
    expect(result.columns[0]).toEqual({
      name: "Name",
      type: "string",
      nullable: false,
    });
  });

  it("detects uniform number column", () => {
    const sheet = {
      name: "Sheet1",
      rows: [[createCell("Age")], [createCell(30)], [createCell(25)]],
    };
    const result = inferSchema(sheet);
    expect(result.columns[0]).toEqual({
      name: "Age",
      type: "number",
      nullable: false,
    });
  });

  it("detects uniform boolean column", () => {
    const sheet = {
      name: "Sheet1",
      rows: [[createCell("Active")], [createCell(true)], [createCell(false)]],
    };
    const result = inferSchema(sheet);
    expect(result.columns[0]).toEqual({
      name: "Active",
      type: "boolean",
      nullable: false,
    });
  });

  it("detects date column", () => {
    const sheet = {
      name: "Sheet1",
      rows: [
        [createCell("Created")],
        [createCell(new Date("2024-01-15"))],
        [createCell(new Date("2024-06-01"))],
      ],
    };
    const result = inferSchema(sheet);
    expect(result.columns[0]).toEqual({
      name: "Created",
      type: "date",
      nullable: false,
    });
  });

  it("detects vector column from STRING cells with vector JSON", () => {
    const sheet = {
      name: "Sheet1",
      rows: [
        [createCell("Embedding")],
        [createCell("[0.1,0.2,0.3]")],
        [createCell("[0.4,0.5,0.6]")],
      ],
    };
    const result = inferSchema(sheet);
    expect(result.columns[0]).toEqual({
      name: "Embedding",
      type: "vector",
      nullable: false,
    });
  });

  it("detects vector column from VECTOR-typed cells", () => {
    const sheet = {
      name: "Sheet1",
      rows: [
        [createCell("Embedding")],
        [createCell([0.1, 0.2, 0.3], null, CellType.VECTOR)],
        [createCell([0.4, 0.5, 0.6], null, CellType.VECTOR)],
      ],
    };
    const result = inferSchema(sheet);
    expect(result.columns[0]).toEqual({
      name: "Embedding",
      type: "vector",
      nullable: false,
    });
  });

  it("picks dominant type for mixed-type column", () => {
    const sheet = {
      name: "Sheet1",
      rows: [
        [createCell("Value")],
        [createCell(1)],
        [createCell(2)],
        [createCell(3)],
        [createCell("text")],
      ],
    };
    const result = inferSchema(sheet);
    expect(result.columns[0].type).toBe("number");
  });

  it("defaults to STRING when all data cells are empty", () => {
    const sheet = {
      name: "Sheet1",
      rows: [
        [createCell("Empty")],
        [createCell(null, null, CellType.EMPTY)],
        [createCell(null, null, CellType.EMPTY)],
      ],
    };
    const result = inferSchema(sheet);
    expect(result.columns[0]).toEqual({
      name: "Empty",
      type: "string",
      nullable: true,
    });
  });

  it("sets nullable true when some cells are empty", () => {
    const sheet = {
      name: "Sheet1",
      rows: [
        [createCell("Name")],
        [createCell("Alice")],
        [createCell(null, null, CellType.EMPTY)],
        [createCell("Charlie")],
      ],
    };
    const result = inferSchema(sheet);
    expect(result.columns[0].nullable).toBe(true);
  });

  it("sets nullable false when no cells are empty", () => {
    const sheet = {
      name: "Sheet1",
      rows: [[createCell("Name")], [createCell("Alice")], [createCell("Bob")]],
    };
    const result = inferSchema(sheet);
    expect(result.columns[0].nullable).toBe(false);
  });

  it("handles multi-column sheet with different types", () => {
    const sheet = {
      name: "Sheet1",
      rows: [
        [createCell("id"), createCell("name"), createCell("active")],
        [createCell(1), createCell("Alice"), createCell(true)],
        [createCell(2), createCell("Bob"), createCell(false)],
      ],
    };
    const result = inferSchema(sheet);
    expect(result.columns).toEqual([
      { name: "id", type: "number", nullable: false },
      { name: "name", type: "string", nullable: false },
      { name: "active", type: "boolean", nullable: false },
    ]);
  });

  it("uses empty string for null header cells instead of 'null'", () => {
    const sheet = {
      name: "Sheet1",
      rows: [
        [createCell(null, null, CellType.EMPTY), createCell("b")],
        [createCell(1), createCell(2)],
      ],
    };
    const result = inferSchema(sheet);
    expect(result.columns[0].name).toBe("");
    expect(result.columns[1].name).toBe("b");
  });
});
