---
name: bos-learn
description: "Phase 7 — measure the shipped change against its target and its kill criteria, decide keep, iterate or kill, and record the learning"
---

Run BuilderOS phase 7, orchestrating the analysis agents against the phase 2 target and the phase 3 kill criteria.

Phase 7 adds no new specialist. It reuses the analysis surface that already exists and holds it to the commitments the pipeline made earlier.

## Steps

1. **Check pipeline state.** Read `.builderos/state.json`. Phase 6 must have passed or been overridden. Also read the override log: it changes how this result should be read.
2. **Read `.builderos/initiatives/{initiative}/06-release.md`, `03-solution-bet.md` and `02-definition.md`.** The baseline with its capture method and timestamp, the kill criteria with their date, and the success metric with its target.
3. **Check the review date.** It came from the kill criteria. If it has not arrived, say so and schedule; a number read early has not stabilized, and reading it anyway is how a good bet gets killed.
4. **Resolve capabilities** per `references/capability-map.md` and derive the operating mode.
5. **Rerun the phase 6 measurement**, identically: same definition, same shape, same parameters, same window length. Then the guardrails from the phase 4 tracking plan.
6. **Dispatch the analysis agents that the question needs**, no more:

| Question | Agent |
|----------|-------|
| Did the metric move, and what does the tree look like now | `product-diagnostician` |
| Did activation or retention change | `growth-architect` |
| Did revenue or unit economics change | `finance-analyst` |
| Did this move the key results it was tied to | `okr-architect` |

Each dispatch carries the baseline, the target, the kill criteria and the measurement window, so the agent compares against commitments rather than producing a general analysis.

7. **Load `outcome-review` and run its Procedure** over the returned numbers: compare against target, evaluate the kill criteria literally, read the overrides, decide, generalize the learning.
8. **Write `.builderos/initiatives/{initiative}/07-outcome.md`** and run gate 7.
9. **Update state.** On KEEP the cycle closes. On ITERATE or KILL, increment `cycle` and set `current_phase` to the re-entry phase.
10. **Verify completion:** `## OUTCOME RECORDED` with a gate 7 verdict. The marker is the agent's claim, not the evidence: re-read the artifact it wrote and run gate 7 on it yourself per `gate-checks`. A missing artifact or a failed condition is what gets reported, whatever the marker says.

## Arguments

- `[--measure-only]` — Rerun the measurement and compare, stop before the decision.
- `[--no-dispatch]` — Run `outcome-review` inline without the specialist agents.

## Notes

On a host without subagent dispatch, load `outcome-review` and run its procedure inline, pulling the numbers directly. The specialists sharpen the analysis; they are not required to reach a decision.

Gate 7.2 evaluates the kill criteria as written: metric, threshold, date, action. Reinterpreting them after seeing the result is the exact failure phase 3 wrote them down to prevent. Interpretation belongs in a separate paragraph, after the verdict.

`KILL` is a successful pass. A wrong bet caught at phase 7 with a tested rollback costs one release; the same wrong belief carried for four quarters costs a roadmap.

Where the decision is irreversible or expensive to unwind, write the ADR with `/bos-adr`.
