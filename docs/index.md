---
layout: home

hero:
  name: "tablsx"
  text: "Predictable XLSX data interchange for Node.js"
  tagline: Read and write Excel workbooks using a small normalized JavaScript model.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: API Reference
      link: /reference/

features:
  - title: Small public API
    details: The package exposes a single normalized workbook model plus focused helpers for reading, writing, tabular conversion, builders, and readers.
  - title: Data pipeline friendly
    details: Work with arrays, row objects, dates, formulas, empty cells, and numeric vectors without adopting a spreadsheet UI abstraction.
  - title: Explicit behavior
    details: The docs link directly to design rules and ADRs so consumers and contributors can understand the intended semantics.
---

## Why tablsx

`tablsx` is designed for programs that treat `.xlsx` files as data exchange artifacts rather than interactive spreadsheets. The package keeps the model small, predictable, and easy to inspect.

## Documentation map

- Start with [Getting Started](/guide/getting-started) for installation and a first round-trip example.
- Use [Choosing an API](/guide/choosing-an-api) to decide between plain functions, builders, and readers.
- Use [Reading Workbooks](/guide/reading-workbooks) and [Writing Workbooks](/guide/writing-workbooks) for direct buffer-based APIs.
- Use [Tabular Workflows](/guide/tabular-workflows) when your data starts as arrays of objects.
- Use [Builder API](/guide/builder-api) for fluent workbook construction.
- Use [Reader API](/guide/reader-api) for navigable, read-only access to parsed workbooks.
- Use [Reference](/reference/) for the full exported surface.
