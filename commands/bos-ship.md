---
name: bos-ship
description: "Phase 6 — rollout plan, tested rollback, production instrumentation check, baseline captured before exposure, release notes, scheduled review"
---

Dispatch the `release-manager` agent to run BuilderOS phase 6.

## Steps

1. **Check pipeline state.** Read `.builderos/state.json`. Phase 5 must have passed or been overridden. Shipping unverified work is what gate 5 exists to prevent.
2. **Read `.builderos/initiatives/{initiative}/05-build-plan.md`, `04-spec.md`, `03-solution-bet.md` and `02-definition.md`.** The verified build, the tracking plan, the kill criteria and the success metric with its exact phase 2 definition.
3. **Resolve capabilities** per `references/capability-map.md` and derive the operating mode.
4. **Dispatch:**

```
Agent({
  description: "Release plan for [feature]",
  subagent_type: "release-manager",
  prompt: "Operating mode: [detected mode]
Resolved capabilities: [per references/capability-map.md, or 'none beyond files']
Pipeline state: initiative [slug], phase 6, cycle [C], mode [full|lite]

PRODUCT.md:
[content]

02-definition.md:
[content — the success metric with its definition, baseline and target]

03-solution-bet.md:
[content — the kill criteria, including the review date]

04-spec.md:
[content — the tracking plan and the guardrail metrics]

05-build-plan.md:
[content — the instrumentation evidence]

User request:
[what the user asked]

Write .builderos/initiatives/{initiative}/06-release.md and run gate 6 before declaring completion.
Capture the baseline before any exposure; gate 6.2 checks the timestamp order."
})
```

5. **Verify completion:** `## SHIPPED` with a gate 6 verdict. The marker is the agent's claim, not the evidence: re-read the artifact it wrote and run gate 6 on it yourself per `gate-checks`. A missing artifact or a failed condition is what gets reported, whatever the marker says.
6. **Present** the rollout plan, the rollback and its test, the captured baseline and the scheduled review.

## Arguments

- `[--baseline-only]` — Capture and timestamp the baseline, stop before the rollout plan.
- `[--notes-only]` — Write release notes against an existing release plan.

## Notes

Gate 6.2 compares two timestamps. A baseline captured after exposure fails, and it fails for a reason worth stating: after exposure there is no way to distinguish the effect of the change from what was going to happen anyway.

Gate 6.1 wants the rollback tested, not described. The related question that gets skipped is what happens to data written while the feature was live: answer it even when the answer is that nothing is written.

Where no analytics capability resolved, the baseline floors to a user-provided number with a tag, or an explicit zero with a first-measurement date. Both pass. A remembered number presented as measured does not.

In lite mode, gate 6.4 becomes a warning. Gates 6.1 and 6.2 never relax.
