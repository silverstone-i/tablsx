# ADR-0003: ZIP and XML Library Selection

## Status

Accepted

## Context

The `.xlsx` format is a ZIP archive containing XML documents. The library needs:

1. A ZIP library to decompress (read) and compress (write) the archive
2. An XML parser to read Open XML documents and (optionally) a generator for writing

These are the only two areas where external dependencies are permitted — all Excel-specific logic (shared strings, cell type resolution, date conversion, worksheet structure) must be implemented within the library.

## Decision

- **ZIP**: `fflate` (v0.8.x) — a modern, fast, pure-JavaScript ZIP library with synchronous `unzipSync`/`zipSync` APIs
- **XML parsing**: `fast-xml-parser` (v5.x) — a high-performance XML parser with configurable attribute handling
- **XML generation**: hand-built string concatenation using array join

### fflate

Used in `src/reader/zip.js` (`unzipSync`) and `src/writer/zip.js` (`zipSync`). Accepts and returns `Uint8Array` buffers. Synchronous API avoids async complexity in the read/write pipelines.

### fast-xml-parser

Used with consistent configuration across parsers:
- `ignoreAttributes: false` — attributes are essential for cell type (`t`), style (`s`), and reference (`r`)
- `attributeNamePrefix: "@_"` — distinguishes attributes from child elements
- `isArray` — configured per parser to ensure consistent array handling for elements like `si`, `r`, `xf`, `numFmt`
- `trimValues: false` — preserves whitespace in shared strings

### XML generation

XML output is built via string array concatenation (`parts.push(...)` then `parts.join("")`). This avoids a dependency on an XML builder library and gives full control over the output format.

## Alternatives Considered

**ZIP alternatives**

| Library | Consideration | Rejection reason |
|---|---|---|
| `yazl`/`yauzl` | Mature, widely used | Async-only API, callback-based |
| `archiver`/`unzipper` | Full-featured | Heavy dependency tree, stream-based API adds complexity |
| `jszip` | Popular | Larger bundle, async API |
| `adm-zip` | Simple sync API | Less performant, larger footprint |

**XML alternatives**

| Library | Consideration | Rejection reason |
|---|---|---|
| `sax` | SAX-style streaming | More boilerplate for simple document structures |
| `xml2js` | Mature | Heavy, callback-based, slower |
| `cheerio` | jQuery-like API | Designed for HTML, overkill for XML |
| `xmlbuilder2` | XML generation | Unnecessary — string concatenation is sufficient and faster |

## Consequences

- Only two runtime dependencies: `fflate` and `fast-xml-parser`
- Synchronous API throughout — no async/await needed in read or write paths
- String-based XML generation is fast and produces minimal output (no pretty-printing)
- fflate's `Uint8Array` output is compatible with Node.js `Buffer` (Buffer is a Uint8Array subclass)
- Upgrading either dependency is low-risk — their APIs are used in isolated wrapper modules (`reader/zip.js`, `writer/zip.js`)
