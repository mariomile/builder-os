# Financial Formulas and Models

Read only the relevant metric, projection, heuristic or output-contract section. This resource resolves relative to its owning `SKILL.md`; sibling SQL is in `revenue-sql.md`.

## Output Contract

For a full report. Narrow requests keep their requested format and only applicable sections.

```markdown
## FINANCIAL ANALYSIS COMPLETE

**Product:** {name} · **Period:** {range}
**Revenue source:** {billing tables / revenue events / recorded / user-provided}
**Capabilities resolved:** {capability → concrete source, or "none: files only"}

## MRR Waterfall
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
| **New MRR** | First positive recurring revenue from a customer | Complete first-paid history plus snapshots |
| **Expansion MRR** | Positive account-level MRR increase among continuing paid customers | Normalized historical account snapshots |
| **Reactivation MRR** | Revenue from returning churned customers | Previous churn → new active |
| **Contraction MRR** | Account-level MRR decrease while remaining paid | Normalized historical account snapshots |
| **Churn MRR** | Starting positive MRR lost when account MRR reaches zero | Complete adjacent closed-month snapshots |

## Unit Economics Formulas

```
ARPA = Total MRR / Active Accounts
Monthly Logo Churn = Churned Accounts / Starting Accounts
Monthly Revenue Churn = Churn MRR / Starting MRR
Gross Churn = (Contraction + Churn MRR) / Starting MRR
NDR = (Starting + Expansion - Contraction - Churn) / Starting MRR × 100%
Simple customer LTV = ARPA / Monthly Logo Churn Rate
Simple margin-adjusted LTV = ARPA × Gross Margin / Monthly Logo Churn Rate
CAC = Sales & Marketing Spend / New Customers Acquired
LTV:CAC = Margin-adjusted LTV / CAC
CAC Payback (months) = CAC / (ARPA × Gross Margin)
Quick Ratio = (New + Expansion + Reactivation) / (Contraction + Churn)
Burn Multiple = Net Burn / Net New ARR
Rule of 40 = Revenue Growth Rate (%) + Profit Margin (%)
```

The simple LTV model assumes constant ARPA, margin and independent monthly logo churn; it is an approximation, not cohort lifetime value. Rates are fractions, not percentages. Zero denominators produce undefined ratios, never zero or an invented finite LTV. NDR tracks only the starting customer set; reactivation enters NDR only when the customer belongs to that starting set under the stated period definition.

## SQL Templates

Read the sibling `revenue-sql.md` only when needed. It contains account-level waterfall (including reactivation), cohort revenue retention with full-year month offsets, period ARPA, plan ARPA, and logo churn queries. Validate the input contract before running; the regression fixtures execute these exact query blocks. A missing/open month is unavailable, not a zero-revenue snapshot.

## Projection Method

### Component Growth Model

```
MRR(t+1) = MRR(t) + new_mrr + expansion_mrr + reactivation_mrr
           - contraction_mrr - churn_mrr
```

Use measured monthly movements (for example, a trailing three-closed-month average), with segment and currency consistent across inputs. An alternative uses monthly rates multiplied by starting MRR for expansion, contraction and churn, while new/reactivation remain separate additions. Never subtract churn again from an NDR assumption that already includes churn. Annual retention must be converted to a stated monthly model; dividing `(annual NDR - 1)` by 12 and calling that expansion is invalid.

Project the requested horizon, with explicitly labeled scenarios. Scenario adjustments below are illustrations, not measured benchmarks; source the actual assumptions and keep rates in [0, 1].

### Scenario Modeling

| Scenario | Churn Adjustment | New MRR Adjustment |
|----------|-----------------|-------------------|
| Pessimistic | +2pp churn | -20% new MRR |
| Base | Current rates | Current rates |
| Optimistic | -1pp churn | +20% new MRR |

## Illustrative Heuristics by Stage

These are directional prompts, not sourced targets. Verify a relevant cohort, contract length, margin and company stage before using them for a decision.

| Metric | Seed | Series A | Growth |
|--------|------|----------|--------|
| Monthly logo churn | <8% | <5% | <3% |
| NDR | >90% | >100% | >110% |
| LTV:CAC | >2x | >3x | >4x |
| CAC Payback | <24mo | <18mo | <12mo |
| Quick Ratio | >1.5 | >2 | >4 |
| Burn Multiple | <3x | <2x | <1.5x |
| Rule of 40 | N/A | >20 | >40 |
