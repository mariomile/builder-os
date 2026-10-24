# TECH.md

## Stack

| Layer | Choice | Status |
|-------|--------|--------|
| Hosting | open | open |

## Map

| What | Where |
|------|-------|
| Entry | src/app.mjs |
| Tests | tests/ |

## Verify

| Check | Command |
|-------|---------|

**Guardrail:** .github/workflows/ci.yml runs Verify on every push
**Quality checks:** accessibility: axe in CI · end-to-end: tests/e2e/confirm.spec.mjs · dependency audit: npm audit · secret scan: gitleaks · static analysis: semgrep · token check: stylelint

| Run | npm start |
| Test | npm test |

## Environments
| Environment | URL | Deploys | Who can see it |
|-------------|-----|---------|----------------|
| production | https://promemoria.example.com | main by CI | the team, behind a password |

**Production check:** {{RUN:production-check}}
**Domain:** promemoria.example.com
**Secrets:** host settings
**Email sender:** not applicable, WhatsApp only
**Live keys:** set in production
**Legal pages:** terms and privacy in Italian

## Operations
**Privacy:** notice in Italian, sub-processors listed
