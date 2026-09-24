---
name: gate-checks
description: "Use when a BuilderOS phase is about to advance, when running /bos-gate, or when deciding whether a phase artifact is complete enough to hand to the next phase"
---

# Gate Checks

Every lifecycle phase ends at a gate. A gate is a list of conditions that can be decided by reading the artifact, not by judging it. Pass all conditions, advance. Fail one, stop and say which.

Borrowed from deterministic design linting: the value is in being boring and non-negotiable. A gate that can be argued with is not a gate.

**REQUIRED BACKGROUND:** Load `evidence-ledger` for tag counting rules. Load `pressure-testing` when a gate fails on an unresolved branch.

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

Overrides exist. Undocumented bypasses are worse than documented ones.

```
/bos-gate --override "reason"
```

Writes to `state.json`: `gate.overridden: true`, `gate.override_reason`, `gate.failed_conditions[]`, timestamp. Every subsequent `/bos-status` shows the phase as `PASSED (overridden)` with the reason. Phase 7 reads the override log when judging the outcome: a bet that failed after three overridden gates learned something different from one that failed clean.

An override never silently disappears. It is not shame, it is provenance.

## The Eight Gates

### Gate 0 — Frame

| # | Condition | Check |
|---|-----------|-------|
| 0.1 | Problem statement contains no solution language | No occurrence of: build, add, app, platform, dashboard, tool, feature, AI, automate, in the problem sentence |
| 0.2 | Exactly one primary ICP named | A single named segment with a size estimate carrying a source tag |
| 0.3 | Riskiest assumption is falsifiable | Stated as a sentence that could be shown false by an observation |
| 0.4 | "Why now" cites a change in the world | A dated external change, not a preference or an availability of technology in general |

### Gate 1 — Discover

| # | Condition | Check |
|---|-----------|-------|
| 1.1 | ≥5 evidence units from primary sources | `evidence-ledger` count of `mcp` + `interview` + `code` + primary `doc` units ≥ 5 |
| 1.2 | ≥5 distinct sources | Distinct identifiers across those units |
| 1.3 | Explicit verdict | One of `VALIDATED` / `KILLED` / `RESHAPED`, with reasoning that cites tags |
| 1.4 | JTBD statement present | Form: "When \_\_\_, I want to \_\_\_, so I can \_\_\_" |
| 1.5 | Disconfirming evidence sought | The artifact names what would have killed the problem and whether it was looked for |

`KILLED` is a successful gate pass. The pipeline stops and reports. Killing a problem in phase 1 is the cheapest outcome BuilderOS can produce.

### Gate 2 — Define

| # | Condition | Check |
|---|-----------|-------|
| 2.1 | ≥3 opportunities in the tree | Each traceable to a Phase 1 evidence tag |
| 2.2 | Exactly one selected | With a stated rejection reason for each of the others |
| 2.3 | Success metric named | With baseline and target, both source-tagged |
| 2.4 | Baseline is real | Baseline tag is `mcp`, `code`, or `doc` — not `estimate` or `assumption`. If no product exists yet, baseline is explicitly `0` with the first-measurement date named |
| 2.5 | Coherent with PMF stage | Pre-PMF (signal score ≤4 per `strategy-frameworks`) rejects scale-oriented opportunities |

### Gate 3 — Ideate

| # | Condition | Check |
|---|-----------|-------|
| 3.1 | ≥3 mechanically distinct options | Each has a different primary user action, stated explicitly. Same action with different UI is one option |
| 3.2 | Selected bet has kill criteria | A metric, a threshold, and a date. All three |
| 3.3 | Riskiest assumption has a designed test | With a cost estimate in days |
| 3.4 | Cheap-test-first rule honored | If test cost < 20% of build cost, the artifact shows the test running first or an override |

### Gate 4 — Shape

| # | Condition | Check |
|---|-----------|-------|
| 4.1 | Acceptance criteria are testable assertions | Each starts with a subject and a verifiable verb; no "should be intuitive" |
| 4.2 | Out-of-scope list is non-empty | An empty out-of-scope list means the scope was never bounded |
| 4.3 | Every flow has error and empty states | Per flow, both states enumerated |
| 4.4 | Tracking plan measures the Phase 2 metric | Named events map to the success metric |
| 4.5 | Accessibility floor stated | Keyboard path, contrast target, focus order |

### Gate 5 — Build

| # | Condition | Check |
|---|-----------|-------|
| 5.1 | Every acceptance criterion maps to ≥1 test | Explicit mapping table in the artifact |
| 5.2 | Those tests pass | Pasted runner output, not a claim that they pass |
| 5.3 | Instrumentation verified firing | Evidence from a real environment, `mcp` or `code` tagged |
| 5.4 | No scope creep | Nothing from the Gate 4 out-of-scope list was built |

### Gate 6 — Ship

| # | Condition | Check |
|---|-----------|-------|
| 6.1 | Rollback path documented | Named mechanism, named owner, tested once |
| 6.2 | Baseline captured before exposure | Timestamped, before the rollout timestamp |
| 6.3 | Measurement exists | Dashboard or saved query for the success metric |
| 6.4 | Release notes written for the audience | Addressed to users or buyers, not a commit list |
| 6.5 | Outcome review scheduled | Owner and date |

### Gate 7 — Learn

| # | Condition | Check |
|---|-----------|-------|
| 7.1 | Actual vs. target stated | Both source-tagged, compared explicitly |
| 7.2 | Kill criteria evaluated | The Phase 3 threshold checked against the actual, verdict stated |
| 7.3 | Decision recorded | `KEEP` / `ITERATE` / `KILL`, with the re-entry phase |
| 7.4 | Generalized learning | One sentence that outlives the feature, written into `decisions/` |

## Coverage Check (feature track)

Runs once, at initialization, when the work is classified as `feature`. It stands in for gates 0 and 1 by reading `PRODUCT.md` instead of a phase artifact. The conditions are the load-bearing ones from those gates, applied to evidence that already exists.

| # | Condition | Check |
|---|-----------|-------|
| C.1 | Problem stated without solution language | The same word list as 0.1, applied to `PRODUCT.md` → The Problem |
| C.2 | Exactly one primary ICP | `PRODUCT.md` → ICP names one primary segment, its size carrying a source tag |
| C.3 | The problem is evidenced, not assumed | The Problem, Who has it, and What that costs them each carry a primary-source tag. `[assumption:unvalidated]` on any of the three fails |
| C.4 | The change serves that ICP | The request names which part of the evidenced problem it addresses. A change aimed at a different segment is a new problem |

Pass: phases 0 and 1 are written `covered`, one `phase_covered` event each with the tags that satisfied C.1 to C.3, and the pipeline starts at phase 2. For gate 2.1 on this track, `PRODUCT.md` tags count as phase 1 evidence tags.

Fail: the work is a `product`. Use the refusal protocol with the failed C condition, then start at phase 0. Not a penalty: phase 0 and 1 are exactly what produces the evidence C.3 was looking for. The coverage check cannot be overridden, because an override would record phases as covered by evidence nobody has.

## Spike Stop (spike track)

A `spike` ends at gate 1. Gate 1 runs unchanged; on pass, phase 1 is written `answered` instead of `passed` and `current_phase` does not advance. The verdict (`VALIDATED`, `KILLED` or `RESHAPED`) is the answer, reported as a recommendation. Continuing means reclassifying to `feature` or `product`, stated to the user and logged as `track_upgraded`.

## Lite Mode

`state.json` may set `mode: "lite"` for small features. Lite mode keeps every hard condition (evidence thresholds, kill criteria, test mapping, rollback, baseline) and drops the elaboration conditions: 2.1 relaxes to ≥2 opportunities, 3.1 to ≥2 options, 4.5 and 6.4 become warnings rather than failures.

Lite mode never relaxes: 1.1, 1.3, 2.3, 2.4, 3.2, 5.1, 5.2, 5.3, 6.1, 6.2, 7.3. Those are the conditions that prevent building on fiction.

## Common Mistakes

| Mistake | Why it fails | Correct |
|---------|-------------|---------|
| Passing a gate because the artifact "feels complete" | Gates are mechanical by design | Check each condition against the text |
| Failing a gate without naming the condition | The user cannot act on it | Use the refusal format |
| Treating `KILLED` as a failure | Killing early is the cheapest win available | Report it as a successful pass and stop |
| Accepting an `[estimate:*]` baseline | Targets measured against estimates are unfalsifiable | Require a real baseline or an explicit zero |
| Overriding the coverage check | Phases recorded as covered by evidence that does not exist | Classify as `product` and start at phase 0 |
| Silently proceeding after a failure | Destroys the value of the whole model | Refuse, or override and log |
| Running gate 4 conditions on a phase 2 artifact | Wrong gate, wasted cycle | Read `current_phase` from `state.json` first |
