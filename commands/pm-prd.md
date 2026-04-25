---
name: pm-prd
description: "Write a PRD — structured product requirements document with user stories, acceptance criteria, and success metrics"
---

Dispatch the `product-writer` agent in PRD mode.

## Steps

1. Find product context (PM-CONTEXT.md)
2. Ask for feature description if not provided
3. Dispatch agent:

```
Agent({
  description: "PRD for [feature name]",
  subagent_type: "product-writer",
  prompt: "[PM-CONTEXT.md content]\n\nMode: PRD\n\nFeature: [feature name and description]\n\n[Any additional context: target user, constraints, related data from diagnostician/growth architect]\n\nWrite a complete PRD with problem statement, user stories, acceptance criteria, success metrics, and timeline."
})
```

4. Verify `## ARTIFACT WRITTEN` marker
5. Present the PRD
