---
name: pm-compete
description: "Competitive analysis — feature matrix, positioning map, and strategic recommendations"
---

Dispatch the `competitive-analyst` agent for market and competitive intelligence.

## Steps

1. Find product context (PM-CONTEXT.md)
2. Determine target: specific competitor or full market landscape
3. Dispatch agent:

```
Agent({
  description: "Competitive analysis [competitor/market]",
  subagent_type: "competitive-analyst",
  prompt: "[PM-CONTEXT.md content]\n\nAnalysis target: [specific competitor name OR 'full market landscape']\n\nCompetitors to include: [list from context or user input]\nMarket category: [from context]\n\nProduce feature matrix, positioning map, and strategic recommendations."
})
```

4. Verify `## COMPETITIVE ANALYSIS COMPLETE` marker
5. Present results with source citations
