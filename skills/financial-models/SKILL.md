---
name: financial-models
description: "Use when calculating SaaS revenue metrics, building MRR waterfalls, modeling unit economics, or projecting financial scenarios"
---

# Financial Models

## Scope and resources

Follow `../../references/operating-modes.md`, resolved from this `SKILL.md`. A standalone metric question does not require a full financial report. In lifecycle work, read only the active initiative artifacts relevant to the question. Run only the numbered steps the request needs.

Load `evidence-ledger` when recording sourced claims, `references/capability-map.md` before accessing a data provider, and the relevant section of `saas-metrics-reference` when a definition needs clarification. Load [historical revenue SQL](references/revenue-sql.md) only when querying revenue, and [financial formulas and models](references/revenue-models.md) only for the requested formula, projection, heuristic comparison or the full-report output contract.

## Capabilities

| Capability | Used for | Floor when absent |
|-----------|----------|-------------------|
| `db.query` | The billing tables: subscriptions, invoices, customers | Read the schema from migrations or the ORM models, then ask for the figures |
| `analytics.query` | Revenue events, where billing is instrumented as events rather than rows | Skip; event-derived revenue is the weaker source anyway |
| `docs.search` | Recorded revenue: investor updates, monthly notes, board decks | Skip, and mark the figure unavailable |
| `repo.read` | Pricing configuration, plan tiers, billing integration code | Skip when there is no codebase |
| `files.read` / `files.write` | The artifact itself | Always present |

Four user-provided numbers, each tagged, make a legitimate analysis; four numbers you chose make fraud dressed as a spreadsheet.

## Procedure

1. **Find the revenue source.** Use the supplied source when suitable; otherwise seek the strongest applicable source in this order:
   1. **Billing tables** via `db.query`. Find the subscription and invoice entities and read column types before any aggregate (cents summed as currency is the classic first error).
   2. **Revenue events** via `analytics.query`. Weaker: events drift from billing; report the discrepancy.
   3. **Recorded figures** via `docs.search`. Date every one and tag it stale beyond 30 days.
   4. **The user.** Ask only for the missing figures this question needs. Tag every value `[doc:user-{date}-{topic}]`.

   Name whichever resolved in the artifact; event and invoice waterfalls are different instruments and will disagree.

2. **Build the MRR waterfall.** New, expansion, reactivation, contraction and churn, per the SQL reference's input contract and templates. Require closed, complete historical snapshots, a continuous calendar with an opening month, normalized currency/units and true first-paid history. Present-day subscription status does not establish historical MRR, a missing month is not churn, and a first observed activation is not necessarily new. Without these inputs, report the missing history. Reconcile: the components must sum to the ending figure; an unreconciled waterfall is worse than none.

3. **Compute unit economics.** ARPA, churn (logo and revenue), LTV, CAC, LTV:CAC, CAC payback. Every derived figure names its inputs; a LTV resting on a user-provided churn rate inherits that uncertainty and is not presented as measured.

4. **Cohort revenue retention.** The retention shape applied to revenue rather than actors. NDR above 100% means expansion outruns churn: the most informative number for a B2B product.

5. **Project.** From an identified base, measured or explicitly user-provided. State assumptions and their sources, and run at least a low and a high case. A single-line projection off an assumed growth rate is a wish with decimal places.

6. **Report.** A full report uses the output contract in the formulas reference (`## FINANCIAL ANALYSIS COMPLETE`); narrow requests keep their requested format and only applicable sections. Every figure tagged; every gap named with the question that would close it.

## Metric and model invariants

`ARPA = total account MRR / positive-MRR accounts`. Zero denominators are undefined. A customer-lifetime LTV approximation uses monthly **logo churn**, with gross margin stated; revenue churn is a different metric. NDR names a fixed starting account set, dated window and its ending revenue, excluding new accounts outside that set.

The waterfall identity is `starting + new + expansion + reactivation - contraction - churn = ending`. Never project annual NDR as monthly expansion or subtract churn twice; state the time unit and use one reconciled projection model.

**Narrow example:** Supplied account A has 100+50 MRR and B has 200. Return ARPA = 175 with the supplied-source tag and definition; do not query unrelated sources or initialize lifecycle state.

## Common Mistakes

| Mistake | Correction |
|---------|------------|
| Reconstructing history from current `status` | Require historical snapshots or report unavailable history |
| Averaging subscriptions for ARPA | Sum MRR per account, then divide by positive-MRR accounts |
