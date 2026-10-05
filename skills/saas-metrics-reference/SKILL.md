---
name: saas-metrics-reference
description: "Use when diagnosing product health, building a metric tree, or when a SaaS metric needs a definition, a formula, or a benchmark band for its stage"
---

# SaaS Metrics Reference

## Scope and resources

Follow `../../references/operating-modes.md`, resolved from this `SKILL.md`. Answer a single metric directly with its unit, denominator, period and assumptions; it needs no health scorecard and no other query shapes.

Load [metric definitions and heuristic bands](references/metric-definitions.md) only for the requested metric/category, and [the diagnosis reference](references/diagnosis.md) for a full diagnosis (query order, metric-tree form, output contract, worked calculation). Load `evidence-ledger` for sourced claims, the relevant section of `references/analytics-contract.md` for a query, and `references/capability-map.md` before accessing a connected source.

## Capabilities

| Capability | Used for | Floor when absent |
|-----------|----------|-------------------|
| `analytics.query` | Volume, funnel and retention shapes | Read instrumentation from code for what *could* be measured, then ask for current values |
| `analytics.events` | Which events exist, and their volume | Search the repository for analytics call sites |
| `db.query` | Revenue, account and subscription metrics | Read the schema from migrations, then ask for the numbers |
| `docs.search` | Recorded metrics, dashboards, analytics notes | Skip; mark the metric unavailable |
| `repo.read` | Instrumentation, data model, feature inventory | Skip when there is no codebase |
| `files.read` / `files.write` | The artifact itself | Always present |

Nothing here is required: a diagnosis with every value unavailable and a named question per gap is valid output.

## Procedure

For a definition or calculation, select the formula, validate the supplied inputs, compute only that metric, and explain undefined or missing inputs. The steps below apply when product-health analysis is requested; lifecycle work reads only the active context needed.

1. **Resolve capabilities and context.** Run the resolution protocol in `references/capability-map.md`; record what resolved. Establish product name, supplied/evidenced stage (not inferred from ARR or a PMF score), activation and retention events, and segment properties: supplied context first, `PRODUCT.md` for lifecycle or product-wide work, then ask only for material missing definitions. Never guess an activation event.
2. **Gather** only the query shapes that answer the business question. Without `analytics.query`, use supplied figures, relevant recorded metrics or a focused instrumentation check, and request only the missing values this diagnosis needs. Date every source; tag a value older than 30 days stale.
3. **Build the metric tree:** acquisition, activation, engagement, retention, business, under the north star or revenue. Every leaf carries its value and tag, or `unavailable` and the reason.
4. **Detect anomalies**, each with its number and tag, and the investigation that would resolve it:
   - Week-over-week change above 20% in either direction
   - A metric at zero or null that should not be
   - A mature retention curve still falling at a relevant age; investigate segment/definition/context without declaring PMF absent
   - Activation below 20%
   - Any value older than 30 days
5. **Score against the stage band** only where applicable, using the conditional heuristic table in `references/metric-definitions.md`. Prefer actual targets, comparable cohorts and the product's history; an unknown stage gets no guessed band. Show red, yellow or green beside the band used.
6. **Report.** A full diagnosis emits the applicable sections of the output contract and ends with `## DIAGNOSIS COMPLETE`; a narrow question keeps its requested format. For each unresolved capability, state which shape would close which gap and what it would answer, never a product to install.

## Common Mistakes

| Mistake | Prevention |
|---------|------------|
| Rounding an absence to zero | Unavailable is a value. Zero is a measurement |
| Comparing a retention curve to a band computed the other way | Record bounded or unbounded next to the curve |
| Revenue churn substituted for logo churn in customer LTV | State customer-lifetime model, use monthly logo churn and gross margin |
| ARPA averaged over subscriptions | Aggregate MRR per account, then divide by positive-MRR accounts |
