---
name: pm-health
description: "Product health diagnosis — pulls live metrics from Mixpanel, builds metric tree, generates scorecard"
---

Dispatch the `product-diagnostician` agent to generate a health scorecard for the current product.

## Steps

1. **Find product context**: Look for `PM-CONTEXT.md` in the current project root or `.pm-toolkit/context.md`
2. **If no context found**: Ask the user for: product name, Mixpanel project ID, stage, activation event
3. **Dispatch agent**:

```
Agent({
  description: "Product health diagnosis for [product name]",
  subagent_type: "product-diagnostician",
  prompt: "[Full PM-CONTEXT.md content]\n\nUser request: Generate a complete health scorecard with metric tree.\n\n[Any specific parameters the user mentioned: date range, specific metrics, segments]"
})
```

4. **Verify completion**: Look for `## DIAGNOSIS COMPLETE` in the agent's output
5. **Present results** to the user with the full scorecard

## Arguments

- `[product]` — Optional product name. If not provided, uses PM-CONTEXT.md
- `[--period 30d|90d]` — Analysis period. Default: 30d
- `[--segment plan|company_size|...]` — Focus on a specific segment
