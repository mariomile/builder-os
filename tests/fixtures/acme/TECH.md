# TECH.md — Acme Reports

**Verified:** 2026-09-01 @ no git

## Map
| Where | What it holds | Read when |
|---|---|---|
| `src/export.ts` | the CSV export of the Monday view, its columns and its filters | changing what an export contains |

## Verify
| Check | Command | Healthy output |
|-------|---------|----------------|
| Run | `npm run dev` | Ready on http://localhost:3000 |
| Test | `npm test` | N passed, 0 failed |

## Environments
| Environment | URL | Deploys from | Who can see it |
|---|---|---|---|
| production | https://reports.acme.example | main, by the CI deploy job | every customer |
| preview | https://pr-{n}.reports.acme.example | each pull request | the team |

**Domain:** reports.acme.example, HTTPS by the host
**Secrets:** in the host's environment settings, never in git; the founders can read them
**Email sender:** acme.example with SPF, DKIM and DMARC verified, 2026-08-20
**Live keys:** payments in live mode, set in production only
**Legal pages:** /terms, /privacy, cookie consent shown before analytics loads
**Production check:** the founder opened the URL and signed in on 2026-09-01 `[doc:production-check]`

## Operations
**Privacy:** policy at /privacy; sub-processors (hosting, email) listed there with their DPAs; account deletion removes deals within 30 days; data in the EU
**SLO:** 99.5% of report requests answered within 2 seconds, monthly
**Load tested:** 2026-09-20, 20 report requests a second (ten times the peak) for 10 minutes, p95 1.4 s
**Incident response:** error tracker alerts the on-call founder; status message on the in-app banner; a postmortem within 3 days starts an anomaly initiative
**Cost per active user:** €0.40 per month infrastructure, budget alert at €0.80

## Stack
| Layer | Choice | Why | Decision |
|-------|--------|-----|----------|
| backend | Node | team knows it | inherited |

**Guardrail:** pre-commit hook `.husky/pre-commit` runs the test command
**Quality checks:** accessibility (axe on every route), end-to-end (Playwright on the primary flow), dependency audit, secret scan, static analysis (CodeQL), all in CI
