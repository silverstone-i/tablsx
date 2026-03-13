// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { describe, it, expect } from "vitest";
import { WorkbookReader } from "../../src/reader/workbook-reader.js";
import { SheetReader } from "../../src/reader/sheet-reader.js";
import { WorkbookBuilder } from "../../src/builder/workbook-builder.js";
import { writeXlsx } from "../../src/writer/index.js";
import { CellType } from "../../src/model/types.js";

function buildBuffer(fn) {
  const builder = WorkbookBuilder.create();
  fn(builder);
  return writeXlsx(builder.build());
}

describe("WorkbookReader", () => {
  describe("fromBuffer", () => {
    it("should create a WorkbookReader from an xlsx buffer", () => {
      const buf = buildBuffer((b) => b.sheet("S1").addRow([1]));
      const reader = WorkbookReader.fromBuffer(buf);
      expect(reader).toBeInstanceOf(WorkbookReader);
    });
  });

  describe("fromWorkbook", () => {
    it("should create a WorkbookReader from a Workbook object", () => {
      const wb = WorkbookBuilder.create();
      wb.sheet("A").addRow([1]);
      const reader = WorkbookReader.fromWorkbook(wb.build());
      expect(reader).toBeInstanceOf(WorkbookReader);
      expect(reader.sheetCount).toBe(1);
    });
  });

  describe("sheetNames / sheetCount", () => {
    it("should return sheet names in order", () => {
      const buf = buildBuffer((b) => {
        b.sheet("First").addRow([1]);
        b.sheet("Second").addRow([2]);
        b.sheet("Third").addRow([3]);
      });
      const reader = WorkbookReader.fromBuffer(buf);
      expect(reader.sheetNames).toEqual(["First", "Second", "Third"]);
      expect(reader.sheetCount).toBe(3);
    });
  });

  describe("sheet", () => {
    it("should retrieve a sheet by name", () => {
      const buf = buildBuffer((b) => b.sheet("Data").addRow([42]));
      const reader = WorkbookReader.fromBuffer(buf);
      const sheet = reader.sheet("Data");
      expect(sheet).toBeInstanceOf(SheetReader);
      expect(sheet.name).toBe("Data");
    });

    it("should retrieve a sheet by index", () => {
      const buf = buildBuffer((b) => {
        b.sheet("A").addRow([1]);
        b.sheet("B").addRow([2]);
      });
      const reader = WorkbookReader.fromBuffer(buf);
      expect(reader.sheet(0).name).toBe("A");
      expect(reader.sheet(1).name).toBe("B");
    });

    it("should throw for unknown sheet name", () => {
      const buf = buildBuffer((b) => b.sheet("A").addRow([1]));
      const reader = WorkbookReader.fromBuffer(buf);
      expect(() => reader.sheet("Nope")).toThrow('Sheet "Nope" not found');
    });

    it("should throw for out-of-bounds index", () => {
      const buf = buildBuffer((b) => b.sheet("A").addRow([1]));
      const reader = WorkbookReader.fromBuffer(buf);
      expect(() => reader.sheet(5)).toThrow("out of bounds");
    });
  });
});

describe("SheetReader", () => {
  function readerForSheet(fn) {
    const buf = buildBuffer((b) => fn(b.sheet("Test")));
    return WorkbookReader.fromBuffer(buf).sheet("Test");
  }

  describe("basic accessors", () => {
    it("should expose name, rowCount, and columnCount", () => {
      const sheet = readerForSheet((s) => {
        s.addRow([1, 2, 3]);
        s.addRow([4, 5, 6]);
      });
      expect(sheet.name).toBe("Test");
      expect(sheet.rowCount).toBe(2);
      expect(sheet.columnCount).toBe(3);
    });
  });

  describe("getRow", () => {
    it("should return a row by index", () => {
      const sheet = readerForSheet((s) => s.addRow(["a", "b"]));
      const row = sheet.getRow(0);
      expect(row[0].value).toBe("a");
      expect(row[1].value).toBe("b");
    });

    it("should throw for out-of-bounds index", () => {
      const sheet = readerForSheet((s) => s.addRow([1]));
      expect(() => sheet.getRow(5)).toThrow("out of bounds");
    });
  });

  describe("getCell", () => {
    it("should return a cell by row and column", () => {
      const sheet = readerForSheet((s) => {
        s.addRow([1, 2]);
        s.addRow([3, 4]);
      });
      expect(sheet.getCell(1, 1).value).toBe(4);
    });

    it("should throw for out-of-bounds column", () => {
      const sheet = readerForSheet((s) => s.addRow([1]));
      expect(() => sheet.getCell(0, 5)).toThrow("out of bounds");
    });
  });

  describe("toValues", () => {
    it("should return a 2D array of plain values", () => {
      const sheet = readerForSheet((s) => {
        s.addRow(["hello", 42, true]);
        s.addRow(["world", 0, false]);
      });
      expect(sheet.toValues()).toEqual([
        ["hello", 42, true],
        ["world", 0, false],
      ]);
    });
  });

  describe("toObjects", () => {
    it("should convert rows to objects using first row as headers", () => {
      const sheet = readerForSheet((s) => {
        s.addRow(["Name", "Age"]);
        s.addRow(["Alice", 30]);
        s.addRow(["Bob", 25]);
      });
      expect(sheet.toObjects()).toEqual([
        { Name: "Alice", Age: 30 },
        { Name: "Bob", Age: 25 },
      ]);
    });

    it("should use explicit headers when provided", () => {
      const sheet = readerForSheet((s) => {
        s.addRow([1, 2]);
        s.addRow([3, 4]);
      });
      const objs = sheet.toObjects({ headers: ["x", "y"] });
      expect(objs).toEqual([
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ]);
    });

    it("should round-trip with SheetBuilder.addObjects", () => {
      const original = [
        { text: "hello", count: 10 },
        { text: "world", count: 20 },
      ];
      const buf = buildBuffer((b) => b.sheet("Test").addObjects(original));
      const sheet = WorkbookReader.fromBuffer(buf).sheet("Test");
      expect(sheet.toObjects()).toEqual(original);
    });

    it("should return null for empty cells", () => {
      const sheet = readerForSheet((s) => {
        s.addRow(["Name", "Value"]);
        s.addRow(["Alice", null]);
      });
      const objs = sheet.toObjects();
      expect(objs[0].Value).toBeNull();
    });

    it("should disambiguate duplicate headers", () => {
      const sheet = readerForSheet((s) => {
        s.addRow(["Col", "Col", "Col"]);
        s.addRow(["a", "b", "c"]);
      });
      const objs = sheet.toObjects();
      expect(objs[0]).toEqual({ Col: "a", Col_2: "b", Col_3: "c" });
    });

    it("should accept column type overrides for vectors", () => {
      const buf = buildBuffer((b) =>
        b
          .sheet("Test")
          .addRow(["label", "embedding"])
          .addRow(["item1", [0.1, 0.2, 0.3]]),
      );
      const sheet = WorkbookReader.fromBuffer(buf).sheet("Test");
      const objs = sheet.toObjects({
        columns: { embedding: { type: CellType.VECTOR } },
      });
      expect(objs[0].embedding).toEqual([0.1, 0.2, 0.3]);
    });

    it("should throw for empty sheet without custom headers", () => {
      const buf = buildBuffer((b) => b.sheet("Test").addRow([]));
      const reader = WorkbookReader.fromBuffer(buf);
      const sheet = reader.sheet("Test");
      expect(() => sheet.toObjects()).toThrow(
        "Cannot convert to objects: sheet has no rows to derive headers from",
      );
    });
  });
});
