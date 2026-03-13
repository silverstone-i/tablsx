# ADR-0002: Shared Strings Strategy — Eagerly Loaded Array

## Status

Accepted

## Context

The `.xlsx` format stores string cell values in a shared strings table (`xl/sharedStrings.xml`). Each string cell references an index into this table. The library must:

1. **On read**: parse the shared strings XML and resolve cell references
2. **On write**: build a deduplicated table and reference it from worksheet cells

Two strategies were considered for the read path:

1. **Eager array** — parse all shared strings into an array upfront, then index into it during worksheet parsing
2. **Lazy map** — parse shared strings on-demand as cells reference them, caching as they're encountered

## Decision

Use an eagerly loaded array for reading and a `Map<string, number>` for writing.

**Read path**: `parseSharedStrings(xml)` returns a `string[]`. The worksheet parser receives this array and resolves cell values by index (`sharedStrings[index]`). Rich text entries (`<r>` elements) are flattened to plain text by concatenating all `<t>` text runs.

**Write path**: `buildSharedStrings(workbook)` scans all cells in a single pass, deduplicating strings via a `Map` for O(1) lookup. Both `STRING` and `VECTOR` cell types contribute to the table (vectors are serialized to JSON strings first). `generateSharedStringsXml()` emits the XML with `xml:space="preserve"` for strings with leading or trailing whitespace.

## Alternatives Considered

**Lazy map (on-demand parsing)**

- Pros: avoids parsing unused strings in partial reads
- Cons: more complex implementation, shared strings are typically small relative to worksheet data, adds per-cell overhead for cache-miss checks

**Streaming SAX parse**

- Pros: lower peak memory for very large shared strings tables
- Cons: shared strings tables are rarely the memory bottleneck (worksheets are), adds implementation complexity for minimal benefit

## Consequences

- Simple, predictable read path — one parse, then array indexing
- Write deduplication is O(n) in total cells with O(1) per lookup
- Rich text formatting is stripped on read — only plain text is preserved
- Whitespace-sensitive strings are preserved via `xml:space="preserve"`
- Memory usage is proportional to unique string count, not total cell count
