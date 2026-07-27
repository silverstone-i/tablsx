// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { describe, it, expect } from "vitest";
import { parseSharedStrings } from "../../src/reader/shared-strings.js";

describe("parseSharedStrings", () => {
  it("returns empty array for null input", () => {
    expect(parseSharedStrings(null)).toEqual([]);
  });

  it("parses simple strings", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="3" uniqueCount="3">
        <si><t>Hello</t></si>
        <si><t>World</t></si>
        <si><t>Test</t></si>
      </sst>`;
    const result = parseSharedStrings(xml);
    expect(result).toEqual(["Hello", "World", "Test"]);
  });

  it("parses rich text strings", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="1" uniqueCount="1">
        <si>
          <r><t>Hello </t></r>
          <r><t>World</t></r>
        </si>
      </sst>`;
    const result = parseSharedStrings(xml);
    expect(result).toEqual(["Hello World"]);
  });

  it("handles empty SST", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="0" uniqueCount="0"/>`;
    const result = parseSharedStrings(xml);
    expect(result).toEqual([]);
  });
});
