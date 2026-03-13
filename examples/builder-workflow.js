// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import { WorkbookBuilder, WorkbookReader, writeXlsx } from "../src/index.js";

export function createSummaryWorkbook() {
  const builder = WorkbookBuilder.create();

  builder
    .sheet("Summary")
    .setHeaders(["metric", "value"])
    .addRow(["users", 42])
    .addRow(["jobs", 8]);

  builder.sheet("Audit").addObjects([
    { event: "generated", actor: "system" },
    { event: "reviewed", actor: "analyst" },
  ]);

  return builder.build();
}

export function readSummaryWorkbook() {
  return WorkbookReader.fromBuffer(writeXlsx(createSummaryWorkbook()));
}
