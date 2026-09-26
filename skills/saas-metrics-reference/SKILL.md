---
name: saas-metrics-reference
description: "Use when diagnosing product health, building a metric tree, or when a SaaS metric needs a definition, a formula, or a benchmark band for its stage"
---

# SaaS Metrics Reference

Definitions, formulas and benchmark bands for the metrics a product health diagnosis rests on, plus the procedure that turns them into a scorecard.

**REQUIRED BACKGROUND:** `evidence-ledger` for tagging. `references/analytics-contract.md` for the five query shapes. `references/capability-map.md` before touching any data source.

## Capabilities

| Capability | Used for | Floor when absent |
|-----------|----------|-------------------|
| `analytics.query` | Volume, funnel and retention shapes behind the metric tree | Read instrumentation from code to learn what *could* be measured, then ask the user for current values |
| `analytics.events` | Which events exist, and their volume | Search the repository for the analytics SDK's call sites |
| `db.query` | Revenue, account and subscription metrics | Read the schema from migrations, then ask for the numbers |
| `docs.search` | Previously recorded metrics, dashboards, analytics notes | Skip, and mark the metric unavailable |
| `repo.read` | Instrumentation audit, data model, feature inventory | Skip when there is no codebase |
| `files.read` / `files.write` | The artifact itself | Always present |

Nothing here is required. A diagnosis with every value marked unavailable and a named question per gap is a valid output, and a more useful one than a diagnosis with invented numbers.

## Procedure

### 1. Resolve capabilities and context

Run the resolution protocol from `references/capability-map.md`. Record what resolved.

Then establish the product context: product name, stage (seed, series-a, growth: it selects the benchmark band), the activation event, the retention event, and the properties worth segmenting by. Take these from `PRODUCT.md` when it exists, from the dispatch prompt otherwise, and ask when neither carries them. Do not guess an activation event: the wrong one produces a confident and meaningless activation rate.

### 2. Gather

Work the shapes in `references/analytics-contract.md`, in this order, stopping at whatever resolves:

1. **Catalogue** — what is emitted, and at what volume. This tells you which of the following are even possible.
2. **Volume** — the core action, unique actors, 30 days, daily. Then the signup event, 90 days, weekly, for the trend.
3. **Funnel** — signup through the activation event, with the conversion window stated.
4. **Retention** — cohorts by signup, returning on the core action, weekly, with the definition stated.
5. **Volume, top features** — unique actors per feature event over 30 days.
6. **Breakdown** — repeat any of the above across the segment properties that matter.

With no `analytics.query`, run the floors instead: search documents for recorded metrics and date every one you find, audit the instrumentation in the repo, then present what exists and ask for current values. A value older than 30 days is tagged stale, and a stale value is still evidence; a fabricated one is not.

### 3. Build the metric tree

Organize into acquisition, activation, engagement, retention, business, under the north star or revenue at the root. Every leaf carries its value and its tag. Every leaf that could not be filled carries `unavailable` and the reason:

```
Retention
├── Week 1: 41% [data:posthog:retention_w1_2026-09] (unbounded)
├── Week 4: unavailable — cohorts younger than 4 weeks
└── Curve shape: flattening from week 3 [derived]
```

Never leave a leaf blank and never round an absence to zero.

### 4. Detect anomalies

Flag, with the number and its tag:

- Week-over-week change above 20% in either direction
- A metric at zero or null that should not be
- A retention curve still falling at week 8, which is the absence of a PMF signal rather than a low number
- Activation below 20%
- Any value older than 30 days

An anomaly is a question, not a finding. Each one gets the investigation that would resolve it.

### 5. Score against the stage band

Use the benchmark table for the stated stage. Each metric gets red, yellow or green, and the band it was judged against appears next to it so the reader can disagree with the band rather than with the colour.

### 6. Report

Emit the output contract below. Where a capability did not resolve, state which shape would close which specific gap and what it would answer. Never name a product for the user to go install.

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

## Core Metrics

The Shape column names the question shape from `references/analytics-contract.md`, never a tool.

### Acquisition

| Metric | Formula | Shape |
|--------|---------|-------|
| Signups per week | Count of the signup event per week | Volume, total, weekly |
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
| ARPA | MRR ÷ active accounts | Derived |
| LTV | ARPA ÷ monthly churn rate | Derived |
| CAC | Sales and marketing spend ÷ new customers | `db.query` or user-provided |
| LTV:CAC | LTV ÷ CAC | Derived, healthy above 3× |
| CAC payback | CAC ÷ (ARPA × gross margin) | Derived, healthy under 18 months |
| Quick ratio | (New + expansion MRR) ÷ (contraction + churn MRR) | Derived from the waterfall |
| Burn multiple | Net burn ÷ net new ARR | User-provided |

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

### Seed (pre-PMF, under $100K ARR)

| Metric | Poor | Okay | Good |
|--------|------|------|------|
| Activation rate | <15% | 15–30% | >30% |
| Week 1 retention | <20% | 20–40% | >40% |
| Week 4 retention | <5% | 5–15% | >15% |
| DAU/MAU | <5% | 5–15% | >15% |
| MoM growth | <5% | 5–15% | >15% |

### Series A ($100K–$1M ARR)

| Metric | Poor | Okay | Good |
|--------|------|------|------|
| Activation rate | <25% | 25–40% | >40% |
| Week 1 retention | <30% | 30–50% | >50% |
| Week 4 retention | <10% | 10–25% | >25% |
| DAU/MAU | <10% | 10–20% | >20% |
| NDR | <90% | 90–110% | >110% |
| MoM growth | <10% | 10–20% | >20% |
| Quick ratio | <1 | 1–2 | >2 |

### Growth ($1M–$10M ARR)

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
