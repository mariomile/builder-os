---
name: experiment-methodology
description: "Use when designing experiments, calculating sample sizes, formulating hypotheses, or interpreting A/B test results"
---

# Experiment Methodology

Follow `../../references/operating-modes.md` for standalone versus lifecycle work. Design and analysis below are analytical modes, separate from that choice. Use only the steps the question needs: a sample-size request does not require a full preregistration.

Load `evidence-ledger` when recording claims, the relevant shapes in `references/analytics-contract.md` when querying, and `references/capability-map.md` before a new data source. Skill-local resources resolve relative to this `SKILL.md`:

- [Calculations and readout](references/proportions.md) for sample size and significance.
- [Design reference](references/design.md) for the hypothesis template, metric and randomization specification, runtime rule, worked examples, experiment types and the full common-mistakes list.
- [Output contracts](references/output-contracts.md) when writing the design or the readout.

## Capabilities

| Capability | Used for | Floor when absent |
|-----------|----------|-------------------|
| `analytics.query` | Baseline and results readout | Ask the user for the baseline, tag it, and state that the power calculation inherits its uncertainty |
| `analytics.events` | Whether output and guardrail metrics are emitted | Search the repository for the call sites |
| `db.query` | Outcomes in the application database | Same floor: ask |
| `repo.read` | Flag and assignment code, to verify randomization | Ask how assignment works |
| `files.read` / `files.write` | The pre-registration and the readout | Always present |

Design mode needs nothing connected. Analysis mode needs numbers, and a user pasting two conversion counts is a legitimate source.

## Procedure

A change not yet shipped is **design**; results in hand are **analysis**.

### Design mode

1. **Resolve capabilities and establish the baseline:** the current output-metric rate, tagged. A guessed baseline gives a confidently wrong sample size.
2. **Write the hypothesis** from the template: the change, the metric, the direction, the effect size worth detecting, and the mechanism.
3. **Define the metrics triad:** one preregistered primary (output) outcome, an input indicator when useful, and the applicable guardrails. Without a guardrail the experiment cannot catch a win that breaks something else.
4. **Verify the metrics are instrumented.** An unemitted output metric makes the experiment unreadable: that is the finding, handed to `tracking-standards` before anything ships.
5. **Calculate sample size and runtime** from the baseline, the minimum detectable effect and the traffic, then state the calendar date of the first read.
6. **Pre-register before the experiment starts:** what ships it, what kills it, whether a preregistered sequential or blinded extension is permitted, its maximum sample/duration, and who decides.

### Analysis mode

1. **Collect the results** for every metric, per variant, each tagged.
2. **Check validity before significance:** full planned duration covering whole weeks, the intended split, no mid-flight instrumentation change.
3. **Compute significance** with the preselected method in `references/proportions.md`, on the one pre-registered primary metric.
4. **Read the guardrails.** A guardrail breach overrides an output win.
5. **Apply the pre-registered decision rule**, and say plainly when the result is inconclusive. Nonsignificance does not establish zero or a small effect: inspect the interval for both meaningful benefit and harm. Never extend a fixed-horizon test merely because its p-value is close to a threshold.
6. **Report**, including what the experiment cannot conclude.

End with `## EXPERIMENT DESIGN COMPLETE` or `## EXPERIMENT ANALYSIS COMPLETE` in its output contract.

## Common Mistakes

| Mistake | Correction |
|---------|------------|
| Mixing pp and relative percent | Convert both to the alternative probability before powering |
| Lookup table disagrees with formula | Generate it from `scripts/proportions.mjs`; regression tests check equality |
| Treating users in one account as independent | Randomize/analyze at the account level or use a clustered method |
| Applying normal tests to zero conversions | Use a suitable exact/rare-event method and state approximation limits |
