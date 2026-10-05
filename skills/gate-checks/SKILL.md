---
name: gate-checks
description: "Use when a BuilderOS phase is about to advance, when asked to inspect a lifecycle gate, or when deciding whether a phase artifact is complete enough to hand to the next phase"
---

# Gate Checks

Every lifecycle phase ends at a gate that checks artifact structure, evidence and decisions. Pass every required condition, advance. Fail one, stop and say which. A gate that can be argued with is not a gate. This skill inspects an active lifecycle initiative; a standalone review returns findings without creating or changing lifecycle state.

Read `evidence-ledger` only when tag counting or source provenance needs clarification. Read `pressure-testing` only for a material unresolved branch that evidence and delegated judgment cannot settle.

## The Conditions

Read `current_phase` from `state.json`, then read only the conditions file for that gate: [0 Frame](references/gate-0-frame.md), [1 Discover](references/gate-1-discover.md), [2 Define](references/gate-2-define.md), [3 Ideate](references/gate-3-ideate.md), [4 Shape](references/gate-4-shape.md), [5 Build](references/gate-5-build.md), [6 Ship](references/gate-6-ship.md), [7 Learn](references/gate-7-learn.md), or [C Coverage](references/coverage-check.md). Each holds the condition table (id, condition, check), which conditions the script decides, and the phase's recording flags. Read [lite mode](references/lite-mode.md) when `state.json` sets `mode: "lite"`.

E.1 runs on every gate, including the coverage check (against `PRODUCT.md`). A tag without its file is an untagged claim wearing a tag.

| # | Condition | Check |
|---|-----------|-------|
| E.1 | Every source tag points at something | Each `interview`, `doc` and `data` tag in the artifact has its file in `evidence/` per the schema, Evidence Files; each `code` tag names a file that exists |

## Who Checks

A gate checked by the model that wrote the artifact is a gate checked on trust, so `state.json` records who decided each condition in `gate.checked_by`.

- **Script-decided** conditions are structure and arithmetic: a word list, a tag count, an enum, a date comparison, a table with no empty cell. Where commands run, `node scripts/bos.mjs gate {N}` decides them and prints one line per condition. Relay that result; never re-judge a condition the script decided.
- **Model-judged** conditions need meaning: whether an assumption is falsifiable, whether two options are mechanically distinct. The script lists them as `judge`, with whatever structural precheck it could run, and the model decides them.

Where commands cannot run, the model checks every condition and records all of them under `model`: same conditions, weaker provenance, and the record says so. E.1 is script-decided; each conditions file states its own split, and the emitted `checked_by` split is authoritative.

**Recording the result.** Where commands run, the result reaches `state.json` only through `node scripts/bos.mjs record {N} --judged "{id}=pass|fail,..."`: the script re-runs its own conditions, takes the model's verdict on the `judge` ones, and writes the phase status, `checked_at`, `checked_by`, the failed conditions and the history event, then advances, closes or holds the phase and regenerates the roadmap. A gate result written into `state.json` by hand where the script can run is a claim, not a record, exactly like a completion marker. Phases 1, 6 and 7 take phase-specific flags (verdict, review date, re-entry), stated in their conditions files. Verdict/enum contradictions cannot be overridden.

## Acceptance

A gate says an artifact is complete, not that a person has read it and agrees. BuilderOS records both, separately.

Phases 0, 4 and 6 each need a person's acceptance, and the build plan inside phase 5 needs its owner's `**Accepted:**` line before any code. Who accepts and where it is recorded is in that gate's conditions file.

**Rules.** Acceptance comes from the person's own words in the conversation, never inferred and never written on their behalf; ask, then record. A standing instruction counts when it named the scope ("proceed through the build without stopping"): quote it with its date as the acceptance. A solo builder accepts their own artifacts; it costs a sentence and leaves a record of what was actually read. The script refuses to pass phases 0, 4 and 6 without `--accepted-by`; a failed gate records no acceptance. Acceptance never replaces a failed condition: an override still needs its reason.

## Refusal Protocol

When a condition fails, the agent produces exactly this, and does not advance:

```markdown
## GATE {N} FAILED

**Failed condition:** {the condition, verbatim}
**Found:** {what the artifact actually contains}
**Satisfied by:** {what would make it pass}
**Cheapest path:** {the least expensive way to get there, with a time estimate}

Remaining conditions: {passed}/{total}
```

Never advance "provisionally". Never pass a gate because the user is in a hurry — offer the override instead, which is honest, logged and visible.

## Override Protocol

Overrides exist; undocumented bypasses are worse than documented ones.

```
/bos-gate --override "reason"
```

Where commands run, `record {N} --judged ... --override "reason"`. Writes to `state.json`: `gate.overridden: true`, `gate.override_reason`, `gate.failed_conditions[]`, timestamp. Every subsequent `/bos-status` shows the phase as `PASSED (overridden)` with the reason. Phase 7 reads the override log when judging the outcome. An override never silently disappears: it is provenance, not shame. The coverage check cannot be overridden.

## Coverage Check (feature track)

Runs once, at initialization, when the work is classified as `feature`, standing in for gates 0 and 1 by reading `PRODUCT.md`. Conditions, the check-before-recording rule and both outcomes: [coverage-check.md](references/coverage-check.md).

## Spike Stop (spike track)

A `spike` ends at gate 1 with phase 1 `answered` and the initiative `closed`: [gate-1-discover.md](references/gate-1-discover.md), Spike Stop.

## Common Mistakes

| Mistake | Why it fails | Correct |
|---------|-------------|---------|
| Passing a gate because the artifact "feels complete" | Gates are mechanical by design | Check each condition against the text |
| Re-judging a condition the script decided | The script exists so the author does not grade its own work | Relay the script's verdict; judge only the `judge` lines |
| Writing `[interview:P3]` with no `evidence/P3.md` | E.1 fails; the claim has no source anyone can open | Write the notes file, or rewrite the claim as an assumption |
| Passing `--accepted-by` because the gate passed | The agent approved its own work under someone else's name | Ask, and record only what the person said |

## Capability Requirements

| Capability | Use | Floor |
|---|---|---|
| `files.read` | Inspect active state, artifacts and raw evidence | Ask for the missing artifact; no gate result without inspection |
| `files.write` | Record authorized lifecycle state | Return the gate result and concrete persistence gap |
| `shell.exec` | Run the bundled gate script and explicitly authorized checks | Model checks with all conditions marked model-judged; execution evidence remains unverified |

## Numbered Procedure and Output

1. Resolve the active initiative and phase; read its artifact, its gate's conditions file and relevant raw evidence. For a standalone review, return findings only.
2. Run read-only gate checks where command execution is available. Gate inspection and recording never execute project checks: run one only when the user has authorized that command (capturing a run: [gate 5](references/gate-5-build.md)), and preserve failures and raw logs rather than a successful summary.
3. Judge only emitted judge conditions against the evidence. Surface unavailable evidence, failed runs and incomplete observation windows.
4. Fix authorized local gaps and repeat affected checks. For a real failure, use the refusal protocol; for an explicit override, preserve failed conditions and reason.
5. Record through the script, using consistent phase-specific verdicts/dates and, at phases 0, 4 and 6, the person who accepted. Return `GATE {N} PASSED` only after recording succeeds, or `GATE {N} FAILED` with the failed conditions. A deferred review returns `REVIEW DEFERRED` and never advances.
