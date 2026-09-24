# .builderos/ State Schema

The project's memory. Created by `/bos-init`, read at the start of every session and by every lifecycle command, written by every phase.

## Layout

```
PRODUCT.md                what the product is: problem, ICP, non-goals, constraints, voice, language
TECH.md                   how it is built: stack, technical constraints, conventions, known traps
AGENTS.md                 the project's own agent instructions; /bos-init adds the pointer below
.builderos/
  state.json              every initiative's pipeline state — the only machine-read file
  ROADMAP.md              the master plan: direction, initiatives now / next / later / dropped
  decisions/
    ADR-001-{slug}.md     one file per decision that is hard to reverse (shared across initiatives)
  initiatives/
    {initiative}/         one folder per initiative: a feature, a bet, a new product
      00-frame.md         problem statement, ICP, riskiest assumption
      01-discovery.md     evidence ledger, JTBD, verdict
      02-definition.md    opportunity tree, selected opportunity, success metric
      03-solution-bet.md  options scored, selected bet, kill criteria
      DESIGN.md           information architecture, flows, states, components
      04-spec.md          scope, flows, acceptance criteria, tracking plan
      05-build-plan.md    tracer tickets, test map, review record
      06-release.md       rollout, instrumentation check, baseline
      07-outcome.md       actual vs. target, decision
      questionnaires/
        {recipient}.md    async questions for someone the user cannot interview, phase 1
      cycle-{N}/          artifacts of an earlier cycle of this initiative
```

Throughout the skills and commands, a bare artifact name (`00-frame.md`, `DESIGN.md`, `questionnaires/`) means the file in the **active initiative's folder**: `.builderos/initiatives/{initiative}/`. `PRODUCT.md`, `TECH.md`, `ROADMAP.md` and `decisions/` are project-wide.

Phase artifacts are Markdown for humans. `state.json` is the machine surface: no agent should have to parse prose to know where any initiative stands.

**Version control:** commit `.builderos/`, `PRODUCT.md` and `TECH.md`. Product decisions belong next to the code they caused, and a teammate cloning the repo inherits the reasoning. Teams that want it private add `.builderos/` to `.gitignore` at init time; `/bos-init` asks once and records the answer.

## Session Start

The files above only help if a new session reads them. Every session, on any host, before answering anything product-related:

1. Read `.builderos/state.json` and `.builderos/ROADMAP.md`.
2. Read `PRODUCT.md`, and `TECH.md` when the work touches code.
3. Give the user a briefing of at most five lines: the active initiative and its phase, the last gate result, open overrides, the most recent decision, and what comes next.

Hosts with a session-start hook get this from `using-builder-os`. Every other host gets it from the pointer `/bos-init` writes into the project's own `AGENTS.md`:

```markdown
## BuilderOS

This project is run with BuilderOS. Before any product or planning work, read `.builderos/state.json`, `.builderos/ROADMAP.md`, `PRODUCT.md` and `TECH.md`, then brief the user in at most five lines on where things stand. Decisions live in `.builderos/decisions/`; each initiative's reasoning lives in `.builderos/initiatives/`.
```

If the project has a `CLAUDE.md` that does not import `AGENTS.md`, the same block goes there too.

## ROADMAP.md

```markdown
# Roadmap — {Product}

**Last updated:** {YYYY-MM-DD}

## Direction
{Two or three sentences: where the product is going this year and why, citing PRODUCT.md and any ADR that set the direction.}

## Now
| Initiative | Track | Phase | Bet in one line | Folder |
|------------|-------|-------|-----------------|--------|
| {name} | {spike/feature/product} | {N — name} | {the change and the metric it should move} | `initiatives/{slug}/` |

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

`ROADMAP.md` is an index, not a store: each line points at the folder or ADR that holds the detail, and never restates it. It is updated whenever an initiative is created, changes phase, or closes. Only `Direction` is written by hand; the tables follow `state.json`, and when the two disagree `state.json` wins and the roadmap is corrected.

## TECH.md

```markdown
# TECH.md — {Product}

## Stack
| Layer | Choice | Why | Decision |
|-------|--------|-----|----------|
| {frontend / backend / data / hosting / analytics} | {choice} | {one line} | {ADR link, or "inherited"} |

## Technical constraints
{Limits the code must respect: performance budgets, regulatory rules on data, supported platforms. Each with a source tag.}

## Conventions
{How this codebase does things that a newcomer would get wrong: naming, error handling, where tests live, how features are flagged.}

## Known traps
{What has bitten before, with the initiative or commit where it happened.}
```

Written at init from the repository when one is readable, otherwise from the user; left as the headings with "no code yet" for an idea with nothing built. Phase 5 adds conventions and traps it discovers; phase 6 adds anything the release taught. A trap is recorded the first time it costs time, not the second.

## state.json

```json
{
  "schema": 2,
  "product": "captoo",
  "active": "csv-export",
  "initiatives": {
    "csv-export": {
      "title": "CSV export for enterprise reports",
      "mode": "lite",
      "track": "feature",
      "current_phase": 2,
      "cycle": 1,
      "created_at": "2026-09-20T10:00:00Z",
      "updated_at": "2026-09-20T14:30:00Z",
      "phases": {
        "0": { "status": "covered", "artifact": null, "gate": null },
        "1": { "status": "covered", "artifact": null, "gate": null },
        "2": { "status": "in_progress", "artifact": null, "gate": null }
      },
      "history": [
        { "at": "2026-09-20T10:00:00Z", "event": "track_set", "track": "feature", "reason": "Existing product; PRODUCT.md problem and ICP carry interview tags" },
        { "at": "2026-09-20T10:00:00Z", "event": "phase_covered", "phase": 0, "tags": ["interview:P1,P4,P6"] },
        { "at": "2026-09-20T10:00:00Z", "event": "phase_covered", "phase": 1, "tags": ["interview:P1,P4,P6", "doc:support-tickets-aug"] }
      ]
    },
    "onboarding-v2": {
      "title": "Onboarding rework",
      "mode": "full",
      "track": "product",
      "current_phase": 1,
      "cycle": 1,
      "created_at": "2026-09-12T09:00:00Z",
      "updated_at": "2026-09-19T16:00:00Z",
      "phases": {
        "0": {
          "status": "passed",
          "artifact": "00-frame.md",
          "gate": {
            "passed": true,
            "checked_at": "2026-09-13T11:00:00Z",
            "failed_conditions": ["0.4"],
            "overridden": true,
            "override_reason": "No dated external change found; problem judged durable, revisit after interviews"
          }
        },
        "1": { "status": "in_progress", "artifact": null, "gate": null }
      },
      "history": [
        { "at": "2026-09-13T11:00:00Z", "event": "gate_overridden", "phase": 0, "conditions": ["0.4"] }
      ]
    }
  }
}
```

### Fields

| Field | Values | Meaning |
|-------|--------|---------|
| `schema` | `2` | Schema version. Agents refuse to write a file whose schema they do not know. A `1` file is migrated, see Rules |
| `active` | initiative slug | The initiative commands act on unless told otherwise. `/bos --initiative {slug}` switches it |
| `initiatives.{slug}` | object | One per initiative. Every field below lives inside it |
| `title` | text | The name the roadmap shows |
| `mode` | `full` \| `lite` | Gate strictness. See `gate-checks` |
| `track` | `spike` \| `feature` \| `product` | How much of the pipeline this work needs. Set at init, announced to the user, only ever upgraded. Absent means `product`, so files written before the field existed stay valid. See `builder-os`, section Tracks |
| `current_phase` | `0`–`7` | Where the pipeline stands |
| `cycle` | `1`+ | Increments when phase 7 re-enters phase 1 or 2 |
| `phases.N.status` | `pending` \| `in_progress` \| `passed` \| `killed` \| `covered` \| `answered` | `killed` ends the pipeline: the problem did not survive. `covered` marks a phase the `feature` track skipped because `PRODUCT.md` passed the coverage check. `answered` ends a `spike` at phase 1 |
| `phases.N.verdict` | phase-specific | Only phases 1 and 7 carry a verdict |
| `gate.failed_conditions` | condition ids | Populated even when overridden — this is the audit trail |
| `history` | append-only | Never rewritten. Phase 7 reads it to judge how the bet was actually run. Track events: `track_set` (at init, with the reason), `phase_covered` (per skipped phase, with the `PRODUCT.md` tags that covered it), `track_upgraded` (from, to, and the observation that forced it) |

## Rules

1. **Every phase reads and writes the active initiative.** "`current_phase`", "phase 1 passed" and every other state check in a skill or command means the entry under `initiatives.{active}`. A phase never writes another initiative's entry.
2. **`state.json` is append-oriented.** `history` is never edited or truncated. Correcting a mistake means adding an event, not deleting one.
3. **A phase writes its own artifact and its own state entry, nothing else.** No agent touches another phase's entry.
4. **`current_phase` advances only through a gate.** Passed or overridden. The `feature` track's coverage check is a gate too: it is how a phase becomes `covered`. There is no other path.
5. **A `killed` phase stops the pipeline.** `/bos` reports the kill and offers to start a new cycle from phase 0 with the learning carried forward.
6. **A track only goes up.** `spike` → `feature` or `product`, `feature` → `product`. Never down: complexity found mid-pipeline does not un-find itself. An upgrade re-enters the earliest phase the new track requires and keeps every artifact already written.
7. **Missing state is not an error.** If `.builderos/` does not exist, any `bos-*` command offers `/bos-init` rather than failing.
8. **Cycle increments preserve prior artifacts.** An initiative's phase artifacts from cycle 1 move to its own `cycle-1/` folder when cycle 2 begins.
9. **The roadmap follows state.** Creating an initiative, advancing a phase, killing or closing one updates `ROADMAP.md` in the same step. A phase that changed `state.json` and left the roadmap stale has not finished.
10. **Migrating schema 1.** A `schema: 1` file describes a single pipeline. Wrap its fields into `initiatives.{slug}` (slug from the product name), set `active` to it, move the phase artifacts and `DESIGN.md` into `initiatives/{slug}/`, create `ROADMAP.md` with that one initiative under Now, bump `schema` to `2`, and append a `migrated` history event. Tell the user what moved; never migrate silently.

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

ADRs are written at phase 7, and any time a decision is hard to reverse, surprising without context, and the result of a real trade-off. All three, or no ADR: `/bos-adr` runs the test. "Revisit when" is mandatory: a decision without a reopening condition becomes dogma.
