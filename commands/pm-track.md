---
name: pm-track
description: "Generate a tracking plan with event taxonomy, property schemas, and dashboard specs for a feature"
---

Dispatch the `tracking-architect` agent to generate a complete tracking plan.

## Steps

1. Find product context (PM-CONTEXT.md)
2. Ask user for the feature description if not provided
3. Dispatch agent:

```
Agent({
  description: "Tracking plan for [feature name]",
  subagent_type: "tracking-architect",
  prompt: "[PM-CONTEXT.md content]\n\nFeature to instrument:\n[feature description]\n\nGenerate a complete tracking plan with event taxonomy, property schemas, funnel definitions, dashboard spec, and implementation checklist."
})
```

4. Verify `## TRACKING PLAN COMPLETE` marker
5. Present results
