---
name: strategy-frameworks
description: "Use when assessing product-market fit, auditing positioning, selecting a North Star metric, or evaluating strategic coherence"
---

# Strategy Frameworks

Operational frameworks for product strategy work. Reference when the Product Strategist or North Star Analyst agent needs to assess PMF, evaluate positioning, or select a North Star metric.

**REQUIRED BACKGROUND:** For retention curve interpretation and activation patterns, load `growth-frameworks`. For metric definitions and benchmarks, load `saas-metrics-reference`.

**REQUIRED BACKGROUND:** `evidence-ledger` for tagging. `references/analytics-contract.md` for the query shapes. `references/capability-map.md` before touching any data source.

## Capabilities

| Capability | Used for | Floor when absent |
|-----------|----------|-------------------|
| `analytics.query` | The retention curve behind the PMF read, and the retention correlation behind a north star candidate | Ask for the curve; without it the retention signal is recorded unavailable, not guessed |
| `analytics.events` | Whether a candidate north star can be measured today at all | Search the repository for the call sites |
| `db.query` | Organic pull and account-level signals that live in the application database | Ask |
| `docs.search` | Survey results, interview notes, prior strategy and positioning work | Ask the user for them |
| `files.read` / `files.write` | The artifact itself | Always present |

A PMF assessment with two of four signals measured and two recorded unavailable is a useful artifact. One with four signals invented is the most expensive document a team can produce, because everything after it is planned against a fiction.

## Procedure: PMF and Positioning Audit

### 1. Resolve capabilities and ingest context

`PRODUCT.md`, current positioning, stage, and whatever prior strategy work exists.

### 2. Read the four signals

Work the PMF Signal Framework below. Per signal, one of three outcomes: measured with its tag, stated by the user with a `[doc:user-provided]` tag, or **unavailable** with the question that would resolve it. Never a fourth.

- **Survey score.** Search documents for an existing "how disappointed" survey. If none exists, the signal is unavailable and running the survey is the recommendation.
- **Retention curve shape.** The Retention shape, with its definition stated. Flattening by week 6 to 8 is the signal; a curve still falling is the absence of one.
- **Organic pull.** Share of signups arriving without paid acquisition, or inbound mentions. Often lives in the application database rather than analytics.
- **Desperate users.** Qualitative, from interviews and support: people who would be genuinely stuck without this. Search the research rather than inferring it from usage.

### 3. Score

Total the signals that were actually measured. Report the score as a fraction of what was measurable, never as a fraction of four when only two were read. "3 of 4 signals, 2 measured" is the honest form.

### 4. Audit positioning

Against the framework below: category, for whom, against what alternative, on what proof. Flag every claim with no evidence behind it, because positioning is where unsupported claims are most expensive.

### 5. Gap analysis and report

What would have to be true for the next stage, and what is missing. Emit the output contract.

## Procedure: North Star Selection

### 1. Generate candidates

Three to five, from the candidates table below, appropriate to the product type and stage. Per candidate: a precise definition of what counts and what does not, the query shape that would measure it, and the share of active users who could contribute to it.

The definition is the work. "Reports shared" means nothing until it says whether a report shared with a teammate counts, whether re-sharing counts, and whether the sender has to be active.

### 2. Score on breadth, depth, frequency

One to three on each axis, per the framework below.

### 3. Check measurability today

Pull the catalogue. Per candidate: measurable now, or measurable only after new instrumentation. Where `analytics.events` did not resolve, read the emitted events from the code instead.

Then, where a retention curve is available, test each measurable candidate against retention: do users who hit this metric retain materially better? A north star with no retention relationship is a vanity metric with a good name.

### 4. Choose

Highest total wins. Tie-break toward what is measurable today: an operational north star beats a theoretically superior one nobody can compute this quarter.

### 5. Build the metric tree

Three levels: the north star, its breadth, depth and frequency drivers, and the inputs under each. Every node names the shape that measures it. Connect it to the existing diagnostic metric tree rather than creating a parallel framework, and say which nodes need instrumentation that does not exist yet.

## Output Contracts

```markdown
## STRATEGY AUDIT COMPLETE

**Product:** {name} · **Stage:** {stage}
**Capabilities resolved:** {capability → concrete source, or "none: files only"}

### PMF Signals
| Signal | Reading | Source | Status |
{measured / user-provided / unavailable, per signal}

**Score:** {n} of {m} signals measured

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

## PMF Signal Framework (4 Signals)

Assess PMF using four independent signals. Each signal scored 0–2: `0` = absent, `1` = weak/partial, `2` = strong. Total: 0–8.

| Signal | Score 2 | Score 1 | Source |
|--------|---------|---------|--------|
| **Sean Ellis score** | >40% "very disappointed" | 25–40% | A survey the team ran: `docs.search`, or user-provided |
| **Retention curve** | Flattens by W6–8, ≥5% floor | Flattens, <5% floor | Retention shape via `analytics.query`, or recorded |
| **Organic pull** | >30% new users from WoM or organic | 15–30% organic | Breakdown by acquisition source, or `db.query`, or user-provided |
| **Desperate users** | 3+ users call product irreplaceable without prompting | 1–2 unprompted mentions | Interview and support records via `docs.search` |

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
