# BuilderOS v0.2 — Strategy & Vision Cluster: Design Spec

**Date:** 2026-04-26
**Status:** Approved — Ready for implementation
**Approach:** B — Sequential Orchestration with Cross-Reference
**Cluster:** Strategy & Vision (3 agents + 2 skills + 4 commands)

---

## Problem Statement

BuilderOS v0.1 excels at **operational PM work** — health diagnostics, growth analysis, tracking, financials, experiments. What it lacks is the **strategic foundation layer**: understanding if the product has achieved PMF, what the business is optimizing for, and whether the OKRs are coherent with the strategy.

Without strategic context, operational insights are directionally correct but purposelessly optimized. The Strategy & Vision cluster fills this gap.

---

## Cluster Philosophy

```
Product Strategist   →   North Star Analyst   →   OKR Architect
  (Where are we?)        (What should drive?)       (How do we get there?)
     Diagnosis               Direction                   Plan
```

**Sequential by design.** Each agent's output feeds the next. Running them independently is valid but suboptimal — the `/pm-strategy-session` command chains all three in order.

**Complementary to v0.1.** The Strategist reads Diagnostician output. The North Star Analyst aligns with the metric tree. The OKR Architect's KRs should be measurable via Mixpanel/Supabase. No duplication — cross-reference.

---

## Agent 1: Product Strategist

**File:** `agents/product-strategist.md`
**Completion marker:** `## STRATEGY AUDIT COMPLETE`
**Required background:** `strategy-frameworks` skill

### Operating Modes

| Mode | Primary Data Sources |
|------|---------------------|
| **mcp-connected** | Mixpanel (PMF signals), Supabase (revenue signals), Notion (strategy docs), Readwise (competitive notes) |
| **vault-based** | Vault strategy notes, context.md, interview notes, competitive analysis notes |
| **codebase-based** | README, CHANGELOG, git log (momentum signals), package.json (market signals) |

### Phases

**Phase 0: Detect Operating Mode**
Check for MCP availability → vault structure → codebase. Prioritize mode accordingly.

**Phase 1: PMF Signal Assessment (4 Signals Framework)**

| Signal | Threshold | Source |
|--------|-----------|--------|
| Sean Ellis score | >40% "very disappointed" | Survey (user-provided or Notion) |
| Retention curve | Flattening (not approaching zero) | Mixpanel cohort / vault notes |
| Organic pull | >30% organic + word-of-mouth | Mixpanel / user-provided |
| Desperate users | Qualitative pattern | Interview notes / Notion |

Score each signal 0–2: `0` = absent, `1` = weak/partial, `2` = strong. Total: 0–8.
- 7–8: Strong PMF
- 5–6: Emerging PMF
- 3–4: Searching for PMF
- 0–2: Pre-PMF

**Phase 2: Positioning Audit**
- Extract ICP definition from PM-CONTEXT.md (or ask user)
- Map: Who are we for? What problem do we solve? What's our differentiation?
- Test coherence: Does marketing message match product behavior?
- Source from: Notion product docs, vault context notes, README

**Phase 3: Coherence Check**
Cross-reference positioning vs. top activated cohort. Flags:
- "ICP says X but top retention cohort is Y" → positioning drift
- "Differentiation claim is Z but competitors also have Z" → weak moat
- "Core metric is A but activation event is B" → metric-action misalignment

**Phase 4: Gap Analysis**
What's missing for the next stage? Structure by:
1. PMF gaps (which signals are weak)
2. Positioning gaps (unclear or disputed)
3. Metric gaps (not yet measuring what matters)
4. Organizational gaps (what we need to know but don't)

### Output Contract

```markdown
## STRATEGY AUDIT COMPLETE

**Product:** {name}
**Stage:** {seed | series-a | growth}
**Source:** {MCP [projects] | vault [[notes]] | user-provided | codebase}
**Date:** {today}

---

### PMF Score: {n}/8 — {level}

| Signal | Score | Evidence | Source |
|--------|-------|----------|--------|
| Sean Ellis | {0-2} | {evidence} | {source} |
| Retention curve | {0-2} | {evidence} | {source} |
| Organic pull | {0-2} | {evidence} | {source} |
| Desperate users | {0-2} | {evidence} | {source} |

### Positioning

**ICP:** {definition}
**Core problem:** {problem}
**Differentiation:** {claim}
**Coherence:** {Aligned | Drifted | Unclear}

### Coherence Flags

{list of flags with evidence}

### Gap Analysis

**PMF gaps:** {list}
**Positioning gaps:** {list}
**Metric gaps:** {list}

### Recommended Next Step

→ {specific action — usually: run /pm-northstar if PMF ≥ Emerging, else fix PMF gaps first}
```

---

## Agent 2: North Star Analyst

**File:** `agents/north-star-analyst.md`
**Completion marker:** `## NORTH STAR COMPLETE`
**Required background:** `strategy-frameworks` skill, `saas-metrics-reference` skill

### Input

Reads Product Strategist output (`## STRATEGY AUDIT COMPLETE` block) if available. Otherwise derives from PM-CONTEXT.md and user-provided context.

### Phases

**Phase 0: Detect Operating Mode** — standard tri-modal detection

**Phase 1: Candidate Generation**

For each candidate North Star metric, evaluate on 3 dimensions:
- **Breadth**: Does it reflect enough of the customer base?
- **Depth**: Does it correlate with real value delivery (not superficial activity)?
- **Frequency**: Can it be measured at meaningful cadence?

Common SaaS North Star candidates by business type:
| Type | Candidate NSM |
|------|---------------|
| Productivity tool | Tasks completed / Active users |
| Analytics platform | Insights generated / Reports shared |
| Communication tool | Messages exchanged per active user |
| Marketplace | Successful transactions per week |
| Dev tool | Deploys / Integrations activated |

**Phase 2: Correlation Validation**

For each candidate:
- Can it be measured in Mixpanel / Supabase? (Path A)
- Is it already tracked in vault notes? (Path B)
- Does codebase show measurement infrastructure? (Path C)

Flag candidates that can't be measured → they require tracking investment.

Test against retention: does the metric correlate with long-term retention cohorts? (Load from Diagnostician output or Mixpanel if available)

**Phase 3: North Star Selection**

Score each candidate:
| Candidate | Breadth | Depth | Frequency | Measurable | Retention Correlation | Total |
|-----------|---------|-------|-----------|------------|----------------------|-------|

Select: highest total score. If tie → favor measurability (operational north star wins over aspirational).

**Phase 4: Metric Tree Alignment**

Map the chosen North Star to input and output metrics from the v0.1 Diagnostician metric tree:
```
North Star Metric
├── Breadth driver: {metric}
├── Depth driver: {metric}
└── Frequency driver: {metric}
    ├── Input 1: {metric} → [Mixpanel event]
    └── Input 2: {metric} → [Mixpanel event]
```

### Output Contract

```markdown
## NORTH STAR COMPLETE

**Product:** {name}
**Chosen North Star:** {metric name}
**Definition:** {precise definition — what counts, what doesn't}
**Current value:** {if measurable} | {Unknown — tracking required}
**Source:** {MCP | vault | user-provided}

---

### Candidates Evaluated

| Candidate | Breadth | Depth | Frequency | Measurable | Score |
|-----------|---------|-------|-----------|------------|-------|

### Why {chosen metric}

{3-5 sentences on the decision rationale, including what was rejected and why}

### Metric Tree

{tree diagram aligned to Diagnostician output}

### Tracking Requirements

{list any metrics that need new Mixpanel events or Supabase queries}

### Recommended Next Step

→ /pm-okr — translate North Star into Objectives and Key Results
```

---

## Agent 3: OKR Architect

**File:** `agents/okr-architect.md`
**Completion marker:** `## OKR COMPLETE`
**Required background:** `okr-frameworks` skill

### Input

Reads both `## STRATEGY AUDIT COMPLETE` and `## NORTH STAR COMPLETE` if available. Extracts: PMF gaps, positioning gaps, North Star metric, metric tree.

### Phases

**Phase 0: Detect Operating Mode** — standard tri-modal detection

**Phase 1: Objectives from Strategy Gaps**

Each Objective must:
- Address a gap from the Strategy Audit OR advance the North Star
- Be qualitative and inspirational (no numbers in objectives)
- Have a 90-day horizon by default (configurable via PM-CONTEXT.md)
- Map to one of: PMF | Growth | Product Quality | Team/Organization

Max 3 objectives per quarter (fewer is better).

**Phase 2: Key Results with Baselines and Targets**

For each Objective, generate 2–4 Key Results:

Formula: `[Verb] [metric] from [baseline] to [target] by [date]`

Rules:
- Baselines from Diagnostician output, Mixpanel, Supabase, or user-provided
- If baseline unknown → "TBD — requires measurement (tracking ticket required)"
- Targets: ambitious (0.7 score = success) not sandbagged (1.0 = easy)
- Every KR must be measurable: specify the Mixpanel event or Supabase query

**Phase 3: Alignment Matrix**

Cross-reference KRs against North Star metric tree inputs:

| KR | North Star Impact | Metric Tree Node | Agent Responsible |
|----|------------------|------------------|-------------------|
| {KR1} | Direct driver | {node} | {Diagnostician / Growth Architect} |
| {KR2} | Indirect | {node} | {Finance Analyst} |

Flag KRs that don't map to the metric tree → consider removing or adding tracking.

**Phase 4: Tracking Plan**

For each KR:
- Which MCP call measures it? (Mixpanel Run-Query, Supabase execute_sql)
- Tracking cadence (weekly / bi-weekly / monthly)
- Owner signal (which agent surfaces this in a future `/pm-health`)

### Output Contract

```markdown
## OKR COMPLETE

**Product:** {name}
**Period:** Q{n} {YYYY}
**North Star:** {metric}
**PMF Level:** {level from Strategy Audit}
**Source:** {MCP | vault | user-provided}

---

### Objective 1: {title}

**Why:** {connection to strategy gap or North Star}

| # | Key Result | Baseline | Target | Measurement | Tracking |
|---|-----------|---------|--------|-------------|---------|
| KR1.1 | {formula} | {value or TBD} | {value} | {Mixpanel event / SQL query} | Weekly |
| KR1.2 | {formula} | {value or TBD} | {value} | {measurement method} | Monthly |

### Objective 2: {title}

{same structure}

### Alignment Matrix

| KR | North Star Node | Measured by |
|----|----------------|-------------|

### Tracking Requirements

{new events or queries needed to baseline KRs marked TBD}

### Review Cadence

- **Weekly check-in:** KRs with weekly tracking → use `/pm-health`
- **Monthly review:** Full OKR progress review → use `/pm-audit`
- **Mid-quarter pivot:** If any KR at <30% progress at week 6 → reassess
```

---

## Skill 1: strategy-frameworks

**File:** `skills/strategy-frameworks/SKILL.md`

### Contents

- **PMF Signals Reference**: 4 signals with thresholds, survey templates, measurement methods
- **Positioning Framework**: ICP definition template, differentiation worksheet, coherence checklist
- **North Star Candidates by Business Type**: lookup table (SaaS subcategory → NSM options)
- **Breadth × Depth × Frequency Scoring**: scoring rubric with examples
- **Stage Heuristics**: what "good" looks like at Seed / Series A / Growth for each strategic dimension
- **Anti-patterns**: common strategy mistakes (optimizing for the wrong metric, premature positioning, NSM that's a vanity metric)

---

## Skill 2: okr-frameworks

**File:** `skills/okr-frameworks/SKILL.md`

### Contents

- **OKR Methodology**: origins (Intel/Google), Objective vs KR distinction, 0.7 scoring philosophy
- **KR Formula**: `[verb] [metric] from [X] to [Y] by [date]` with examples
- **Cascading OKRs**: company → product → team alignment patterns
- **Common Anti-Patterns**: KRs that are tasks not outcomes, objectives that are actually KRs, >5 KRs per Objective, sandbagged targets
- **Baseline Discovery Protocol**: how to find baseline values from MCP / vault / user
- **Review Templates**: weekly check-in format, mid-quarter pivot protocol, end-of-quarter scoring

---

## Commands

### `/pm-strategy` — `commands/pm-strategy.md`

Routes to `product-strategist` agent.
Input: optional `[product]` argument; falls back to PM-CONTEXT.md.
No prior agent output required.

### `/pm-northstar` — `commands/pm-northstar.md`

Routes to `north-star-analyst` agent.
Input: optional — reads prior Strategist output if available.
Can run standalone (will derive context from PM-CONTEXT.md and user-provided data).

### `/pm-okr [quarter]` — `commands/pm-okr.md`

Routes to `okr-architect` agent.
Input: optional quarter (e.g. `Q2 2026`); reads prior Strategist + North Star output if available.

### `/pm-strategy-session` — `commands/pm-strategy-session.md`

**Sequential orchestration command** — the full strategy stack in one session:

```
Step 1: product-strategist    → ## STRATEGY AUDIT COMPLETE
         ↓ (output passed as context)
Step 2: north-star-analyst    → ## NORTH STAR COMPLETE
         ↓ (output passed as context)
Step 3: okr-architect         → ## OKR COMPLETE
         ↓
Step 4: Hub synthesis          → Combined strategy brief
```

Hub synthesis (Step 4) produces a 1-page strategy brief:
- PMF level + key gaps
- North Star + metric tree (3-level)
- OKR summary (objectives + KR count)
- Top 3 priorities for next 90 days

Storage:
- **vault-based**: `strategy/YYYY-MM-[product]-strategy-session.md` in project folder
- **mcp-connected**: also write to Notion page
- **codebase-based**: `docs/strategy/YYYY-MM-strategy-session.md`

---

## Hub Skill Update

**File:** `skills/pm-toolkit/SKILL.md` — add to routing table:

| User intent | Route to |
|-------------|----------|
| PMF assessment, product-market fit, strategy audit, positioning review | `product-strategist` |
| North Star metric, what should we optimize for, metric alignment | `north-star-analyst` |
| OKRs, objectives and key results, quarterly planning, goal setting | `okr-architect` |
| Full strategy session, strategy + north star + OKRs together | sequential: `product-strategist` → `north-star-analyst` → `okr-architect` |

---

## File Inventory (9 new + 1 update)

| # | Path | Type | Status |
|---|------|------|--------|
| 1 | `agents/product-strategist.md` | Agent | New |
| 2 | `agents/north-star-analyst.md` | Agent | New |
| 3 | `agents/okr-architect.md` | Agent | New |
| 4 | `skills/strategy-frameworks/SKILL.md` | Skill | New |
| 5 | `skills/okr-frameworks/SKILL.md` | Skill | New |
| 6 | `commands/pm-strategy.md` | Command | New |
| 7 | `commands/pm-northstar.md` | Command | New |
| 8 | `commands/pm-okr.md` | Command | New |
| 9 | `commands/pm-strategy-session.md` | Command | New |
| 10 | `skills/pm-toolkit/SKILL.md` | Skill | Update (add 4 routing rows) |

---

## Integration with v0.1

| v0.2 Agent | Reads from v0.1 | Outputs to v0.1 |
|-----------|-----------------|-----------------|
| Product Strategist | Diagnostician (health scorecard, retention cohorts) | OKR Architect (gap list) |
| North Star Analyst | Diagnostician (metric tree), Growth Architect (funnel/retention) | OKR Architect (NSM + metric tree) |
| OKR Architect | Strategist (gaps), North Star Analyst (NSM) | Diagnostician (KR tracking via `/pm-health`) |

**OKR → Health loop**: Once OKRs are set, `/pm-health` should surface KR progress as a dedicated section in the health scorecard. This is a v0.2 update to `agents/product-diagnostician.md` (Phase 5: KR Progress section, reads KR definitions from strategy session output).

---

## Self-Review Checklist

- [x] All 3 agents have Phase 0 (tri-modal detection)
- [x] All agents have explicit MCP call syntax for Path A
- [x] All agents have vault fallback (grep) for Path B
- [x] All agents have codebase fallback for Path C
- [x] All agents have completion markers (`## X COMPLETE`)
- [x] All agents have REQUIRED BACKGROUND references
- [x] Sequential orchestration is additive (each step reads prior output)
- [x] No duplication with v0.1 (strategy reads Diagnostician, doesn't re-query)
- [x] OKR → Health feedback loop identified (v0.2 Diagnostician update)
- [x] Storage is mode-appropriate (vault / Notion / docs/)
- [x] Hub skill routing table covers all 4 new intents
- [x] Skills are knowledge-only (no execution logic)
- [x] Command files are thin routing layers
- [x] 9 new files + 1 update = 10 total changes

---

## Open Questions (pre-implementation)

1. **KR baselines from Diagnostician**: Should OKR Architect explicitly call the Diagnostician as a sub-step, or should it instruct the user to run `/pm-health` first? → Recommend: check if `## DIAGNOSIS COMPLETE` exists in context; if not, suggest running `/pm-health` before `/pm-okr`.

2. **90-day default horizon**: Is Q = 90 days always right? Some products run 6-week cycles. → Add `okr_horizon_days` to PM-CONTEXT.md template (default: 90).

3. **Multi-product OKRs**: Mario uses BuilderOS for both DeepAgent and Captoo. When `PM-CONTEXT.md` has multiple products, should OKR Architect produce separate OKR trees? → Scope for v0.3; for now, one PM-CONTEXT.md = one OKR tree.
