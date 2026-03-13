# ADR-0004: Date Detection via styles.xml Parsing

## Status

Accepted

## Context

Excel stores dates as serial numbers (days since 1900-01-01). A cell containing the number `45658` could be a plain number or the date 2024-12-28 — the only way to distinguish them is by examining the cell's number format.

Number formats are defined in `xl/styles.xml`. Each cell has an optional style index (`s` attribute) that references an entry in `cellXfs`, which in turn references a `numFmtId`. The library must determine which `numFmtId` values represent date/time formats.

Two approaches were considered:

1. **styles.xml parsing** — parse the styles file to build a set of date-formatted style indices
2. **Heuristic detection** — guess based on the numeric value range (e.g., treat values between 1 and 2958465 as potential dates)

## Decision

Parse `xl/styles.xml` to identify date-formatted cells. The implementation uses a two-tier approach:

1. **Built-in format IDs**: Excel defines standard number format IDs (14–22, 27–36, 45–47, 50–58) that are always date/time formats. These are checked via a static `Set`.

2. **Custom format codes**: For `numFmtId` values outside the built-in range, the format code string is inspected. After stripping quoted literals and color tokens, if the format contains date/time placeholders (`y`, `m`, `d`, `h`, `s`) it is classified as a date format.

`parseDateStyles()` returns a `Set<number>` of `cellXfs` indices that are date-formatted. The worksheet parser checks each numeric cell's style index against this set.

## Alternatives Considered

**Heuristic / value-range detection**

- Pros: no need to parse styles.xml
- Cons: false positives on ordinary numbers, no way to distinguish intentional numbers in the date serial range, breaks round-trip correctness

**Exhaustive format pattern matching**

- Pros: handles all possible custom date formats
- Cons: Open XML format codes are complex (locale-aware, conditional), diminishing returns for rare patterns

## Consequences

- Correct date detection for all files that use standard built-in format IDs
- Reasonable coverage of custom date formats via pattern matching
- Edge cases: unusual custom formats (e.g., locale-specific patterns with `[$-...]` tokens) may not be detected — these are uncommon in practice
- The `parseDateStyles()` function is isolated and can be refined without affecting other components
- Date detection adds a dependency on styles.xml being present — files without styles.xml treat all numeric cells as numbers
