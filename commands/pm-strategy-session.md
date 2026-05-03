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
