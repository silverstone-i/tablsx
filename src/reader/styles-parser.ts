// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { XMLParser } from "fast-xml-parser";
import type { XmlStylesDoc } from "./xml-types.js";

// Known date format IDs (built-in Excel number formats for dates/times)
const BUILTIN_DATE_FORMAT_IDS = new Set([
  14, 15, 16, 17, 18, 19, 20, 21, 22, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
  45, 46, 47, 50, 51, 52, 53, 54, 55, 56, 57, 58,
]);

// Patterns that indicate a date format
const DATE_FORMAT_REGEX = /[ymdhs]/i;
const NON_DATE_TOKENS =
  /\[(?:Red|Blue|Green|Yellow|Magenta|Cyan|White|Black|Color\d+)\]|[#0?,.%]/g;

/**
 * Check if a number format string represents a date/time format.
 */
function isDateFormat(fmt: string): boolean {
  if (!fmt) return false;
  // Remove quoted sections and color tokens
  const cleaned = fmt.replace(/"[^"]*"/g, "").replace(NON_DATE_TOKENS, "");
  return DATE_FORMAT_REGEX.test(cleaned);
}

/**
 * Parse xl/styles.xml to build a set of cell style indices (xf index) that are date-formatted.
 *
 * @returns Set of cellXfs indices that are date-formatted.
 */
export function parseDateStyles(xml: string | null): Set<number> {
  const dateXfIndices = new Set<number>();
  if (!xml) return dateXfIndices;

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    isArray: (name): boolean => name === "numFmt" || name === "xf",
  });

  const parsed = parser.parse(xml) as XmlStylesDoc;
  const styleSheet = parsed?.styleSheet;
  if (!styleSheet) return dateXfIndices;

  // Build custom number format map
  const numFmtMap = new Map<number, string>();
  const numFmts = styleSheet?.numFmts?.numFmt;
  if (numFmts) {
    for (const nf of numFmts) {
      const formatCode = nf["@_formatCode"];
      if (formatCode !== undefined) {
        numFmtMap.set(Number(nf["@_numFmtId"]), formatCode);
      }
    }
  }

  // Parse cellXfs to find date-formatted styles
  const xfs = styleSheet?.cellXfs?.xf;
  if (!xfs) return dateXfIndices;

  for (let i = 0; i < xfs.length; i++) {
    const xf = xfs[i];
    const numFmtId = Number(xf?.["@_numFmtId"] ?? 0);

    if (BUILTIN_DATE_FORMAT_IDS.has(numFmtId)) {
      dateXfIndices.add(i);
    } else {
      const fmt = numFmtMap.get(numFmtId);
      if (fmt !== undefined && isDateFormat(fmt)) {
        dateXfIndices.add(i);
      }
    }
  }

  return dateXfIndices;
}
