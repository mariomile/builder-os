# SaaS Metric Definitions and Heuristic Bands

Read only the requested metric/category and relevant heuristic band. Resolve this resource relative to its owning `SKILL.md`. No table below establishes PMF or company stage.

## Core Metrics

The Shape column names the question shape from `references/analytics-contract.md`, never a tool.

### Acquisition

| Metric | Formula | Shape |
|--------|---------|-------|
| Signups per week | Unique eligible signup actors/accounts per week (state unit) | Volume, unique, weekly |
| Signup trend | Week-over-week change in signups | Derived from the above |
| Signup to activation | Activated ÷ signed up within the window | Funnel |

### Activation

| Metric | Formula | Shape |
|--------|---------|-------|
| Activation rate | Actors reaching the activation event ÷ signups | Funnel |
| Time to activate | Median time from signup to activation | Funnel, time to convert |
| Setup completion | Actors completing onboarding ÷ signups | Funnel |

### Engagement

| Metric | Formula | Shape |
|--------|---------|-------|
| DAU | Unique actors on the core action in a day | Volume, unique, daily |
| WAU | Unique actors over 7 days | Volume, unique |
| MAU | Unique actors over 30 days | Volume, unique |
| Stickiness | DAU ÷ MAU | Derived |
| Feature adoption | Unique actors per feature event ÷ active actors | Volume, unique, per event |

### Retention

| Metric | Formula | Shape |
|--------|---------|-------|
| Week N retention | Cohort members active in week N ÷ cohort size | Retention |
| Net dollar retention | (Starting MRR + expansion − contraction − churn) ÷ starting MRR | `db.query` over billing |
| Logo churn | Churned accounts ÷ starting accounts | `db.query` over subscriptions |

### Revenue

| Metric | Formula | Shape |
|--------|---------|-------|
| MRR | Sum of active monthly recurring revenue | `db.query` |
| ARR | MRR × 12 | Derived |
| ARPA | Total account MRR ÷ distinct positive-MRR accounts | Derived, aggregate subscriptions per account first |
| Simple customer LTV | ARPA ÷ monthly logo churn rate | Derived, assumes stable ARPA and constant monthly churn |
| Margin-adjusted customer LTV | ARPA × gross margin ÷ monthly logo churn rate | Derived, approximate customer lifetime gross profit |
| CAC | Sales and marketing spend ÷ new customers | `db.query` or user-provided |
| LTV:CAC | Margin-adjusted LTV ÷ CAC | Derived; use matched acquisition cohorts and declared cost policy |
| CAC payback | CAC ÷ (ARPA × gross margin) | Derived; consistent monthly revenue/cost model |
| Quick ratio | (New + expansion + reactivation MRR) ÷ (contraction + churn MRR) | Derived from the waterfall; report variant if excluding reactivation |
| Burn multiple | Net burn ÷ net new ARR | User-provided |

## Units, windows and undefined ratios

Specify currency/unit, monthly plan normalization, discounts/trials/taxes policy, timezone, date range, complete closed periods and unit of analysis. A present-day subscription status is not historical monthly MRR; use the [historical revenue input contract](../../financial-models/references/revenue-sql.md) when querying history. Zero MRR is a measured amount; a missing snapshot is unavailable. Zero denominators make ARPA/churn/LTV/CAC ratios undefined, not zero. A zero-churn month is insufficient evidence of infinite customer LTV.

For customer LTV, churn is a monthly probability/fraction of starting accounts, not revenue churn or a percentage numeral. The simple model assumes constant ARPA, margin and independent churn over time; prefer measured cohort value when available. Label whether LTV includes gross margin when using LTV:CAC.

For NDR specify start date, end date, the fixed starting paid-account set, starting MRR and ending MRR of those same accounts, and observation completeness. NDR = ending MRR of starting accounts / starting MRR of those accounts. Exclude revenue from new accounts and returning accounts outside that starting set. A returning account inside the starting set over a longer window contributes to its final ending MRR; do not double-count its churn/reactivation across intervening months. Compare ratios only across matching windows and money definitions; a monthly NDR and annual NDR are different metrics.

For funnels, use the same eligible cohort in numerator/denominator and state the conversion window. For bounded retention, compare mature cohorts at the same age and aligned natural usage rhythm; unbounded retention is a different definition.

## MRR Waterfall

```
Ending MRR = Starting MRR
  + New MRR          (new customers)
  + Expansion MRR    (upgrades, add-ons)
  + Reactivation MRR (returning churned customers)
  − Contraction MRR  (downgrades)
  − Churn MRR        (cancellations)
```

The identity is the check: if the components do not reconcile to the ending figure, the segmentation is wrong, not the arithmetic. `financial-models` holds the query patterns for computing it against a billing schema.

## Benchmark Bands

These are working heuristics for triage, not sourced industry benchmarks. They are here so a number gets a reaction rather than a shrug. The moment a product has two quarters of its own history, its own trend is the better band, and any conclusion that hinges on the difference between a yellow and a green deserves the real comparison rather than this table.

### Seed context (supplied/evidenced, not an ARR or PMF classification)

| Metric | Poor | Okay | Good |
|--------|------|------|------|
| Activation rate | <15% | 15–30% | >30% |
| Week 1 retention | <20% | 20–40% | >40% |
| Week 4 retention | <5% | 5–15% | >15% |
| DAU/MAU | <5% | 5–15% | >15% |
| MoM growth | <5% | 5–15% | >15% |

### Series A context (supplied/evidenced)

| Metric | Poor | Okay | Good |
|--------|------|------|------|
| Activation rate | <25% | 25–40% | >40% |
| Week 1 retention | <30% | 30–50% | >50% |
| Week 4 retention | <10% | 10–25% | >25% |
| DAU/MAU | <10% | 10–20% | >20% |
| NDR | <90% | 90–110% | >110% |
| MoM growth | <10% | 10–20% | >20% |
| Quick ratio | <1 | 1–2 | >2 |

### Growth context (supplied/evidenced)

| Metric | Poor | Okay | Good |
|--------|------|------|------|
| Activation rate | <35% | 35–50% | >50% |
| Week 1 retention | <40% | 40–60% | >60% |
| Week 4 retention | <15% | 15–30% | >30% |
| DAU/MAU | <15% | 15–25% | >25% |
| NDR | <100% | 100–120% | >120% |
| LTV:CAC | <2× | 2–4× | >4× |
| CAC payback | >24mo | 12–24mo | <12mo |
| Quick ratio | <2 | 2–4 | >4 |

Retention bands assume a weekly-rhythm product. For a product used monthly by design, weekly retention is the wrong instrument and the bands do not apply: switch the cohort granularity to match the product's natural rhythm and say so in the artifact.

