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
