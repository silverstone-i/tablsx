// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { describe, it, expect } from "vitest";
import { sheetFromRows } from "../../src/tabular/serializer.js";
import { rowsFromSheet } from "../../src/tabular/parser.js";
import { inferSchema } from "../../src/tabular/schema.js";
import { readXlsx } from "../../src/reader/index.js";
import { writeXlsx } from "../../src/writer/index.js";

describe("tabular round-trip", () => {
  it("round-trips string values", () => {
    const input = [{ name: "Alice" }, { name: "Bob" }];
    const sheet = sheetFromRows(input);
    const output = rowsFromSheet(sheet);
    expect(output).toEqual(input);
  });

  it("round-trips number values", () => {
    const input = [
      { val: 0 },
      { val: -5 },
      { val: 3.14 },
      { val: Number.MAX_SAFE_INTEGER },
    ];
    const sheet = sheetFromRows(input);
    const output = rowsFromSheet(sheet);
    expect(output).toEqual(input);
  });

  it("round-trips boolean values", () => {
    const input = [{ active: true }, { active: false }];
    const sheet = sheetFromRows(input);
    const output = rowsFromSheet(sheet);
    expect(output).toEqual(input);
  });

  it("round-trips date values", () => {
    const d1 = new Date("2024-01-15T00:00:00.000Z");
    const d2 = new Date("2024-06-01T12:30:00.000Z");
    const input = [{ created: d1 }, { created: d2 }];
    const sheet = sheetFromRows(input);
    const output = rowsFromSheet(sheet);
    expect(output[0].created).toEqual(d1);
    expect(output[1].created).toEqual(d2);
  });

  it("round-trips null values", () => {
    const input = [
      { name: "Alice", note: null },
      { name: "Bob", note: null },
    ];
    const sheet = sheetFromRows(input);
    const output = rowsFromSheet(sheet);
    expect(output).toEqual(input);
  });

  it("round-trips vectors with column override on both sides", () => {
    const input = [
      { id: 1, embedding: [0.1, 0.2, 0.3] },
      { id: 2, embedding: [0.4, 0.5, 0.6] },
    ];
    const columnOpts = { columns: { embedding: { type: "vector" } } };
    const sheet = sheetFromRows(input, columnOpts);
    const output = rowsFromSheet(sheet, columnOpts);
    expect(output).toEqual(input);
  });

  it("round-trips mixed-type rows", () => {
    const date = new Date("2024-03-15T00:00:00.000Z");
    const input = [
      { id: 1, name: "Alice", active: true, created: date, note: null },
    ];
    const sheet = sheetFromRows(input);
    const output = rowsFromSheet(sheet);
    expect(output).toEqual(input);
  });

  it("full xlsx round-trip: sheetFromRows → writeXlsx → readXlsx → rowsFromSheet", () => {
    const input = [
      { id: 1, name: "Alice", score: 95.5 },
      { id: 2, name: "Bob", score: 87.0 },
    ];
    const sheet = sheetFromRows(input);
    const buffer = writeXlsx({ sheets: [sheet] });
    const workbook = readXlsx(buffer);
    const output = rowsFromSheet(workbook.sheets[0]);
    expect(output).toEqual(input);
  });

  it("full xlsx round-trip with vector column override", () => {
    const input = [
      { id: 1, embedding: [0.1, 0.2, 0.3] },
      { id: 2, embedding: [0.4, 0.5, 0.6] },
    ];
    const columnOpts = { columns: { embedding: { type: "vector" } } };
    const sheet = sheetFromRows(input, columnOpts);
    const buffer = writeXlsx({ sheets: [sheet] });
    const workbook = readXlsx(buffer);
    const output = rowsFromSheet(workbook.sheets[0], columnOpts);
    expect(output).toEqual(input);
  });

  it("inferSchema returns matching types for sheetFromRows-created sheet", () => {
    const date = new Date("2024-01-15T00:00:00.000Z");
    const input = [
      { id: 1, name: "Alice", active: true, created: date },
      { id: 2, name: "Bob", active: false, created: date },
    ];
    const sheet = sheetFromRows(input);
    const schema = inferSchema(sheet);
    expect(schema.columns).toEqual([
      { name: "id", type: "number", nullable: false },
      { name: "name", type: "string", nullable: false },
      { name: "active", type: "boolean", nullable: false },
      { name: "created", type: "date", nullable: false },
    ]);
  });

  it("inferSchema detects vectors after xlsx round-trip", () => {
    const input = [
      { id: 1, embedding: [0.1, 0.2] },
      { id: 2, embedding: [0.3, 0.4] },
    ];
    const columnOpts = { columns: { embedding: { type: "vector" } } };
    const sheet = sheetFromRows(input, columnOpts);
    const buffer = writeXlsx({ sheets: [sheet] });
    const workbook = readXlsx(buffer);
    const schema = inferSchema(workbook.sheets[0]);
    expect(schema.columns[1]).toEqual({
      name: "embedding",
      type: "vector",
      nullable: false,
    });
  });
});
