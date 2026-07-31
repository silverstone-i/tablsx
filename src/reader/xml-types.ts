// Copyright © 2026 – present NapSoft LLC. All rights reserved.
/**
 * Minimal shapes for the fast-xml-parser output consumed by the readers.
 *
 * Every field is optional: the parser output is an untrusted bag and the
 * parsing code narrows defensively at each access. These interfaces exist
 * to type the single cast at each `parser.parse()` boundary.
 */

/** A text node parsed with `textNodeName: "#text"`. */
export interface XmlTextNode {
  "#text"?: string | number;
}

/** Text content that may be a primitive or a `#text` wrapper object. */
export type XmlText = string | number | XmlTextNode;

/** A rich-text run: `<r><t>…</t></r>`. */
export interface XmlInlineRun {
  t?: XmlText | XmlText[];
}

/** An inline string: `<is><t>…</t></is>` or `<is><r>…</r>…</is>`. */
export interface XmlInlineStr {
  t?: XmlText | XmlText[];
  r?: XmlInlineRun | XmlInlineRun[];
}

/** A worksheet cell element `<c>`. */
export interface XmlCell {
  "@_r"?: string;
  "@_t"?: string;
  "@_s"?: string | number;
  v?: string | number;
  f?: XmlText;
  is?: XmlInlineStr;
}

/** A worksheet row element `<row>`. */
export interface XmlRow {
  "@_r"?: string | number;
  c?: XmlCell[];
}

/** Parsed `xl/worksheets/sheetN.xml`. */
export interface XmlWorksheetDoc {
  worksheet?: {
    sheetData?: {
      row?: XmlRow[];
    };
  };
}

/** A shared-string item `<si>` (with `si`, `r`, and `t` forced to arrays). */
export interface XmlSharedStringItem {
  t?: XmlText[];
  r?: XmlInlineRun[];
}

/** Parsed `xl/sharedStrings.xml`. */
export interface XmlSstDoc {
  sst?: {
    si?: XmlSharedStringItem[];
  };
}

/** A sheet entry `<sheet>` in the workbook part. */
export interface XmlSheetEntry {
  "@_name"?: string;
  "@_r:id"?: string;
}

/** Parsed `xl/workbook.xml`. */
export interface XmlWorkbookDoc {
  workbook?: {
    sheets?: {
      sheet?: XmlSheetEntry[];
    };
  };
}

/** A relationship entry in a `.rels` part. */
export interface XmlRelationship {
  "@_Id"?: string;
  "@_Target"?: string;
}

/** Parsed `xl/_rels/workbook.xml.rels`. */
export interface XmlRelsDoc {
  Relationships?: {
    Relationship?: XmlRelationship[];
  };
}

/** A custom number format `<numFmt>`. */
export interface XmlNumFmt {
  "@_numFmtId"?: string | number;
  "@_formatCode"?: string;
}

/** A cell format record `<xf>`. */
export interface XmlXf {
  "@_numFmtId"?: string | number;
}

/** Parsed `xl/styles.xml`. */
export interface XmlStylesDoc {
  styleSheet?: {
    numFmts?: {
      numFmt?: XmlNumFmt[];
    };
    cellXfs?: {
      xf?: XmlXf[];
    };
  };
}
