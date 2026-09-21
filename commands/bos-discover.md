---
name: bos-discover
description: "Phase 1 — plan and run the research that tests the frame, and return a VALIDATED/KILLED/RESHAPED verdict"
---

Dispatch the `research-planner` agent to run BuilderOS phase 1.

## Steps

1. **Check pipeline state.** Read `.builderos/state.json`. Phase 0 must have passed or been overridden; if not, refuse with the failed condition per `gate-checks`.
2. **Read `.builderos/00-frame.md`.** The riskiest assumption in it is the research target. Without it, stop and route to `/bos-frame`.
3. **Resolve capabilities** per `references/capability-map.md` and derive the operating mode.
4. **Dispatch:**

```
Agent({
  description: "Discovery research for [product]",
  subagent_type: "research-planner",
  prompt: "Operating mode: [detected mode]
Resolved capabilities: [per references/capability-map.md, or 'none beyond files']
Pipeline state: phase 1, cycle [C], mode [full|lite]

PRODUCT.md:
[content]

00-frame.md:
[content]

User request:
[what the user asked — a plan, or synthesis of transcripts they are bringing]

Transcripts/notes provided:
[paths or content, or 'none — plan only']

Write .builderos/01-discovery.md and run gate 1 before declaring completion.
If no transcripts exist yet, deliver the plan and say the gate runs later."
})
```

5. **Verify completion:** `## DISCOVERY COMPLETE` with a verdict, or `## RESEARCH PLAN READY`.
6. **Present.** On `KILLED`, report the pipeline stop as a successful outcome and name what it saved.

## Arguments

- `[--plan]` — Plan and guide only, no synthesis.
- `[--synthesize <paths>]` — Ingest transcripts or notes and go straight to synthesis and verdict.
- `[--mine]` — Source mining only: churn reasons, tickets, replays, funnels.

## Notes

Phase 1 usually spans two sessions: the plan, then the verdict after the conversations happen. That is normal and the state file carries the gap.

A `KILLED` verdict stops the pipeline. That is the cheapest outcome BuilderOS can produce and it should be presented as a win, not a setback.
