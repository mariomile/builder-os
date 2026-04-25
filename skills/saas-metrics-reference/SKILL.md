---
name: saas-metrics-reference
description: "Use when you need SaaS metric definitions, formulas, benchmarks, or the mapping between metrics and MCP queries"
---

# SaaS Metrics Reference

Quick-reference for key SaaS metrics with formulas, benchmarks by stage, and how to compute each from MCP data sources.

**REQUIRED BACKGROUND:** For comprehensive analytics methodology (12 parts), load `b2b-saas-analytics`.

## Core Metrics

### Acquisition

| Metric | Formula | MCP Query |
|--------|---------|-----------|
| Signups/week | Count of signup events per week | `Run-Query(insights, signup_event, total, 30d, week)` |
| Signup trend | WoW % change in signups | Calculate from weekly signup query |
| Signup-to-activation rate | Activated / Signed up (within window) | `Run-Query(funnels, [signup, activation], window)` |

### Activation

| Metric | Formula | MCP Query |
|--------|---------|-----------|
| Activation rate | Users who reached aha moment / Total signups | `Run-Query(funnels, [signup, activation_event], conversion_window)` |
| Time to activate | Median time from signup to activation event | `Run-Query(funnels, time_to_convert)` |
| Setup completion | Users who completed onboarding / Total signups | `Run-Query(funnels, [signup, onboarding_complete])` |

### Engagement

| Metric | Formula | MCP Query |
|--------|---------|-----------|
| DAU | Unique users performing core action in a day | `Run-Query(insights, core_event, unique, 1d)` |
| WAU | Unique users in 7 days | `Run-Query(insights, core_event, unique, 7d)` |
| MAU | Unique users in 30 days | `Run-Query(insights, core_event, unique, 30d)` |
| Stickiness (DAU/MAU) | DAU / MAU | Calculate from above |
| Feature adoption | Unique users per feature / Total active users | `Run-Query(insights, [feature_events], unique, 30d)` |

### Retention

| Metric | Formula | MCP Query |
|--------|---------|-----------|
| Week N retention | Users active in week N / Users in cohort | `Run-Query(retention, born=signup, return=core, weekly)` |
| Dollar retention (NDR) | (Starting MRR + Expansion - Contraction - Churn) / Starting MRR | Supabase: `execute_sql` on billing tables |
| Logo churn rate | Churned accounts / Starting accounts per period | Supabase: `execute_sql` on subscription tables |

### Revenue

| Metric | Formula | MCP Query |
|--------|---------|-----------|
| MRR | Sum of monthly recurring revenue | Supabase: `SELECT SUM(mrr) FROM subscriptions WHERE status='active'` |
| ARR | MRR * 12 | Calculate from MRR |
| ARPA | MRR / Active accounts | Calculate |
| LTV | ARPA / Monthly churn rate | Calculate |
| CAC | Total sales+marketing spend / New customers | Manual input or Supabase |
| LTV:CAC ratio | LTV / CAC | Calculate (target: >3x) |
| CAC Payback | CAC / (ARPA * Gross margin) | Calculate (target: <18 months) |
| Quick Ratio | (New MRR + Expansion MRR) / (Contraction MRR + Churn MRR) | Supabase MRR waterfall query |
| Burn Multiple | Net burn / Net new ARR | Manual input |

## MRR Waterfall Components

```
Ending MRR = Starting MRR
  + New MRR         (from new customers)
  + Expansion MRR   (upgrades, add-ons)
  + Reactivation MRR (returning churned customers)
  - Contraction MRR (downgrades)
  - Churn MRR       (cancellations)
```

### SQL Template (Stripe-style billing)

```sql
-- MRR Waterfall for a given month
WITH current_month AS (
  SELECT customer_id, plan_amount AS mrr
  FROM subscriptions
  WHERE status = 'active' AND period = '{current_month}'
),
previous_month AS (
  SELECT customer_id, plan_amount AS mrr
  FROM subscriptions
  WHERE status = 'active' AND period = '{previous_month}'
)
SELECT
  SUM(CASE WHEN c.customer_id IS NOT NULL AND p.customer_id IS NULL THEN c.mrr ELSE 0 END) AS new_mrr,
  SUM(CASE WHEN c.mrr > p.mrr THEN c.mrr - p.mrr ELSE 0 END) AS expansion_mrr,
  SUM(CASE WHEN c.mrr < p.mrr AND c.customer_id IS NOT NULL THEN p.mrr - c.mrr ELSE 0 END) AS contraction_mrr,
  SUM(CASE WHEN p.customer_id IS NOT NULL AND c.customer_id IS NULL THEN p.mrr ELSE 0 END) AS churn_mrr
FROM previous_month p
FULL OUTER JOIN current_month c ON p.customer_id = c.customer_id;
```

## Benchmarks by Stage

### Seed (Pre-PMF, <$100K ARR)

| Metric | Poor | Okay | Good |
|--------|------|------|------|
| Activation rate | <15% | 15-30% | >30% |
| Week 1 retention | <20% | 20-40% | >40% |
| Week 4 retention | <5% | 5-15% | >15% |
| DAU/MAU | <5% | 5-15% | >15% |
| MoM growth | <5% | 5-15% | >15% |

### Series A ($100K-$1M ARR)

| Metric | Poor | Okay | Good |
|--------|------|------|------|
| Activation rate | <25% | 25-40% | >40% |
| Week 1 retention | <30% | 30-50% | >50% |
| Week 4 retention | <10% | 10-25% | >25% |
| DAU/MAU | <10% | 10-20% | >20% |
| NDR | <90% | 90-110% | >110% |
| MoM growth | <10% | 10-20% | >20% |
| Quick Ratio | <1 | 1-2 | >2 |

### Growth ($1M-$10M ARR)

| Metric | Poor | Okay | Good |
|--------|------|------|------|
| Activation rate | <35% | 35-50% | >50% |
| Week 1 retention | <40% | 40-60% | >60% |
| Week 4 retention | <15% | 15-30% | >30% |
| DAU/MAU | <15% | 15-25% | >25% |
| NDR | <100% | 100-120% | >120% |
| LTV:CAC | <2x | 2-4x | >4x |
| CAC Payback | >24mo | 12-24mo | <12mo |
| Quick Ratio | <2 | 2-4 | >4 |
