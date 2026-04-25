---
name: pm-growth
description: "Growth diagnosis — analyzes activation funnels, retention cohorts, designs interventions with ICE scoring"
---

Dispatch the `growth-architect` agent to analyze growth bottlenecks and design interventions.

## Steps

1. **Find product context**: Look for `PM-CONTEXT.md` in the current project root or `.pm-toolkit/context.md`
2. **If no context found**: Ask the user for: product name, Mixpanel project ID, activation event, retention event, key segments
3. **Dispatch agent**:

```
Agent({
  description: "Growth analysis for [product name]",
  subagent_type: "growth-architect",
  prompt: "[Full PM-CONTEXT.md content]\n\nUser request: Analyze activation funnel, retention cohorts, and design top 3 growth interventions.\n\n[Any specific focus: 'activation only', 'retention deep dive', specific segment]"
})
```

4. **Verify completion**: Look for `## GROWTH ANALYSIS COMPLETE` in the agent's output
5. **Present results** to the user with funnel analysis, retention curves, and prioritized interventions

## Arguments

- `[product]` — Optional product name
- `[--focus activation|retention|loops]` — Focus on specific growth area
- `[--segment plan|company_size|...]` — Segment to analyze
