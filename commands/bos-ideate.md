---
name: bos-ideate
description: "Phase 3 — generate distinct solution options, select the bet, write kill criteria, and design the cheapest test"
---

**Resources:** The installation root is the parent of this loaded `commands/` directory (or the hook’s installation-root line). Resolve `skills/`, `references/` and `scripts/` there; project artifacts belong in the working project.

**Dispatch:** On Claude Code use the namespaced profiles below, foreground (`run_in_background: false`), and await completion before the next dispatch or gate. On any other host resolve `subagent.dispatch`: pass the skill and context to an available generic agent, or run inline. Load ideation-methods; qualify skill names with `builder-os:` on Claude.

Dispatch the `builder-os:solution-architect` agent to run BuilderOS phase 3.

## Steps

1. **Check pipeline state.** Read the active initiative's `state.json` (resolved per the schema, Active Initiative). Phase 2 must have passed or been overridden. Without a selected opportunity and a success metric there is nothing to generate options against.
2. **Read `.builderos/initiatives/{initiative}/02-definition.md` and `00-frame.md`.** The chosen opportunity, the metric with its baseline and target, and the riskiest assumption.
3. **Resolve capabilities** per `references/capability-map.md` and derive the operating mode.
4. **Dispatch:**

Dispatch `builder-os:solution-architect` with this context:

```text
Operating mode: [detected mode]
Resolved capabilities: [per references/capability-map.md, or 'none beyond files']
Pipeline state: initiative [slug], phase 3, cycle [C], mode [full|lite]

PRODUCT.md:
[content]

00-frame.md:
[content]

02-definition.md:
[content]

User request:
[what the user asked]

Write .builderos/initiatives/{initiative}/03-solution-bet.md and run gate 3 before declaring completion.
```

5. **Verify completion:** `## BET SELECTED` with a gate 3 verdict. The marker is the agent's claim, not the evidence: re-read the artifact it wrote and run gate 3 on it yourself per `gate-checks`. A missing artifact or a failed condition is what gets reported, whatever the marker says.
6. **Present** the option set with its primary actions, the selected bet, the kill criteria and the test order.

## Arguments

- `[--options-only]` — Generate and score the option set, stop before selection.
- `[--test-only]` — Design the cheapest test against an already-selected bet.

## Notes

Gate 3.1 counts mechanisms, not entries. Three rows in the table that all describe the same primary user action count as one option and the gate fails, correctly.

Gate 3.4 is where this phase earns its keep. When the test costs under 20% of the build, the test runs first. A team that overrides it is making a real decision, logged, that phase 7 will read back when judging the outcome.

In lite mode, gate 3.1 relaxes to two options. Gate 3.2 never relaxes: a bet with no kill criteria makes phase 7 decorative.
