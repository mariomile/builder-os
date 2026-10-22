# TECH.md — Acme Reports

**Verified:** 2026-09-01 @ no git

## Operations
**Privacy:** policy at /privacy; sub-processors (hosting, email) listed there with their DPAs; account deletion removes deals within 30 days; data in the EU
**SLO:** 99.5% of report requests answered within 2 seconds, monthly
**Incident response:** error tracker alerts the on-call founder; status message on the in-app banner; a postmortem within 3 days starts an anomaly initiative
**Cost per active user:** €0.40 per month infrastructure, budget alert at €0.80

## Stack
| Layer | Choice | Why | Decision |
|-------|--------|-----|----------|
| backend | Node | team knows it | inherited |

**Guardrail:** pre-commit hook `.husky/pre-commit` runs the test command
**Quality checks:** accessibility (axe on every route), end-to-end (Playwright on the primary flow), dependency audit, secret scan, all in CI
