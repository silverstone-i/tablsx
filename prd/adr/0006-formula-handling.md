# ADR-0006: Formula Handling — Store-Only Approach

## Status

Accepted

## Context

Excel cells can contain formulas (e.g., `=SUM(A1:A10)`). The `.xlsx` format stores both the formula string (in `<f>` elements) and the last-calculated cached value (in `<v>` elements). The library must decide how to handle formulas:

1. **Store and evaluate** — parse formulas and compute results
2. **Store only** — preserve the formula string and cached value without evaluation
3. **Ignore** — discard formula information entirely

## Decision

Store formulas without evaluating them. On read, both the formula string and the cached result value are captured. On write, both are emitted back to the `.xlsx` file.

A formula cell has `type: CellType.FORMULA` with:
- `formula` — the formula string without the leading `=` (e.g., `"SUM(A1:A10)"`)
- `value` — the cached result (`string | number | null`)

The worksheet parser extracts `<f>` and `<v>` elements. The worksheet writer emits `<f>` elements, and if a cached value exists, also emits `<v>` with the appropriate type attribute.

## Alternatives Considered

**Formula evaluation engine**

- Pros: computed values are always up-to-date
- Cons: enormous scope (Excel has hundreds of functions, cross-sheet references, circular dependency handling), out of scope per PRD non-goals, would dominate the library's complexity

**Ignore formulas**

- Pros: simpler implementation
- Cons: data loss on round-trip, callers lose formula context, breaks the deterministic round-trip guarantee

## Consequences

- Formulas are preserved through read-write-read cycles
- Cached values may be stale if the underlying data changed — the library does not recalculate
- When Excel opens a file written by this library, it will recalculate formulas if "Calculate on open" is enabled
- Formula cells without cached values write `<f>` without `<v>` — Excel will compute the value on first open
- The library does not validate formula syntax
- The `CellType.FORMULA` type distinguishes formula cells from plain value cells in the data model
