# ADR-0005: Vector Serialization as JSON Strings

## Status

Accepted

## Context

The library supports vector/embedding columns (`number[]`) for ML and data science workflows. Since Excel has no native array-in-cell type, the library must choose a serialization format for storing vectors in `.xlsx` cells.

Options considered:

1. **JSON array string** — `"[0.1,0.2,0.3]"`
2. **Delimited string** — `"0.1,0.2,0.3"` or `"0.1|0.2|0.3"`
3. **Multiple columns** — spread each vector element across adjacent cells

## Decision

Serialize vectors as JSON array strings. A `number[]` value is stored as a regular string cell containing `JSON.stringify(arr)`, e.g., `"[0.1,0.2,0.3]"`.

Three utility functions handle the conversion:

- `serializeVector(arr)` — calls `JSON.stringify(arr)`
- `deserializeVector(str)` — calls `JSON.parse(str)` and validates the result is an array of numbers
- `isVectorString(str)` — detects whether a string looks like a JSON array of numbers (starts with `[`, ends with `]`, parses as `number[]`)

On write, vector cells contribute to the shared strings table (the JSON string is deduplicated like any other string). On read, deserialization is opt-in — callers must indicate which columns are vectors via schema or options (Phase 3).

## Alternatives Considered

**Delimited string (comma or pipe)**

- Pros: slightly more compact, human-readable
- Cons: ambiguous with numbers containing commas in some locales, no standard delimiter, harder to detect automatically, requires custom parser

**Multiple columns (one element per cell)**

- Pros: each element is a native number cell
- Cons: destroys column semantics, variable-length vectors break the rectangular grid, makes round-trip impossible without metadata

## Consequences

- Vectors round-trip losslessly through JSON serialization for standard IEEE 754 doubles
- The format is self-describing — `isVectorString()` can detect JSON arrays for automatic inference (Phase 3)
- Stored as regular string cells — compatible with all Excel applications (they display the JSON text)
- No additional metadata required in the `.xlsx` file
- Precision is limited to `JSON.stringify` output for floating-point numbers (sufficient for ML embeddings)
- Large vectors (thousands of elements) produce large cell strings — acceptable for the target use case of embeddings (typically 384–1536 dimensions)
