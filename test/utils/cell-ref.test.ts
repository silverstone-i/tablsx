// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { describe, it, expect } from "vitest";
import {
  columnToLetter,
  letterToColumn,
  encodeCellRef,
  decodeCellRef,
} from "../../src/utils/cell-ref.js";

describe("columnToLetter", () => {
  it("converts single-letter columns", () => {
    expect(columnToLetter(0)).toBe("A");
    expect(columnToLetter(1)).toBe("B");
    expect(columnToLetter(25)).toBe("Z");
  });

  it("converts double-letter columns", () => {
    expect(columnToLetter(26)).toBe("AA");
    expect(columnToLetter(27)).toBe("AB");
    expect(columnToLetter(51)).toBe("AZ");
    expect(columnToLetter(52)).toBe("BA");
  });

  it("converts triple-letter columns", () => {
    expect(columnToLetter(702)).toBe("AAA");
  });
});

describe("letterToColumn", () => {
  it("converts single-letter columns", () => {
    expect(letterToColumn("A")).toBe(0);
    expect(letterToColumn("B")).toBe(1);
    expect(letterToColumn("Z")).toBe(25);
  });

  it("converts double-letter columns", () => {
    expect(letterToColumn("AA")).toBe(26);
    expect(letterToColumn("AB")).toBe(27);
    expect(letterToColumn("AZ")).toBe(51);
    expect(letterToColumn("BA")).toBe(52);
  });

  it("converts triple-letter columns", () => {
    expect(letterToColumn("AAA")).toBe(702);
  });
});

describe("encodeCellRef", () => {
  it("encodes A1-style references", () => {
    expect(encodeCellRef(0, 0)).toBe("A1");
    expect(encodeCellRef(0, 1)).toBe("B1");
    expect(encodeCellRef(1, 0)).toBe("A2");
    expect(encodeCellRef(9, 25)).toBe("Z10");
    expect(encodeCellRef(0, 26)).toBe("AA1");
  });
});

describe("decodeCellRef", () => {
  it("decodes A1-style references", () => {
    expect(decodeCellRef("A1")).toEqual({ row: 0, col: 0 });
    expect(decodeCellRef("B1")).toEqual({ row: 0, col: 1 });
    expect(decodeCellRef("A2")).toEqual({ row: 1, col: 0 });
    expect(decodeCellRef("Z10")).toEqual({ row: 9, col: 25 });
    expect(decodeCellRef("AA1")).toEqual({ row: 0, col: 26 });
  });

  it("throws on invalid references", () => {
    expect(() => decodeCellRef("invalid")).toThrow();
    expect(() => decodeCellRef("")).toThrow();
  });

  it("round-trips with encodeCellRef", () => {
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 30; c++) {
        const ref = encodeCellRef(r, c);
        const decoded = decodeCellRef(ref);
        expect(decoded).toEqual({ row: r, col: c });
      }
    }
  });
});
