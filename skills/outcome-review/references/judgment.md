# Judging the Outcome

Read when the result is ambiguous, when choosing the re-entry point, when reading overrides against the outcome, when writing the generalized learning, when setting or rechecking a watch, or for the full list of common mistakes. The procedure is in [the skill](../SKILL.md).

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

- **Not enough data yet.** The window was too short or the volume too low for the number to mean anything. Say so, name the date when it will mean something, and defer rather than force KEEP/ITERATE/KILL. Record the reason and a new review date; phase 7 stays open and the cycle remains unchanged.
- **The metric moved, the mechanism is unclear.** Something else changed at the same time: a campaign, a seasonal effect, another release. Name the confounder rather than claiming or denying credit.
- **The baseline turned out to be wrong.** It happens. Say it explicitly; a comparison against a baseline you no longer believe is worse than no comparison, and the correction is a finding for the next cycle.

## The Decision

Gate 7.3: one of three, with the re-entry point.

| Decision | Means | Re-enters at |
|----------|-------|-------------|
| **KEEP** | Retain the change; identify any authorized cleanup separately | Normally none; explicit continued cycle may name phase N |
| **ITERATE** | The direction holds, the execution or the scope was wrong | Phase 3 for a different mechanism, or phase 4 for a different execution |
| **KILL** | The bet was wrong. Revert or leave it and stop investing | No re-entry; this bet closes. A different direction needs a separately authorized initiative |

State which phase the next cycle re-enters at, and why. "We will keep an eye on it" is not a decision and does not satisfy gate 7.3.

### Why KILL counts as success

`KILL` is a successful outcome for the pipeline, exactly as it is at gate 1. The system's purpose is to make being wrong cheap and fast, and a kill at phase 7 with a tested rollback costs a release. The same wrong belief carried for four quarters costs a roadmap.

## Keep Watching After KEEP

KEEP closes the cycle; it does not close the question. A metric that held for 28 days can drift for three months before anyone opens the dashboard again. A closing KEEP therefore sets a watch, which gate 7.5 checks:

| Field | Rule |
|-------|------|
| **Metric** | The phase 2 success metric by its phase 2 definition, the one just measured |
| **Bands** | Thresholds against its baseline. Default: 1σ note it, 2σ diagnose read-only, 3σ start a new initiative. Rolling mean and deviation over the product's natural rhythm; slow drift counts as well as spikes |
| **Owner** | The person who triages a breach |
| **Recheck** | The next date someone compares the metric with its bands |

Where a scheduler or monitoring capability resolves, the watch can run on it. Where none does, the recheck date is the mechanism: the session briefing raises it once it has passed. Measuring a watch reuses the detection method in `saas-metrics-reference` instead of inventing one.

**A breach becomes a new initiative.** The anomaly is the input, framed per `problem-framing` (Three Ways In) with the metric, baseline, breach and window as tagged evidence; it starts at phase 0, or on the feature track when `PRODUCT.md` already evidences the problem. A breach never becomes a fix pushed outside the lifecycle. Breaches that turned out to be noise are recorded too: they are how the bands get tuned.

**After each recheck**, record what it found: no breach rolls the date forward (`scripts/bos.mjs watch --initiative {slug} --recheck YYYY-MM-DD --note "..."`, appending `watch_checked`); a breach clears the watch once the new initiative exists (`watch --initiative {slug} --clear --breach {new-slug} --note "..."`, appending `watch_breached`). Without commands, write the same events by hand. Until one of the two happens, the briefing keeps raising the watch.

## Eval Set

The eval dataset reruns on the next prompt or model change; an incident that never became a case can come back unseen.

## Read the Overrides

A bet that failed after three overridden gates learned something different from one that failed clean.

| Pattern | What it suggests |
|---------|-----------------|
| Failed, gate 1 overridden | The problem may never have been validated. The bet was not the failure; the evidence was |
| Failed, gate 3.4 overridden (test skipped) | The cheap test would probably have caught it. That is the learning, and it is about process |
| Failed, no overrides | An honest miss. The most valuable kind, and the one worth generalizing |
| Succeeded, several overrides | Got away with it. Worth naming, because the next one may not |

This is why overrides stay visible rather than disappearing once a phase passes.

## The Generalized Learning

| Summary | Learning |
|---------|----------|
| "The import feature had 12% adoption" | "In the observed segment, manual migration may limit adoption; test an assisted migration before generalizing" |
| "The onboarding change did not help retention" | "This onboarding change did not shift retention in the measured window; acquisition mix is a confounder to test" |
| "We shipped it late" | "Any slice that touches billing needs the finance review scheduled at spec time, not at release" |

The generalized learning goes in an ADR when the decision is irreversible or expensive to unwind, and in the outcome artifact always. Format in `references/builderos-state-schema.md`; "Revisit when" is mandatory, because a decision with no reopening condition becomes dogma.

## Common Mistakes

| Mistake | Why it fails | Correct |
|---------|-------------|---------|
| A different window or definition than phase 6 | The comparison becomes an argument | Rerun the recorded method, or state what changed |
| Reinterpreting the kill criteria after seeing the result | Exactly what phase 3 wrote them down to prevent | Apply as written, then interpret separately |
| Only comparing against the target | The kill criteria are a different test and often disagree | Both comparisons, always |
| Insufficient data forced into KEEP | Fabricates a final verdict | REVIEW DEFERRED, date and reason; phase 7 remains open |
| Measuring before the review date | The number has not stabilized | Schedule, do not measure early |
| Skipping the guardrails | Misses the release that won and broke something else | Rerun them too |
| Ignoring the override log | A failure after three overrides has a different lesson | Read the overrides against the outcome |
| A learning that only describes what happened | It is a summary; it changes nothing later | Could it change an unrelated decision? |
| Treating KILL as a failure | It is the cheapest good outcome in the system | Record it as a successful pass and close the cycle |
| Claiming credit without checking confounders | The campaign that ran the same week moved it | Name what else changed |
| KEEP with nobody watching | The metric drifts for months before anyone looks | Set the watch: metric, bands, owner, recheck date |
| Answering a breach with a quick fix | It skips the evidence and the gates that make a fix trustworthy | Frame it as a new initiative from the anomaly |
| An incident that never became an eval case | The next prompt change brings it back | Add it to the dataset before closing the review |
