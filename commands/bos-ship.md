---
name: bos-ship
description: "Phase 6 — rollout plan, tested rollback, production instrumentation check, baseline captured before exposure, release notes, scheduled review"
---

**Resources:** The installation root is the parent of this loaded `commands/` directory (or the hook’s installation-root line). Resolve `skills/`, `references/` and `scripts/` there; project artifacts belong in the working project.

**Dispatch:** On Claude Code use the namespaced profiles below, foreground (`run_in_background: false`), and await completion before the next dispatch or gate. On any other host resolve `subagent.dispatch`: pass the skill and context to an available generic agent, or run inline. Load release-ops; qualify skill names with `builder-os:` on Claude.

Dispatch the `builder-os:release-manager` agent to run BuilderOS phase 6.

## Steps

1. **Check pipeline state.** Read the active initiative's `state.json` (resolved per the schema, Active Initiative). Phase 5 must have passed or been overridden. Shipping unverified work is what gate 5 exists to prevent.
2. **Read `.builderos/initiatives/{initiative}/05-build-plan.md`, `04-spec.md`, `03-solution-bet.md` and `02-definition.md`.** The verified build, the tracking plan, the kill criteria and the success metric with its exact phase 2 definition.
3. **Resolve capabilities** per `references/capability-map.md` and derive the operating mode.
4. **Dispatch:**

Dispatch `builder-os:release-manager` with this context:

```text
Operating mode: [detected mode]
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
Capture the baseline before exposure. Do not deploy without authorization. For SHIPPED, add `## Exposure verification`: Authorized by (who, how), Status verified, actual Exposed at, Environment, Version, and Verification with an observed result and resolvable data/doc source. Planning stays RELEASE READY.
```

5. **Verify completion:** `## RELEASE READY` means preparation only and keeps phase 6 open. `## SHIPPED` requires gate 6 plus actual verified exposure (6.6). Re-read the artifact and rerun gate 6 per `gate-checks`; report missing artifacts or failed conditions despite any marker.
6. **Present** the rollout plan, the rollback and its test, the captured baseline and the scheduled review. Record phase 6 with `--accepted-by` from the person who authorized exposure (6.8).

## Arguments

- `[--baseline-only]` — Capture and timestamp the baseline, stop before the rollout plan.
- `[--notes-only]` — Write release notes against an existing release plan.

## Notes

Gate 6.2 compares two timestamps. A baseline captured after exposure fails: after exposure the effect of the change cannot be told apart from what would have happened anyway.

Gate 6.1 wants the rollback tested, not described. The related question that gets skipped is what happens to data written while the feature was live: answer it even when the answer is that nothing is written.

Without analytics, retain an unknown baseline or use a dated user-provided source. Zero requires evidence appropriate to the metric; unavailable data does not imply zero.

In lite mode, gate 6.4 becomes a warning. Gates 6.1, 6.2 and 6.8 never relax.
