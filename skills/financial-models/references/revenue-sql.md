# Historical Revenue SQL

Load this reference only for a revenue query. Paths are relative to this reference's owning `SKILL.md`; shared BuilderOS resources resolve from the supplied installation root. These are PostgreSQL query templates, validated on synthetic fixtures in DuckDB; they are not a certification of a customer's PostgreSQL integration. Read the real schema and adapt the input relations, not the metric definitions.

## Required input contract

- `monthly_revenue_snapshots(period DATE, customer_id, plan_name, mrr NUMERIC)`: Historical end-of-month recurring revenue, one nonnegative MRR contribution per subscription/plan (no duplicated invoice rows), in a single named currency and unit. Periods are first-of-month dates. Annual plans are divided by 12 before entering this relation. Exclude taxes, one-off charges, trials/free accounts; document discounts and FX policy. Present-day subscription status cannot reconstruct this history.
- `revenue_calendar(period DATE, is_closed BOOLEAN, is_complete BOOLEAN)`: Exactly one row for every consecutive month of the observation window, including months with zero revenue. Completeness is a source assertion: an absent customer row means zero revenue only in a certified complete snapshot. Open/missing/incomplete months are unavailable, never synthesized as churn. Validate continuity and completeness for the entire requested range before executing any template.
- `customer_revenue_history(customer_id, first_paid_period DATE)`: Exactly one row per customer with their true first positive-MRR month, including history before the snapshot window. Every snapshot customer must have a history row. Without full first-paid history, classify zero-to-positive MRR as **unclassified activation**, not new/reactivation, and do not run the classified waterfall.
- Bind `{report_start}` and `{report_end}` to explicit first-of-month dates in chronological order. Waterfall/churn require a complete closed opening snapshot one month before `report_start`. Never append an unobserved month after `report_end`. The month of first observed data is not an opening balance of zero unless certified as such.
- For cohort retention also require every member's first-paid snapshot for the denominator; validate that its MRR is positive and that the first-paid mapping is complete. Otherwise mark that cohort unavailable. Cohorts span all years using total elapsed months; 0–12 means inception plus twelve later months. A reactivation retains its original cohort.

Validate duplicate calendar/history keys, nonnegative amounts, non-NULL IDs/amounts/dates, contiguous periods, all history mappings and opening/baseline coverage before running. Bind dates through the data provider rather than interpolating user text. Save the adapted SQL and query window with the source tag. The templates do not invent the input relations or certify completeness.

## MRR Waterfall

Churn/contraction are positive losses. New and reactivated revenue are separate. Reconcile each row: `starting + new + expansion + reactivation - contraction - churn = ending`. Empty account populations still yield zero-revenue calendar rows.

```sql
WITH params AS (
  SELECT DATE '{report_start}' AS report_start, DATE '{report_end}' AS report_end
),
calendar AS (
  -- Calendar rows certify complete, closed months; validate continuity before running.
  SELECT c.period
  FROM revenue_calendar c CROSS JOIN params p
  WHERE c.is_closed AND c.is_complete
    AND c.period BETWEEN p.report_start - INTERVAL '1 month' AND p.report_end
),
account_mrr AS (
  -- Snapshot input is already normalized to monthly recurring revenue in one currency.
  SELECT period, customer_id, SUM(mrr) AS mrr
  FROM monthly_revenue_snapshots
  GROUP BY period, customer_id
),
accounts AS (
  SELECT customer_id, first_paid_period FROM customer_revenue_history
),
account_months AS (
  -- Missing revenue is zero ONLY because the calendar certifies complete snapshots.
  SELECT c.period, a.customer_id, a.first_paid_period, COALESCE(m.mrr, 0) AS mrr
  FROM calendar c CROSS JOIN accounts a
  LEFT JOIN account_mrr m ON m.period = c.period AND m.customer_id = a.customer_id
),
movements AS (
  SELECT c.period, c.customer_id, c.first_paid_period,
         c.mrr AS current_mrr, p.mrr AS previous_mrr
  FROM account_months c
  JOIN account_months p ON p.customer_id = c.customer_id
    AND p.period = c.period - INTERVAL '1 month'
  CROSS JOIN params r
  WHERE c.period BETWEEN r.report_start AND r.report_end
)
SELECT c.period,
  COALESCE(SUM(previous_mrr), 0) AS starting_mrr,
  SUM(CASE WHEN previous_mrr = 0 AND current_mrr > 0 AND first_paid_period = c.period
           THEN current_mrr ELSE 0 END) AS new_mrr,
  SUM(CASE WHEN previous_mrr = 0 AND current_mrr > 0 AND first_paid_period < c.period
           THEN current_mrr ELSE 0 END) AS reactivation_mrr,
  SUM(CASE WHEN previous_mrr > 0 AND current_mrr > previous_mrr
           THEN current_mrr - previous_mrr ELSE 0 END) AS expansion_mrr,
  SUM(CASE WHEN current_mrr > 0 AND current_mrr < previous_mrr
           THEN previous_mrr - current_mrr ELSE 0 END) AS contraction_mrr,
  SUM(CASE WHEN previous_mrr > 0 AND current_mrr = 0 THEN previous_mrr ELSE 0 END) AS churn_mrr,
  COALESCE(SUM(current_mrr), 0) AS ending_mrr
FROM calendar c CROSS JOIN params r
LEFT JOIN movements m ON m.period = c.period
WHERE c.period BETWEEN r.report_start AND r.report_end
GROUP BY c.period
ORDER BY c.period;
```

## Cohort Revenue Retention

Uses inception MRR, not the first month in a cropped report, as the denominator. Includes zero-revenue observed cohort periods, excludes unobserved future periods. `mrr_retention` is a ratio (1.0 = 100%), not an annual growth assumption.

```sql
WITH params AS (
  SELECT DATE '{report_start}' AS report_start, DATE '{report_end}' AS report_end
),
account_mrr AS (
  SELECT period, customer_id, SUM(mrr) AS mrr
  FROM monthly_revenue_snapshots
  GROUP BY period, customer_id
),
cohort_baseline AS (
  -- Require every member's inception snapshot; incomplete historical cohorts are unavailable.
  SELECT h.first_paid_period AS cohort_month, COUNT(*) AS cohort_accounts, SUM(m.mrr) AS initial_mrr
  FROM customer_revenue_history h
  JOIN account_mrr m ON m.customer_id = h.customer_id AND m.period = h.first_paid_period
  GROUP BY h.first_paid_period
),
cohort_revenue AS (
  SELECT h.first_paid_period AS cohort_month, c.period,
    CAST((EXTRACT(YEAR FROM c.period) - EXTRACT(YEAR FROM h.first_paid_period)) * 12
      + EXTRACT(MONTH FROM c.period) - EXTRACT(MONTH FROM h.first_paid_period) AS INTEGER) AS month_number,
    SUM(COALESCE(m.mrr, 0)) AS total_mrr,
    COUNT(CASE WHEN m.mrr > 0 THEN h.customer_id END) AS active_accounts
  FROM revenue_calendar c CROSS JOIN customer_revenue_history h CROSS JOIN params p
  LEFT JOIN account_mrr m ON m.period = c.period AND m.customer_id = h.customer_id
  WHERE c.is_closed AND c.is_complete
    AND c.period BETWEEN p.report_start AND p.report_end
    AND h.first_paid_period <= c.period
  GROUP BY h.first_paid_period, c.period
)
SELECT c.cohort_month, c.period, c.month_number, b.cohort_accounts,
       c.total_mrr, c.active_accounts, c.total_mrr / NULLIF(b.initial_mrr, 0) AS mrr_retention
FROM cohort_revenue c JOIN cohort_baseline b ON b.cohort_month = c.cohort_month
WHERE c.month_number BETWEEN 0 AND 12
ORDER BY c.cohort_month, c.month_number;
```

## Period MRR and Account Count

ARPA divides revenue by distinct positive-MRR accounts after aggregating subscriptions. Zero active accounts return zero MRR and NULL ARPA, which means undefined.

```sql
WITH account_mrr AS (
  SELECT s.customer_id, SUM(s.mrr) AS mrr
  FROM monthly_revenue_snapshots s
  JOIN revenue_calendar c ON c.period = s.period AND c.is_closed AND c.is_complete
  WHERE s.period = DATE '{report_end}'
  GROUP BY s.customer_id
)
SELECT COUNT(CASE WHEN mrr > 0 THEN customer_id END) AS active_accounts,
       COALESCE(SUM(mrr), 0) AS total_mrr,
       SUM(mrr) / NULLIF(COUNT(CASE WHEN mrr > 0 THEN customer_id END), 0) AS arpa
FROM account_mrr;
```

## MRR by Plan

An account with multiple plans may contribute to several plan groups; group counts are not additive. Each group's ARPA uses accounts, not subscription rows.

```sql
WITH account_plan_mrr AS (
  SELECT s.plan_name, s.customer_id, SUM(s.mrr) AS mrr
  FROM monthly_revenue_snapshots s
  JOIN revenue_calendar c ON c.period = s.period AND c.is_closed AND c.is_complete
  WHERE s.period = DATE '{report_end}'
  GROUP BY s.plan_name, s.customer_id
)
SELECT plan_name, COUNT(CASE WHEN mrr > 0 THEN customer_id END) AS accounts,
       SUM(mrr) AS mrr,
       SUM(mrr) / NULLIF(COUNT(CASE WHEN mrr > 0 THEN customer_id END), 0) AS arpa
FROM account_plan_mrr
GROUP BY plan_name
ORDER BY mrr DESC;
```

## Monthly Churn Rate

The denominator is the previous complete month's positive-MRR accounts. Churn is their loss in the current observed month; new/reactivated customers never enter that month's starting denominator. Zero starting accounts return NULL churn rate.

```sql
WITH params AS (
  SELECT DATE '{report_start}' AS report_start, DATE '{report_end}' AS report_end
),
calendar AS (
  -- Calendar rows certify complete, closed months; validate continuity before running.
  SELECT c.period
  FROM revenue_calendar c CROSS JOIN params p
  WHERE c.is_closed AND c.is_complete
    AND c.period BETWEEN p.report_start - INTERVAL '1 month' AND p.report_end
),
account_mrr AS (
  -- Snapshot input is already normalized to monthly recurring revenue in one currency.
  SELECT period, customer_id, SUM(mrr) AS mrr
  FROM monthly_revenue_snapshots
  GROUP BY period, customer_id
),
accounts AS (
  SELECT customer_id, first_paid_period FROM customer_revenue_history
),
account_months AS (
  -- Missing revenue is zero ONLY because the calendar certifies complete snapshots.
  SELECT c.period, a.customer_id, a.first_paid_period, COALESCE(m.mrr, 0) AS mrr
  FROM calendar c CROSS JOIN accounts a
  LEFT JOIN account_mrr m ON m.period = c.period AND m.customer_id = a.customer_id
),
movements AS (
  SELECT c.period, c.customer_id, c.first_paid_period,
         c.mrr AS current_mrr, p.mrr AS previous_mrr
  FROM account_months c
  JOIN account_months p ON p.customer_id = c.customer_id
    AND p.period = c.period - INTERVAL '1 month'
  CROSS JOIN params r
  WHERE c.period BETWEEN r.report_start AND r.report_end
)
SELECT c.period,
  COUNT(CASE WHEN previous_mrr > 0 THEN customer_id END) AS starting_accounts,
  COUNT(CASE WHEN previous_mrr > 0 AND current_mrr = 0 THEN customer_id END) AS churned_accounts,
  100.0 * COUNT(CASE WHEN previous_mrr > 0 AND current_mrr = 0 THEN customer_id END)
    / NULLIF(COUNT(CASE WHEN previous_mrr > 0 THEN customer_id END), 0) AS churn_rate_pct
FROM calendar c CROSS JOIN params r
LEFT JOIN movements m ON m.period = c.period
WHERE c.period BETWEEN r.report_start AND r.report_end
GROUP BY c.period
ORDER BY c.period;
```

## Regression examples

Two accounts at 100 MRR in July, only one left in August: August starting MRR 200, churn 100, ending 100, logo churn 1/2 = 50%; no September churn without a closed September snapshot. A returning customer first paid in May is reactivated, not new. January 2025 to February 2026 is month 13 and is excluded from the 0–12 cohort view. Account A at 100+50 and B at 200 produces ARPA 350/2 = 175.

Run the exact reference queries and committed fixtures with `uv run --with duckdb python tests/analytics/revenue-sql.py`. This is an optional development check, with no runtime dependency added to BuilderOS. It validates query arithmetic in DuckDB, not production ingestion or PostgreSQL dialect compatibility.
