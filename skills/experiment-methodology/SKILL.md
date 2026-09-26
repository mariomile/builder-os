---
name: experiment-methodology
description: "Use when designing experiments, calculating sample sizes, formulating hypotheses, or interpreting A/B test results"
---

# Experiment Methodology

Statistical reference for product experimentation. Formulas, lookup tables, and interpretation guides.

**REQUIRED BACKGROUND:** `evidence-ledger` for tagging. `references/analytics-contract.md` for the query shapes. `references/capability-map.md` before touching any data source.

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
3. **Define the metrics triad:** output, input, guardrail. All three, always. An experiment with no guardrail cannot fail in the way that matters, which is by winning on the target while breaking something else.
4. **Verify the metrics are instrumented.** If the output metric is not emitted, the experiment is unreadable and this is the finding; hand it to `tracking-standards` before anything ships.
5. **Calculate sample size and runtime** from the baseline, the minimum detectable effect, and the traffic. Then state the calendar date the experiment can first be read.
6. **Pre-register.** Decision rule before data: what result ships it, what result kills it, what result extends it, and who decides. Written down, before the experiment starts, or the readout becomes a negotiation.

### Analysis mode

1. **Collect the results** for all three metrics, per variant, with the tag for each.
2. **Check validity before significance.** Did it run the full planned duration, covering whole weeks? Was the split as intended? Did any instrumentation change mid-flight? A significant result from a broken assignment is a significant artifact.
3. **Compute significance** per the formula below, on the pre-registered metric. One primary metric. Testing six and reporting the one that reached significance is how teams ship noise.
4. **Read the guardrails.** A guardrail breach overrides an output win.
5. **Apply the pre-registered decision rule**, and say plainly when the result is inconclusive. Inconclusive is a real outcome and usually means the effect is smaller than the experiment could see, which is itself information about the size of the bet.
6. **Report**, including what the experiment cannot conclude.

## Output Contracts

```markdown
## EXPERIMENT DESIGN COMPLETE

**Hypothesis:** {statement with mechanism}
**Baseline:** {value, tag} · **MDE:** {%} · **Sample per variant:** {n} · **Runtime:** {days, first readable on date}
**Metrics:** output {…} · input {…} · guardrail {…}
**Instrumentation:** {emitted / missing, per metric}
**Decision rule:** ship if {…} · kill if {…} · extend if {…}
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

## Metrics Triad

Every experiment needs exactly three metrics:

| Type | Purpose | Selection Criteria |
|------|---------|-------------------|
| **Output** | What you're trying to move | Directly tied to hypothesis |
| **Input** | Leading indicator | Moves before output metric, controllable |
| **Guardrail** | Must not degrade | Protects user experience or business health |

## Sample Size Formula

For comparing two proportions (standard A/B test):

```
n = (Z_α/2 + Z_β)² × (p₁(1-p₁) + p₂(1-p₂)) / (p₂ - p₁)²
```

### Lookup Table (95% confidence, 80% power, per variant)

| Baseline | MDE 1pp | MDE 2pp | MDE 5pp | MDE 10pp |
|----------|---------|---------|---------|----------|
| 5% | 7,400 | 1,900 | 340 | 100 |
| 10% | 14,200 | 3,600 | 620 | 170 |
| 15% | 20,100 | 5,100 | 870 | 230 |
| 20% | 24,600 | 6,200 | 1,050 | 280 |
| 30% | 32,300 | 8,100 | 1,350 | 360 |
| 40% | 36,900 | 9,300 | 1,500 | 390 |
| 50% | 38,400 | 9,600 | 1,570 | 400 |

### Runtime Formula

```
Days = (n × variants) / daily_eligible_traffic
```

**Rules of thumb:**
- Runtime > 8 weeks → increase MDE or change unit
- Runtime < 1 week → MDE too large, may miss real effects
- Minimum runtime: 2 full business cycles (typically 2 weeks)

## Results Analysis

### Statistical Significance

```
Observed Δ = p_treatment - p_control
SE = √(p₁(1-p₁)/n₁ + p₂(1-p₂)/n₂)
Z = Δ / SE
p-value = 2 × (1 - Φ(|Z|))
95% CI = Δ ± 1.96 × SE
```

### Interpretation Matrix

| p-value | CI excludes 0 | Effect size | Decision |
|---------|--------------|-------------|----------|
| < 0.05 | Yes | ≥ MDE | **Ship** — clear win |
| < 0.05 | Yes | < MDE | **Consider** — significant but small |
| < 0.05 | Yes (negative) | Any | **Kill** — clear loss |
| ≥ 0.05 | No, includes positive | Any | **Extend** — need more data |
| ≥ 0.05 | No, centered at 0 | Any | **Kill** — no real effect |

### Common Pitfalls

| Pitfall | Reality |
|---------|---------|
| "Almost significant" (p = 0.06) | Not significant. Don't rationalize. |
| Peeking during experiment | Inflates false positive rate. Wait for full sample. |
| Multiple comparisons without correction | Testing 5 segments? Use Bonferroni: α/5 = 0.01 |
| Reporting only p-value | Always report confidence interval and effect size |
| "No effect" from underpowered test | Check if CI includes meaningful effects |

## Experiment Types

| Type | When to Use | Duration |
|------|------------|----------|
| **A/B test** | Binary choice, enough traffic | 2-6 weeks |
| **Multi-variant (A/B/C)** | Multiple alternatives | 3-8 weeks (more traffic needed) |
| **Holdback** | Measure long-term impact of shipped feature | 4-12 weeks |
| **Sequential testing** | Need early stopping | Varies (uses alpha spending) |
| **Quasi-experiment** | Can't randomize (e.g., pricing by region) | Varies |
