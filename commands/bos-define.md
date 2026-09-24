---
name: bos-define
description: "Phase 2 — turn discovery evidence into an opportunity tree, select one, and define the success metric with a real baseline"
---

Dispatch the `opportunity-mapper` agent to run BuilderOS phase 2.

## Steps

1. **Check pipeline state.** Read `.builderos/state.json`. Phase 1 must have passed, been overridden, or be `covered` (feature track). If its verdict is `KILLED`, refuse: the pipeline stopped. If it is `answered`, the spike ended there: report the verdict and offer to reclassify.
2. **Read `.builderos/01-discovery.md` and `00-frame.md`.** Without discovery evidence there is no tree to build, only a wish list. On the feature track neither exists: `PRODUCT.md` is the evidence, and the dispatch passes "covered by PRODUCT.md" in their place.
3. **Resolve capabilities** per `references/capability-map.md` and derive the operating mode.
4. **Dispatch:**

```
Agent({
  description: "Opportunity mapping for [product]",
  subagent_type: "opportunity-mapper",
  prompt: "Operating mode: [detected mode]
Resolved capabilities: [per references/capability-map.md, or 'none beyond files']
Pipeline state: phase 2, cycle [C], mode [full|lite], track [spike|feature|product]

PRODUCT.md:
[content]

00-frame.md:
[content]

01-discovery.md:
[content]

User request:
[what the user asked]

Write .builderos/02-definition.md and run gate 2 before declaring completion."
})
```

5. **Verify completion:** `## DEFINITION COMPLETE` with a gate 2 verdict. The marker is the agent's claim, not the evidence: re-read the artifact it wrote and run gate 2 on it yourself per `gate-checks`. A missing artifact or a failed condition is what gets reported, whatever the marker says.
6. **Present** the tree, the selection with its rejections, and the success metric.

## Arguments

- `[--tree-only]` — Build and size the tree, stop before selection.
- `[--metric-only]` — Define the success metric against an already-selected opportunity.

## Notes

Gate 2.4 rejects an estimated baseline. If the product is uninstrumented, the honest output is an unknown baseline plus an instrumentation requirement carried into phase 4. If the product does not exist, the baseline is zero. Both pass the gate; a plausible-sounding guess does not.
