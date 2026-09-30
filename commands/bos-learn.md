---
name: bos-learn
description: "Phase 7 — measure the shipped change against its target and its kill criteria, decide keep, iterate or kill, and record the learning"
---

**Resources:** The installation root is the parent of this loaded `commands/` directory (or the hook’s installation-root line). Resolve `skills/`, `references/` and `scripts/` there; project artifacts belong in the working project.

**Dispatch:** On Claude Code use the namespaced profiles below, foreground (`run_in_background: false`), and await completion before the next dispatch or gate. On any other host resolve `subagent.dispatch`: pass the skill and context to an available generic agent, or run inline. Load outcome-review; qualify skill names with `builder-os:` on Claude.

Run BuilderOS phase 7, orchestrating the analysis agents against the phase 2 target and the phase 3 kill criteria.

Use existing specialists against recorded commitments.

## Steps

1. **Check pipeline state.** Read the active initiative's `state.json` (resolved per the schema, Active Initiative). Phase 6 must have passed or been overridden. Actual exposure verification (6.6) must exist; a RELEASE READY plan cannot enter LEARN. Read the override log.
2. **Read `.builderos/initiatives/{initiative}/06-release.md`, `03-solution-bet.md` and `02-definition.md`.** The baseline with its capture method and timestamp, the kill criteria with their date, and the success metric with its target.
3. **Check the review date.** It came from the kill criteria. If it has not arrived or measurement is unavailable, use `defer-review --review-due YYYY-MM-DD --reason ...`; hold phase 7 without inventing a verdict.
4. **Resolve capabilities** per `references/capability-map.md` and derive the operating mode.
5. **Rerun the phase 6 measurement**, identically: same definition, same shape, same parameters, same window length. Then the guardrails from the phase 4 tracking plan.
6. **Dispatch the analysis agents that the question needs**, no more:

| Question | Agent / portable skill |
|----------|-------|
| Did the metric move, and what does the tree look like now | `builder-os:product-diagnostician` / saas-metrics-reference |
| Did activation or retention change | `builder-os:growth-architect` / growth-frameworks |
| Did revenue or unit economics change | `builder-os:finance-analyst` / financial-models |
| Did this move the key results it was tied to | `builder-os:okr-architect` / okr-frameworks |

Pass baseline, target, kill criteria and measurement window; await all analyses before continuing.

7. **Load `outcome-review` and run its Procedure** over the returned numbers: compare against target, evaluate the kill criteria literally, read the overrides, decide, generalize the learning.
8. **Write `.builderos/initiatives/{initiative}/07-outcome.md`** and run gate 7.
9. **Update state.** Use the `outcome-review` decision and `gate-checks` recording protocol; KEEP closes, ITERATE re-enters, KILL closes with `Re-enters at: none`; a new direction needs a separately authorized initiative.
10. **Verify completion:** `## OUTCOME RECORDED` with a gate 7 verdict. The marker is the agent's claim, not the evidence: re-read the artifact it wrote and run gate 7 on it yourself per `gate-checks`. A missing artifact or a failed condition is what gets reported, whatever the marker says.

## Arguments

- `[--measure-only]` — Rerun the measurement and compare, stop before the decision.
- `[--no-dispatch]` — Run `outcome-review` inline without the specialist agents.

## Notes

Without delegation, run `outcome-review` inline. Evaluate kill criteria as written before interpretation. A KILL can pass the gate and stop the initiative. Use `/builder-os:bos-adr` for a decision that merits an ADR.
