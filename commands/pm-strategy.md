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
