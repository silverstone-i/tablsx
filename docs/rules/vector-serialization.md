# Vector Serialization Rules

Defines the rules for encoding and decoding vector/embedding columns (`number[]`) in `.xlsx` files.

## Storage Format

Vectors are serialized as JSON array strings and stored as regular string cells:

```
number[] → JSON.stringify() → string cell → shared strings table
```

Example: `[0.1, 0.2, 0.3]` → `"[0.1,0.2,0.3]"`

## Serialization (`serializeVector`)

- Input: `number[]`
- Output: `string` (JSON array)
- Implementation: `JSON.stringify(arr)`
- No custom formatting — relies on JavaScript's default number serialization

## Deserialization (`deserializeVector`)

- Input: `string`
- Output: `number[]`
- Implementation: `JSON.parse(str)` with validation
- Throws if the parsed value is not an array of numbers
- Does not accept mixed-type arrays (e.g., `[1, "two", 3]`)

## Detection (`isVectorString`)

- Input: `string`
- Output: `boolean`
- Rules:
  1. Must be a string type
  2. Trimmed value must start with `[` and end with `]`
  3. Must parse as valid JSON
  4. Parsed value must be an array where every element is a `number`
- Leading/trailing whitespace is tolerated

## Precision Guarantees

- IEEE 754 double-precision floating-point numbers round-trip through `JSON.stringify`/`JSON.parse` without precision loss
- Special values (`NaN`, `Infinity`, `-Infinity`) cause `serializeVector` to throw — it requires an array of finite numbers. These values cannot be stored in vector cells
- The precision boundary is JavaScript's `Number` type (53-bit mantissa)

## Opt-In vs Automatic Detection

- **On write**: automatic — `VECTOR` cells are detected by `inferType()` when the value is `number[]`
- **On read (core reader)**: vectors are stored as string cells; the reader performs no automatic vector detection
- **On read (tabular layer)**: callers may opt in to vector deserialization via column type overrides in `rowsFromSheet()`, or rely on automatic detection via `isVectorString()` in `inferSchema()`
- **On read (SheetReader)**: `SheetReader.toObjects()` delegates to `rowsFromSheet()`, so callers may also opt in to vector deserialization via `options.columns`

## Shared Strings Integration

Vector JSON strings participate in the shared strings table:
- Identical vectors share the same string entry
- Deduplication is by exact string equality (same JSON output = same entry)
- The JSON string is XML-escaped like any other shared string

## Limitations

- Maximum practical vector length is constrained by Excel's cell content limit (32,767 characters)
- For 1536-dimension embeddings with typical precision, JSON strings are ~12,000 characters — well within limits
- Empty arrays (`[]`) are valid vectors
- Nested arrays are not supported — only flat `number[]`
