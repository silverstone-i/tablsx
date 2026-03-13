// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { describe, it, expect } from "vitest";
import { SheetBuilder } from "../../src/builder/sheet-builder.js";
import { CellType } from "../../src/model/types.js";
import { sheetFromRows } from "../../src/tabular/serializer.js";

describe("SheetBuilder", () => {
  describe("addRow", () => {
    it("should add a row with string values", () => {
      const sheet = new SheetBuilder("Test").addRow(["a", "b", "c"]).build();
      expect(sheet.name).toBe("Test");
      expect(sheet.rows).toHaveLength(1);
      expect(sheet.rows[0]).toHaveLength(3);
      expect(sheet.rows[0][0]).toEqual({
        value: "a",
        formula: null,
        type: CellType.STRING,
      });
    });

    it("should infer types for all value types", () => {
      const date = new Date("2024-06-15T00:00:00Z");
      const sheet = new SheetBuilder("Test")
        .addRow(["text", 42, true, date, null, undefined, [1, 2, 3]])
        .build();

      const row = sheet.rows[0];
      expect(row[0].type).toBe(CellType.STRING);
      expect(row[1].type).toBe(CellType.NUMBER);
      expect(row[2].type).toBe(CellType.BOOLEAN);
      expect(row[3].type).toBe(CellType.DATE);
      expect(row[3].value).toBe(date);
      expect(row[4].type).toBe(CellType.EMPTY);
      expect(row[5].type).toBe(CellType.EMPTY);
      expect(row[6].type).toBe(CellType.VECTOR);
      expect(row[6].value).toEqual([1, 2, 3]);
    });

    it("should return this for chaining", () => {
      const builder = new SheetBuilder("Test");
      const result = builder.addRow(["a"]);
      expect(result).toBe(builder);
    });
  });

  describe("addRows", () => {
    it("should add multiple rows", () => {
      const sheet = new SheetBuilder("Test")
        .addRows([
          ["a", 1],
          ["b", 2],
          ["c", 3],
        ])
        .build();

      expect(sheet.rows).toHaveLength(3);
      expect(sheet.rows[0][0].value).toBe("a");
      expect(sheet.rows[2][1].value).toBe(3);
    });
  });

  describe("setHeaders", () => {
    it("should set headers as the first row", () => {
      const sheet = new SheetBuilder("Test")
        .setHeaders(["Name", "Age"])
        .addRow(["Alice", 30])
        .build();

      expect(sheet.rows).toHaveLength(2);
      expect(sheet.rows[0][0].value).toBe("Name");
      expect(sheet.rows[0][0].type).toBe(CellType.STRING);
      expect(sheet.rows[0][1].value).toBe("Age");
      expect(sheet.rows[1][0].value).toBe("Alice");
    });

    it("should throw if rows already exist", () => {
      const builder = new SheetBuilder("Test").addRow(["a"]);
      expect(() => builder.setHeaders(["Name"])).toThrow(
        "Cannot set headers after rows have been added",
      );
    });

    it("should return this for chaining", () => {
      const builder = new SheetBuilder("Test");
      expect(builder.setHeaders(["A"])).toBe(builder);
    });
  });

  describe("addObjects", () => {
    it("should derive headers from object keys", () => {
      const sheet = new SheetBuilder("Test")
        .addObjects([
          { name: "Alice", age: 30 },
          { name: "Bob", age: 25 },
        ])
        .build();

      expect(sheet.rows).toHaveLength(3); // 1 header + 2 data
      expect(sheet.rows[0][0].value).toBe("name");
      expect(sheet.rows[0][1].value).toBe("age");
      expect(sheet.rows[1][0].value).toBe("Alice");
      expect(sheet.rows[1][1].value).toBe(30);
    });

    it("should use key union from all objects", () => {
      const sheet = new SheetBuilder("Test")
        .addObjects([{ a: 1 }, { b: 2 }, { a: 3, b: 4 }])
        .build();

      expect(sheet.rows[0]).toHaveLength(2);
      expect(sheet.rows[0][0].value).toBe("a");
      expect(sheet.rows[0][1].value).toBe("b");
      // First row: a=1, b=empty
      expect(sheet.rows[1][0].value).toBe(1);
      expect(sheet.rows[1][1].type).toBe(CellType.EMPTY);
    });

    it("should handle missing keys as empty cells", () => {
      const sheet = new SheetBuilder("Test")
        .addObjects([{ name: "Alice", age: 30 }, { name: "Bob" }])
        .build();

      expect(sheet.rows[2][1].type).toBe(CellType.EMPTY);
    });

    it("should JSON.stringify nested objects", () => {
      const sheet = new SheetBuilder("Test")
        .addObjects([{ data: { nested: true } }])
        .build();

      expect(sheet.rows[1][0].value).toBe('{"nested":true}');
      expect(sheet.rows[1][0].type).toBe(CellType.STRING);
    });

    it("should handle Date values", () => {
      const date = new Date("2024-01-15T00:00:00Z");
      const sheet = new SheetBuilder("Test")
        .addObjects([{ created: date }])
        .build();

      expect(sheet.rows[1][0].type).toBe(CellType.DATE);
      expect(sheet.rows[1][0].value).toBe(date);
    });

    it("should handle vector values", () => {
      const sheet = new SheetBuilder("Test")
        .addObjects([{ embedding: [0.1, 0.2, 0.3] }])
        .build();

      expect(sheet.rows[1][0].type).toBe(CellType.VECTOR);
      expect(sheet.rows[1][0].value).toEqual([0.1, 0.2, 0.3]);
    });

    it("should use existing headers from setHeaders", () => {
      const sheet = new SheetBuilder("Test")
        .setHeaders(["name", "age"])
        .addObjects([{ name: "Alice", age: 30, extra: "ignored" }])
        .build();

      // Headers row + 1 data row
      expect(sheet.rows).toHaveLength(2);
      expect(sheet.rows[0]).toHaveLength(2);
      expect(sheet.rows[1][0].value).toBe("Alice");
      expect(sheet.rows[1][1].value).toBe(30);
    });

    it("should do nothing for empty array", () => {
      const sheet = new SheetBuilder("Test").addObjects([]).build();
      expect(sheet.rows).toHaveLength(0);
    });

    it("should use existing headers for subsequent addObjects calls", () => {
      const sheet = new SheetBuilder("Test")
        .addObjects([{ a: 1, b: 2 }])
        .addObjects([{ a: 3, b: 4 }])
        .build();

      // 1 header + 2 data rows
      expect(sheet.rows).toHaveLength(3);
      expect(sheet.rows[2][0].value).toBe(3);
    });

    it("should accept column type overrides for vectors", () => {
      const sheet = new SheetBuilder("Test")
        .addObjects([{ label: "item1", embedding: [0.1, 0.2, 0.3] }], {
          columns: { embedding: { type: CellType.VECTOR } },
        })
        .build();

      expect(sheet.rows[1][1].type).toBe(CellType.VECTOR);
      expect(sheet.rows[1][1].value).toEqual([0.1, 0.2, 0.3]);
    });

    it("should accept column type overrides for dates from strings", () => {
      const sheet = new SheetBuilder("Test")
        .addObjects([{ event: "launch", date: "2024-06-15" }], {
          columns: { date: { type: CellType.DATE } },
        })
        .build();

      expect(sheet.rows[1][1].type).toBe(CellType.DATE);
      expect(sheet.rows[1][1].value).toBeInstanceOf(Date);
    });

    it("should produce same output as sheetFromRows for identical input", () => {
      const objects = [
        { name: "Alice", age: 30, nested: { x: 1 } },
        { name: "Bob", age: 25, nested: { x: 2 } },
      ];
      const fromBuilder = new SheetBuilder("Test").addObjects(objects).build();
      const fromApi = sheetFromRows(objects, { name: "Test" });
      expect(fromBuilder).toEqual(fromApi);
    });
  });

  describe("build", () => {
    it("should normalize row lengths", () => {
      const sheet = new SheetBuilder("Test")
        .addRow(["a", "b", "c"])
        .addRow(["x"])
        .build();

      expect(sheet.rows[0]).toHaveLength(3);
      expect(sheet.rows[1]).toHaveLength(3);
      expect(sheet.rows[1][1].type).toBe(CellType.EMPTY);
      expect(sheet.rows[1][2].type).toBe(CellType.EMPTY);
    });

    it("should build an empty sheet", () => {
      const sheet = new SheetBuilder("Empty").build();
      expect(sheet.name).toBe("Empty");
      expect(sheet.rows).toHaveLength(0);
    });
  });
});
