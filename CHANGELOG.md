# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- GitHub Actions workflow for automated npm publishing on version tags (with RC support)
- GitHub Actions workflow for VitePress documentation deployment to GitHub Pages
- Release Guide documenting versioning, branching, and publishing workflows

## [0.1.0] - 2026-03-13

### Added

- Core `readXlsx` and `writeXlsx` functions for reading and writing .xlsx files
- Data model: Workbook, Worksheet, Cell, and CellType enum
- Support for all Excel data types: strings, numbers, booleans, dates, formulas, errors
- Shared strings and styles parsing for accurate type detection
- Tabular API: `sheetFromRows`, `rowsFromSheet`, `inferSchema` for row-oriented workflows
- Builder API: `WorkbookBuilder` and `SheetBuilder` for fluent workbook construction
- Reader API: `WorkbookReader` and `SheetReader` for selective sheet reading
- Utility functions: cell-ref encoding, XML escaping, date conversion, vector serialization
- VitePress documentation site with guides and API reference
- GitHub Actions CI pipeline (tests, lint, examples, docs build)
- Pre-commit hooks via Husky (ESLint + Prettier + vitest)
