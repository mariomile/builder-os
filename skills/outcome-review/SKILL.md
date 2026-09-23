---
name: outcome-review
description: "Use when a shipped change needs judging against the target and the kill criteria it was committed to, when deciding keep, iterate or kill, or when writing the decision record that outlives the feature"
---

# Outcome Review

Phase 7 asks the only question the previous seven phases were built to make answerable: did it do what it was supposed to do?

The phase exists because the honest answer is usually uncomfortable, and every structural incentive pushes toward declaring victory. Gate 7 removes the room to do that: the target was written in phase 2, the kill criteria in phase 3, the baseline captured in phase 6. Phase 7 reads them back.

**REQUIRED BACKGROUND:** `evidence-ledger` for tagging. `saas-metrics-reference` and `growth-frameworks` for the measurement itself. `pressure-testing` when a result is being explained rather than read. `references/analytics-contract.md` for the query shapes. `references/capability-map.md` before touching any data source.

## Read the Same Number

The measurement rerun in phase 7 is the one specified in phase 6: same metric definition, same query shape, same parameters, same window length. Written down at capture time precisely so this comparison is honest.

A different window, a different segment or a slightly different definition turns the comparison into an argument. Where the phase 6 method genuinely cannot be rerun, say so and state what changed, rather than substituting a similar number silently.

Rerun the guardrails too. A release that moved the target and broke something adjacent is a result that only shows up when someone looks for it.

## Judge Against What Was Committed

Two separate comparisons, both required:

| Comparison | Source | Gate |
|-----------|--------|------|
| **Actual against target** | The phase 2 success metric, its baseline and its target | 7.1 |
| **Actual against kill criteria** | The phase 3 threshold and date | 7.2 |

They are not the same test and they frequently disagree. A change can miss its target and still clear its kill threshold, which means keep going. A change can beat a soft target and still fail the criterion that mattered.

Evaluate the kill criteria literally. It said: on this date, if this metric is below this threshold, we do this thing. Apply it as written. A criterion being reinterpreted after the fact is the failure that phase 3 wrote it down to prevent, and the reinterpretation is itself worth recording.

### When the result is ambiguous

Three ambiguities are common and each has an honest handling:

- **Not enough data yet.** The window was too short or the volume too low for the number to mean anything. Say so, name the date when it will mean something, and extend rather than deciding. Extending is a decision and it gets recorded.
- **The metric moved, the mechanism is unclear.** Something else changed at the same time: a campaign, a seasonal effect, another release. Name the confounder rather than claiming or denying credit.
- **The baseline turned out to be wrong.** It happens. Say it explicitly; a comparison against a baseline you no longer believe is worse than no comparison, and the correction is a finding for the next cycle.

## The Decision

Gate 7.3: one of three, with the re-entry point.

| Decision | Means | Re-enters at |
|----------|-------|-------------|
| **KEEP** | It worked. Remove the flag, clean up, move on | No re-entry; the cycle closes |
| **ITERATE** | The direction holds, the execution or the scope was wrong | Phase 3 for a different mechanism, or phase 4 for a different execution |
| **KILL** | The bet was wrong. Revert or leave it and stop investing | Phase 2 for a different opportunity, or phase 1 if the evidence itself is now in doubt |

`KILL` is a successful outcome for the pipeline, exactly as it is at gate 1. The system's purpose is to make being wrong cheap and fast, and a kill at phase 7 with a tested rollback costs a release. The same wrong belief carried for four quarters costs a roadmap.

State which phase the next cycle re-enters at, and why. "We will keep an eye on it" is not a decision and does not satisfy gate 7.3.

## Read the Overrides

Before judging, read the override log from `state.json`. A bet that failed after three overridden gates learned something different from one that failed clean.

| Pattern | What it suggests |
|---------|-----------------|
| Failed, gate 1 overridden | The problem may never have been validated. The bet was not the failure; the evidence was |
| Failed, gate 3.4 overridden (test skipped) | The cheap test would probably have caught it. That is the learning, and it is about process |
| Failed, no overrides | An honest miss. The most valuable kind, and the one worth generalizing |
| Succeeded, several overrides | Got away with it. Worth naming, because the next one may not |

This is why overrides stay visible rather than disappearing once a phase passes.

## The Generalized Learning

Gate 7.4: one sentence that is still true when the feature is gone, written into `.builderos/decisions/`.

The test: could this sentence change a decision about something unrelated? If it only describes what happened, it is a summary, not a learning.

| Summary | Learning |
|---------|----------|
| "The import feature had 12% adoption" | "Users will not move existing data by hand, whatever the import tool looks like; the migration has to happen without them" |
| "The onboarding change did not help retention" | "Retention in this product is decided before signup, by who arrives, not after it by what they see" |
| "We shipped it late" | "Any slice that touches billing needs the finance review scheduled at spec time, not at release" |

The generalized learning goes in an ADR when the decision is irreversible or expensive to unwind, and in the outcome artifact always. Format in `references/builderos-state-schema.md`; "Revisit when" is mandatory, because a decision with no reopening condition becomes dogma.

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `analytics.query` | Rerunning the phase 6 measurement and the guardrails | Ask the user for the number, tagged. Gate 7.1 needs a tagged actual, not a live one |
| `db.query` | Outcomes that live in the application database | Same floor |
| `docs.search` | Anything else that changed in the window, which is how confounders are found | Ask what else shipped or ran |
| `files.read` / `files.write` | Previous artifacts, this artifact, the ADR, state | Required |

Phase 7 is the phase most helped by a data capability and it is still not blocked without one: a user-provided actual, tagged and compared against a tagged baseline, satisfies gate 7.1. What the gate refuses is a comparison with no source on either side.

## Procedure

Run in order. Delegate where the host allows it, run inline where it does not.

1. **Read `06-release.md`, `03-solution-bet.md` and `02-definition.md`.** The baseline with its capture method and timestamp, the kill criteria, and the success metric with its target. Then read the override log from `state.json`.

2. **Check the date.** The review date came from the kill criteria. Running early produces a number that has not stabilized; where the date has not arrived, say so and schedule rather than measuring.

3. **Rerun the measurement.** Same definition, same shape, same parameters, same window length as phase 6. Then the guardrails. Where a delivery of this depends on specialist analysis, hand the numbers to the analysis surface: health, growth, cohorts and revenue each have their own skill, and phase 7 orchestrates rather than reimplements.

4. **Compare against the target.** Baseline, actual, target, delta, all tagged.

5. **Evaluate the kill criteria literally.** As written: metric, threshold, date, and the action it specified. State the verdict plainly before interpreting it.

6. **Read the overrides** against the outcome, per the table above. What the pipeline did differently is part of what happened.

7. **Decide.** KEEP, ITERATE or KILL, with the re-entry phase and the reason. Where the result is ambiguous, use one of the three honest handlings rather than forcing a decision the data cannot support.

8. **Generalize the learning.** One sentence that outlives the feature. Apply the test: could it change an unrelated decision?

9. **Write the ADR** where the decision is irreversible or expensive to unwind, per the format in `references/builderos-state-schema.md`.

10. **Write and gate.** Write `.builderos/07-outcome.md`, run gate 7, update `state.json`. On KEEP the cycle closes; on ITERATE or KILL, increment `cycle` and set `current_phase` to the re-entry phase.

Completion marker: `## OUTCOME RECORDED` with the comparison, the kill-criteria verdict, the decision with its re-entry point, and the generalized learning.

## Output Contract

`.builderos/07-outcome.md`:

```markdown
# Outcome — {feature}

## Measured {date}, {n} days after rollout

**Method:** {the phase 6 query shape and parameters, rerun identically — or what changed and why}

| Metric | Baseline | Actual | Target | Delta | Tag |
| {success metric} | | | | | |
| {guardrail} | | | — | | |

## Against target
{met / missed / ambiguous, with the number}

## Against kill criteria
**Criterion:** {restated verbatim from 03-solution-bet.md}
**Verdict:** {cleared / triggered}, {the arithmetic}

## Pipeline notes
**Overrides:** {which gates, and what that means for how to read this result}
**Confounders:** {anything else that changed in the window}

## Decision: {KEEP | ITERATE | KILL}
**Why:** {reasoning against both comparisons}
**Re-enters at:** {phase, or "cycle closed"}
**Next:** {the specific thing that happens now}

## Learning
{one sentence that is true when the feature is gone}

**ADR:** {decisions/ADR-NNN-slug.md, or "not required: the decision is reversible"}
```

## Common Mistakes

| Mistake | Why it fails | Correct |
|---------|-------------|---------|
| A different window or definition than phase 6 | The comparison becomes an argument | Rerun the recorded method, or state what changed |
| Reinterpreting the kill criteria after seeing the result | Exactly what phase 3 wrote them down to prevent | Apply as written, then interpret separately |
| Only comparing against the target | The kill criteria are a different test and often disagree | Both comparisons, always |
| "We will keep an eye on it" | Not a decision; gate 7.3 fails | KEEP, ITERATE or KILL, with the re-entry phase |
| Measuring before the review date | The number has not stabilized | Schedule, do not measure early |
| Skipping the guardrails | Misses the release that won and broke something else | Rerun them too |
| Ignoring the override log | A failure after three overrides has a different lesson | Read the overrides against the outcome |
| A learning that only describes what happened | It is a summary; it changes nothing later | Could it change an unrelated decision? |
| Treating KILL as a failure | It is the cheapest good outcome in the system | Record it as a successful pass and close the cycle |
| Claiming credit without checking confounders | The campaign that ran the same week moved it | Name what else changed |
