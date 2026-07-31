# CLAUDE.md — tablsx

## Project Overview
tablsx is a TypeScript library for reading and writing Excel .xlsx files. It uses ES modules, targets Node >=18, and has minimal dependencies (fflate for zip, fast-xml-parser for XML). The published package ships compiled JS + type declarations from `dist/`; development and tests run directly on the TypeScript sources (no build step needed).

## Commands
- `npm test` — run all tests (vitest)
- `npm run test:watch` — run tests in watch mode
- `npm run typecheck` — typecheck src/examples and tests (two tsconfig projects)
- `npm run build` — compile src to `dist/` (only needed for publishing)
- `npm run lint` — run ESLint (typed typescript-eslint rules)
- `npm run lint:fix` — run ESLint with auto-fix
- `npm run format` — format all JS/TS files with Prettier
- `npm run format:check` — check formatting without writing
- `npm run check:headers` — verify copyright headers on all source files

## Pre-commit Hook
A husky pre-commit hook runs automatically on every commit:
1. `lint-staged` — ESLint + Prettier on staged `.js`/`.ts` files
2. `npm test` — full test suite

## Architecture
- `src/model/` — data model (Workbook, Worksheet, Cell, CellType) and shared type aliases in `types.ts`
- `src/reader/` — .xlsx parsing (worksheet-parser, shared-strings, styles); `xml-types.ts` types the fast-xml-parser boundary
- `src/writer/` — .xlsx generation (worksheet-writer, shared-strings-writer, styles-writer, workbook-writer, zip)
- `src/utils/` — helpers (cell-ref encoding, XML escaping, date conversion, vector serialization)
- `test/` — mirrors src structure, uses vitest; `test/tsconfig.json` relaxes `noUncheckedIndexedAccess` for test code only
- `dist/` — build output, gitignored, published to npm

## Code Conventions
- ES modules (`import`/`export`), no CommonJS; import specifiers use `.js` extensions (NodeNext resolution)
- Strict TypeScript: always declare parameter types and return types explicitly (enforced by `@typescript-eslint/explicit-function-return-type`)
- Reuse the shared aliases in `src/model/types.ts` (`Cell`, `CellValue`, `Row`, `Worksheet`, `Workbook`, `XlsxInput`) instead of redeclaring structures
- Use `import type { ... }` for type-only imports (enforced by `verbatimModuleSyntax`)
- Use `CellType` constants (e.g., `CellType.STRING`), never raw string literals for cell types
- JSDoc on all exported functions: prose descriptions, `@throws`, `@param name description` — no type braces (types live in signatures)
- In tests, mark deliberate invalid-input calls with `// @ts-expect-error — testing invalid input`
- Run `npm test` after changes to verify nothing breaks
- **Every `.js`/`.ts` file must start with a copyright header** as the first line(s), before any imports:
  ```js
  // Copyright © 2026 – present NapSoft LLC. All rights reserved.
  ```
  When creating new files or modifying existing files that lack this header, add it.

## Git / Commit Rules
- **Never add `Co-Authored-By` lines** to commit messages — suppress the default trailer entirely
- Keep commit messages concise (1-2 sentences) focused on "why" not "what"
- Stage specific files, avoid `git add -A`

## Branching / PR Strategy
- All feature and fix branches create PRs targeting **`main`**
- The legacy `dev` branch is deprecated — do not target or merge it
- Releases are cut by tagging `main` with `vX.Y.Z` (triggers the npm publish workflow)
