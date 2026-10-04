---
name: bos-shape
description: "Phase 4 — turn the selected bet into a spec: bounded scope, testable acceptance criteria, flows with full state coverage, and the tracking plan"
---

**Resources:** The installation root is the parent of this loaded `commands/` directory (or the hook’s installation-root line). Resolve `skills/`, `references/` and `scripts/` there; project artifacts belong in the working project.

**Dispatch:** On Claude Code use the namespaced profiles below, foreground (`run_in_background: false`), and await completion before the next dispatch or gate. On any other host resolve `subagent.dispatch`: pass the skill and context to an available generic agent, or run inline. Load ux-architecture, then spec-writing; qualify skill names with `builder-os:` on Claude.

Dispatch `builder-os:ux-architect` then `builder-os:spec-writer` to run BuilderOS phase 4.

## Steps

1. **Check pipeline state.** Read the active initiative's `state.json` (resolved per the schema, Active Initiative). Phase 3 must have passed or been overridden. Without a selected bet and its kill criteria there is nothing to specify.
2. **Read `.builderos/initiatives/{initiative}/03-solution-bet.md` and `02-definition.md`.** The primary user action, the kill criteria, and the success metric the tracking plan must compute.
3. **Resolve capabilities** per `references/capability-map.md` and derive the operating mode.
4. **Detect a design-quality toolchain** in this session. If one is present, the UX architect delegates visual craft to it and keeps the structure. Absence is the expected case and costs nothing; never prompt an install.
5. **Dispatch the UX architect first.** The spec consumes its flow list, so the order matters.

Dispatch `builder-os:ux-architect` with this context:

```text
Operating mode: [detected mode]
Resolved capabilities: [per references/capability-map.md, or 'none beyond files']
Pipeline state: initiative [slug], phase 4, cycle [C], mode [full|lite]
Design toolchain present: [yes, named | no]

PRODUCT.md:
[content]

03-solution-bet.md:
[content]

User request:
[what the user asked]

Write DESIGN.md. End with ## DESIGN COMPLETE.
```

6. **Dispatch the spec writer**, passing `DESIGN.md` through.

Dispatch `builder-os:spec-writer` with this context:

```text
Operating mode: [detected mode]
Resolved capabilities: [as above]
Pipeline state: initiative [slug], phase 4, cycle [C], mode [full|lite]

PRODUCT.md:
[content]

02-definition.md:
[content]

03-solution-bet.md:
[content]

DESIGN.md:
[content from the previous step]

User request:
[what the user asked]

Write .builderos/initiatives/{initiative}/04-spec.md and run gate 4 before declaring completion.
```

7. **Verify completion:** `## DESIGN COMPLETE` then `## SPEC COMPLETE` with a gate 4 verdict. The marker is the agent's claim, not the evidence: re-read the artifact it wrote and run gate 4 on it yourself per `gate-checks`. A missing artifact or a failed condition is what gets reported, whatever the marker says.
8. **Present** the scope boundaries, the conflicts and who decides them, the acceptance criteria and how the tracking plan computes the phase 2 metric. Ask the person to accept the spec; phase 4 records only with `--accepted-by "who"` from their answer.

## Arguments

- `[--design-only]` — Run the UX architect, stop before the spec.
- `[--spec-only]` — Run the spec writer against an existing `DESIGN.md`.

## Notes

Without delegation, run `ux-architecture` then `spec-writing` inline. Apply the phase 4 criteria in `gate-checks`; neither design-only nor spec-only bypasses them.
