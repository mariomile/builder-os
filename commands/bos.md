---
name: bos
description: "BuilderOS hub — reads pipeline state and routes to the right phase"
---

Stateful entry point. Reads where the project stands and routes to the next phase, or answers a direct request by dispatching the right phase agent.

**REQUIRED BACKGROUND:** `builder-os` skill for the phase map, routing table and dispatch protocol.

## Steps

1. **Read `.builderos/state.json`.** If missing, say so in one line and offer `/bos-init`. Do not guess a phase and do not scaffold silently.

2. **Read `PRODUCT.md`** (or `PM-CONTEXT.md` as fallback).

3. **Detect the operating mode** per the `builder-os` detection protocol.

4. **Route:**
   - No argument → report current phase, last gate result, and dispatch the current phase's command
   - Argument present → match intent against the phase routing table in `builder-os`. If the intent belongs to a phase that is not current, say which phase it belongs to and what the pipeline skips by jumping there, then let the user choose
   - Intent is a standalone analysis question ("what's my churn", "write a PRD") → route to the `pm-*` surface instead, no pipeline involvement

5. **Enforce the previous gate.** If the previous phase's gate failed and was not overridden, refuse with the failed condition per `gate-checks`.

6. **Dispatch** using the agent prompt template in `builder-os`, including mode, MCP list, `PRODUCT.md`, and the previous phase artifact.

## Arguments

- `[intent]` — Optional. What the user wants. Matched against the phase routing table.
- `[--phase N]` — Force a phase. Logs the jump in `history`.

## Output

Before dispatching, one block:

```markdown
**{Product}** · cycle {C} · phase {N} — {phase name} · mode {full|lite}
Last gate: {passed | passed (overridden) | failed: {condition}}
→ Dispatching {agent}
```

Then the agent's output, then the next command.
