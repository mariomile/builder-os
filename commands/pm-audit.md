---
name: pm-audit
description: "Full product audit — runs Product Diagnostician + Growth Architect + Finance Analyst in parallel, then synthesizes"
---

Orchestrate a comprehensive product audit using multiple agents in parallel.

## Steps

1. Find product context (PM-CONTEXT.md) — required for this command
2. Dispatch three agents IN PARALLEL:

```
Agent({
  description: "Health diagnosis for [product]",
  subagent_type: "product-diagnostician",
  prompt: "[PM-CONTEXT.md]\n\nGenerate complete health scorecard."
})

Agent({
  description: "Growth analysis for [product]",
  subagent_type: "growth-architect",
  prompt: "[PM-CONTEXT.md]\n\nAnalyze activation funnel, retention, design top 3 interventions."
})

Agent({
  description: "Financial analysis for [product]",
  subagent_type: "finance-analyst",
  prompt: "[PM-CONTEXT.md]\n\nFull financial analysis: MRR waterfall, unit economics, projections."
})
```

3. Wait for all three completion markers
4. Synthesize into executive summary:

```markdown
## PRODUCT AUDIT COMPLETE

### Executive Summary
{Cross-cutting themes from all three analyses}

### Health Scorecard
{From Product Diagnostician}

### Growth Bottlenecks
{Top 3 from Growth Architect}

### Financial Position
{Key metrics from Finance Analyst}

### Priority Actions (Combined)
1. {Highest impact action across all analyses}
2. {Second highest}
3. {Third highest}
```

5. Present unified audit to user
