---
name: experiment-methodology
description: "Use when designing experiments, calculating sample sizes, formulating hypotheses, or interpreting A/B test results"
---

# Experiment Methodology

Statistical reference for product experimentation. Formulas, lookup tables, and interpretation guides.

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
