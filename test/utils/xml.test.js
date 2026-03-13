// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { describe, it, expect } from "vitest";
import { escapeXml } from "../../src/utils/xml.js";

describe("escapeXml", () => {
  it("escapes ampersands", () => {
    expect(escapeXml("A&B")).toBe("A&amp;B");
  });

  it("escapes angle brackets", () => {
    expect(escapeXml("<tag>")).toBe("&lt;tag&gt;");
  });

  it("escapes quotes", () => {
    expect(escapeXml('"hello"')).toBe("&quot;hello&quot;");
    expect(escapeXml("it's")).toBe("it&apos;s");
  });

  it("handles strings with no special characters", () => {
    expect(escapeXml("hello world")).toBe("hello world");
  });

  it("handles empty strings", () => {
    expect(escapeXml("")).toBe("");
  });

  it("handles multiple special characters", () => {
    expect(escapeXml('<a href="test">&</a>')).toBe(
      "&lt;a href=&quot;test&quot;&gt;&amp;&lt;/a&gt;",
    );
  });
});
