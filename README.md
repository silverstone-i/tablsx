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

tablsx is designed for data pipelines, database expor