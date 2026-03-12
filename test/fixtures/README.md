# Test Fixtures

## `synthetic/`

Programmatically generated test data used for round-trip verification. These fixtures are created by the test suite itself and contain expected output in JSON format.

## `excel-generated/`

Real `.xlsx` files created by Microsoft Excel, Google Sheets, or LibreOffice Calc. Used for compatibility testing to verify that the library correctly reads files produced by different applications.

### Adding Excel-generated fixtures

1. Create the desired workbook in the target application (Excel, Google Sheets, LibreOffice)
2. Save as `.xlsx` format
3. Place the file in this directory with a descriptive name (e.g., `basic-types.xlsx`, `dates.xlsx`)
4. Add a corresponding test in `test/reader/` that reads the fixture and verifies the expected cell values
