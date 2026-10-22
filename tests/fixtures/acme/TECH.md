# TECH.md — Acme Reports

**Verified:** 2026-09-01 @ no git

## Stack
| Layer | Choice | Why | Decision |
|-------|--------|-----|----------|
| backend | Node | team knows it | inherited |

**Guardrail:** pre-commit hook `.husky/pre-commit` runs the test command
**Quality checks:** accessibility (axe on every route), end-to-end (Playwright on the primary flow), dependency audit, secret scan, all in CI
