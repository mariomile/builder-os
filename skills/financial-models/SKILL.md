---
name: financial-models
description: "Use when calculating SaaS revenue metrics, building MRR waterfalls, modeling unit economics, or projecting financial scenarios"
---

# Financial Models

Reference for SaaS financial analysis: MRR decomposition, unit economics, SQL templates, and projection methods.

**REQUIRED BACKGROUND:** `evidence-ledger` for tagging. `references/capability-map.md` before touching any data source. `saas-metrics-reference` for the metric definitions these models compute.

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

Run the resolution protocol from `references/capability-map.md`, then look for revenue in this order, taking the first that resolves:

1. **Billing tables** via `db.query`. List the tables, find the subscription and invoice entities, read the column types before writing any aggregate. A `plan_amount` in cents summed as if it were currency is the classic first error.
2. **Revenue events** via `analytics.query`, where subscription lifecycle is tracked as events. Weaker: events drift from billing reality, and the discrepancy is itself worth reporting.
3. **Recorded figures** via `docs.search`. Date every one and tag it stale beyond 30 days.
4. **The user.** Ask for current MRR, active accounts, monthly churn and ARPA. Tag every value `[doc:user-{date}-{topic}]`.

Whatever resolved, name it in the artifact. A waterfall built on events and a waterfall built on invoices are different instruments and will disagree.

### 2. Build the MRR waterfall

Decompose the period into new, expansion, reactivation, contraction and churn, using the SQL templates below against whatever the billing schema actually looks like. Reconcile: the components must sum to the ending figure. When they do not, the segmentation is wrong, and reporting the unreconciled version is worse than reporting no waterfall.

### 3. Compute unit economics

ARPA, churn (logo and revenue), LTV, CAC, LTV:CAC, CAC payback. Every derived figure names its inputs, because a LTV that rests on a user-provided churn rate inherits that uncertainty and must not be presented as measured.

### 4. Cohort revenue retention

The retention shape applied to revenue rather than actors. Net dollar retention above 100% means expansion is outrunning churn, and it is the single most informative number in the set for a B2B product.

### 5. Project

Only from a measured base. State the growth assumption, its source, and run at least a low and a high case. A single-line projection off an assumed growth rate is a wish with decimal places.

### 6. Report

Emit the output contract. Every figure tagged. Every gap named with the question that would close it.

## Output Contract

```markdown
## FINANCIAL ANALYSIS COMPLETE

**Product:** {name} · **Period:** {range}
**Revenue source:** {billing tables / revenue events / recorded / user-provided}
**Capabilities resolved:** {capability → concrete source, or "none: files only"}

### MRR Waterfall
{starting, new, expansion, reactivation, contraction, churn, ending, reconciled}

### Unit Economics
{each metric with its inputs and tags}

### Cohort Revenue Retention
{the triangle, with NDR}

### Projection
{low and high case, with the assumption and its source stated}

### Key Findings
{each with its numbers and tags}
```

## MRR Waterfall

```
Ending MRR = Starting MRR + New + Expansion + Reactivation - Contraction - Churn
```

| Component | Definition | Source |
|-----------|-----------|--------|
| **New MRR** | Revenue from first-time customers | First subscription record |
| **Expansion MRR** | Revenue increase from existing customers | plan_amount increased |
| **Reactivation MRR** | Revenue from returning churned customers | Previous churn → new active |
| **Contraction MRR** | Revenue decrease from existing customers | plan_amount decreased |
| **Churn MRR** | Revenue lost from cancellations | Active → cancelled/expired |

## Unit Economics Formulas

```
ARPA = Total MRR / Active Accounts
Monthly Logo Churn = Churned Accounts / Starting Accounts
Monthly Revenue Churn = Churn MRR / Starting MRR
Gross Churn = (Contraction + Churn MRR) / Starting MRR
NDR = (Starting + Expansion - Contraction - Churn) / Starting MRR × 100%
LTV = ARPA / Monthly Revenue Churn Rate
LTV (margin-adjusted) = ARPA × Gross Margin / Monthly Revenue Churn Rate
CAC = Sales & Marketing Spend / New Customers Acquired
LTV:CAC = LTV / CAC
CAC Payback (months) = CAC / (ARPA × Gross Margin)
Quick Ratio = (New + Expansion) / (Contraction + Churn)
Burn Multiple = Net Burn / Net New ARR
Rule of 40 = Revenue Growth Rate (%) + Profit Margin (%)
```

## SQL Templates

These are ANSI-ish SQL against a Stripe-shaped billing schema: a `subscriptions` table with `customer_id`, `plan_amount`, `status` and `period_start`. Read the real schema first and adapt; the shape of the decomposition is what transfers, not the column names. Run them through whatever provides `db.query`.

### MRR Waterfall

```sql
WITH monthly_mrr AS (
  SELECT
    date_trunc('month', period_start)::date AS period,
    customer_id,
    SUM(plan_amount) AS mrr
  FROM {billing_table}
  WHERE status = 'active'
  GROUP BY 1, 2
),
waterfall AS (
  SELECT
    c.period,
    c.customer_id,
    c.mrr AS current_mrr,
    p.mrr AS previous_mrr,
    CASE
      WHEN p.customer_id IS NULL AND c.customer_id IS NOT NULL THEN 'new'
      WHEN c.mrr > COALESCE(p.mrr, 0) THEN 'expansion'
      WHEN c.mrr < p.mrr THEN 'contraction'
      WHEN c.customer_id IS NULL AND p.customer_id IS NOT NULL THEN 'churn'
      ELSE 'retained'
    END AS movement_type
  FROM monthly_mrr c
  FULL OUTER JOIN monthly_mrr p
    ON c.customer_id = p.customer_id
    AND c.period = p.period + INTERVAL '1 month'
)
SELECT
  period,
  SUM(CASE WHEN movement_type = 'new' THEN current_mrr ELSE 0 END) AS new_mrr,
  SUM(CASE WHEN movement_type = 'expansion' THEN current_mrr - previous_mrr ELSE 0 END) AS expansion_mrr,
  SUM(CASE WHEN movement_type = 'contraction' THEN previous_mrr - current_mrr ELSE 0 END) AS contraction_mrr,
  SUM(CASE WHEN movement_type = 'churn' THEN previous_mrr ELSE 0 END) AS churn_mrr,
  SUM(COALESCE(current_mrr, 0)) AS ending_mrr
FROM waterfall
GROUP BY period
ORDER BY period;
```

This template has no reactivation branch: a returning churned customer lands in `new`. Where reactivation matters, split it by checking for a prior active period, and say which variant produced the numbers.

### Cohort Revenue Retention

```sql
WITH customer_cohort AS (
  SELECT
    customer_id,
    date_trunc('month', MIN(period_start))::date AS cohort_month
  FROM {billing_table}
  WHERE status = 'active'
  GROUP BY customer_id
),
cohort_revenue AS (
  SELECT
    cc.cohort_month,
    EXTRACT(MONTH FROM AGE(date_trunc('month', s.period_start), cc.cohort_month))::int AS month_number,
    SUM(s.plan_amount) AS total_mrr,
    COUNT(DISTINCT s.customer_id) AS active_accounts
  FROM {billing_table} s
  JOIN customer_cohort cc ON s.customer_id = cc.customer_id
  WHERE s.status = 'active'
  GROUP BY 1, 2
)
SELECT
  cohort_month,
  month_number,
  total_mrr,
  active_accounts,
  total_mrr / NULLIF(FIRST_VALUE(total_mrr) OVER (PARTITION BY cohort_month ORDER BY month_number), 0) AS mrr_retention
FROM cohort_revenue
WHERE month_number <= 12
ORDER BY cohort_month, month_number;
```

### Current MRR and Account Count

```sql
SELECT
  COUNT(DISTINCT customer_id) AS active_accounts,
  SUM(plan_amount) AS total_mrr,
  AVG(plan_amount) AS arpa
FROM subscriptions
WHERE status = 'active';
```

### MRR by Plan

```sql
SELECT
  plan_name,
  COUNT(DISTINCT customer_id) AS accounts,
  SUM(plan_amount) AS mrr,
  AVG(plan_amount) AS arpa
FROM subscriptions
WHERE status = 'active'
GROUP BY plan_name
ORDER BY mrr DESC;
```

### Monthly Churn Rate

```sql
WITH monthly AS (
  SELECT
    date_trunc('month', period_start)::date AS month,
    customer_id,
    plan_amount
  FROM subscriptions
  WHERE status IN ('active', 'cancelled')
)
SELECT
  m2.month,
  COUNT(DISTINCT CASE WHEN m1.customer_id IS NOT NULL AND m2.customer_id IS NULL THEN m1.customer_id END) AS churned_accounts,
  COUNT(DISTINCT m1.customer_id) AS starting_accounts,
  ROUND(
    COUNT(DISTINCT CASE WHEN m1.customer_id IS NOT NULL AND m2.customer_id IS NULL THEN m1.customer_id END)::numeric
    / NULLIF(COUNT(DISTINCT m1.customer_id), 0) * 100, 2
  ) AS churn_rate_pct
FROM monthly m1
FULL OUTER JOIN monthly m2
  ON m1.customer_id = m2.customer_id
  AND m2.month = m1.month + INTERVAL '1 month'
WHERE m1.month >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY m2.month
ORDER BY m2.month;
```

## Projection Method

### Simple Growth Model

```
Month N+1 MRR = Month N MRR
  × (1 − observed monthly revenue churn)
  + projected new MRR      (trailing 3-month average)
  + projected expansion    (from observed NDR above 100%)
```

Six months forward, three cases: base, optimistic (NDR +5pp) and pessimistic (NDR −5pp). The spread is the honest part of the output.

```
MRR(t+1) = MRR(t) × (1 - monthly_churn) + new_mrr + expansion_mrr

Where:
- monthly_churn: average of last 3 months
- new_mrr: average of last 3 months (or growing at observed rate)
- expansion_mrr: (NDR - 1) × MRR(t) / 12
```

### Scenario Modeling

| Scenario | Churn Adjustment | New MRR Adjustment |
|----------|-----------------|-------------------|
| Pessimistic | +2pp churn | -20% new MRR |
| Base | Current rates | Current rates |
| Optimistic | -1pp churn | +20% new MRR |

## Benchmarks by Stage

| Metric | Seed | Series A | Growth |
|--------|------|----------|--------|
| Monthly logo churn | <8% | <5% | <3% |
| NDR | >90% | >100% | >110% |
| LTV:CAC | >2x | >3x | >4x |
| CAC Payback | <24mo | <18mo | <12mo |
| Quick Ratio | >1.5 | >2 | >4 |
| Burn Multiple | <3x | <2x | <1.5x |
| Rule of 40 | N/A | >20 | >40 |
