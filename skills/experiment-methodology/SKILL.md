---
name: experiment-methodology
description: "Designs and reads experiments: hypotheses, sample sizes and duration, guardrails, and an honest reading of the result. Use when planning an A/B test or a fake door, calculating how many users a test needs, or interpreting a test result."
---

# Experiment Methodology

An experiment is a decision written down before the data arrives: the baseline, the effect worth detecting, the guardrails, and what ships or kills it. A change not yet shipped is **design**; results in hand are **analysis**. Run the steps the question needs: a sample-size request is answered by design steps 1 and 5.

**Mode.** Standalone or as part of phases 3, 6 and 7, per [operating modes](../../references/operating-modes.md); design and analysis apply in both. Load `evidence-ledger` when recording claims and the shapes in `references/analytics-contract.md` when querying. Skill-local resources:

- [Calculations and readout](references/proportions.md) for sample size and significance.
- [Design reference](references/design.md) for the hypothesis template, metric and randomization specification, runtime rule, worked examples, experiment types and the full list of traps.
- [Output contracts](references/output-contracts.md) when writing the design or the readout.

**Stage.** Read `PRODUCT.md` → Stage. Before PMF (`idea`, `pre-PMF`) traffic is too small for significance to mean anything: write the thresholds before the test, accept a small sample and declare its size, and judge the result qualitatively against those thresholds, reported as directional. After PMF the full procedure applies.

## Procedure

### Design

1. **Establish the baseline:** the current output-metric rate, tagged. A guessed baseline gives a confidently wrong sample size, so an unavailable one is asked for and its uncertainty carried. Done when the baseline has a value, a window and a tag.
2. **Write the hypothesis** from the template: the change, the metric, the direction, the effect size worth detecting, and the mechanism. Done when every field of the template is filled.
3. **Define the metrics triad:** one preregistered primary (output) outcome, an input indicator when useful, and the guardrails that catch a win breaking something else. Done when each metric has its definition and population.
4. **Verify the metrics are emitted.** An unemitted output metric makes the experiment unreadable; that finding goes to `tracking-standards` before anything ships. Done when each metric is confirmed emitted, or the gap is handed over.
5. **Calculate sample size and runtime** from the baseline, the minimum detectable effect and the traffic. Done when the first read has a calendar date.
6. **Pre-register** before the experiment starts: what ships it, what kills it, whether a preregistered sequential or blinded extension is permitted, its maximum sample and duration, and who decides. Done when the pre-registration is written and dated before the first exposure.

### Analysis

1. **Collect the results** for every metric, per variant, each tagged. Done when every preregistered metric has a value per variant.
2. **Check validity before significance:** the full planned duration covering whole weeks, the intended split, instrumentation stable throughout. Done when each check passes or the result is declared invalid with the reason.
3. **Compute significance** with the preselected method in `references/proportions.md`, on the one pre-registered primary metric. Done when the estimate has its interval.
4. **Read the guardrails.** A guardrail breach outranks an output win. Done when every guardrail has a verdict.
5. **Apply the pre-registered decision rule.** An inconclusive result is named as such; a nonsignificant one is read through its interval for both meaningful benefit and harm. A fixed-horizon test ends at its horizon. Done when the decision follows from the rule written in design step 6.
6. **Report**, including what the experiment leaves unanswered. Done when the output contract is filled.

## Watch for

| Do | Instead of |
|---|---|
| Convert pp and relative percent to the alternative probability before powering | Mixing the two |
| Generate lookup tables from `scripts/proportions.mjs` | A table that disagrees with the formula |
| Randomize and analyze at the account level, or use a clustered method | Treating users in one account as independent |
| An exact or rare-event method for zero conversions, limits stated | Normal tests on zeros |

## Capabilities

| Capability | Used for | Floor when absent |
|-----------|----------|-------------------|
| `analytics.query` | Baseline and results readout | Ask for the baseline, tag it, and state that the power calculation inherits its uncertainty |
| `analytics.events` | Whether output and guardrail metrics are emitted | Search the repository for the call sites |
| `db.query` | Outcomes in the application database | Ask |
| `repo.read` | Flag and assignment code, to verify randomization | Ask how assignment works |
| `files.read` / `files.write` | The pre-registration and the readout | Always present |

Design needs nothing connected. Analysis needs numbers, and two conversion counts pasted by the person are a legitimate source.

## Output Contract

`## EXPERIMENT DESIGN COMPLETE` or `## EXPERIMENT ANALYSIS COMPLETE`, in the shape of its [output contract](references/output-contracts.md).
