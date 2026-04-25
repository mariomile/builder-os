---
name: pm-finance
description: "Financial analysis — MRR waterfall, unit economics, cohort revenue, and projections from live billing data"
---

Dispatch the `finance-analyst` agent for revenue analysis and financial modeling.

## Steps

1. Find product context (PM-CONTEXT.md)
2. Dispatch agent:

```
Agent({
  description: "Financial analysis for [product name]",
  subagent_type: "finance-analyst",
  prompt: "[PM-CONTEXT.md content]\n\nUser request: [specific analysis requested or 'full financial analysis']\n\nInclude MRR waterfall, unit economics, cohort revenue analysis, and 6-month projection."
})
```

3. Verify `## FINANCIAL ANALYSIS COMPLETE` marker
4. Present results
