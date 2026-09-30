# Growth Method Details

Read only the loop, activation, retention or prioritization section needed for the request. This resource resolves relative to its owning `SKILL.md`. Patterns and thresholds below are hypotheses/heuristics, not causal proof or PMF classification.

## Growth Loop Patterns

Loops model repeatable feedback where an output supplies the next cycle’s input. Some products grow through several mechanisms; establish loop actors, cycle time, conversion, saturation and economics rather than requiring every funnel to be a loop.

### Loop Types

| Loop | Mechanism | B2B Example | Key Metric |
|------|-----------|-------------|------------|
| **Viral** | Users invite other users | "Share report with client" → client signs up | Viral coefficient (K) |
| **Content** | Usage generates content → SEO/social discovery | Public dashboards, templates, benchmarks | Organic traffic |
| **Product** | Product value grows with usage → word-of-mouth | "We use X for analytics" in job postings | NPS, referral rate |
| **Sales-assisted** | Product usage triggers sales outreach | Free user hits limit → sales call | PQL → SQL conversion |
| **Paid** | Revenue funds acquisition → LTV > CAC | Google Ads → free trial → paid conversion | ROAS, CAC payback |

### Identifying Which Loop to Build

Use this decision tree based on your data:

1. Establish the product's natural value/usage rhythm, eligible activation definition, mature retention, segment and channel economics. No universal activation percentage establishes PMF.
2. For a well-retaining relevant segment, explore loop mechanics (sharing, content, referrals, product signals, reinvestment) and test conversion/cycle time; a viral loop is not automatic.
3. For declining retention, investigate whether value, fit, mix, seasonality or measurement explains it before increasing acquisition exposure.
4. For segment differences, examine sample/selection and test a focused value/acquisition hypothesis. A high activation segment alone does not establish willingness to pay or retention.
5. For low measured activation, investigate definition, eligibility and friction. Do not conclude “product problem” from a heuristic cutoff.

## Activation Framework

### The Aha Moment

The aha moment is when a user first experiences core product value. It is not automatically established by:
- Completing onboarding
- Viewing the dashboard
- Connecting an integration

Potential observed value moments include:
- Getting their first actionable insight
- Completing their first workflow successfully
- Seeing data they couldn't see before

### Aha Moment Discovery Method

1. Define a signup cohort, mature retention horizon, independent unit and a fixed early feature-use window ending before the retention outcome.
2. Compare candidate early actions against later retention for comparable segments, with counts and intervals; avoid selecting a winner from many tiny post-hoc slices.
3. Treat prediction as an association: engaged users self-select into actions, and account maturity/need can affect both action and retention.
4. Propose a value-based activation definition and validate in future cohorts. A 2× ratio is a local heuristic, not causal proof or a universal threshold.
5. Test whether an intervention that changes the early action improves durable value/retention, using a suitable randomized or carefully identified design when feasible. A return event in the early window cannot double as the later outcome.

### Activation Hypotheses to Investigate

The following causes are possibilities, not conclusions from the funnel count alone.

| Drop-off Point | Likely Cause | Intervention |
|----------------|-------------|-------------|
| Signup → First Login | Weak motivation, unclear value prop | Improve signup page copy, add social proof |
| First Login → Setup | Onboarding friction, too many steps | Reduce setup steps, add defaults, offer templates |
| Setup → First Value | Value not clear, feature discovery | Guide to aha moment, contextual tooltips, sample data |
| First Value → Repeat | One-time value, no habit trigger | Email drip with use cases, feature discovery |

## Retention Curve Interpretation

### Curve reading

Read a bounded return curve within the same cohort at mature ages. Flattening suggests a retained segment under that definition; it does not establish PMF, durability or acquisition economics. Continuous decline can reflect value loss, natural episodic usage, eligibility or measurement and requires investigation. Match weekly/monthly rhythm to intended use.

| Pattern | Question before acting |
|---------|-----------------------|
| Mature curve flattens | Which segment retains, at what absolute floor, with what durable value and economics? |
| Curve keeps falling | Is the cohort mature and comparable; is intended use episodic; are return events valid? |
| Large first-period drop | Which eligible accounts had a real opportunity to experience value? |
| Newer cohorts have higher same-age return | Did mix, acquisition source, seasonality, definition or product change? |
| Older cohorts outperform newer | Which cohort/measurement changes explain the difference? |
| A segment retains more | Is its sample large/comparable, and does customer evidence support an ICP hypothesis? |

### Smile curve versus cohort improvement

A **bounded-retention smile** is a dip followed by higher observed return in the **same fixed cohort** at later ages, often because dormant members return. For example, January cohort W4 = 12%, W8 = 9%, W12 = 14%. Validate sample/eligibility and the return event; it is a hypothesis about renewed value, not an automatic permission to scale.

March W4 = 16% versus January W4 = 12% is **same-age improvement across cohorts**, not a smile. It may reflect product changes or acquisition/segment/seasonal differences. Do not attribute causality from this comparison alone. Under unbounded “active on or after age N” retention, the nested returning sets cannot produce a genuine upward smile; verify the definition or calculation when one appears.

## ICE Scoring Framework

For prioritizing growth interventions:

```
ICE Score = (Impact × Confidence × Ease) / 10
```

| Factor | 1-3 | 4-6 | 7-10 |
|--------|-----|-----|------|
| **Impact** | <5% metric improvement | 5-15% improvement | >15% improvement |
| **Confidence** | Gut feeling, no data | Some supporting data | Strong data + prior experiments |
| **Ease** | >2 weeks, cross-team | 1-2 weeks, 1 team | <1 week, 1 person |

With all known factors in 1–10, score range is 0.1–100. Scores are a local prioritization aid, not execution authority. Unknown factors remain unknown; impact must state metric, unit, horizon and assumptions. Compare expected recoverable value/cost and evidence quality alongside the score.

## Metrics Triad for Experiments

Define one primary outcome and applicable indicators/guardrails; exactly three total metrics is not required:

1. **Output metric** — What you're trying to improve (e.g., activation rate)
2. **Input metric** — Leading indicator of success (e.g., % users who complete step 2)
3. **Guardrail metric** — What must NOT break (e.g., support ticket volume, time to first response)

If the guardrail degrades, the experiment fails regardless of output metric improvement.
