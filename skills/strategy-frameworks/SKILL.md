---
name: strategy-frameworks
description: "Use when assessing product-market fit, auditing positioning, selecting a North Star metric, or evaluating strategic coherence"
---

# Strategy Frameworks

Operational frameworks for product strategy work. Reference when the Product Strategist or North Star Analyst agent needs to assess PMF, evaluate positioning, or select a North Star metric.

**REQUIRED BACKGROUND:** For retention curve interpretation and activation patterns, load `growth-frameworks`. For metric definitions and benchmarks, load `saas-metrics-reference`.

## PMF Signal Framework (4 Signals)

Assess PMF using four independent signals. Each signal scored 0–2: `0` = absent, `1` = weak/partial, `2` = strong. Total: 0–8.

| Signal | Score 2 | Score 1 | Source |
|--------|---------|---------|--------|
| **Sean Ellis score** | >40% "very disappointed" | 25–40% | User survey (user-provided or Notion) |
| **Retention curve** | Flattens by W6–8, ≥5% floor | Flattens, <5% floor | Mixpanel cohorts / vault notes |
| **Organic pull** | >30% new users from WoM or organic | 15–30% organic | Mixpanel acquisition source / user-provided |
| **Desperate users** | 3+ users call product irreplaceable without prompting | 1–2 unprompted mentions | Interview notes / Notion |

**PMF Level Thresholds:**
- 7–8: **Strong PMF** — scale acquisition
- 5–6: **Emerging PMF** — tighten retention loop, then scale
- 3–4: **Searching** — focus on high-value segment, don't scale yet
- 0–2: **Pre-PMF** — stop building features, talk to users

**Sean Ellis Survey Template:**
> "How would you feel if you could no longer use [Product]?"
> - Very disappointed
> - Somewhat disappointed
> - Not disappointed
> - I no longer use it

Score = (Very disappointed / total) × 100

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

Max score: 9. Minimum viable NSM: 6+. If no candidate scores 6+, define what "value delivered" means before selecting.

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

| Stage | PMF Score Target | NSM Focus | OKR Horizon |
|-------|-----------------|-----------|-------------|
| **Seed** | Reach 5+ (Emerging) | Value delivery for core segment | 6-week sprints |
| **Series A** | 7+ (Strong) | Scalable breadth metric | 90-day quarters |
| **Growth** | Maintain 7+, compound | Monetization + expansion metric | Annual + quarterly |
