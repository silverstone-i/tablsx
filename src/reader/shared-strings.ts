// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { XMLParser } from "fast-xml-parser";
import type { XmlSstDoc, XmlText } from "./xml-types.js";

/**
 * Extract the plain text from a parsed `<t>` value.
 */
function textValue(val: XmlText | undefined): string {
  return typeof val === "object" ? String(val["#text"] ?? "") : String(val ?? "");
}

/**
 * Parse xl/sharedStrings.xml and return an array of strings.
 */
export function parseSharedStrings(xml: string | null): string[] {
  if (!xml) return [];

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    isArray: (name) => name === "si" || name === "r" || name === "t",
    trimValues: false,
  });

  const parsed = parser.parse(xml) as XmlSstDoc;
  const sst = parsed?.sst;
  if (!sst) return [];

  const items = sst.si;
  if (!items) return [];

  const strings: string[] = [];
  for (const si of items) {
    if (si.t !== undefined) {
      // Simple string: <si><t>text</t></si>
      const tArr = Array.isArray(si.t) ? si.t : [si.t];
      // t can be a string or an object with #text
      strings.push(textValue(tArr[0]));
    } else if (si.r) {
      // Rich text: <si><r><t>part1</t></r><r><t>part2</t></r></si>
      const runs = Array.isArray(si.r) ? si.r : [si.r];
      let text = "";
      for (const run of runs) {
        const tArr = Array.isArray(run.t) ? run.t : [run.t];
        text += textValue(tArr[0]);
      }
      strings.push(text);
    } else {
      strings.push("");
    }
  }
  return strings;
}
