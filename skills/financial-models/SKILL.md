---
name: financial-models
description: "Use when calculating SaaS revenue metrics, building MRR waterfalls, modeling unit economics, or projecting financial scenarios"
---

# Financial Models

Reference for SaaS financial analysis: MRR decomposition, unit economics, SQL templates, and projection methods.

## Scope and resources

Follow `../../references/operating-modes.md`, resolved from this `SKILL.md`: A standalone metric question uses supplied context and the requested output destination; it does not initialize an initiative or require a full financial report. In lifecycle work, read only the active initiative artifacts relevant to the question. Run the numbered steps below that the request needs; omit unrelated analyses.

Load `evidence-ledger` when recording sourced claims, `references/capability-map.md` before accessing a data provider, and the relevant section of `saas-metrics-reference` when a definition needs clarification. Load [historical revenue SQL](references/revenue-sql.md) only when querying revenue. Its path resolves relative to this `SKILL.md`, not the user's working directory.

## Capabilities

| Capability | Used for | Floor when absent |
|-----------|----------|-------------------|
| `db.query` | The billing tables: subscriptions, invoices, customers | Read the schema from migrations or the ORM models, then ask for the figures |
| `analytics.query` | Revenue events, where billing is instrumented as events rather than rows | Skip; event-derived revenue is the weaker source anyway |
| `docs.search` | Recorded revenue: investor updates, monthly notes, board decks | Skip, and mark the figure unavailable |
| `repo.read` | Pricing configuration, plan tiers, billing integration code | Skip when there is no codebase |
| `files.read` / `files.write` | The artifact itself | Always present |

A revenue analysis from four user-provided numbers, each tagged, is a legitimate output. A revenue analysis from four numbers you chose is fraud dressed as a spreadsheet.

## Procedure

### 1. Resolve capabilities and find the revenue source

Run the resolution protocol from `references/capability-map.md`, then look for revenue in this order, using the supplied source when suitable and otherwise seeking the strongest applicable source:

1. **Billing tables** via `db.query`. List the tables, find the subscription and invoice entities, read the column types before writing any aggregate. A `plan_amount` in cents summed as if it were currency is the classic first error.
2. **Revenue events** via `analytics.query`, where subscription lifecycle is tracked as events. Weaker: events drift from billing reality, and the discrepancy is itself worth reporting.
3. **Recorded figures** via `docs.search`. Date every one and tag it stale beyond 30 days.
4. **The user.** Ask only for the missing figures needed for this question. Tag every value `[doc:user-{date}-{topic}]`.

Whatever resolved, name it in the artifact. A waterfall built on events and a waterfall built on invoices are different instruments and will disagree.

### 2. Build the MRR waterfall

Decompose the period into new, expansion, reactivation, contraction and churn, using the input contract and templates in `references/revenue-sql.md`. Require closed, complete historical snapshots, a continuous calendar with an opening month, normalized currency/units and true first-paid history. Present-day subscription status does not establish historical MRR. Without these inputs, report the missing history rather than inventing churn or classifying every activation as new. Reconcile: the components must sum to the ending figure. When they do not, the segmentation is wrong, and reporting the unreconciled version is worse than reporting no waterfall.

### 3. Compute unit economics

ARPA, churn (logo and revenue), LTV, CAC, LTV:CAC, CAC payback. Every derived figure names its inputs, because a LTV that rests on a user-provided churn rate inherits that uncertainty and must not be presented as measured.

### 4. Cohort revenue retention

The retention shape applied to revenue rather than actors. Net dollar retention above 100% means expansion is outrunning churn, and it is the single most informative number in the set for a B2B product.

### 5. Project

From an identified base, measured or explicitly user-provided. State assumptions and their sources, and run at least a low and a high case when projections are requested. A single-line projection off an assumed growth rate is a wish with decimal places.

### 6. Report

For a full report, use the output contract below; narrow requests keep their requested format and only applicable sections. Every figure tagged. Every gap named with the question that would close it.

## Output Contract

```markdown
## FINANCIAL ANALYSIS COMPLETE

**Product:** {name} · **Period:** {range}
**Revenue source:** {billing tables / revenue events / recorded / user-provided}
**Capabilities resolved:** {capability → concrete source, or "none: files only"}

### Metric and model invariants

`ARPA = total account MRR / positive-MRR accounts`. Zero denominators are undefined. A customer-lifetime LTV approximation uses monthly **logo churn**, with gross margin stated; revenue churn is a different metric. NDR names a fixed starting account set, dated window and its ending revenue, excluding new accounts outside that set.

The waterfall identity is `starting + new + expansion + reactivation - contraction - churn = ending`. Query templates and their historical-input contract live in `references/revenue-sql.md`. Load [financial formulas and models](references/revenue-models.md) only for the requested formula, projection or heuristic comparison; it resolves relative to this `SKILL.md`. Never project annual NDR as monthly expansion or subtract churn twice.

## Common Mistakes

| Mistake | Correction |
|---------|------------|
| Reconstructing history from current `status` | Require historical snapshots or report unavailable history |
| Missing month interpreted as churn | Certify complete closed calendar periods first |
| First observed activation called new | Verify true first-paid period and separate reactivation |
| Averaging subscriptions for ARPA | Sum MRR per account, then divide by positive-MRR accounts |
| Monthly component assumptions mixed with annual NDR | State the time unit and use one reconciled projection model |
| Full report for a single ARPA question | Answer the requested metric with definition, inputs and limitation |

**Narrow example:** Supplied account A has 100+50 MRR and B has 200. Return ARPA = 175 with the supplied-source tag and definition; do not query unrelated sources or initialize lifecycle state.
