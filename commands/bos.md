---
name: bos
description: "BuilderOS hub — reads pipeline state and routes to the right phase"
---

**Resources:** The installation root is the parent of this loaded `commands/` directory (or the hook’s installation-root line). Resolve `skills/`, `references/` and `scripts/` there; project artifacts belong in the working project.

**Dispatch:** On Claude Code use the namespaced profiles below, foreground (`run_in_background: false`), and await completion before the next dispatch or gate. On any other host resolve `subagent.dispatch`: pass the skill and context to an available generic agent, or run inline. Do not assume Claude profiles exist.

Stateful entry point. Reads where the project stands and routes to the next phase, or answers a direct request by dispatching the right phase agent.

**REQUIRED BACKGROUND:** `builder-os` skill for the phase map, routing table and dispatch protocol.

## Steps

1. **Read `.builderos/ROADMAP.md` and resolve the active initiative** per the schema (Active Initiative), then read its `state.json`. If `.builderos/` is missing, say so in one line and offer `/builder-os:bos-init`. Do not guess a phase and do not scaffold silently. If a `schema: 1` file sits at `.builderos/state.json`, migrate it per the schema's Rules first and say what moved.

2. **Read `PRODUCT.md`** (or `PM-CONTEXT.md` as fallback).

3. **Resolve capabilities** per `references/capability-map.md` and derive the operating mode.

4. **Route:**
   - No argument → report current phase, last gate result, and dispatch the current phase's command
   - Argument present → match intent against the phase routing table in `builder-os`. If the intent belongs to a phase that is not current, say which phase it belongs to and what the pipeline skips by jumping there, then let the user choose
   - Intent is new work unrelated to the active initiative ("we should also add X") → offer a new initiative with `/builder-os:bos-init`, which pauses the current one; never fold it into the active pipeline
   - Intent is a standalone analysis question ("what's my churn", "write a PRD") → route per `using-builder-os` to the specialist skill, no pipeline involvement. A PRD for an unbuilt feature can also be standalone; preserve the requested scope and destination per `references/operating-modes.md`

5. **Enforce the previous gate.** If the previous phase's gate failed, was not overridden and the phase is not `covered`, refuse with the failed condition per `gate-checks`. If phase 1 is `answered`, the spike is over: report its verdict and offer to reclassify.

6. **Dispatch and await completion** using the agent prompt template in `builder-os`, including mode, resolved capabilities, `PRODUCT.md`, and the previous phase artifact.

## Arguments

- `[intent]` — Optional. What the user wants. Matched against the phase routing table.
- `[--phase N]` — Force a phase. Logs a `phase_jump` event in `history`.
- `[--initiative slug]` — Switch the active initiative, then route. The switch is logged and named to the user.

## Output

Before dispatching, one block:

```markdown
**{Product}** · {initiative} · cycle {C} · phase {N} — {phase name} · mode {full|lite} · track {spike|feature|product}
Last gate: {passed | passed (overridden) | failed: {condition}}
→ Dispatching {agent}
```

Then the agent's output, then the next command.
