---
name: bos-frame
description: "Phase 0 — turn an idea or complaint into a stated problem, a named ICP and a falsifiable riskiest assumption"
---

**Resources:** The installation root is the parent of this loaded `commands/` directory (or the hook’s installation-root line). Resolve `skills/`, `references/` and `scripts/` there; project artifacts belong in the working project.

**Dispatch:** On Claude Code use the namespaced profiles below, foreground (`run_in_background: false`), and await completion before the next dispatch or gate. On any other host resolve `subagent.dispatch`: pass the skill and context to an available generic agent, or run inline. Load problem-framing; qualify skill names with `builder-os:` on Claude.

Dispatch the `builder-os:problem-framer` agent to run BuilderOS phase 0.

## Steps

1. **Check pipeline state.** Read the active initiative's `state.json` (resolved per the schema, Active Initiative). If missing, offer `/builder-os:bos-init` and stop. If `current_phase` is past 0, say so and ask whether to re-frame (a re-frame starts a new cycle, it does not overwrite).
2. **Read `PRODUCT.md`** (fallback `PM-CONTEXT.md`, then nothing — phase 0 works with nothing).
3. **Resolve capabilities** per `references/capability-map.md` and derive the operating mode.
4. **Dispatch:**

Dispatch `builder-os:problem-framer` with this context:

```text
Operating mode: [detected mode]
Resolved capabilities: [per references/capability-map.md, or 'none beyond files']
Pipeline state: initiative [slug], phase 0, cycle [C], mode [full|lite]

PRODUCT.md:
[content or 'none — new idea']

User request:
[the idea, complaint, or feature request, verbatim]

Write .builderos/initiatives/{initiative}/00-frame.md and run gate 0 before declaring completion.
```

5. **Verify completion:** look for `## FRAME COMPLETE` and a gate 0 verdict. The marker is the agent's claim, not the evidence: re-read the artifact it wrote and run gate 0 on it yourself per `gate-checks`. A missing artifact or a failed condition is what gets reported, whatever the marker says.
6. **Present** the frame, then the next command or the failed condition.

## Arguments

- `[idea]` — The idea, problem or complaint. If absent, the agent asks.
- `[--reframe]` — Start a new cycle from phase 0, preserving prior artifacts under `.builderos/initiatives/{initiative}/cycle-N/`.

## Notes

Phase 0 needs no data source. An idea with no product, no users and no analytics is the normal entry point. If the agent asks for analytics, it has misread its mode.
