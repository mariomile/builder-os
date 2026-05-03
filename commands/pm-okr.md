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
