# Product Health Diagnosis Reference

Read when running a full product-health diagnosis: the query order, the metric-tree form, the output contract, and the full common-mistakes list with a worked calculation. The procedure is in [the skill](../SKILL.md).

## Query order

For a full diagnosis, use only the query shapes that answer the business question. The following is a possible order, not a mandatory all-shapes collection:

1. **Catalogue** — what is emitted, and at what volume. This tells you which of the following are even possible.
2. **Volume** — the core action, unique actors, 30 days, daily. Then the signup event, 90 days, weekly, for the trend.
3. **Funnel** — signup through the activation event, with the conversion window stated.
4. **Retention** — cohorts by signup, returning on the core action, weekly, with the definition stated.
5. **Volume, top features** — unique actors per feature event over 30 days.
6. **Breakdown** — repeat any of the above across the segment properties that matter.

## Metric tree form

Organize into acquisition, activation, engagement, retention, business, under the north star or revenue at the root. Every leaf carries its value and its tag. Every leaf that could not be filled carries `unavailable` and the reason:

```
Retention
├── Week 1: 41% [data:posthog:retention_w1_2026-09] (unbounded)
├── Week 4: unavailable — cohorts younger than 4 weeks
└── Curve shape: flattening from week 3 [derived]
```

Never leave a leaf blank and never round an absence to zero.

## Output Contract

```markdown
## DIAGNOSIS COMPLETE

**Product:** {name} · **Stage:** {stage} · **Period:** {range} · **Date:** {today}
**Capabilities resolved:** {capability → concrete source, or "none: files only"}

### Health Scorecard
| Category | Metric | Value | Source | Band ({stage}) | Status | Trend |

### Metric Tree
{full tree, every leaf tagged or marked unavailable with a reason}

### Data Gaps
{per gap: what is missing, which shape would fill it, what it would answer}

### Anomalies
{per anomaly: what, severity, the investigation that resolves it}

### Key Findings
{each with its numbers and tags}

### Recommended Actions
{each with expected impact as metric plus direction, priority, effort}
```

## Common Mistakes

| Mistake | Prevention |
|---------|------------|
| A number without a tag | Every value carries its source, or is marked unavailable |
| Comparing a retention curve to a band computed the other way | Record bounded or unbounded next to the curve |
| A funnel whose conversion window was never read | Read it, state it, next to the rate |
| Treating a recorded metric as current | Date every value; tag anything over 30 days stale |
| Rounding an absence to zero | Unavailable is a value. Zero is a measurement |
| Ending on "connect a product for deeper insight" | Name the shape and the question it would answer, not a vendor |
| Judging a monthly product on weekly retention | Match cohort granularity to the product's rhythm |
| Revenue churn substituted for logo churn in customer LTV | State customer-lifetime model, use monthly logo churn and gross margin |
| ARPA averaged over subscriptions | Aggregate MRR per account, then divide by positive-MRR accounts |
| Benchmark or ARR band proves PMF | Treat heuristics as triage; assess evidence and context separately |
| Full diagnosis for a definition request | Return only the relevant definition/calculation and assumptions |

**Worked calculation:** A has two subscriptions totaling 150 MRR, B has 200 → account ARPA = 350/2 = 175. With ARPA 120, gross margin 80% and measured monthly logo churn 5%, simple margin-adjusted LTV = 120 × 0.80 / 0.05 = 1,920. A 2% revenue churn input cannot be silently substituted for logo churn. If logo churn is unavailable, report LTV unavailable.
