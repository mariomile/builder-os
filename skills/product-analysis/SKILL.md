---
name: product-analysis
description: "Analyzes a product with numbers and sources: health diagnosis and metric trees, metric definitions, activation and retention, growth loops, revenue and unit economics, PMF and positioning, North Star selection, OKRs, and competitors. Use when someone asks how the product is doing, what a metric means or should be, why activation or retention moved, what revenue or LTV looks like, whether there is PMF, which north star or OKRs to set, or how competitors compare."
---

# Product Analysis

One skill for the questions a senior product analyst answers. Each area keeps its own procedure in a reference file; load only the one the question needs, and inside it only the steps the question needs. A single metric gets a single answer, not a report.

Follow [operating modes](../../references/operating-modes.md). **Standalone** is the default: answer in the requested format, cite direct sources, write no lifecycle state. **Lifecycle:** when phase 2 (Define) or phase 7 (Learn) calls an area, its artifact paths and gate rules apply and every claim follows `evidence-ledger`.

## Areas

| The question | Read | Completion marker of a full report |
|--------------|------|-------------------------------------|
| How is the product doing; what does metric X mean, how is it computed, what band is normal | [metrics](references/metrics.md), then [definitions](references/metric-definitions.md) or [diagnosis](references/diagnosis.md) | `## DIAGNOSIS COMPLETE` |
| Where activation leaks, how retention behaves, which growth loop, which intervention first | [growth](references/growth.md), [methods](references/growth-methods.md) | `## GROWTH ANALYSIS COMPLETE` |
| MRR, waterfall, ARPA, churn, LTV, CAC, payback, NDR, projections | [finance](references/finance.md), [formulas](references/revenue-models.md), [revenue SQL](references/revenue-sql.md) | `## FINANCIAL ANALYSIS COMPLETE` |
| PMF, positioning, the north star and its metric tree | [strategy](references/strategy.md), [methods](references/strategy-methods.md) | `## STRATEGY AUDIT COMPLETE` / `## NORTH STAR COMPLETE` |
| Objectives and key results, baselines and targets | [OKRs](references/okrs.md), [method](references/okr-method.md), [output](references/okr-output-contract.md) | `## OKR COMPLETE` |
| Competitors, feature matrix, positioning map | [competition](references/competition.md), [templates](references/competitive-templates.md) | `## COMPETITIVE ANALYSIS COMPLETE` |

A question that spans areas (a strategy session: PMF, then a north star, then OKRs) runs them in that order, each feeding the next; the metric tree is one tree, extended, never a second one.

## Capabilities

Every area resolves capabilities per `references/capability-map.md` and asks for data in the shapes of `references/analytics-contract.md`. The ones used here: `analytics.query`, `analytics.events`, `analytics.replay`, `db.query`, `docs.search`, `research.search`, `web.search`, `web.fetch`, `repo.read`, `files.read` / `files.write`. Each area's file lists what it uses each for and its floor.

**Floor for all of them:** with nothing connected, the analysis still runs. A metric tree with every leaf `unavailable` and a named question per gap, a funnel mapped from the onboarding code with its untracked steps, four user-provided figures each tagged `[doc:user-{date}-{topic}]`: all valid output.

## Rules for Every Area

- **Unknown is a value, zero is a measurement.** Never round an absence to zero, never fill a missing signal, never guess a stage from a threshold.
- **Every number names its source and date**; a value older than 30 days is marked stale. A derived figure names its inputs and inherits their uncertainty.
- **Bands and scores are heuristics.** Prefer the product's own history and actual targets; an unknown stage gets no band.
- **A gap ends with the question that closes it**, named as a query shape or a capability, never as a product to install.

Completion marker: the area's marker above for a full report; a narrow answer keeps the requested format.

## Common Mistakes

| Mistake | Correction |
|---------|------------|
| Running a full diagnosis for one metric question | Answer the metric with unit, denominator, period and assumptions |
| A second metric tree for the north star | Extend the diagnostic tree under the chosen north star |
| ARPA averaged over subscriptions | Sum MRR per account, divide by positive-MRR accounts |
| Correlation of activation and retention reported as cause | Pre-outcome window, comparable populations, then a causal test |
| A search snippet treated as a competitor's current price | Read the page or mark the claim unverified, with the date |
