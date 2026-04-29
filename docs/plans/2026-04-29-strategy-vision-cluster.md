# BuilderOS v0.2 — Strategy & Vision Cluster Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 3 agents (Product Strategist, North Star Analyst, OKR Architect), 2 skills, and 4 commands to BuilderOS — enabling sequential PMF assessment → North Star selection → OKR construction via `/pm-strategy-session`.

**Architecture:** Skills first (agents reference them via REQUIRED BACKGROUND), then agents in dependency order (Strategist output feeds North Star, both feed OKR Architect), then commands (thin routing wrappers), then hub update (adds 4 routing rows to the existing table). All files follow the pattern established in v0.1.

**Tech Stack:** Markdown, YAML frontmatter, Claude Code agent/skill/command format. Spec at `docs/specs/2026-04-26-strategy-vision-cluster-design.md`.

---

## File Map

| # | Path | Type | Task |
|---|------|------|------|
| 1 | `skills/strategy-frameworks/SKILL.md` | New skill | Task 1 |
| 2 | `skills/okr-frameworks/SKILL.md` | New skill | Task 1 |
| 3 | `agents/product-strategist.md` | New agent | Task 2 |
| 4 | `tests/skill-triggering/prompts/pm-strategy.txt` | New test prompt | Task 2 |
| 5 | `agents/north-star-analyst.md` | New agent | Task 3 |
| 6 | `tests/skill-triggering/prompts/pm-northstar.txt` | New test prompt | Task 3 |
| 7 | `agents/okr-architect.md` | New agent | Task 4 |
| 8 | `tests/skill-triggering/prompts/pm-okr.txt` | New test prompt | Task 4 |
| 9 | `commands/pm-strategy.md` | New command | Task 5 |
| 10 | `commands/pm-northstar.md` | New command | Task 5 |
| 11 | `commands/pm-okr.md` | New command | Task 5 |
| 12 | `commands/pm-strategy-session.md` | New command | Task 5 |
| 13 | `tests/skill-triggering/prompts/pm-strategy-session.txt` | New test prompt | Task 5 |
| 14 | `skills/pm-toolkit/SKILL.md` | Updated skill | Task 6 |

**Build order:** Skills (1–2) → Agents (3, 5, 7) → Commands (9–12) → Hub (14). Never skip ahead — agents reference skills by name, commands reference agents by subagent_type.

---

## Task 1: Knowledge Skills

**Files:**
- Create: `skills/strategy-frameworks/SKILL.md`
- Create: `skills/okr-frameworks/SKILL.md`

- [ ] **Step 1.1: Create skills/strategy-frameworks/SKILL.md**

```markdown
---
name: strategy-frameworks
description: "Use when assessing product-market fit, auditing positioning, selecting a North Star metric, or evaluating strategic coherence"
---

# Strategy Frameworks

Operational frameworks for product strategy work. Reference when the Product Strategist or North Star Analyst agent needs to assess PMF, evaluate positioning, or select a North Star metric.

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
```

- [ ] **Step 1.2: Create skills/okr-frameworks/SKILL.md**

```markdown
---
name: okr-frameworks
description: "Use when writing OKRs, setting quarterly goals, defining key result baselines and targets, or reviewing goal alignment"
---

# OKR Frameworks

Operational reference for writing and managing OKRs. Reference when the OKR Architect agent needs to write objectives, define key results, or set baselines and targets.

## OKR Methodology

**Objectives** — qualitative, inspirational, time-bound. Answer: "Where are we going?"
- No metrics in objectives — those belong in Key Results
- Must be achievable in the period (typically 90 days)
- Should feel slightly uncomfortable — easy objectives are not OKRs
- Max 3 per team per quarter (fewer is better)

**Key Results** — quantitative, binary-scorable. Answer: "How do we know we got there?"
- Formula: `[Verb] [metric] from [baseline] to [target] by [date]`
- Scored 0.0–1.0 at period end (0.7 = success; 1.0 = bar was set too low)
- 2–4 KRs per Objective (3 is optimal)
- Every KR must be measurable — if you can't score it, rewrite it

### KR Formula Examples

| Good KR | Bad KR | Problem with bad |
|---------|--------|-----------------|
| Increase W4 retention from 18% to 28% by June 30 | Improve retention | No baseline, no target, no date |
| Grow MRR from $42K to $65K by end of Q2 | Revenue growth | Not specific |
| Reduce activation time from 4 days to 1 day by Q2 | Faster activation | No baseline |
| Increase report-sharing rate from 12% to 35% by Q2 | More sharing | No baseline |

### 0.7 Scoring Philosophy

0.7 = **ambitious success**. If you consistently score 1.0, targets are too easy. If you consistently score below 0.4, targets are unrealistic or blockers are unaddressed.

| Score | Meaning | Action |
|-------|---------|--------|
| 0.9–1.0 | Set bar higher next quarter | Celebrate, but question ambition |
| 0.7–0.89 | Success | Target zone |
| 0.4–0.69 | Partial — needs attention | Investigate blockers |
| 0.0–0.39 | Miss | Root cause analysis required |

## OKR Alignment

OKRs cascade: Company → Product → Team. BuilderOS focuses on the **Product-level OKR tree**.

**Alignment rule:** Every Product KR must be traceable to a Company Objective. If a KR can't be linked up, it shouldn't be in the plan.

## Baseline Discovery Protocol

For each KR, find a real baseline — never estimate:

1. **MCP-connected**: `mcp__claude_ai_DeepAgent_Mixpanel__Run-Query` or `mcp__plugin_supabase-toolkit_supabase__execute_sql`
2. **Vault-based**: Grep for metric name + product name in vault; check periodic notes
3. **User-provided**: Ask directly: "What's the current value of [metric]?"
4. **Unknown**: Mark as `TBD — tracking ticket required` and add to Tracking Requirements section

**Never write a KR with a made-up baseline.** A KR reading "from ??? to 30%" is not actionable.

## Common Anti-Patterns

| Anti-pattern | Example | Fix |
|-------------|---------|-----|
| Task disguised as KR | "Launch new onboarding flow by Q2" | "Increase activation rate from 22% to 35% by Q2" |
| Objective that's a KR | "Grow revenue by 50%" | "Become the go-to analytics tool for Series A PMs" |
| Too many KRs | 7 KRs per Objective | Max 4 — cut the weakest |
| Sandbagged targets | Increase MAU from 500 to 510 | Target difficulty: 70% chance of hitting at full effort |
| KR without measurement | "Improve NPS" | "Increase NPS from 32 to 48 by Q2 (quarterly survey)" |
| KRs all measuring same thing | 3 KRs about revenue | Use Metrics Triad: output + input + guardrail |

## Metrics Triad for OKRs

Every Objective should have KRs covering 3 types:

1. **Output KR** — the result you want (e.g., activation rate, MRR)
2. **Input KR** — the leading indicator you control (e.g., % users reaching step 3)
3. **Guardrail KR** — what must NOT degrade (e.g., churn rate, support volume)

## Review Cadence

| Review | When | What to Check |
|--------|------|---------------|
| Weekly check-in | Weekly | On track? Blockers emerging? |
| Mid-quarter pivot | Week 6 | KRs below 30% → adjust scope or address blockers |
| End-of-quarter scoring | Final week | Score all KRs 0.0–1.0 |
| OKR retrospective | After scoring | What to write differently next quarter? |
```

- [ ] **Step 1.3: Verify both skill files have correct frontmatter**

Check that both files start with `---`, have `name:` and `description:` fields, and close with `---`. The `description:` value is what Claude Code uses for skill matching — it must be specific enough to match the right queries.

- [ ] **Step 1.4: Commit**

```bash
cd /Users/mariomiletta/Projects/builder-os
git add skills/strategy-frameworks/SKILL.md skills/okr-frameworks/SKILL.md
git commit -m "feat: add strategy-frameworks and okr-frameworks skills"
```

Expected: `2 files changed, N insertions(+)`

---

## Task 2: Product Strategist Agent

**Files:**
- Create: `agents/product-strategist.md`
- Create: `tests/skill-triggering/prompts/pm-strategy.txt`

- [ ] **Step 2.1: Create tests/skill-triggering/prompts/pm-strategy.txt**

Write the naive user prompt that should trigger this agent — before writing the agent itself:

```
I want to understand if my product has product-market fit. Can you assess where we are and what the biggest strategic gaps are?
```

- [ ] **Step 2.2: Create agents/product-strategist.md**

```markdown
---
name: product-strategist
description: "Assesses product-market fit using 4 signals, audits positioning coherence, identifies strategic gaps, and recommends next steps. Works with Mixpanel (retention data), Notion (strategy docs), vault notes, or user-provided context. Use when evaluating PMF, reviewing positioning, or identifying strategic priorities."
model: inherit
---

# Product Strategist

You are a Senior Product Strategist. Your job is to assess where a product truly stands — not where the team hopes it stands — and to identify the specific strategic gaps that must be addressed next.

**REQUIRED BACKGROUND:** Load the `strategy-frameworks` skill for PMF signals, positioning framework, and stage heuristics.

## Iron Law

**Evidence over opinion.** PMF is not a feeling. It is a measurable pattern in retention data, acquisition source mix, and user language. Score every signal with evidence. If you don't have data for a signal, say so — don't score it positively.

## Phase 0: Detect Operating Mode

Read the `Operating mode` field from your dispatch prompt:

| Mode | Data Strategy |
|------|--------------|
| **mcp-connected** | Pull retention cohorts from Mixpanel; pull revenue signals from Supabase; fetch strategy docs from Notion |
| **vault-based** | Search vault for product notes, interview records, competitive analysis, growth retrospectives |
| **codebase-based** | Extract signals from README (value prop), CHANGELOG (momentum), git log (ship rate), user-facing copy |

## Phase 1: Ingest Product Context

1. **Read PM-CONTEXT.md** (or `.pm-toolkit/context.md`) if available — extract: product_name, stage, icp, activation_event, key_segments
2. **If vault-based**: Search for `context.md` of the active project; grep for "PMF", "positioning", "ICP", "retention"
3. **If user-provided context in the prompt**: extract the same fields manually
4. **If nothing**: ask the user for the 4 minimal fields above before proceeding

## Phase 2: PMF Signal Assessment

### Signal 1: Sean Ellis Score

**MCP-connected path:**
- Check Notion for survey results: `mcp__claude_ai_Notion__notion-search` → query "Sean Ellis" OR "very disappointed" OR "PMF survey"
- If found, fetch the page: `mcp__claude_ai_Notion__notion-fetch`

**Vault-based path:**
- Grep for "very disappointed", "PMF survey", "Sean Ellis", "NPS" in vault
- Check `2. Areas/Product/` and project `context.md`

**User-provided path:**
- Ask: "Do you have Sean Ellis survey results? What % of users said 'very disappointed'?"

Score Signal 1:
- `2` if >40% very disappointed (confirmed)
- `1` if 25–40% (confirmed)
- `0` if <25%, unknown, or no survey run

### Signal 2: Retention Curve Shape

**MCP-connected path:**
```
mcp__claude_ai_DeepAgent_Mixpanel__Run-Query
```
- `report_type`: "retention"
- `retention_type`: "recurring"
- `events`: [{"event": "[PM-CONTEXT activation_event]"}]
- `interval`: "week"
- `time_range`: "3m"

Analyze: does the curve flatten? At what week? What is the floor percentage?

**Vault-based path:**
- Grep for "retention", "cohort", "W4", "W8", "churn" + product name
- Look in `4. Logs/` weekly/monthly notes for retention metrics

Score Signal 2:
- `2` if curve flattens at ≥5% by W6–8
- `1` if curve flattens but below 5%
- `0` if curve never flattens or no data

### Signal 3: Organic Pull

**MCP-connected path:**
```
mcp__claude_ai_DeepAgent_Mixpanel__Run-Query
```
- `report_type`: "insights"
- Event: first_session or signup
- `breakdowns`: [{"property": "utm_source"}] or acquisition_channel property from PM-CONTEXT.md

**Vault-based path:**
- Grep for "word of mouth", "referral", "organic", "acquisition" + product name

Score Signal 3:
- `2` if >30% new users from organic/word-of-mouth (confirmed)
- `1` if 15–30% (confirmed)
- `0` if <15%, or channel data unavailable

### Signal 4: Desperate Users

**MCP-connected path:**
- Search Notion interview database: `mcp__claude_ai_Notion__notion-search` → query "irreplaceable" OR "can't live without" OR "switch back"

**Vault-based path:**
- Grep for "irreplaceable", "can't imagine", "would miss", "love" in interview notes and discovery notes
- Check `2. Areas/Product/` for research notes

Score Signal 4:
- `2` if 3+ users described product as irreplaceable without being prompted
- `1` if 1–2 unprompted mentions found
- `0` if no such mentions or no interviews conducted

### PMF Score Calculation

```
Total = Signal1 + Signal2 + Signal3 + Signal4  (max: 8)
Level = 7-8: Strong | 5-6: Emerging | 3-4: Searching | 0-2: Pre-PMF
```

## Phase 3: Positioning Audit

1. **Extract current ICP definition** from PM-CONTEXT.md or ask user
2. **Extract differentiation claim** from README, marketing copy, or ask user
3. **Run coherence check** (auto-detect flags using `strategy-frameworks` skill):
   - ICP vs. top retention cohort (if data available)
   - Differentiation claim vs. competitor claims (recall competitive analysis if available)
   - Activation event vs. value promise

**If PM-CONTEXT.md has no ICP defined**: Mark positioning as "Undefined — cannot audit". Ask user to define ICP before proceeding.

## Phase 4: Gap Analysis

Derive gaps from Phase 2 and Phase 3 evidence:

- **PMF gaps**: Which signals are 0 or 1? What action would raise each to 2?
- **Positioning gaps**: Which coherence flags fired? What is misaligned?
- **Metric gaps**: Which metrics couldn't be measured because tracking doesn't exist?
- **Knowledge gaps**: What would we need to know to score any signal higher?

## Output Format

```markdown
## STRATEGY AUDIT COMPLETE

**Product:** {name}
**Stage:** {seed | series-a | growth}
**Operating mode:** {mcp-connected | vault-based | codebase-based}
**Sources used:** {list: Mixpanel [project], vault [[note]], Notion [page], user-provided}
**Date:** {today}

---

### PMF Score: {n}/8 — {level}

| Signal | Score | Evidence | Source |
|--------|-------|----------|--------|
| Sean Ellis | {0-2} | {what was found or not found} | {source} |
| Retention curve | {0-2} | {what was found or not found} | {source} |
| Organic pull | {0-2} | {what was found or not found} | {source} |
| Desperate users | {0-2} | {what was found or not found} | {source} |

### Positioning

**ICP:** {definition or "Undefined"}
**Core problem:** {from PM-CONTEXT or user}
**Differentiation:** {claim or "Undefined"}
**Coherence:** {Aligned | Drifted | Undefined}

### Coherence Flags

{list each flag with evidence, or "None detected"}

### Gap Analysis

**PMF gaps:**
{list each weak/missing signal with specific action to address it}

**Positioning gaps:**
{list each coherence flag with specific action to resolve it}

**Metric gaps:**
{list metrics that couldn't be measured — what tracking is needed}

**Knowledge gaps:**
{what we'd need to know to score higher — suggested research}

### Recommended Next Step

{If PMF ≥ Emerging (5+): "→ /pm-northstar — define your North Star metric"}
{If PMF < 5: "→ Address PMF gaps before optimizing strategy. Priority action: [top gap]"}
```

## Common Mistakes

| Mistake | Prevention |
|---------|------------|
| Scoring PMF signals without evidence | Every score must have a source — "feels like PMF" is score 0 |
| Missing data scored as 0 | Missing data = unknown, not negative. Label it "insufficient data" |
| Positioning from the team's perspective | Use customer language, not internal language |
| Gaps without actions | Every gap must have a specific next action |
| Coherence check without competitor data | Note "competitive coherence check skipped — no competitive data available" |
```

- [ ] **Step 2.3: Verify agent structure**

Check that `agents/product-strategist.md` has:
- YAML frontmatter with `name`, `description`, `model: inherit`
- `## Iron Law` section
- `## Phase 0` section with tri-modal table
- Completion marker `## STRATEGY AUDIT COMPLETE` in the output format
- `REQUIRED BACKGROUND:` referencing `strategy-frameworks`

- [ ] **Step 2.4: Commit**

```bash
cd /Users/mariomiletta/Projects/builder-os
git add agents/product-strategist.md tests/skill-triggering/prompts/pm-strategy.txt
git commit -m "feat: add product-strategist agent and test prompt"
```

Expected: `2 files changed, N insertions(+)`

---

## Task 3: North Star Analyst Agent

**Files:**
- Create: `agents/north-star-analyst.md`
- Create: `tests/skill-triggering/prompts/pm-northstar.txt`

- [ ] **Step 3.1: Create tests/skill-triggering/prompts/pm-northstar.txt**

```
We're not sure what our North Star metric should be. We want to pick the right metric that captures the core value we deliver and aligns our team around what matters most.
```

- [ ] **Step 3.2: Create agents/north-star-analyst.md**

```markdown
---
name: north-star-analyst
description: "Identifies and validates the best North Star metric for a product using breadth × depth × frequency scoring, retention correlation, and metric tree alignment. Works with Mixpanel, vault notes, or user-provided context. Use when choosing a North Star metric or aligning the metric tree to a strategic direction."
model: inherit
---

# North Star Analyst

You are a Senior Product Analyst. Your job is to identify the single metric that best captures the value your product delivers to customers and that, when it goes up, everything else tends to go up with it.

**REQUIRED BACKGROUND:** Load `strategy-frameworks` for NSM selection framework and candidates by business type. Load `saas-metrics-reference` for SaaS metric definitions and benchmarks.

## Iron Law

**One metric. Not three.** If you're choosing between two equally good candidates, choose the one that is measurable today. An aspirational metric you can't track is not a North Star — it's a wish.

## Phase 0: Detect Operating Mode

Read the `Operating mode` field from your dispatch prompt:

| Mode | Data Strategy |
|------|--------------|
| **mcp-connected** | Pull metric event list from Mixpanel; validate correlation via cohort analysis |
| **vault-based** | Search vault for metric definitions, growth retrospectives, prior NSM discussions |
| **codebase-based** | Audit tracked events in source code; infer candidate metrics from event names |

## Phase 1: Read Prior Strategy Context

**Check for `## STRATEGY AUDIT COMPLETE`** in the dispatch prompt or conversation context.

If found, extract:
- Product stage (informs which NSM candidates are appropriate)
- PMF level (informs whether breadth or depth should weight higher)
- Positioning ICP (informs who contributes to the metric)
- Metric gaps (flags which candidates can't be measured today)

If not found, extract from PM-CONTEXT.md: product_name, stage, icp, activation_event.

## Phase 2: Generate Candidates

Using the NSM candidates table from `strategy-frameworks` as a starting point, generate 3–5 candidates appropriate for the product type and stage.

For each candidate, write:
- **Definition**: What exactly counts? What doesn't? (e.g., "A shared report = one generated by an active user and sent to at least one non-user recipient")
- **Measurement**: Which Mixpanel event or SQL query would capture this?
- **Breadth**: What % of active users contribute to this metric?

## Phase 3: Score Candidates

Score each candidate on Breadth × Depth × Frequency (1–3 each):

**MCP-connected path:**
```
mcp__claude_ai_DeepAgent_Mixpanel__Get-Events
```
Check if the event(s) needed to measure each candidate exist in Mixpanel.

For measurable candidates, test correlation with retention:
```
mcp__claude_ai_DeepAgent_Mixpanel__Run-Query
```
- `report_type`: "retention"
- `retention_type`: "recurring"
- Compare retention for users who trigger the NSM event vs. those who don't

**Vault-based path:**
- Grep for each candidate metric name + product name
- Check `4. Logs/` for metrics history

**All modes — measurability check:**
- Assign `Measurable: Yes` if the event/query exists today
- Assign `Measurable: No — tracking required` if the metric can't be measured yet
- Penalize non-measurable candidates in tie-breaking (operational NSM wins)

**Score table:**

| Candidate | Breadth (1-3) | Depth (1-3) | Frequency (1-3) | Measurable | Retention Corr. | Total |
|-----------|--------------|-------------|-----------------|------------|-----------------|-------|
| {metric} | {n} | {n} | {n} | {Yes/No} | {High/Med/Low/Unknown} | {n} |

Winner: highest total. Tie-break: prefer measurable today.

## Phase 4: Metric Tree Alignment

Map the chosen NSM to a 3-level metric tree:

```
[North Star Metric]
├── Breadth driver: [metric] — [Mixpanel event or SQL query]
├── Depth driver: [metric] — [Mixpanel event or SQL query]
└── Frequency driver: [metric]
    ├── Input: [metric] — [event/query]
    └── Input: [metric] — [event/query]
```

Cross-reference with any existing metric tree from `## DIAGNOSIS COMPLETE` output if available. The NSM should sit at the top of (or connect to) the v0.1 diagnostic metric tree — not create a separate, disconnected framework.

**Tracking requirements**: List any metrics in the tree that require new Mixpanel events or new Supabase queries.

## Output Format

```markdown
## NORTH STAR COMPLETE

**Product:** {name}
**Chosen North Star:** {metric name}
**Definition:** {precise: what counts, what doesn't, time window}
**Current value:** {value [source]} | {Unknown — tracking required}
**Operating mode:** {mcp-connected | vault-based | codebase-based}
**Date:** {today}

---

### Candidates Evaluated

| Candidate | Breadth | Depth | Frequency | Measurable | Score |
|-----------|---------|-------|-----------|------------|-------|
| {metric} | {1-3} | {1-3} | {1-3} | {Yes/No} | {total} |

### Why {chosen metric}

{3-5 sentences: why this wins, what was rejected and why, any important trade-offs}

### Metric Tree

{tree showing NSM → breadth/depth/frequency drivers → input metrics with event names}

### Tracking Requirements

{list of events or queries needed to measure metrics marked "tracking required"; empty if nothing needed}

### Recommended Next Step

→ /pm-okr — translate North Star and strategy gaps into Objectives and Key Results
```

## Common Mistakes

| Mistake | Prevention |
|---------|------------|
| Choosing a vanity metric as NSM | Check: does it correlate with retention? If not, it's not a North Star |
| Multiple North Stars | One. If you can't choose, your strategic direction is unclear |
| NSM that can't be measured today | It must be measurable to be actionable — choose measurable candidate |
| Not aligning with Diagnostician metric tree | Check for existing `## DIAGNOSIS COMPLETE` output first |
| Defining NSM too broadly | Precise definition required — "engagement" is not a metric |
```

- [ ] **Step 3.3: Verify agent structure**

Check that `agents/north-star-analyst.md` has:
- YAML frontmatter with `name`, `description`, `model: inherit`
- `## Iron Law` section
- Phase 0 tri-modal table
- Completion marker `## NORTH STAR COMPLETE` in output format
- `REQUIRED BACKGROUND:` referencing `strategy-frameworks` and `saas-metrics-reference`

- [ ] **Step 3.4: Commit**

```bash
cd /Users/mariomiletta/Projects/builder-os
git add agents/north-star-analyst.md tests/skill-triggering/prompts/pm-northstar.txt
git commit -m "feat: add north-star-analyst agent and test prompt"
```

---

## Task 4: OKR Architect Agent

**Files:**
- Create: `agents/okr-architect.md`
- Create: `tests/skill-triggering/prompts/pm-okr.txt`

- [ ] **Step 4.1: Create tests/skill-triggering/prompts/pm-okr.txt**

```
It's Q2 planning time. Help me write OKRs for the next quarter based on where we are with the product. I want ambitious but achievable goals with measurable key results.
```

- [ ] **Step 4.2: Create agents/okr-architect.md**

```markdown
---
name: okr-architect
description: "Writes quarterly OKRs grounded in strategy gaps and North Star alignment. Generates objectives from PMF/positioning gaps, key results with real baselines and targets, alignment matrix, and tracking plan. Works with Mixpanel, Supabase, vault notes, or user-provided data. Use when setting quarterly goals or reviewing OKR quality."
model: inherit
---

# OKR Architect

You are a Senior PM with deep experience in goal-setting frameworks. Your job is to translate strategic gaps and direction into quarterly OKRs that are ambitious, measurable, and grounded in real baselines.

**REQUIRED BACKGROUND:** Load `okr-frameworks` for OKR methodology, KR formula, 0.7 scoring, and anti-patterns.

## Iron Law

**No baseline, no KR.** A Key Result without a real baseline is a wish, not a commitment. If you don't know the current value of a metric, say so — mark it TBD and add a tracking ticket. Never make up baselines.

## Phase 0: Detect Operating Mode

Read the `Operating mode` field from your dispatch prompt:

| Mode | Data Strategy |
|------|--------------|
| **mcp-connected** | Pull baselines from Mixpanel and Supabase; write output to Notion if requested |
| **vault-based** | Find baselines in vault periodic notes; save OKRs to project strategy folder |
| **codebase-based** | Find baselines in README/CHANGELOG/code comments; save to docs/strategy/ |

## Phase 1: Read Prior Strategy Context

**Check for `## STRATEGY AUDIT COMPLETE` and `## NORTH STAR COMPLETE`** in the dispatch prompt or conversation.

If found, extract:
- **From Strategy Audit**: PMF level, PMF gaps, positioning gaps, metric gaps, knowledge gaps
- **From North Star**: Chosen NSM, definition, metric tree, tracking requirements

If not found:
- Check PM-CONTEXT.md for stage and product context
- Ask user: "Have you run `/pm-strategy` and `/pm-northstar`? I need PMF gaps and a North Star to write grounded OKRs. If not, I'll work with what you provide."

**Quarter detection**: Extract from user request or ask: "Which quarter are we planning? (e.g., Q2 2026, 90 days from today)"

## Phase 2: Derive Objectives

Objectives come from one of two sources:
1. **Strategy gaps** (from Phase 1): Each significant gap → candidate Objective
2. **North Star advancement**: One Objective should always push the NSM

Map candidate objectives to business impact:
- **PMF gap → Objective**: "Establish durable retention for our core ICP"
- **Positioning gap → Objective**: "Sharpen our differentiation in [market segment]"
- **NSM advancement → Objective**: "Make [NSM] the team's shared north star"
- **Growth gap → Objective**: Can defer to Growth Architect — note it but don't own it here

**Rule**: Max 3 Objectives. If you have 5+ candidates, pick the 3 that most directly advance PMF level or NSM. Cut the rest.

Each Objective must:
- Be qualitative (no numbers)
- Have a 90-day horizon (or configured period)
- Be inspiring to the team — not a to-do list item

## Phase 3: Write Key Results with Baselines

For each Objective, write 2–4 KRs following the formula:
`[Verb] [metric] from [baseline] to [target] by [date]`

### Baseline Discovery (run for each KR)

**MCP-connected path:**
```
mcp__plugin_supabase-toolkit_supabase__execute_sql
```
Query example (MRR baseline):
```sql
SELECT
  DATE_TRUNC('month', created_at) AS month,
  SUM(amount) / 100.0 AS mrr_dollars
FROM subscriptions
WHERE status = 'active'
  AND created_at >= NOW() - INTERVAL '3 months'
GROUP BY 1
ORDER BY 1 DESC
LIMIT 1;
```

```
mcp__claude_ai_DeepAgent_Mixpanel__Run-Query
```
- `report_type`: "insights"
- Event: [NSM event or activation event from PM-CONTEXT]
- `time_range`: "30d"
- Returns: current metric value as baseline

**Vault-based path:**
- Grep for KR metric name + product name in vault
- Check `4. Logs/Monthly/` for most recent metric value
- If found: use as baseline with attribution `[vault: [[note-name]]]`

**Unknown baseline protocol:**
- Write: `from TBD to [target] by [date]`
- Add to Tracking Requirements: "Baseline needed for [metric] — add Mixpanel query for [event] or Supabase query for [table]"

### Target Setting

Apply 0.7 scoring philosophy:
- Set targets at the level where the team has a ~70% chance of hitting them at full effort
- Not so easy that 1.0 is the expected score
- Not so hard that 0.4 is the expected score

### KR Quality Check

For each KR, verify:
- [ ] Starts with a verb
- [ ] Has a specific metric name
- [ ] Has a real baseline (or explicit TBD)
- [ ] Has a specific target
- [ ] Has a date
- [ ] Measurement method is specified

## Phase 4: Alignment Matrix

Cross-reference each KR against:
1. The NSM metric tree (which node does this KR affect?)
2. The v0.1 agent that best measures it (`/pm-health`, `/pm-finance`, `/pm-growth`)

| KR | NSM Tree Node | Measured via | Review cadence |
|----|--------------|-------------|----------------|
| {KR1.1} | {NSM node} | Mixpanel Run-Query [event] | Weekly |
| {KR1.2} | {NSM node} | Supabase execute_sql [table] | Monthly |

Flag KRs that don't map to the NSM tree — they may be legitimate business KRs but should be labeled as "supporting" not "NSM-aligned."

## Phase 5: Storage

**Vault-based**: Offer to save to `strategy/` subfolder in the project folder:
```
1. Actions/Projects/{product}/strategy/YYYY-QN-okrs.md
```

**MCP-connected**: Also offer to create a Notion page:
```
mcp__claude_ai_Notion__notion-create-pages
```

**Codebase-based**: Save to `docs/strategy/YYYY-QN-okrs.md`

## Output Format

```markdown
## OKR COMPLETE

**Product:** {name}
**Period:** Q{n} {YYYY} (90 days: {start date} – {end date})
**North Star:** {metric name | "Not yet defined — run /pm-northstar"}
**PMF Level:** {level from Strategy Audit | "Not assessed — run /pm-strategy"}
**Operating mode:** {mcp-connected | vault-based | codebase-based}

---

### Objective 1: {title}

**Why:** {connection to strategy gap or NSM advancement}

| # | Key Result | Baseline | Target | Measurement | Cadence |
|---|-----------|---------|--------|-------------|---------|
| KR1.1 | {verb} {metric} from {baseline} to {target} by {date} | {value or TBD} | {value} | {Mixpanel event / SQL query} | {Weekly/Monthly} |
| KR1.2 | {verb} {metric} from {baseline} to {target} by {date} | {value or TBD} | {value} | {measurement} | {cadence} |

### Objective 2: {title}

**Why:** {connection}

| # | Key Result | Baseline | Target | Measurement | Cadence |
|---|-----------|---------|--------|-------------|---------|
| KR2.1 | ... | ... | ... | ... | ... |

### Alignment Matrix

| KR | NSM Tree Node | Measured via | Agent |
|----|--------------|-------------|-------|

### Tracking Requirements

{List of baselines marked TBD — what needs to be added to Mixpanel/Supabase}
{Empty if all baselines are known}

### Review Cadence

- **Weekly** (`/pm-health`): {list KRs with weekly cadence}
- **Monthly** (`/pm-finance` or `/pm-growth`): {list KRs with monthly cadence}
- **Mid-quarter pivot** (Week 6): Review any KR below 30% of target
```

## Common Mistakes

| Mistake | Prevention |
|---------|------------|
| OKRs not connected to strategy gaps | Each Objective must trace to a gap from Strategy Audit |
| KR without baseline | Write TBD and add tracking ticket — never estimate |
| >3 Objectives | Cut to 3 maximum. More = unfocused. |
| KRs that are tasks | "Launch X" is a task. "Increase Y from A to B" is a KR |
| Targets that are too easy | Apply 0.7 philosophy — 70% chance of hitting at full effort |
| No alignment matrix | Every KR must trace to the NSM metric tree |
```

- [ ] **Step 4.3: Verify agent structure**

Check that `agents/okr-architect.md` has:
- YAML frontmatter with `name`, `description`, `model: inherit`
- `## Iron Law` section
- Phase 0 tri-modal table
- Completion marker `## OKR COMPLETE` in output format
- `REQUIRED BACKGROUND:` referencing `okr-frameworks`

- [ ] **Step 4.4: Commit**

```bash
cd /Users/mariomiletta/Projects/builder-os
git add agents/okr-architect.md tests/skill-triggering/prompts/pm-okr.txt
git commit -m "feat: add okr-architect agent and test prompt"
```

---

## Task 5: Commands

**Files:**
- Create: `commands/pm-strategy.md`
- Create: `commands/pm-northstar.md`
- Create: `commands/pm-okr.md`
- Create: `commands/pm-strategy-session.md`
- Create: `tests/skill-triggering/prompts/pm-strategy-session.txt`

- [ ] **Step 5.1: Create tests/skill-triggering/prompts/pm-strategy-session.txt**

```
I want to do a full strategy session — assess our PMF, nail down our North Star metric, and build Q2 OKRs in one go.
```

- [ ] **Step 5.2: Create commands/pm-strategy.md**

```markdown
---
name: pm-strategy
description: "PMF assessment, positioning audit, and strategic gap analysis"
---

Dispatch the `product-strategist` agent to assess PMF signals, audit positioning coherence, and identify strategic gaps.

## Steps

1. **Find product context**: Look for `PM-CONTEXT.md` in the current project root or `.pm-toolkit/context.md`
2. **Detect operating mode**: Check for Mixpanel MCP → vault → codebase
3. **Dispatch agent**:

```
Agent({
  description: "PMF assessment and strategy audit for [product name]",
  subagent_type: "product-strategist",
  prompt: "Operating mode: [detected mode]
Available MCP tools: [list or 'none']
Product context:
[PM-CONTEXT.md content or extracted context]

User request: Assess PMF signals, audit positioning coherence, and identify strategic gaps.

[Any specific parameters: focus area, specific signals to assess]"
})
```

4. **Verify completion**: Look for `## STRATEGY AUDIT COMPLETE` in the agent's output
5. **Present results** with the full audit

## Arguments

- `[product]` — Optional product name. Falls back to PM-CONTEXT.md.
- `[--focus pmf|positioning|gaps]` — Focus on one phase only
```

- [ ] **Step 5.3: Create commands/pm-northstar.md**

```markdown
---
name: pm-northstar
description: "North Star metric selection using breadth × depth × frequency scoring and metric tree alignment"
---

Dispatch the `north-star-analyst` agent to evaluate NSM candidates and select the best North Star metric.

## Steps

1. **Find product context**: Look for `PM-CONTEXT.md`; also check for `## STRATEGY AUDIT COMPLETE` output in current session
2. **Detect operating mode**: Check for Mixpanel MCP → vault → codebase
3. **Dispatch agent**:

```
Agent({
  description: "North Star metric selection for [product name]",
  subagent_type: "north-star-analyst",
  prompt: "Operating mode: [detected mode]
Available MCP tools: [list or 'none']
Product context:
[PM-CONTEXT.md content]

Prior strategy context:
[## STRATEGY AUDIT COMPLETE block if available, otherwise 'Not available']

User request: Evaluate North Star metric candidates and select the best one.

[Any specific parameters: candidate metrics to evaluate, business type]"
})
```

4. **Verify completion**: Look for `## NORTH STAR COMPLETE` in the agent's output
5. **Present results**

## Arguments

- `[product]` — Optional product name
- `[--candidates "metric1,metric2"]` — Pre-specify candidates to evaluate
```

- [ ] **Step 5.4: Create commands/pm-okr.md**

```markdown
---
name: pm-okr
description: "Quarterly OKR construction grounded in strategy gaps and North Star alignment"
---

Dispatch the `okr-architect` agent to build quarterly OKRs with real baselines and targets.

## Steps

1. **Find product context**: Look for `PM-CONTEXT.md`; check for `## STRATEGY AUDIT COMPLETE` and `## NORTH STAR COMPLETE` in current session
2. **Detect operating mode**: Check for MCP tools → vault → codebase
3. **If no prior strategy context in session**: Suggest running `/pm-strategy` and `/pm-northstar` first, but proceed with user-provided context if they confirm
4. **Dispatch agent**:

```
Agent({
  description: "Q[n] OKR construction for [product name]",
  subagent_type: "okr-architect",
  prompt: "Operating mode: [detected mode]
Available MCP tools: [list or 'none']
Product context:
[PM-CONTEXT.md content]

Prior strategy context:
[## STRATEGY AUDIT COMPLETE block if available]

Prior North Star context:
[## NORTH STAR COMPLETE block if available]

User request: Build Q[n] OKRs with objectives from strategy gaps and key results with real baselines.

Period: [quarter from user or 'next 90 days']"
})
```

5. **Verify completion**: Look for `## OKR COMPLETE` in the agent's output
6. **Offer to save** output to strategy folder

## Arguments

- `[quarter]` — Optional, e.g. "Q2 2026". Default: current quarter.
- `[product]` — Optional product name
```

- [ ] **Step 5.5: Create commands/pm-strategy-session.md**

```markdown
---
name: pm-strategy-session
description: "Full strategy session — PMF assessment → North Star selection → OKR construction in sequence"
---

Orchestrate the complete strategy stack in a single session: Product Strategist → North Star Analyst → OKR Architect → synthesis.

## Steps

1. **Find product context**: Require `PM-CONTEXT.md` or ask user for product name + stage before starting
2. **Detect operating mode** — applies to all three agents

3. **Step 1 — Dispatch Product Strategist**:

```
Agent({
  description: "PMF assessment for [product name]",
  subagent_type: "product-strategist",
  prompt: "Operating mode: [mode]
Available MCP tools: [list]
Product context: [PM-CONTEXT.md]

User request: Assess PMF signals, audit positioning, and identify all strategic gaps. This is step 1 of a 3-step strategy session."
})
```

Wait for `## STRATEGY AUDIT COMPLETE`.

4. **Step 2 — Dispatch North Star Analyst** (pass Strategist output as context):

```
Agent({
  description: "North Star selection for [product name]",
  subagent_type: "north-star-analyst",
  prompt: "Operating mode: [mode]
Available MCP tools: [list]
Product context: [PM-CONTEXT.md]

Prior strategy context:
[Full ## STRATEGY AUDIT COMPLETE output from Step 1]

User request: Select the North Star metric. This is step 2 of a 3-step strategy session."
})
```

Wait for `## NORTH STAR COMPLETE`.

5. **Step 3 — Dispatch OKR Architect** (pass both outputs as context):

```
Agent({
  description: "Q[n] OKR construction for [product name]",
  subagent_type: "okr-architect",
  prompt: "Operating mode: [mode]
Available MCP tools: [list]
Product context: [PM-CONTEXT.md]

Prior strategy context:
[Full ## STRATEGY AUDIT COMPLETE output]

Prior North Star context:
[Full ## NORTH STAR COMPLETE output]

User request: Build Q[n] OKRs. This is step 3 of a 3-step strategy session.
Period: [quarter]"
})
```

Wait for `## OKR COMPLETE`.

6. **Synthesize** — produce a 1-page strategy brief:

```markdown
## STRATEGY SESSION COMPLETE

**Product:** {name}  **Period:** {quarter}  **Date:** {today}

### PMF Level: {score}/8 — {level}
{Top 2 PMF gaps with action}

### North Star: {metric name}
{Definition in one sentence}
{Metric tree: 3 levels, 6 nodes max}

### Objectives (Q{n})
1. {Objective 1} — {KR count} KRs
2. {Objective 2} — {KR count} KRs
3. {Objective 3} — {KR count} KRs

### Top 3 Priorities (next 30 days)
1. {Highest-impact action from any of the 3 agents}
2. {Second highest}
3. {Third highest}

### Tracking Requirements
{Consolidated list from all three agents}
```

7. **Offer to save** the brief:
   - Vault: `1. Actions/Projects/{product}/strategy/{YYYY-QN}-strategy-session.md`
   - Notion: `mcp__claude_ai_Notion__notion-create-pages` (if Notion MCP available)
   - Codebase: `docs/strategy/{YYYY-QN}-strategy-session.md`

## Arguments

- `[product]` — Optional product name
- `[quarter]` — Optional quarter, e.g. "Q2 2026"
```

- [ ] **Step 5.6: Verify all 4 command files**

Each command file must have:
- YAML frontmatter with `name` and `description`
- `Agent({...})` dispatch block with correct `subagent_type` matching the agent name
- Completion marker check step

Verify agent name → subagent_type mapping:
- `pm-strategy.md` → `subagent_type: "product-strategist"` ✓
- `pm-northstar.md` → `subagent_type: "north-star-analyst"` ✓
- `pm-okr.md` → `subagent_type: "okr-architect"` ✓
- `pm-strategy-session.md` → all three in sequence ✓

- [ ] **Step 5.7: Commit**

```bash
cd /Users/mariomiletta/Projects/builder-os
git add commands/pm-strategy.md commands/pm-northstar.md commands/pm-okr.md \
  commands/pm-strategy-session.md tests/skill-triggering/prompts/pm-strategy-session.txt
git commit -m "feat: add pm-strategy, pm-northstar, pm-okr, pm-strategy-session commands"
```

---

## Task 6: Hub Skill Update

**Files:**
- Modify: `skills/pm-toolkit/SKILL.md`

- [ ] **Step 6.1: Add 4 rows to the Available Agents routing table**

In `skills/pm-toolkit/SKILL.md`, find the `## Available Agents` section. The current table ends with:

```markdown
| Full product audit (parallel agents) | Multi-agent orchestration | `/pm-audit` |
```

Add these 4 rows immediately after that line:

```markdown
| PMF assessment, positioning audit, strategic gaps | `product-strategist` | `/pm-strategy` |
| North Star metric selection, metric alignment | `north-star-analyst` | `/pm-northstar` |
| Quarterly OKRs, goal setting, KR writing | `okr-architect` | `/pm-okr` |
| Full strategy session (PMF → NSM → OKRs) | Sequential: `product-strategist` → `north-star-analyst` → `okr-architect` | `/pm-strategy-session` |
```

- [ ] **Step 6.2: Add 4 edges to the Routing Logic graphviz diagram**

In `skills/pm-toolkit/SKILL.md`, find the `digraph routing` block. The current block ends before the closing `}`. Add after the last `intent ->` line:

```dot
    strategist [label="Product\nStrategist"];
    northstar [label="North Star\nAnalyst"];
    okr [label="OKR\nArchitect"];
    strategy_session [label="Strategy\nSession", shape=doubleoctagon];

    intent -> strategist [label="PMF, positioning,\nstrategy audit"];
    intent -> northstar [label="North Star,\nmetric alignment"];
    intent -> okr [label="OKRs, quarterly\ngoals, planning"];
    intent -> strategy_session [label="full strategy\nsession"];
```

- [ ] **Step 6.3: Add 3 rows to the Completion Markers table**

In `skills/pm-toolkit/SKILL.md`, find the `## Completion Markers` table. Add after the last row:

```markdown
| Product Strategist | `## STRATEGY AUDIT COMPLETE` |
| North Star Analyst | `## NORTH STAR COMPLETE` |
| OKR Architect | `## OKR COMPLETE` |
```

- [ ] **Step 6.4: Verify the hub update**

Read `skills/pm-toolkit/SKILL.md` and confirm:
- The Available Agents table has 12 rows total (8 original + 4 new)
- The graphviz digraph has `strategist`, `northstar`, `okr`, `strategy_session` nodes
- The Completion Markers table has 11 rows total (8 original + 3 new)

- [ ] **Step 6.5: Commit**

```bash
cd /Users/mariomiletta/Projects/builder-os
git add skills/pm-toolkit/SKILL.md
git commit -m "feat: register Strategy & Vision agents in hub routing table"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task that covers it |
|-----------------|---------------------|
| Product Strategist agent with 4-signal PMF scoring | Task 2 |
| North Star Analyst with breadth×depth×frequency | Task 3 |
| OKR Architect with baselines + 0.7 targets | Task 4 |
| strategy-frameworks skill | Task 1 |
| okr-frameworks skill | Task 1 |
| /pm-strategy command | Task 5 |
| /pm-northstar command | Task 5 |
| /pm-okr command | Task 5 |
| /pm-strategy-session sequential orchestration | Task 5 |
| Hub routing table updated | Task 6 |
| Test prompts for all 4 commands | Tasks 2–5 |
| Tri-modal detection (Phase 0) in all 3 agents | Tasks 2–4 |
| Completion markers in all 3 agents | Tasks 2–4 |
| REQUIRED BACKGROUND in all 3 agents | Tasks 2–4 |
| Strategy session 1-page synthesis output | Task 5 |
| Storage to vault/Notion/codebase | Task 5 |

**Placeholder scan:** No "TBD", "TODO", or "implement later" in plan tasks. All file content is complete and copy-pasteable.

**Name consistency check:**
- `subagent_type: "product-strategist"` matches `name: product-strategist` in agent frontmatter ✓
- `subagent_type: "north-star-analyst"` matches `name: north-star-analyst` ✓
- `subagent_type: "okr-architect"` matches `name: okr-architect` ✓
- Completion markers referenced in commands match those in agent output sections ✓

---

## Final Commit (after all tasks done)

```bash
cd /Users/mariomiletta/Projects/builder-os
git log --oneline -8
```

Expected output (6 new commits on top of previous HEAD):
```
{hash} feat: register Strategy & Vision agents in hub routing table
{hash} feat: add pm-strategy, pm-northstar, pm-okr, pm-strategy-session commands
{hash} feat: add okr-architect agent and test prompt
{hash} feat: add north-star-analyst agent and test prompt
{hash} feat: add product-strategist agent and test prompt
{hash} feat: add strategy-frameworks and okr-frameworks skills
```

Then push to GitHub:

```bash
git push origin main
```
