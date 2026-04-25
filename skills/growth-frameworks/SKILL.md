---
name: growth-frameworks
description: "Use when designing growth strategies, analyzing activation funnels, interpreting retention curves, or mapping growth loops"
---

# Growth Frameworks

Operational frameworks for growth analysis and strategy. Use these when the Growth Architect agent needs to interpret data and design interventions.

**REQUIRED BACKGROUND:** For comprehensive analytics methodology, load `b2b-saas-analytics`.

## Growth Loop Patterns

Every sustainable growth engine is a loop, not a funnel. New users create value that attracts more new users.

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

1. **Activation rate > 40% AND retention curve flattens?** → You have PMF. Build a viral or product loop.
2. **Activation rate > 40% BUT retention declining?** → Fix retention first. No loop survives leaky retention.
3. **Activation rate < 40% AND some segments activate well?** → Focus on high-activation segments. Build sales-assisted loop for them.
4. **Activation rate < 40% across all segments?** → Product problem, not growth problem. Fix value delivery.

## Activation Framework

### The Aha Moment

The aha moment is when a user first experiences core product value. It is NOT:
- Completing onboarding
- Viewing the dashboard
- Connecting an integration

It IS:
- Getting their first actionable insight
- Completing their first workflow successfully
- Seeing data they couldn't see before

### Aha Moment Discovery Method

1. Pull Week 4 retention by feature usage (which features correlate with retention?)
2. Find the action that most strongly predicts retention
3. Define activation as: user performs this action within X days of signup
4. Validate: activated users should retain 2x+ better than non-activated

### Activation Rate Improvement Playbook

| Drop-off Point | Likely Cause | Intervention |
|----------------|-------------|-------------|
| Signup → First Login | Weak motivation, unclear value prop | Improve signup page copy, add social proof |
| First Login → Setup | Onboarding friction, too many steps | Reduce setup steps, add defaults, offer templates |
| Setup → First Value | Value not clear, feature discovery | Guide to aha moment, contextual tooltips, sample data |
| First Value → Repeat | One-time value, no habit trigger | Email drip with use cases, feature discovery |

## Retention Curve Interpretation

### Curve Shapes

```
100% ─┐
      │╲
      │ ╲    Flattening (PMF signal)
      │  ╲_______________
      │
      │╲
      │ ╲   Continuous decline (No PMF)
      │  ╲
      │   ╲
      │    ╲
      │
0%  ──┴──────────────────── Weeks
```

### Reading the Curve

| What to Look For | What It Means | Action |
|-----------------|---------------|--------|
| Curve flattens by W6-8 | Core users found value | Scale acquisition |
| Curve never flattens | No durable value | Fix product before scaling |
| Week 1 drop > 60% | First experience disappoints | Fix onboarding, set expectations |
| Newer cohorts > older | Product improving | Keep shipping, measure per-cohort |
| Older cohorts > newer | Product degrading | Investigate recent changes |
| One segment retains 2x+ | ICP validation | Double down on that segment |

### Smile Curve Detection

Compare same-age retention across cohorts:
```
If Week_4_retention(Cohort_March) > Week_4_retention(Cohort_January):
    → Smile curve detected. Product is improving.
```

Smile curve = green light to invest in growth. Frown curve = stop and fix.

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

Score range: 0.1 (low priority) to 100 (do this immediately).

## Metrics Triad for Experiments

Every growth experiment needs three metrics:

1. **Output metric** — What you're trying to improve (e.g., activation rate)
2. **Input metric** — Leading indicator of success (e.g., % users who complete step 2)
3. **Guardrail metric** — What must NOT break (e.g., support ticket volume, time to first response)

If the guardrail degrades, the experiment fails regardless of output metric improvement.
