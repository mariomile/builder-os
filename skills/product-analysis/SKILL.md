---
name: product-analysis
description: "Analyzes a product with numbers and sources: health and metric trees, metric definitions, activation, retention, revenue and LTV, PMF, North Star, OKRs, competitors. Use when asked how the product is doing, why a metric moved, or any of these."
---

# Product Analysis

One skill for the questions a senior product analyst answers. Each **area** keeps its own procedure in a reference file; load the one the question needs, and inside it the steps the question needs. A single metric gets a single answer.

**Mode.** Standalone is the default: the requested format, direct sources cited, no lifecycle state. When phase 2 or phase 7 calls an area, its artifact paths and gate rules apply and every claim follows `evidence-ledger`. Both per [operating modes](../../references/operating-modes.md).

## Areas

| The question | Read | Completion marker of a full report |
|--------------|------|-------------------------------------|
| How is the product doing; what does metric X mean, how is it computed, what band is normal | [metrics](references/metrics.md), then [definitions](references/metric-definitions.md) or [diagnosis](references/diagnosis.md) | `## DIAGNOSIS COMPLETE` |
| Where activation leaks, how retention behaves, which growth loop, which intervention first | [growth](references/growth.md), [methods](references/growth-methods.md) | `## GROWTH ANALYSIS COMPLETE` |
| MRR, waterfall, ARPA, churn, LTV, CAC, payback, NDR, projections | [finance](references/finance.md), [formulas](references/revenue-models.md), [revenue SQL](references/revenue-sql.md) | `## FINANCIAL ANALYSIS COMPLETE` |
| PMF, positioning, the north star and its metric tree | [strategy](references/strategy.md), [methods](references/strategy-methods.md) | `## STRATEGY AUDIT COMPLETE` / `## NORTH STAR COMPLETE` |
| Objectives and key results, baselines and targets | [OKRs](references/okrs.md), [method](references/okr-method.md), [output](references/okr-output-contract.md) | `## OKR COMPLETE` |
| Competitors, feature matrix, positioning map | [competition](references/competition.md), [templates](references/competitive-templates.md) | `## COMPETITIVE ANALYSIS COMPLETE` |

A question that spans areas (a strategy session: PMF, then a north star, then OKRs) runs them in that order, each feeding the next; the metric tree is one tree, extended under the chosen north star.

## Capabilities

Every area resolves capabilities per `references/capability-map.md` and asks for data in the shapes of `references/analytics-contract.md`. The ones used here: `analytics.query`, `analytics.events`, `analytics.replay`, `db.query`, `docs.search`, `research.search`, `web.search`, `web.fetch`, `repo.read`, `files.read` / `files.write`. Each area's file lists what it uses each for and its floor.

**Floor for all of them:** with nothing connected, the analysis still runs. A metric tree with every leaf `unavailable` and a named question per gap, a funnel mapped from the onboarding code with its untracked steps, four user-provided figures each tagged `[doc:user-{date}-{topic}]`: all valid output.

## Rules for Every Area

- **Unknown is a value, zero is a measurement.** An absence stays unknown, a missing signal stays missing, and a stage comes from evidence rather than a threshold.
- **Lead with what is measured.** When the only figure is synthetic, a fixture, a plan or older than its window, the answer opens with "not measured" and what would measure it; the figure follows, labeled as what it is.
- **Every number names its source and date**; a value older than 30 days is marked stale. A derived figure names its inputs and inherits their uncertainty.
- **Bands and scores are heuristics.** Prefer the product's own history and actual targets; an unknown stage gets no band.
- **A gap ends with the question that closes it**, named as a query shape or a capability.

## Procedure

1. **Place the question.** Match it to an area in the table; a question spanning areas runs them in the table's order. Done when each part of the question has its area and reference file.
2. **Run the area's steps** from its reference file, the ones this question needs, resolving each data source per `references/capability-map.md` and asking in the shapes of `references/analytics-contract.md`. Done when every number in the answer has its source and date, or its gap and the question that closes it.
3. **Answer at the size of the question**: a narrow question in the requested format, a full report with the area's sections. Done when the rules above hold for every figure in it.

## Watch for

| Do | Instead of |
|---|---|
| Answer the metric with unit, denominator, period and assumptions | A full diagnosis for one metric question |
| Extend the diagnostic tree under the chosen north star | A second metric tree |
| Sum MRR per account, divide by positive-MRR accounts | ARPA averaged over subscriptions |
| Pre-outcome window, comparable populations, then a causal test | Activation–retention correlation reported as cause |
| Read the competitor's page, or mark the claim unverified with the date | A search snippet taken as the current price |

## Output Contract

A full report ends with its area's marker (`## DIAGNOSIS COMPLETE`, `## GROWTH ANALYSIS COMPLETE`, `## FINANCIAL ANALYSIS COMPLETE`, `## STRATEGY AUDIT COMPLETE`, `## NORTH STAR COMPLETE`, `## OKR COMPLETE`, `## COMPETITIVE ANALYSIS COMPLETE`); a narrow answer keeps the requested format.
