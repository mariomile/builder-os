---
name: pm-health
description: "Product health diagnosis — metric tree and scorecard from whatever data resolves, live or otherwise"
---

Dispatch the `product-diagnostician` agent to generate a health scorecard for the current product.

## Steps

1. **Find product context**: Look for `PM-CONTEXT.md` in the current project root or `.pm-toolkit/context.md`
2. **Resolve capabilities** per `references/capability-map.md`, and record what each resolved to
3. **If no context found**: ask for product name, stage, activation event and retention event. Never ask for a provider account or project id: the agent uses whatever resolved
4. **Dispatch agent**:

```
Agent({
  description: "Product health diagnosis for [product name]",
  subagent_type: "product-diagnostician",
  prompt: "[Full PM-CONTEXT.md content]\n\nUser request: Generate a complete health scorecard with metric tree.\n\n[Any specific parameters the user mentioned: date range, specific metrics, segments]"
})
```

5. **Verify completion**: Look for `## DIAGNOSIS COMPLETE` in the agent's output
6. **Present results** to the user with the full scorecard

## Arguments

- `[product]` — Optional product name. If not provided, uses PM-CONTEXT.md
- `[--period 30d|90d]` — Analysis period. Default: 30d
- `[--segment plan|company_size|...]` — Focus on a specific segment
