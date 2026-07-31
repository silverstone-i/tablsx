// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { describe, expect, it } from "vitest";
import {
  createPeopleWorkbook,
  roundTripPeopleWorkbook,
} from "../../examples/getting-started.js";
import {
  createEmbeddingsSheet,
  inferEmbeddingsSchema,
  parseEmbeddingsSheet,
} from "../../examples/tabular-workflow.js";
import {
  createSummaryWorkbook,
  readSummaryWorkbook,
} from "../../examples/builder-workflow.js";

describe("documentation examples", () => {
  it("round-trips the getting started workbook", () => {
    const workbook = roundTripPeopleWorkbook();
    expect(workbook.sheets[0].name).toBe("People");
    expect(workbook.sheets[0].rows[1][0].value).toBe("Ada");
  });

  it("builds the same workbook shape shown in the getting started example", () => {
    const workbook = createPeopleWorkbook();
    expect(workbook.sheets).toHaveLength(1);
    expect(workbook.sheets[0].rows[0][0].value).toBe("name");
  });

  it("supports tabular workflows with type overrides", () => {
    const rows = parseEmbeddingsSheet();
    expect(rows[0].embedding).toEqual([0.1, 0.2, 0.3]);
    expect(rows[0].created_at).toBeInstanceOf(Date);
  });

  it("infers schema for the tabular example", () => {
    const schema = inferEmbeddingsSchema();
    expect(schema.columns.map((column) => column.name)).toEqual([
      "id",
      "label",
      "embedding",
      "created_at",
    ]);
    expect(schema.columns[2].type).toBe("vector");
  });

  it("builds a workbook from the builder example", () => {
    const workbook = createSummaryWorkbook();
    expect(workbook.sheets.map((sheet) => sheet.name)).toEqual([
      "Summary",
      "Audit",
    ]);
  });

  it("reads the builder example through WorkbookReader", () => {
    const reader = readSummaryWorkbook();
    expect(reader.sheet("Summary").toObjects()).toEqual([
      { metric: "users", value: 42 },
      { metric: "jobs", value: 8 },
    ]);
  });

  it("keeps the tabular example sheet named as documented", () => {
    const sheet = createEmbeddingsSheet();
    expect(sheet.name).toBe("Embeddings");
  });
});
