# ADR-0001: Internal Data Model — Plain Objects vs Classes

## Status

Accepted

## Context

The library needs an internal representation for workbooks, worksheets, and cells. Two primary approaches exist:

1. **Plain JavaScript objects** created by factory functions (`createWorkbook`, `createWorksheet`, `createCell`)
2. **ES6 classes** (`class Workbook`, `class Worksheet`, `class Cell`) with methods and encapsulation

The choice affects serialization, testability, API surface, and the ability to round-trip data without loss.

## Decision

Use plain JavaScript objects created by factory functions. The data model consists of:

- `Workbook` — `{ sheets: Worksheet[] }`
- `Worksheet` — `{ name: string, rows: Cell[][] }`
- `Cell` — `{ value: CellValue, formula: string | null, type: CellType }`

Factory functions (`createWorkbook`, `createWorksheet`, `createCell`) construct these objects. A `CellType` enum provides string constants for type tags, enforced via `inferType()` when no explicit type is provided.

Row-length consistency is enforced by `normalizeRows()`, which pads shorter rows with empty cells.

## Alternatives Considered

**ES6 Classes**

- Pros: encapsulation, methods on instances, IDE autocompletion
- Cons: not JSON-serializable without custom `toJSON()`, harder to inspect in logs, couples data to behavior, complicates cloning and deep equality checks

**TypeScript Interfaces (compile-time only)**

- Not applicable — the project uses plain JavaScript without a build step

## Consequences

- Data structures are directly JSON-serializable (except `Date` values, which serialize to ISO strings)
- Objects can be constructed inline in tests without importing classes
- The reader and writer operate on the same shape, enabling trivial round-trip testing
- No prototype chain — `JSON.parse(JSON.stringify(workbook))` preserves structure
- Type safety relies on the `CellType` enum and `inferType()` rather than class-based enforcement
- The builder API (Phase 4) can wrap these plain objects without replacing them
