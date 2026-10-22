---
name: bos-shape
description: "Phase 4 — turn the selected bet into a spec: flows, business rules, the look and the stack decided with the user, bounded scope, testable acceptance criteria, full state coverage, and the tracking plan"
---

**Resources:** The installation root is the parent of this loaded `commands/` directory (or the hook’s installation-root line). Resolve `skills/`, `references/` and `scripts/` there; project artifacts belong in the working project.

**Dispatch:** On Claude Code use the namespaced profiles below, foreground (`run_in_background: false`), and await completion before the next dispatch or gate. On any other host resolve `subagent.dispatch`: pass the skill and context to an available generic agent, or run inline. Qualify skill names with `builder-os:` on Claude.

Dispatch `builder-os:ux-architect`, run the rules, the look and the stack with the user here, then dispatch `builder-os:spec-writer`, for BuilderOS phase 4.

## Steps

1. **Check pipeline state.** Read the active initiative's `state.json` (per the schema, Active Initiative). Phase 3 must have passed, been overridden, or be `covered` by the change track's mandate check (then the input is `00-request.md` instead of `03-solution-bet.md`).
2. **Read `03-solution-bet.md` and `02-definition.md`** in `.builderos/initiatives/{initiative}/`: the primary action, the kill criteria, the success metric. On the change track, `00-request.md` and `DOMAIN.md` instead.
3. **Resolve capabilities** per `references/capability-map.md`, including `ui.render`, and derive the operating mode.
4. **Dispatch `builder-os:ux-architect`** with mode, capabilities, pipeline state (initiative, phase 4, cycle, mode), `PRODUCT.md`, `03-solution-bet.md` and the user's request. It writes the flows into `DESIGN.md` and ends with `## DESIGN COMPLETE`.
5. **Run `domain-model`, then `agent-design` when a model acts, then `design-direction`, in this conversation:** entities, transitions and business rules as round questions, a logic prototype when the rules are non-trivial; autonomy per action as round questions; then reference screens and the versions as files under `design/`, shown through `ui.render` where it resolved, the choice in rounds. The user's answers cannot be collected inside a dispatch.
6. **Run `stack-decisions` in this conversation:** inherited layers from the repository, a decision card per open layer, rounds, ADRs, `TECH.md` → Stack. Then the design kit (`design-direction`, step 6) and the tokens.
7. **Dispatch `builder-os:spec-writer`** with mode, capabilities, pipeline state, `PRODUCT.md`, `02-definition.md`, `03-solution-bet.md`, `DESIGN.md`, the stack decisions with who made them, the agent behavior the user decided, and the user's request. Ask it to write `04-spec.md` and run gate 4.
8. **Verify completion:** `## SPEC COMPLETE` with a gate 4 verdict. The marker is the agent's claim: re-read the artifact and run gate 4 yourself per `gate-checks`. Report a missing artifact or failed condition, whatever the marker says.
9. **Present `## What we chose` first**, then scope, conflicts, criteria and how the tracking plan computes the phase 2 metric. Ask the person to accept; phase 4 records only with `--accepted-by "who"` from their answer.

## Arguments

- `[--design-only]` — Steps 4 and 5, stop before the stack.
- `[--stack-only]` — Step 6 against an existing `DESIGN.md`.
- `[--spec-only]` — Step 7 against an existing `DESIGN.md` and decided stack.

## Notes

Without delegation, run the skills inline in the same order. Gates 4.8, 4.9, 4.10 and 4.16 refuse a stack, a look, business rules or an agent's autonomy nobody decided; no argument bypasses them.
