---
name: outcome-review
description: "Use when a shipped change needs judging against the target and the kill criteria it was committed to, when deciding keep, iterate or kill, or when writing the decision record that outlives the feature"
---

# Outcome Review

Phase 7 judges whether the shipped change did what it was supposed to do against what earlier phases committed: the phase 2 target, the phase 3 kill criteria, the phase 6 baseline.

Read [operating modes](../../references/operating-modes.md) first. For a standalone request, use supplied requirements and sources; keep the requested format and destination. Lifecycle artifact paths, gates and state writes below apply only to an explicitly selected initiative.

Load only the analysis skill needed for the outcome metric, `pressure-testing` for a material unsupported explanation, and `evidence-ledger` for lifecycle claims. Use [analytics shapes](../../references/analytics-contract.md) when rerunning a query and [capabilities](../../references/capability-map.md) when resolving sources. Read [judging the outcome](references/judgment.md) for ambiguous results, re-entry choices, override patterns, learning examples, the watch, and the full common-mistakes list.

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `analytics.query` | Rerunning the phase 6 measurement and guardrails | Ask the user for the number, tagged. Gate 7.1 needs a tagged actual, not a live one |
| `db.query` | Outcomes that live in the application database | Same floor |
| `docs.search` | What else changed in the window (confounders) | Ask what else shipped or ran |
| `files.read` / `files.write` | Previous artifacts, this artifact, the ADR, state | Required |

A user-provided actual, tagged and compared against a tagged baseline, satisfies gate 7.1. The gate refuses a comparison with no source on either side.

## Standalone Procedure

Compare the supplied baseline, target, actual and decision criteria. State missing windows or sources. Deliver the requested review without requiring phase files or writing lifecycle state. A recommendation does not authorize a rollback or flag change.

## Lifecycle Procedure

Run in order. Delegate where the host allows it, run inline where it does not.

1. **Read `06-release.md`, `03-solution-bet.md` and `02-definition.md`** for the baseline with its capture method and timestamp, the kill criteria, and the success metric with its target; then the override log in `state.json`.

2. **Check the date** set by the kill criteria. Before it the number has not stabilized: defer with the reason and date rather than invent a final outcome.

3. **Rerun the measurement.** Same definition, same shape, same parameters, same window length as phase 6; where that method genuinely cannot be rerun, say so and state what changed. Then rerun the guardrails. Hand specialist analysis (health, growth, cohorts, revenue) to its own skill; phase 7 orchestrates rather than reimplements.

3b. **Feed the eval set.** Where the spec declared model output, add each production output that failed the rubric in the window, and each model-caused incident, to the eval dataset: real input, what a correct output must contain, `must_pass` for safety or compliance. It reruns on the next prompt or model change.

4. **Compare against the target (gate 7.1).** Baseline, actual, target, delta, all tagged.

5. **Evaluate the kill criteria literally (gate 7.2).** As written: metric, threshold, date, and the action it specified. State the verdict plainly before interpreting it. Both comparisons are required; they often disagree. Record any reinterpretation after the fact.

6. **Read the overrides and the pace** against the outcome. Pace (`scripts/bos.mjs pace` where commands run, the history events otherwise): time per phase, gates failed before passing, who accepted what, spec changes after the build plan. Repeated spec rework after the plan means phase 4 was too thin: record that process learning next to the product one.

7. **Decide or defer.** If the window or data is insufficient, write `## REVIEW DEFERRED`, the reason and new date, invoke `scripts/bos.mjs defer-review --review-due YYYY-MM-DD --reason "..."` and stop with phase 7 open. Otherwise decide KEEP, ITERATE or KILL (gate 7.3) with the re-entry phase and why: KEEP normally re-enters nowhere, ITERATE at phase 3 for a different mechanism or phase 4 for a different execution, KILL closes the bet with no re-entry. For an ambiguous result, defer, name the confounder, or state that the baseline was wrong, rather than forcing a decision. "We will keep an eye on it" does not satisfy gate 7.3. KILL is a successful outcome for the pipeline. A closing KEEP writes the watch (gate 7.5): metric, bands, owner, recheck date.

8. **Generalize the learning (gate 7.4).** A reusable, evidence-bounded hypothesis or decision, true when the feature is gone, stating population, observation, confidence, causal limitations and reopening condition; one before/after result is not a universal law. Test: could it change an unrelated decision? A sentence that only describes what happened is a summary.

9. **Persist the scoped learning.** Use `.builderos/decisions/learning-{initiative}-cycle-{N}.md` for a reversible learning, with source, population, confidence, limitations and `Revisit when`. **Write the ADR** where the decision passes the ADR test (hard to reverse, surprising without context, a real trade-off: all three), per the format and test in `references/builderos-state-schema.md`.

10. **Write and gate.** Write `.builderos/initiatives/{initiative}/07-outcome.md`, run gate 7 and record it with the decision (`scripts/bos.mjs record 7 --verdict keep|iterate|kill [--reenter N]` where commands run), which clears `review_due`. KEEP with `Re-enters at: none` closes the cycle; an explicitly selected KEEP with a matching phase re-enters. ITERATE increments `cycle` and moves to the matching phase. KILL closes with `Re-enters at: none` and prohibits `--reenter`; another direction requires a separately authorized initiative. In `ROADMAP.md`, move a closed initiative to Done and dropped with the decision and the one-sentence learning; on ITERATE it stays under Now at the phase named in step 7.

Completion marker: `## OUTCOME RECORDED` with the comparison, the kill-criteria verdict, the decision with its re-entry point, the watch for a closing KEEP, and the generalized learning.

A later watch breach becomes a new initiative, never a fix pushed outside the lifecycle; recheck recording is in [judging the outcome](references/judgment.md).

## Output Contract

`.builderos/initiatives/{initiative}/07-outcome.md`, following [the outcome template](references/outcome-template.md).

## Common Mistakes

| Mistake | Correct |
|---------|---------|
| A different window or definition than phase 6 | Rerun the recorded method, or state what changed |
| Reinterpreting the kill criteria after seeing the result | Apply as written, then interpret separately |
| Insufficient data forced into KEEP | REVIEW DEFERRED, date and reason; phase 7 remains open |
| A learning that only describes what happened | Could it change an unrelated decision? |
