# Utilities

## Cell references

- `columnToLetter(col)`
- `letterToColumn(letter)`
- `encodeCellRef(row, col)`
- `decodeCellRef(ref)`

These helpers convert between zero-based coordinates and Excel references like `B4`.

## Date conversion

- `excelDateToJS(serial)`
- `jsDateToExcel(date)`

These helpers convert between Excel serial dates and JavaScript `Date` values.

## Vector helpers

- `serializeVector(arr)`
- `deserializeVector(str)`
- `isVectorString(str)`

These helpers implement the package's numeric vector interchange format.

## XML helper

- `escapeXml(str)`

Escapes special XML characters for text content generation.
