---
name: saas-metrics-reference
description: "Use when diagnosing product health, building a metric tree, or when a SaaS metric needs a definition, a formula, or a benchmark band for its stage"
---

# SaaS Metrics Reference

Definitions, formulas and benchmark bands for the metrics a product health diagnosis rests on, plus the procedure that turns them into a scorecard.

## Scope and resources

Follow `../../references/operating-modes.md`, resolved from this `SKILL.md`: Standalone definitions and calculations preserve supplied context/output destination and do not initialize an initiative. Answer a single metric directly with its unit, denominator, period and assumptions; do not require a health scorecard or every query shape.

Load [metric definitions and heuristic bands](references/metric-definitions.md) only for the requested metric/category. Load `evidence-ledger` for sourced claims, the relevant section of `references/analytics-contract.md` for a query, and `references/capability-map.md` before accessing a connected source. Skill-local paths resolve relative to this `SKILL.md`; shared paths resolve from the supplied installation root.

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

For a definition/calculation, select the relevant formula, validate the supplied inputs and compute only that metric; explain undefined/missing inputs. The numbered diagnosis steps below apply when product-health analysis is requested. Lifecycle work reads only the active context needed; standalone work preserves its supplied scope.

### 1. Resolve capabilities and context

Run the resolution protocol from `references/capability-map.md`. Record what resolved.

Then establish the product context: product name, supplied/evidenced stage, applicable activation/retention events and segmentation properties. Stage is context, not inferred from ARR or a PMF score; heuristic bands are optional. Use the supplied context first. Read `PRODUCT.md` for lifecycle context or a requested product-wide diagnosis; ask only for material missing definitions. Do not guess an activation event: the wrong one produces a confident and meaningless activation rate.

### 2. Gather

For a full diagnosis, use only the query shapes that answer the business question. The following is a possible order, not a mandatory all-shapes collection:

1. **Catalogue** — what is emitted, and at what volume. This tells you which of the following are even possible.
2. **Volume** — the core action, unique actors, 30 days, daily. Then the signup event, 90 days, weekly, for the trend.
3. **Funnel** — signup through the activation event, with the conversion window stated.
4. **Retention** — cohorts by signup, returning on the core action, weekly, with the definition stated.
5. **Volume, top features** — unique actors per feature event over 30 days.
6. **Breakdown** — repeat any of the above across the segment properties that matter.

With no `analytics.query`, use applicable floors: supplied figures, relevant recorded metrics or a focused instrumentation check. Date sources and request only missing values needed for this diagnosis. A value older than 30 days is tagged stale, and a stale value is still evidence; a fabricated one is not.

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
- A mature retention curve still falling at a relevant age; investigate segment/definition/context without declaring PMF absent
- Activation below 20%
- Any value older than 30 days

An anomaly is a question, not a finding. Each one gets the investigation that would resolve it.

### 5. Score against the stage band

If applicable, use the conditional heuristic table in `references/metric-definitions.md` for the supplied/evidenced context. Prefer actual targets, comparable cohorts and the product’s history; unknown stage does not justify guessing a band. Each metric gets red, yellow or green, and the band it was judged against appears next to it so the reader can disagree with the band rather than with the colour.

### 6. Report

For a full diagnosis, emit the applicable sections of the output contract below; for a narrow question keep its requested format. Where a capability did not resolve, state which shape would close which specific gap and what it would answer. Never name a product for the user to go install.

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
