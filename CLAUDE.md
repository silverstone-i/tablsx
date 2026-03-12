# CLAUDE.md — tablsx

## Project Overview
tablsx is a Node.js library for reading and writing Excel .xlsx files. It uses ES modules, targets Node >=18, and has minimal dependencies (fflate for zip, fast-xml-parser for XML).

## Commands
- `npm test` — run all tests (vitest)
- `npm run test:watch` — run tests in watch mode
- `npm run lint` — run ESLint
- `npm run lint:fix` — run ESLint with auto-fix
- `npm run format` — format all JS files with Prettier
- `npm run format:check` — check formatting without writing

## Pre-commit Hook
A husky pre-commit hook runs automatically on every commit:
1. `lint-staged` — ESLint + Prettier on staged `.js` files
2. `npm test` — full test suite

## Architecture
- `src/model/` — data model (Workbook, Sheet, Cell, CellType enum)
- `src/reader/` — .xlsx parsing (worksheet-parser, shared-strings, styles)
- `src/writer/` — .xlsx generation (worksheet-writer, shared-strings-writer, styles-writer, workbook-writer, zip)
- `src/utils/` — helpers (cell-ref encoding, XML escaping, date conversion, vector serialization)
- `test/` — mirrors src structure, uses vitest

## Code Conventions
- ES modules (`import`/`export`), no CommonJS
- Use `CellType` enum constants (e.g., `CellType.STRING`), never raw string literals for cell types
- JSDoc on all exported functions
- Run `npm test` after changes to verify nothing breaks
- **Every `.js` file must start with a copyright header** as the first line(s), before any imports:
  ```js
  // Copyright © 2026 – present NapSoft LLC. All rights reserved.
  ```
  When creating new files or modifying existing files that lack this header, add it.

## Git / Commit Rules
- **Never add `Co-Authored-By` lines** to commit messages — suppress the default trailer entirely
- Keep commit messages concise (1-2 sentences) focused on "why" not "what"
- Stage specific files, avoid `git add -A`
