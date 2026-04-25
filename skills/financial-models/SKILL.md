---
name: financial-models
description: "Use when calculating SaaS revenue metrics, building MRR waterfalls, modeling unit economics, or projecting financial scenarios"
---

# Financial Models

Reference for SaaS financial analysis: MRR decomposition, unit economics, SQL templates, and projection methods.

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
