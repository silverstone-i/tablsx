# tablsx
tablsx is a lightweight Node.js library for importing and exporting Excel .xlsx files as structured JavaScript data.

The library focuses on clean, predictable data interchange rather than full spreadsheet editing. It reads Excel workbooks into simple tabular structures and writes .xlsx files from arrays, objects, or database-style rows.

Key capabilities:
- Read .xlsx files into JavaScript data structures
- Write .xlsx files from tabular data
- Support Excel data types including strings, numbers, booleans, dates, formulas, and null values
- Handle large datasets and multi-sheet workbooks
- Support vector/embedding columns using numeric arrays
- Provide a simple core data model with an optional builder-style API for creating workbooks

tablsx is designed for data pipelines, database exports, and other data engineering workflows.

## Possible future features

The current scope intentionally focuses on predictable tabular interchange. If needed, the following features could be added in future versions:

- Styling and formatting support (fonts, fills, borders, number formats, alignment)
- Worksheet tables
- Data validation rules
- Named ranges / defined names
- Cell comments and notes
- Conditional formatting
- Image embedding
- Worksheet protection
- Page setup and print options (including headers and footers)
- Worksheet views (freeze/split panes)
- CSV read/write API
- Rich text and hyperlink-focused helpers
- Merged-cell and outline/grouping convenience APIs
- Streaming read/write APIs for very large workbooks

## Collaboration best practices

See [docs/collaboration-best-practices.md](./docs/collaboration-best-practices.md) for contributor workflow, coding standards, testing expectations, and documentation update rules.
