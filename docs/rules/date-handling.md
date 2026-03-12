# Date Handling Rules

Defines the rules for converting between Excel date serial numbers and JavaScript `Date` objects.

## 1900 Date System

Excel uses the 1900 date system where serial number 1 = January 1, 1900. Each integer increment represents one day. Fractional values represent time within a day.

| Serial | Date |
|---|---|
| 1 | 1900-01-01 |
| 2 | 1900-01-02 |
| 59 | 1900-02-28 |
| 60 | 1900-02-29 (phantom — see below) |
| 61 | 1900-03-01 |
| 44927 | 2023-01-01 |

## Lotus 1-2-3 Leap Year Bug

Excel inherited a bug from Lotus 1-2-3: it incorrectly treats 1900 as a leap year. Serial number 60 corresponds to February 29, 1900, which does not exist in the Gregorian calendar.

### Conversion behavior

**`excelDateToJS(serial)`:**
- For `serial >= 60`: subtract 1 from the serial before converting, compensating for the phantom leap day
- For `serial < 60`: use the serial as-is (these dates map correctly despite the bug)
- For `serial < 1`: treat as time-only (see below)

**`jsDateToExcel(date)`:**
- Compute serial from epoch, then add 1 if `serial >= 60` to account for the phantom leap day

### Edge cases at the boundary

| Serial | `excelDateToJS` result | Notes |
|---|---|---|
| 59 | 1900-02-28 | Last valid date before the bug |
| 60 | 1900-02-28 | Phantom leap day is collapsed onto Feb 28 (Feb 29, 1900 does not exist) |
| 61 | 1900-03-01 | First date after the bug; adjusted by -1 internally |

## Time-Only Values

Serial numbers less than 1 represent time without a date. The fractional part represents the portion of a 24-hour day:

| Serial | Time |
|---|---|
| 0.0 | 00:00:00 (midnight) |
| 0.25 | 06:00:00 |
| 0.5 | 12:00:00 (noon) |
| 0.75 | 18:00:00 |

Time-only values are converted to a `Date` anchored to December 31, 1899 (UTC).

## Date+Time (Fractional Serials)

Fractional serial numbers encode both date and time:

- Integer part = date (days since epoch)
- Fractional part = time (portion of 24-hour day)

Example: `44927.5` = January 1, 2023 at 12:00:00 noon UTC

Milliseconds are computed via `Math.round(fractional_part * 86400000)` to avoid floating-point drift.

## Timezone Convention

All date conversions use UTC:
- `excelDateToJS()` returns a `Date` set via `Date.UTC()`
- `jsDateToExcel()` reads the date via `date.getTime()` relative to the UTC epoch
- The library does not apply local timezone offsets

Callers who need local-time display should apply their own timezone conversion.

## Date Detection on Read

Numeric cells are classified as dates only if their style index references a date number format in `xl/styles.xml`. Detection uses:

1. **Built-in format IDs**: IDs 14–22, 27–36, 45–47, 50–58 are always date/time
2. **Custom format codes**: after stripping quoted literals and color tokens, if the format contains `y`, `m`, `d`, `h`, or `s` placeholders, it is classified as a date format

If `xl/styles.xml` is absent or a cell has no style index, numeric values are treated as plain numbers.

## Date Writing

When writing a `DATE` cell:
- The `Date` value is converted to an Excel serial number via `jsDateToExcel()`
- The cell is written with style index `s="1"`, which references the built-in date format with `numFmtId=14` (`m/d/yyyy`) in the generated `xl/styles.xml`
- No type attribute is set on the `<c>` element (dates are stored as numbers in Excel)
