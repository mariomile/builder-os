# Strategy Method Details

Read only the PMF, positioning, North Star, signal-reading, example or output-contract section needed for the request. This file resolves relative to its owning `SKILL.md`.

## PMF Signal Framework (4 Signals)

Use four complementary signals as an unvalidated local diagnostic rubric; they are not statistically independent or a universal PMF classifier. Each signal scored 0–2: `0` = absent, `1` = weak/partial, `2` = strong. Fixed total: 0–8. Unknown is not zero: Report observed points, known/4 coverage and possible interval; do not classify incomplete readings as a definitive PMF band.

| Signal | Score 2 | Score 1 | Score 0 (known absence) | Source |
|--------|---------|---------|-------------------------|--------|
| **Sean Ellis score** | >40% "very disappointed" | 25–40% | <25% in the specified eligible sample | Existing survey or user-provided results |
| **Retention curve** | Mature comparable cohorts flatten by W6–8, ≥5% floor | Mature cohorts flatten, <5% floor | Mature curve continues declining without stabilization | Retention shape or recorded cohorts |
| **Organic pull** | >30% new users from WoM or organic | 15–30% organic | <15% under a defined attribution rule | Acquisition breakdown or user-provided results |
| **Desperate users** | 3+ users call product irreplaceable without prompting | 1–2 unprompted mentions | No such mentions in a documented relevant research sample | Interview/support records |

Missing surveys, immature cohorts, unknown attribution and absent interview coverage yield **unknown**, not score 0. Disclose sample size, maturity, sampling/attribution limitations and time range per signal. These thresholds are illustrative local rubric choices; the raw readings and limitations matter more than the band.

**Illustrative PMF Bands (complete coverage only):**
- 7–8: **Strong PMF signal band** — investigate scalable acquisition economics
- 5–6: **Emerging PMF signal band** — validate retention durability and economics
- 3–4: **Searching signal band** — investigate value in relevant segments
- 0–2: **Pre-PMF signal band** — investigate unmet user value before broader bets

**Sean Ellis Survey Template:**
> "How would you feel if you could no longer use [Product]?"
> - Very disappointed
> - Somewhat disappointed
> - Not disappointed
> - I no longer use it

Survey share = very disappointed / eligible respondents × 100. Predefine eligibility, exclusions, segment, recruitment and survey period; disclose n and response bias. Do not silently exclude negative responses or nonresponse. The signal score is a separate 0–2 rubric, not this percentage.

## Positioning Framework

A coherent positioning statement has 5 components:

| Component | Question | Example |
|-----------|----------|---------|
| **For** | Who specifically? | B2B SaaS PMs at Series A companies |
| **Who** | What pain do they have? | Lack real-time product metrics |
| **Our product** | What category? | Product analytics platform |
| **That** | What makes you different? | Works without an analyst, in 5 minutes |
| **Unlike** | What's the alternative? | Mixpanel, which requires data team setup |

**Coherence Checklist:**
- ICP matches the highest-retention cohort
- Differentiation claim is NOT also made by top 3 competitors
- Product category matches how customers search
- Marketing copy uses same language as positioning statement
- Activation event delivers the differentiation promise

**Coherence Flags (auto-detect):**
- ICP says enterprise but top cohort is SMB → **Positioning drift**
- Differentiation is "easy to use" and Competitor A also claims this → **Weak moat**
- Activation event is "connect integration" but promise is "insights fast" → **Promise-delivery gap**

## North Star Metric Selection

### Breadth × Depth × Frequency Framework

Score each candidate NSM on 3 dimensions (1–3 each):

| Dimension | Score 3 | Score 2 | Score 1 |
|-----------|---------|---------|---------|
| **Breadth** | >70% of active users contribute | 40–70% | <40% |
| **Depth** | Directly measures value delivered | Correlates with value | Surface-level activity |
| **Frequency** | Measurable weekly or faster | Monthly | Quarterly or slower |

Known scores range 3–9. Unknown axes remain unknown. The 6+ cutoff is a local heuristic, not a validated rule. If no candidate scores 6+, define what "value delivered" means before selecting.

### NSM Candidates by Business Type

| B2B SaaS Category | Primary NSM Candidates |
|-------------------|----------------------|
| Analytics / BI | Reports shared per active user |
| Project Management | Tasks completed by team per week |
| CRM / Sales | Deals progressed per rep per week |
| Dev Tools | Deploys per active user |
| Communication | Messages exchanged per active user |
| Data Pipeline | Pipelines running reliably (uptime × count) |

### NSM Anti-patterns

| Anti-pattern | Example | Why It's Bad |
|-------------|---------|-------------|
| Vanity metric | Page views, signups | Don't correlate with value |
| Gaming-prone | Messages sent | Users can spam to inflate |
| Too aggregate | DAU | Doesn't tell you what to change |
| Low frequency | Monthly active users | Can't react week-to-week |
| Lagging indicator | NPS score | Too late to act |

## Stage-Appropriate Heuristics

Stage here is supplied/evidenced company context, not an inferred label from incomplete PMF data. These heuristic targets do not establish PMF or authorize scaling.

| Stage | PMF Score Target | NSM Focus | OKR Horizon |
|-------|-----------------|-----------|-------------|
| **Seed** | Reach 5+ (Emerging) | Value delivery for core segment | 6-week sprints |
| **Series A** | 7+ (Strong) | Scalable breadth metric | 90-day quarters |
| **Growth** | Maintain 7+, compound | Monetization + expansion metric | Annual + quarterly |

## Signal Reading Notes

- **Survey score.** Search documents for an existing "how disappointed" survey. If none exists, the signal is unavailable and running the survey is the recommendation.
- **Retention curve shape.** The Retention shape, with its definition stated. Treat week 6–8 and retention-floor cutoffs as local heuristics, not universal PMF thresholds; verify mature cohorts, unit, return event and retention definition first.
- **Organic pull.** Share of signups arriving without paid acquisition, or inbound mentions. Often lives in the application database rather than analytics.
- **Desperate users.** Qualitative, from interviews and support: people who would be genuinely stuck without this. Search the research rather than inferring it from usage.

## North Star Definitions

The definition is the work. "Reports shared" means nothing until it says whether a report shared with a teammate counts, whether re-sharing counts, and whether the sender has to be active.

## Examples

**Incomplete PMF:** Survey score 2, retention score 1, organic pull and qualitative users unavailable → observed points 3, coverage 2/4, possible score 3–7 of 8. Report compatible Searching/Emerging/Strong bands and the missing evidence; do not call it 3/4 or conclude Pre-PMF.

**Narrow positioning request:** Review the supplied positioning sentence against customer/alternative/proof; do not require retention queries or a full PMF assessment.

## Output Contracts

```markdown
## STRATEGY AUDIT COMPLETE

**Product:** {name} · **Stage:** {supplied/evidenced context, or unknown}
**Capabilities resolved:** {capability → concrete source, or "none: files only"}

### PMF Signals
| Signal | Reading | Score 0–2 or unknown | Source | Status |
{measured / user-provided / unavailable, per signal}

**PMF score (fixed 0–8):** {observed points}, possible interval {low–high}
**Coverage:** {known}/4 signals · **Interpretation:** {compatible bands; unresolved when incomplete}

### Positioning
{category, for whom, against what, on what proof; unsupported claims flagged}

### Gap Analysis
{what must be true for the next stage, and what is missing}

### Recommended Next Step
```

```markdown
## NORTH STAR COMPLETE

**Chosen:** {metric, with its precise definition}
**Capabilities resolved:** {capability → concrete source}

### Candidates Evaluated
| Candidate | Breadth | Depth | Frequency | Measurable today | Retention relationship | Total |

### Why this one
### Metric Tree
{3 levels, every node naming the shape that measures it}

### Instrumentation Required
{nodes that cannot be measured today}
```
