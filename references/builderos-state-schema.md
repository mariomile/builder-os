# .builderos/ State Schema

The pipeline's memory. Created by `/bos-init`, read by every lifecycle command, written by every phase agent.

## Layout

```
.builderos/
  state.json            pipeline state — the only machine-read file
  00-frame.md           problem statement, ICP, riskiest assumption
  01-discovery.md       evidence ledger, JTBD, verdict
  02-definition.md      opportunity tree, selected opportunity, success metric
  03-solution-bet.md    options scored, selected bet, kill criteria
  04-spec.md            scope, flows, acceptance criteria, tracking plan
  05-build-plan.md      tracer tickets, test map, review record
  06-release.md         rollout, instrumentation check, baseline
  07-outcome.md         actual vs. target, decision
  decisions/
    ADR-001-{slug}.md   one file per irreversible decision
```

Phase artifacts are Markdown for humans. `state.json` is the machine surface: no agent should have to parse prose to know where the pipeline stands.

**Version control:** commit `.builderos/`. Product decisions belong next to the code they caused, and a teammate cloning the repo inherits the reasoning. Teams that want it private add it to `.gitignore` at init time; `/bos-init` asks once and records the answer.

## state.json

```json
{
  "schema": 1,
  "product": "captoo",
  "mode": "full",
  "current_phase": 2,
  "cycle": 1,
  "created_at": "2026-09-20T10:00:00Z",
  "updated_at": "2026-09-20T14:30:00Z",
  "phases": {
    "0": {
      "status": "passed",
      "artifact": "00-frame.md",
      "gate": {
        "passed": true,
        "checked_at": "2026-09-20T11:00:00Z",
        "failed_conditions": [],
        "overridden": false,
        "override_reason": null
      }
    },
    "1": {
      "status": "passed",
      "artifact": "01-discovery.md",
      "verdict": "VALIDATED",
      "gate": {
        "passed": true,
        "checked_at": "2026-09-20T14:00:00Z",
        "failed_conditions": ["1.5"],
        "overridden": true,
        "override_reason": "No churned users reachable before the board meeting; revisit in cycle 2"
      }
    },
    "2": { "status": "in_progress", "artifact": null, "gate": null }
  },
  "history": [
    { "at": "2026-09-20T11:00:00Z", "event": "gate_passed", "phase": 0 },
    { "at": "2026-09-20T14:00:00Z", "event": "gate_overridden", "phase": 1, "conditions": ["1.5"] }
  ]
}
```

### Fields

| Field | Values | Meaning |
|-------|--------|---------|
| `schema` | `1` | Schema version. Agents refuse to write a file whose schema they do not know |
| `mode` | `full` \| `lite` | Gate strictness. See `gate-checks` |
| `current_phase` | `0`–`7` | Where the pipeline stands |
| `cycle` | `1`+ | Increments when phase 7 re-enters phase 1 or 2 |
| `phases.N.status` | `pending` \| `in_progress` \| `passed` \| `killed` | `killed` ends the pipeline: the problem did not survive |
| `phases.N.verdict` | phase-specific | Only phases 1 and 7 carry a verdict |
| `gate.failed_conditions` | condition ids | Populated even when overridden — this is the audit trail |
| `history` | append-only | Never rewritten. Phase 7 reads it to judge how the bet was actually run |

## Rules

1. **`state.json` is append-oriented.** `history` is never edited or truncated. Correcting a mistake means adding an event, not deleting one.
2. **A phase writes its own artifact and its own state entry, nothing else.** No agent touches another phase's entry.
3. **`current_phase` advances only through a gate.** Passed or overridden. There is no third path.
4. **A `killed` phase stops the pipeline.** `/bos` reports the kill and offers to start a new cycle from phase 0 with the learning carried forward.
5. **Missing state is not an error.** If `.builderos/` does not exist, any `bos-*` command offers `/bos-init` rather than failing.
6. **Cycle increments preserve prior artifacts.** Phase artifacts from cycle 1 move to `.builderos/cycle-1/` when cycle 2 begins.

## ADR Format

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

ADRs are written at phase 7, and any time a decision is irreversible or expensive to unwind. "Revisit when" is mandatory: a decision without a reopening condition becomes dogma.
