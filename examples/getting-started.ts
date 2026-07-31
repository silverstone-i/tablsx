// Copyright © 2026 – present NapSoft LLC. All rights reserved.
import {
  createCell,
  createWorkbook,
  createWorksheet,
  readXlsx,
  writeXlsx,
} from "../src/index.js";
import type { Workbook } from "../src/index.js";

export function createPeopleWorkbook(): Workbook {
  return createWorkbook([
    createWorksheet("People", [
      [createCell("name"), createCell("age"), createCell("active")],
      [createCell("Ada"), createCell(36), createCell(true)],
      [createCell("Linus"), createCell(54), createCell(false)],
    ]),
  ]);
}

export function roundTripPeopleWorkbook(): Workbook {
  return readXlsx(writeXlsx(createPeopleWorkbook()));
}
