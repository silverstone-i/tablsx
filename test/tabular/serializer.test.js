// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { describe, it, expect } from "vitest";
import { sheetFromRows } from "../../src/tabular/serializer.js";
import { CellType } from "../../src/model/types.js";

describe("sheetFromRows", () => {
  it("returns empty worksheet for empty array", () => {
    const sheet = sheetFromRows([]);
    expect(sheet.name).toBe("Sheet1");
    expect(sheet.rows).toEqual([]);
  });

  it("creates header row and data row for single object", () => {
    const sheet = sheetFromRows([{ name: "Alice", age: 30 }]);
    expect(sheet.rows.length).toBe(2);
    expect(sheet.rows[0][0].value).toBe("name");
    expect(sheet.rows[0][0].type).toBe(CellType.STRING);
    expect(sheet.rows[0][1].value).toBe("age");
    expect(sheet.rows[1][0].value).toBe("Alice");
    expect(sheet.rows[1][1].value).toBe(30);
  });

  it("creates STRING cells for string values", () => {
    const sheet = sheetFromRows([{ text: "hello" }]);
    expect(sheet.rows[1][0].type).toBe(CellType.STRING);
  });

  it("creates NUMBER cells for number values", () => {
    const sheet = sheetFromRows([{ count: 42 }]);
    expect(sheet.rows[1][0].type).toBe(CellType.NUMBER);
  });

  it("creates BOOLEAN cells for boolean values", () => {
    const sheet = sheetFromRows([{ active: true }]);
    expect(sheet.rows[1][0].type).toBe(CellType.BOOLEAN);
  });

  it("creates DATE cells for Date values", () => {
    const date = new Date("2024-01-15T00:00:00.000Z");
    const sheet = sheetFromRows([{ created: date }]);
    expect(sheet.rows[1][0].type).toBe(CellType.DATE);
    expect(sheet.rows[1][0].value).toEqual(date);
  });

  it("creates EMPTY cells for null values", () => {
    const sheet = sheetFromRows([{ name: null }]);
    expect(sheet.rows[1][0].type).toBe(CellType.EMPTY);
    expect(sheet.rows[1][0].value).toBeNull();
  });

  it("creates EMPTY cells for undefined values", () => {
    const sheet = sheetFromRows([{ name: undefined }]);
    expect(sheet.rows[1][0].type).toBe(CellType.EMPTY);
  });

  it("creates VECTOR cells for number arrays", () => {
    const sheet = sheetFromRows([{ embedding: [0.1, 0.2, 0.3] }]);
    expect(sheet.rows[1][0].type).toBe(CellType.VECTOR);
    expect(sheet.rows[1][0].value).toEqual([0.1, 0.2, 0.3]);
  });

  it("creates EMPTY cells for missing keys in later rows", () => {
    const sheet = sheetFromRows([{ a: 1, b: 2 }, { a: 3 }]);
    expect(sheet.rows[2][1].type).toBe(CellType.EMPTY);
  });

  it("uses custom sheet name from options", () => {
    const sheet = sheetFromRows([{ x: 1 }], { name: "Data" });
    expect(sheet.name).toBe("Data");
  });

  it("applies vector column override for array values", () => {
    const sheet = sheetFromRows([{ emb: [1, 2, 3] }], {
      columns: { emb: { type: "vector" } },
    });
    expect(sheet.rows[1][0].type).toBe(CellType.VECTOR);
    expect(sheet.rows[1][0].value).toEqual([1, 2, 3]);
  });

  it("applies vector column override for string values", () => {
    const sheet = sheetFromRows([{ emb: "[1,2,3]" }], {
      columns: { emb: { type: "vector" } },
    });
    expect(sheet.rows[1][0].type).toBe(CellType.VECTOR);
    expect(sheet.rows[1][0].value).toEqual([1, 2, 3]);
  });

  it("applies date column override for string values", () => {
    const sheet = sheetFromRows([{ created: "2024-01-15" }], {
      columns: { created: { type: "date" } },
    });
    expect(sheet.rows[1][0].type).toBe(CellType.DATE);
    expect(sheet.rows[1][0].value).toBeInstanceOf(Date);
  });

  it("throws for invalid date string with date override", () => {
    expect(() =>
      sheetFromRows([{ created: "not-a-date" }], {
        columns: { created: { type: "date" } },
      }),
    ).toThrow("Invalid date string");
  });

  it("applies date column override for number values (Excel serial)", () => {
    const sheet = sheetFromRows([{ created: 45307 }], {
      columns: { created: { type: "date" } },
    });
    expect(sheet.rows[1][0].type).toBe(CellType.DATE);
    expect(sheet.rows[1][0].value).toBeInstanceOf(Date);
  });

  it("JSON-stringifies nested object values", () => {
    const nested = { key: "value", num: 42 };
    const sheet = sheetFromRows([{ data: nested }]);
    expect(sheet.rows[1][0].type).toBe(CellType.STRING);
    expect(sheet.rows[1][0].value).toBe(JSON.stringify(nested));
  });

  it("preserves header names exactly including spaces and special chars", () => {
    const sheet = sheetFromRows([{ "First Name": "Alice", "age (years)": 30 }]);
    expect(sheet.rows[0][0].value).toBe("First Name");
    expect(sheet.rows[0][1].value).toBe("age (years)");
  });

  it("preserves column order from Object.keys of first row", () => {
    const sheet = sheetFromRows([{ z: 1, a: 2, m: 3 }]);
    expect(sheet.rows[0][0].value).toBe("z");
    expect(sheet.rows[0][1].value).toBe("a");
    expect(sheet.rows[0][2].value).toBe("m");
  });

  it("normalizes rows to equal length", () => {
    const sheet = sheetFromRows([{ a: 1, b: 2, c: 3 }, { a: 4 }]);
    expect(sheet.rows[1].length).toBe(sheet.rows[2].length);
  });
});
