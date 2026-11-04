# Memory templates

The formats of the project files BuilderOS writes besides state: `ROADMAP.md`, `TECH.md`, `DOMAIN.md` and an ADR. Read the one you are writing; the layout, `state.json` and the rules are in [the state schema](builderos-state-schema.md).

## ROADMAP.md

```markdown
# Roadmap — {Product}

**Verified:** {YYYY-MM-DD} @ {short commit, or "no git"}

## Direction
{Two or three sentences: where the product is going this year and why, citing PRODUCT.md and any ADR that set the direction.}

## Now
| Initiative | Track | Phase | Bet in one line | Folder |
|------------|-------|-------|-----------------|--------|
| {name} | {spike/change/feature/product} | {N — name} | {the change and the metric it should move} | `initiatives/{slug}/` |

## Next
| Initiative | Why next | What must be true first |
|------------|----------|-------------------------|

## Later
{Ideas worth keeping, one line each, with the reason they wait.}

## Done and dropped
| Initiative | Outcome | Learning | Date |
|------------|---------|----------|------|
| {name} | KEEP / ITERATE / KILL / killed at phase 1 / answered | {the phase 7 learning, or the verdict} | {date} |
```

`ROADMAP.md` is an index, not a store: each line points at the folder or ADR that holds the detail, and never restates it. Only `Direction`, `Next` and `Later` are written by hand. `Now` and `Done and dropped` are regenerated from the initiative states whenever one is created, changes phase or closes (`node scripts/bos.mjs roadmap` does it where commands run); when a table and a state disagree, the state wins. `Verified` moves only when someone re-reads the Direction and confirms it still holds.

## TECH.md

```markdown
# TECH.md — {Product}

**Verified:** {YYYY-MM-DD} @ {short commit, or "no git"}

## Stack
| Layer | Choice | Why | Decision |
|-------|--------|-----|----------|
| {interface / backend / data / auth / hosting / jobs / model / integrations / analytics / design kit} | {choice, or "open"} | {one line} | {ADR link, "inherited", or "decide in phase 4"} |

## Map
| Where | What it holds | Read when |
|-------|---------------|-----------|
| {a path: an entry point, a module, the tests, a config} | {one line} | {the change that needs it} |

**Generated:** {paths that are generated and never edited by hand, or "none"}

{Only what the agent cannot find in one search: the entry points, the module that holds the domain rules, where each kind of test lives, the files that look editable and are not. Kept true by phase 5 at every build; gate 5.11 checks that every path exists.}

## Design system
**Kit:** {component library or "custom"}
**Tokens:** {where the tokens live in the code, e.g. src/styles/tokens.css}
**Composition:** {grid, density, where primary actions sit; one or two lines}

## Verify
| Check | Command | Healthy output |
|-------|---------|----------------|
| Run | {the one command that starts the product locally (gate 5.17)} | {the ready line, e.g. "Ready on http://localhost:3000"} |
| Build | {one command, exits non-zero on failure} | {what success prints} |
| Test | {one command} | {e.g. "N passed, 0 failed"} |
| Test (fast) | {optional: the command that runs only the tests for a path or a pattern, used per slice when the full suite is slow} | {} |
| Lint | {one command} | {e.g. "0 problems"} |

**Known failing:** {tests already red before BuilderOS, by name, with the date; "none"}
**Guardrail:** {where Verify runs without anyone asking: a CI job, a pre-commit hook, or both, with the file that defines it; "none" until phase 5 adds one; "declined by {person} ({why}), {date}" when the CI belongs to someone else who said no}
**Quality checks:** {the automatic checks in the guardrail: accessibility (an axe-style scan on every route), end-to-end on the primary flow, dependency audit, secret scan, static analysis; with an interface, a token check (raw colours and spacing outside the token file fail); once `## Design system` has a kit, visual regression on the primary flow; each named with its command or "n/a, {why}"; "declined by {person} ({why}), {date}" as for the guardrail}
**Demo:** {with an interface: the one command that runs the end-to-end test of a flow with recording on, and where the video lands (`delivery-discipline` (demo)); written by the first build that records one}

## Environments
| Environment | URL | Deploys from | Who can see it |
|-------------|-----|--------------|----------------|
| production | {https:// address} | {branch and the CI job that deploys it} | {the team behind a password or flag, until the rollout; then everyone} |
| preview | {the per-change URL pattern, or staging} | {each pull request} | {the team} |

**Domain:** {domain, who registered it, HTTPS on}
**Secrets:** {where production secrets live, who can read them; development uses other values, out of git}
**Email sender:** {the sending domain with SPF, DKIM and DMARC verified and the date, or "sends no email"}
**Live keys:** {payment and provider keys in live mode, production only; or "not applicable, {why}"}
**Legal pages:** {terms, privacy notice, cookie consent before analytics; URLs, in each language of PRODUCT.md → Markets}
**Production check:** {`**Run:**` path of a captured request to the production URL, or the person's observation with its `[doc:...]` tag}

{Set up by `release-ops` (production) from the first slice of a new product (gate 5.16, all lines on the product track); on a product that already runs, written from its deploy configuration at init.}

## Operations
**Privacy:** {where the privacy notice lives; sub-processors (hosting, model provider, email, analytics) with their data processing agreements; how a person's data is deleted on request; data region; or "no personal data, {why}"}
**AI disclosure:** {where people are told they are dealing with an AI system, when the product has model output; omit otherwise}
**SLO:** {after PMF: one or two promises on the primary flow (availability, response time) and the alert when the error budget burns}
**Incident response:** {after PMF: who is alerted and how, how users are told, and the postmortem that becomes an initiative}
**Cost per active user:** {after PMF: infrastructure plus model cost per active user per month, with the budget alert}
**Load tested:** {after PMF: the date, the load (ten times the expected peak from the spec's `**Capacity:**`), how long, and the result against the SLO}
**Model degradation:** {after PMF, with model output: the must-pass cases run on sampled production turns, how often, and the pass rate that alerts; omit otherwise}

## Technical constraints
{Limits the code must respect: performance budgets, regulatory rules on data, supported platforms. Each with a source tag. A rule that must hold every time names the deterministic check that enforces it (a host hook, a CI check), or says none exists.}

## Conventions
{How this codebase does things that a newcomer would get wrong: naming, error handling, where tests live, how features are flagged. Where a feature depends on model output: its eval dataset reruns, through `run-check`, on every prompt or model change.}

## Known traps
{What has bitten before, with the initiative or commit where it happened.}
```

Written at init from the repository when one is readable, otherwise from the user; left as the headings with "no code yet" for an idea with nothing built. A Stack layer nobody has decided is written `open`, never guessed: phase 4 decides it with the user (`system-design` (stack)), and the briefing flags an open initiative past phase 4 whose `TECH.md` still has open or empty layers. Phase 5 fills Verify when it is empty, adds the Guardrail and the Quality checks when there are none, and adds the conventions, traps and recurring review findings it discovers; phase 6 adds anything the release taught and fills Operations as the stage requires (gate 6.10): Privacy, and AI disclosure when a model speaks, from the first release; SLO, Incident response, Cost per active user and Load tested once `PRODUCT.md` says `emerging-PMF` or `scaling`. These are product facts, written once and kept true, not repeated per release. A trap is recorded the first time it costs time, not the second. Keep the file under a page: an agent reads all of it every session, so a line that is no longer true is cut, not kept for history. `Verified` moves when the file has been checked against the repository (manifests, lockfiles, config), not when a line is appended; a briefing flags it when dependencies changed after it.

## DOMAIN.md

```markdown
# DOMAIN.md — {Product}

## Entities
| Entity | Means | Lifecycle | Since |
|--------|-------|-----------|-------|
| {name in the product's words} | {one sentence} | {states, or "none"} | {initiative that introduced or last changed it} |

## Transitions: {entity}
| From | To | Who | Guard | Effect |

## Invariants
- {a rule that holds whatever happens} ({initiative})

## Business rules
- {a rule a person decided, with who and when} ({initiative}, {decision file if any})
```

Written at init from the repository when it holds schemas, migrations or status enums (marked unverified until a person confirms them), otherwise the heading only. Grows at every ship (gate 6.9). A rule that a later initiative changes is rewritten with the new initiative named, and the change is a decision in `decisions/` when it passes the ADR test. Terms stay defined in `PRODUCT.md` → Language; this file holds how the things behave.

## ADR Format

Write one only when all three hold: **hard to reverse** (changing your mind later costs something real), **surprising without context** (a reader in six months would ask why), and **a real trade-off** (genuine alternatives existed). Missing any one, skip it.

```markdown
# ADR-{NNN}: {Decision}

**Date:** {YYYY-MM-DD}
**Phase:** {N}
**Status:** accepted | superseded by ADR-{NNN}

## Context
{What forced a decision. Evidence tags required.}

## Decision
{What was decided, in one paragraph, active voice.}

## Alternatives rejected
{Each with the reason it lost.}

## Consequences
{What this makes easy, what it makes hard, what it forecloses.}

## Revisit when
{The observation that would reopen this.}
```

ADRs are written at phase 7, and any time a decision is hard to reverse, surprising without context, and the result of a real trade-off. All three, or no ADR: `/bos-adr` runs the test. "Revisit when" is mandatory: a decision without a reopening condition becomes dogma. Write a date in it when time alone should reopen the decision (`By 2027-01-15, or when …`); the briefing raises it once that date passes, and raises any decision file without the section.
