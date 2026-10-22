---
name: outcome-review
description: "Judges a shipped change against its target and kill criteria, has the person decide keep, iterate or kill, and writes the decision and cleanup. Use when an outcome review is due, someone asks whether a release worked, or a feature's future is open."
---

# Outcome Review

Phase 7 judges whether the shipped change did what it was supposed to, against what earlier phases committed: the phase 2 target, the phase 3 kill criteria, the phase 6 baseline. KILL is a successful outcome for the pipeline; a forced verdict on thin data is the failure.

**Mode.** Standalone compares the supplied baseline, target, actual and decision criteria, states missing windows or sources, and returns the review; a recommendation leaves rollbacks and flags to the person. The lifecycle runs every step and gate 7. Both per [operating modes](../../references/operating-modes.md). Load the analysis skill the outcome metric needs, `pressure-testing` for a material unsupported explanation, and the [analytics shapes](../../references/analytics-contract.md) when rerunning a query. Read [judging the outcome](references/judgment.md) for ambiguous results, re-entry choices, override patterns, learning examples, the watch, and the full list of traps.

## Procedure

1. **Read `06-release.md`, `03-solution-bet.md` and `02-definition.md`**: the baseline with its capture method and timestamp, the kill criteria, the success metric with its target; then the override log in `state.json`. Done when the baseline, the target and the kill criteria are in front of you, each tagged.
2. **Check the date** the kill criteria set. Before it the number has not stabilized, so the review defers with the reason and date (step 7). Done when the date has passed, or the deferral is the next step.
3. **Rerun the measurement** with the same definition, shape, parameters and window length as phase 6; where that method cannot be rerun, say so and state what changed. Then rerun the guardrails. Specialist analysis (health, growth, cohorts, revenue) goes to its own skill; phase 7 orchestrates. Done when the actual and every guardrail have a tagged value.
3b. **Feed the eval set.** Where the spec declared model output, add each production output that failed the rubric in the window, and each model-caused incident, to the eval dataset: real input, what a correct output must contain, `must_pass` for safety or compliance. Done when every failure in the window is in the dataset, or the spec declared no model output.
4. **Compare against the target** (gate 7.1): baseline, actual, target, delta, all tagged. Done when the four numbers sit in one table.
5. **Apply the kill criteria as written** (gate 7.2): metric, threshold, date, and the action they specified. State that verdict plainly before interpreting it; it often disagrees with step 4, and both stand. A reinterpretation after the fact is recorded as one. Done when the literal verdict is written above any interpretation.
6. **Read the overrides and the pace** against the outcome: time per phase, gates failed before passing, who accepted what, spec changes after the build plan (`scripts/bos.mjs pace` where commands run, the history events otherwise). Repeated spec rework after the plan means phase 4 was too thin, a process learning recorded next to the product one. Done when each override is weighed against the result.
6b. **Retro on the agent's environment.** Run [retro](../retro/SKILL.md) on this cycle: the build's retro list from `05-build-plan.md`, then what the release and the review added. Done when the changes made are listed under `**Environment:**`.
7. **Decide or defer.** With an insufficient window or data, write `## REVIEW DEFERRED` with the reason and new date, run `scripts/bos.mjs defer-review --review-due YYYY-MM-DD --reason "..."`, and stop with phase 7 open. Otherwise recommend KEEP, ITERATE or KILL (gate 7.3) with the re-entry phase and why, as one `pressure-testing` round with the comparison from steps 4 and 5 above it; the person decides, recorded as `**Chosen by:**` under the decision (gate 7.7). KEEP normally re-enters nowhere, ITERATE at phase 3 for a different mechanism or phase 4 for a different execution, KILL closes the bet. An ambiguous result defers, names the confounder, or states that the baseline was wrong; "we will keep an eye on it" is a deferral without a date. A closing KEEP writes the watch (gate 7.5): metric, bands, owner, recheck date. Every decision writes its **Cleanup** (gate 7.6): after KEEP the flag and the old path the rollout left behind, after KILL the code that shipped, with an owner, a date and a line in `ROADMAP.md` → Next; removing shipped code is a `change` initiative with `removal` as its mandate. Done when the person's decision, its re-entry, the watch where due, and the cleanup are written.
8. **Generalize the learning** (gate 7.4): a reusable, evidence-bounded hypothesis or decision that stays true when the feature is gone, with population, observation, confidence, causal limitations and reopening condition. One before/after result is one observation. Done when the learning could change an unrelated decision.
9. **Persist it.** A reversible learning goes to `.builderos/decisions/learning-{initiative}-cycle-{N}.md` with source, population, confidence, limitations and `Revisit when`. A decision that is hard to reverse, surprising without context and a real trade-off (all three) also becomes an ADR per `references/builderos-state-schema.md`. Done when the learning file and any ADR exist.
10. **Write and gate.** Write `.builderos/initiatives/{initiative}/07-outcome.md` per [the outcome template](references/outcome-template.md), run gate 7 and record it with the decision (`scripts/bos.mjs record 7 --verdict keep|iterate|kill [--reenter N]` where commands run), which clears `review_due`. KEEP with `Re-enters at: none` closes the cycle; ITERATE increments `cycle` and moves to the matching phase; KILL closes with `Re-enters at: none`, and another direction is a separately authorized initiative. In `ROADMAP.md` a closed initiative moves to Done and dropped with the decision and the one-sentence learning; on ITERATE it stays under Now at the phase from step 7. Done when gate 7 is recorded and the roadmap matches state.

A later watch breach becomes a new initiative inside the lifecycle; recheck recording is in [judging the outcome](references/judgment.md).

## Watch for

| Do | Instead of |
|---|---|
| Rerun the recorded method, or state what changed | A different window or definition than phase 6 |
| Apply the kill criteria as written, then interpret | Reinterpreting them after seeing the result |
| REVIEW DEFERRED with a date and reason | Forcing thin data into KEEP |
| A learning that could change an unrelated decision | A summary of what happened |

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `analytics.query` | Rerunning the phase 6 measurement and guardrails | Ask the person for the number, tagged; gate 7.1 needs a tagged actual, live or supplied |
| `db.query` | Outcomes that live in the application database | Same floor |
| `docs.search` | What else changed in the window (confounders) | Ask what else shipped or ran |
| `files.read` / `files.write` | Previous artifacts, this artifact, the ADR, state | Required |

An actual the person provides, tagged and compared against a tagged baseline, satisfies gate 7.1; the gate takes a source on both sides.

## Output Contract

`## OUTCOME RECORDED` with the comparison, the kill-criteria verdict, the decision and who chose it, its re-entry point, the watch for a closing KEEP, the cleanup and the generalized learning; or `## REVIEW DEFERRED` with the reason and the new date. Lifecycle output is `07-outcome.md` per [the outcome template](references/outcome-template.md).
