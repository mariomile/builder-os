---
name: bos-shape
description: "Phase 4 — turn the selected bet into a spec: bounded scope, testable acceptance criteria, flows with full state coverage, and the tracking plan"
---

Dispatch `ux-architect` then `spec-writer` to run BuilderOS phase 4.

## Steps

1. **Check pipeline state.** Read `.builderos/state.json`. Phase 3 must have passed or been overridden. Without a selected bet and its kill criteria there is nothing to specify.
2. **Read `.builderos/03-solution-bet.md` and `02-definition.md`.** The primary user action, the kill criteria, and the success metric the tracking plan must compute.
3. **Resolve capabilities** per `references/capability-map.md` and derive the operating mode.
4. **Detect a design-quality toolchain** in this session. If one is present, the UX architect delegates visual craft to it and keeps the structure. Absence is the expected case and costs nothing; never prompt an install.
5. **Dispatch the UX architect first.** The spec consumes its flow list, so the order matters.

```
Agent({
  description: "Structural design for [feature]",
  subagent_type: "ux-architect",
  prompt: "Operating mode: [detected mode]
Resolved capabilities: [per references/capability-map.md, or 'none beyond files']
Pipeline state: phase 4, cycle [C], mode [full|lite]
Design toolchain present: [yes, named | no]

PRODUCT.md:
[content]

03-solution-bet.md:
[content]

User request:
[what the user asked]

Write DESIGN.md. End with ## DESIGN COMPLETE."
})
```

6. **Dispatch the spec writer**, passing `DESIGN.md` through.

```
Agent({
  description: "Spec for [feature]",
  subagent_type: "spec-writer",
  prompt: "Operating mode: [detected mode]
Resolved capabilities: [as above]
Pipeline state: phase 4, cycle [C], mode [full|lite]

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

Write .builderos/04-spec.md and run gate 4 before declaring completion."
})
```

7. **Verify completion:** `## DESIGN COMPLETE` then `## SPEC COMPLETE` with a gate 4 verdict.
8. **Present** the scope boundaries, the acceptance criteria and how the tracking plan computes the phase 2 metric.

## Arguments

- `[--design-only]` — Run the UX architect, stop before the spec.
- `[--spec-only]` — Run the spec writer against an existing `DESIGN.md`.

## Notes

On a host without subagent dispatch, load `ux-architecture` and then `spec-writing` and run their procedures inline, in that order. Same artifacts, same gate.

Gate 4.2 fails an empty out-of-scope list. That is not pedantry: an unbounded scope is what phase 5's scope-creep check has nothing to check against.

Gate 4.4 is the link between building and learning. If the named events cannot compute the phase 2 success metric, phase 7 will have nothing to evaluate and the kill criteria from phase 3 become unenforceable.

In lite mode, gate 4.5 becomes a warning rather than a failure. Gates 4.1, 4.2 and 4.4 never relax.
