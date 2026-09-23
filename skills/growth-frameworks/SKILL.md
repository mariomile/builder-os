---
name: growth-frameworks
description: "Use when designing growth strategies, analyzing activation funnels, interpreting retention curves, or mapping growth loops"
---

# Growth Frameworks

Activation and retention diagnosis, and the interventions that follow from it. Holds both the method and the frameworks it applies.

**REQUIRED BACKGROUND:** `evidence-ledger` for tagging. `references/analytics-contract.md` for the query shapes. `references/capability-map.md` before touching any data source. `saas-metrics-reference` for definitions and benchmark bands.

## Capabilities

| Capability | Used for | Floor when absent |
|-----------|----------|-------------------|
| `analytics.query` | The activation funnel and the retention curve, segmented | Map the funnel from the onboarding code, then ask the user for the rates |
| `analytics.events` | Whether each funnel step is emitted at all | Grep the repo for the analytics SDK's call sites |
| `analytics.replay` | Watching where users actually stall in the drop-off step | Skip; the drop-off is still located, just not explained |
| `docs.search` | Previously recorded funnel and retention numbers | Skip, and mark the step unavailable |
| `repo.read` | Onboarding flow, tracking coverage, missing instrumentation | Skip when there is no codebase |
| `files.read` / `files.write` | The artifact itself | Always present |

A growth diagnosis with no data is still worth running: mapping the funnel from the code and naming which steps are untracked is a finding, and often the finding that matters most.

## Procedure

### 1. Resolve capabilities and establish the funnel

Run the resolution protocol from `references/capability-map.md`.

Define the funnel steps before pulling anything: signup, first login, the setup step that gates value, the activation event, the repeated core action. Take them from `PRODUCT.md` or the dispatch prompt. A funnel invented at query time measures nothing.

### 2. Pull the funnel

Funnel shape, over the ordered steps, with the conversion window stated (7 to 14 days is typical for B2B, but state the one you used). Then the same funnel broken down by each segment property, and the time-to-convert distribution.

Without `analytics.query`: read the onboarding flow in the repo, map the journey step by step, then compare the steps against the emitted events. Every step with no event is a blind spot and goes in the report as one. Present the mapped funnel and ask for the rates.

### 3. Pull retention

Retention shape, cohorts by signup, returning on the core action, weekly, definition stated. Then: by segment, by activation status (activated versus not), and the last four cohorts against four cohorts from sixty days earlier.

### 4. Analyze activation

Locate the biggest drop:

```
drop_rate at step N = 1 − (actors at step N+1 ÷ actors at step N)
```

The largest drop is the first lever. A ten-point improvement there beats a fifty-point improvement at a smaller step, and saying which step it is with its number is the core deliverable of this phase.

Then segment that step (who converts, who does not) and read the timing: a median time to activate above a day means a re-engagement trigger is missing; under thirty minutes means onboarding is working and the constraint is upstream.

### 5. Analyze retention

Classify the curve shape, compute the activation-retention multiplier, and find the segment with the highest week-4 retention. The last one is ICP evidence, not a growth tactic, and it belongs in the report even when it contradicts the stated ICP.

### 6. Design interventions

One per bottleneck, in the format below, each ranked by ICE. Present the top three, not all of them.

### 7. Report

Emit the output contract. Every number tagged. Every step whose data was unavailable named as unavailable, with the shape that would fill it.

## Intervention Format

```markdown
### Intervention: {name}

**Bottleneck:** {step or retention week, with the number and its tag}
**Hypothesis:** If we {change}, then {metric} improves by {estimate} because {reasoning}
**Type:** {onboarding / re-engagement / feature discovery / value delivery}
**Loop:** {viral / content / product / paid / sales-assisted}

**Implementation:** {steps}

**Metrics:** output {…} · input {…} · guardrail {…}
**ICE:** impact {1-10} × confidence {1-10} × ease {1-10} ÷ 10 = {score}
```

## Output Contract

```markdown
## GROWTH ANALYSIS COMPLETE

**Product:** {name} · **Period:** {range}
**Capabilities resolved:** {capability → concrete source, or "none: files only"}

### Activation Funnel
{step, actors, conversion from previous, tag; conversion window stated}

### Retention
{curve with its definition, shape classification, activation multiplier, best segment}

### Bottlenecks
{ranked, each with its number}

### Interventions
{top 3 by ICE}

### Tracking Gaps
{steps with no event, properties missing for the segments that matter}
```

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
