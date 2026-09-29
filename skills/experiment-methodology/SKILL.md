---
name: experiment-methodology
description: "Use when designing experiments, calculating sample sizes, formulating hypotheses, or interpreting A/B test results"
---

# Experiment Methodology

Statistical reference for product experimentation. Formulas, lookup tables, and interpretation guides.

## Scope and resources

Follow `../../references/operating-modes.md`, resolved from this `SKILL.md`: Use the supplied inputs and requested output destination for standalone work; do not create initiative state. Design/analysis below are analytical modes, separate from standalone/lifecycle mode. Use only the steps needed for the question. A sample-size request does not require a full preregistration.

Load `evidence-ledger` when recording claims, relevant query shapes in `references/analytics-contract.md` when accessing analytics, and `references/capability-map.md` before a new data source. Load [calculation and interpretation reference](references/proportions.md) for statistical calculations. Skill-local resources resolve relative to this `SKILL.md`.

## Capabilities

| Capability | Used for | Floor when absent |
|-----------|----------|-------------------|
| `analytics.query` | The baseline the experiment is powered against, and the results readout | Ask the user for the baseline, tag it, and state that the power calculation inherits its uncertainty |
| `analytics.events` | Whether the output and guardrail metrics are even emitted | Search the repository for the call sites; an unemitted metric makes the experiment unreadable before it starts |
| `db.query` | Results where the outcome lives in the application database rather than events | Same floor: ask |
| `repo.read` | Feature flag and assignment code, to verify randomization | Ask how assignment works |
| `files.read` / `files.write` | The pre-registration and the readout | Always present |

Design mode needs nothing connected. Analysis mode needs numbers from somewhere, and a user pasting two conversion counts is a legitimate somewhere.

## Procedure

This skill runs in one of two modes. Determine which from the request: a change not yet shipped is **design**; results in hand are **analysis**.

### Design mode

1. **Resolve capabilities and establish the baseline.** The current rate of the output metric, with its tag. Everything downstream is powered against this number, so a guessed baseline produces a confidently wrong sample size.
2. **Write the hypothesis** in the template below. It names the change, the metric, the direction, the size of effect worth detecting, and the reason to expect it. A hypothesis with no mechanism is a coin flip with extra steps.
3. **Define the metrics triad:** output, input, guardrail. Define the primary outcome, mechanism/input indicator when useful, and applicable guardrails. An experiment with no guardrail cannot fail in the way that matters, which is by winning on the target while breaking something else.
4. **Verify the metrics are instrumented.** If the output metric is not emitted, the experiment is unreadable and this is the finding; hand it to `tracking-standards` before anything ships.
5. **Calculate sample size and runtime** from the baseline, the minimum detectable effect, and the traffic. Then state the calendar date the experiment can first be read.
6. **Pre-register.** Decision rule before data: what result ships it, what result kills it, whether a preregistered sequential or blinded extension is permitted, its maximum sample/duration, and who decides. Written down, before the experiment starts, or the readout becomes a negotiation.

### Analysis mode

1. **Collect the results** for all three metrics, per variant, with the tag for each.
2. **Check validity before significance.** Did it run the full planned duration, covering whole weeks? Was the split as intended? Did any instrumentation change mid-flight? A significant result from a broken assignment is a significant artifact.
3. **Compute significance** using the preselected method in `references/proportions.md`, on the pre-registered metric. One primary metric. Testing six and reporting the one that reached significance is how teams ship noise.
4. **Read the guardrails.** A guardrail breach overrides an output win.
5. **Apply the pre-registered decision rule**, and say plainly when the result is inconclusive. Nonsignificance does not establish zero or a small effect: inspect the interval for both meaningful benefit and harm. Never extend a fixed-horizon test merely because its p-value is close to a threshold.
6. **Report**, including what the experiment cannot conclude.

## Output Contracts

```markdown
## EXPERIMENT DESIGN COMPLETE

**Hypothesis:** {statement with mechanism}
**Baseline:** {value, tag} · **MDE:** {absolute pp and relative %, direction} · **Sample per variant:** {n} · **Runtime:** {days, first readable on date}
**Metrics:** output {…} · input {…} · guardrail {…}
**Instrumentation:** {emitted / missing, per metric}
**Decision rule:** ship if {…} · kill if {…} · inconclusive if {…} · permitted extension {method, cap, or none}
```

```markdown
## EXPERIMENT ANALYSIS COMPLETE

**Validity:** {duration, split, instrumentation stability}
**Result:** {metric, control, variant, lift, p-value or interval}
**Guardrails:** {each, with verdict}
**Decision:** {ship / kill / extend / inconclusive}, per the pre-registered rule
**Cannot conclude:** {what this experiment does not answer}
```

## Hypothesis Template

```
If we [specific, implementable change],
then [primary metric] will [increase/decrease] by [minimum detectable effect],
because [reasoning tied to user behavior or data].
```

**Bad hypothesis:** "If we improve onboarding, activation will increase."
**Good hypothesis:** "If we add a progress bar to the 3-step setup wizard, setup completion rate will increase by 8pp (from 45% to 53%), because users abandon when they don't know how many steps remain (exit survey data: 34% cite 'didn't know how long it would take')."

## Metrics and statistical method

Use one preregistered primary outcome plus the minimum applicable input indicators and guardrails. More than one guardrail may be needed; exactly three total metrics is not a statistical requirement. Specify randomization unit (usually account for B2B), allocation, exposure, eligibility, analysis population and the business effect worth detecting.

For equal-allocation binary outcomes, use the normal approximation in `references/proportions.md`: Two-sided 95% confidence, 80% power, independent units. The zero-dependency `scripts/proportions.mjs` is the calculation source and generates the committed lookup table. Where local execution is unavailable, apply the same formula explicitly; the script is optional. Do not apply it to clustered users, repeated observations, multiple arms or rare-event regimes without an appropriate design.

Runtime is sample per arm × arms / daily eligible independent units, rounded up, then extended to the preregistered full business cycles. A short calculated runtime is not proof the MDE is wrong; it still needs a calendar rule. A long runtime is a design tradeoff, not permission to change assignment unit after seeing results.

**Calculation example:** At baseline 5%, an absolute +5pp means 10% alternative (100% relative lift): 432 per arm. A +10% relative lift means 5.5% alternative: 31,196 per arm. Label both scales; never call 10% relative lift 10pp.

**Interpretation example:** A completed fixed-horizon test with an interval from −2pp to +5pp remains inconclusive when +3pp is the business threshold. Neither “no effect” nor an unplanned “run until significant” follows. A confidence interval contained inside a preregistered equivalence margin can support an equivalence claim using the appropriate equivalence test.

## Common Mistakes

| Mistake | Correction |
|---------|------------|
| Mixing pp and relative percent | Convert both to the alternative probability before powering |
| Lookup table disagrees with formula | Generate it from `scripts/proportions.mjs`; regression tests check equality |
| Nonsignificance means no effect | Report the interval, meaningful effects still compatible with it, and inconclusive verdict |
| Extending after seeing p = 0.06 | Follow a prespecified sequential/blinded extension rule or start a new preregistered test |
| Treating users in one account as independent | Randomize/analyze at the account level or use a clustered method |
| Applying normal tests to zero conversions | Use a suitable exact/rare-event method and state approximation limits |

## Experiment Types

| Type | When to Use | Duration |
|------|------------|----------|
| **A/B test** | Binary choice, enough traffic | 2-6 weeks |
| **Multi-variant (A/B/C)** | Multiple alternatives | 3-8 weeks (more traffic needed) |
| **Holdback** | Measure long-term impact of shipped feature | 4-12 weeks |
| **Sequential testing** | Need early stopping | Varies (uses alpha spending) |
| **Quasi-experiment** | Can't randomize (e.g., pricing by region) | Varies |
