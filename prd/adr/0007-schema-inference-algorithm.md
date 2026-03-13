# ADR-0007: Schema Inference Algorithm

## Status
Accepted

## Context
Phase 3 introduces `inferSchema(sheet)` which analyzes a worksheet and returns column metadata (name, type, nullable). The algorithm needs to handle mixed-type columns, detect vector columns stored as JSON strings, and determine nullability — all without requiring caller configuration.

## Decision
The schema inference algorithm uses a **dominant-type voting** approach:

1. **Header extraction** — Row 0 cells become column names (converted to string).
2. **Per-column type tallying** — For each data row (1..N), the cell's type is tallied. Empty cells are counted separately for nullability but do not participate in type voting.
3. **Vector detection** — STRING cells whose value passes `isVectorString()` (valid JSON array of numbers) are tallied as VECTOR, not STRING. This handles the fact that vectors written to xlsx are stored as shared strings and read back as STRING-typed cells.
4. **Dominant type selection** — The type with the highest count wins. If no non-empty cells exist, the column defaults to STRING.
5. **Nullable flag** — Set to `true` if any EMPTY cells exist in the column, or if the sheet has no data rows (header-only).

Vector detection is **automatic and heuristic** in `inferSchema`, unlike `rowsFromSheet` where vector deserialization requires an explicit column override. This distinction is intentional: schema inference is a read-only analysis where false positives are low-cost (the caller reviews the schema), while `rowsFromSheet` produces data where automatic deserialization of bracket-containing strings would be surprising.

## Alternatives Considered

**Unanimous-type requirement** — Require all non-null values to share the same type. Rejected because real-world data often has minor inconsistencies (e.g., one string in a mostly-numeric column), and dominant-type is more practical.

**Weighted scoring with type priority** — Assign weights to types (e.g., prefer NUMBER over STRING). Rejected as over-engineered; simple count-based voting covers real use cases without arbitrary priority rules.

**No automatic vector detection** — Require explicit opt-in for vector columns in schema inference too. Rejected because inferSchema's purpose is to discover types without prior knowledge, and the `isVectorString` heuristic (valid JSON array of numbers) is specific enough to avoid false positives in practice.

## Consequences
- Schema inference is zero-configuration — callers get useful results without knowing column types in advance.
- Vector columns are correctly detected after xlsx round-trip (where they become STRING cells with JSON content).
- Mixed-type columns resolve to the most common type, which may not match every cell — callers should review the schema for data quality issues.
- The algorithm is O(rows * columns), which is acceptable for the library's target dataset sizes.
