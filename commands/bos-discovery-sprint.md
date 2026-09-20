---
name: bos-discovery-sprint
description: "Phases 0 → 1 → 2 in sequence: idea to selected opportunity with a success metric, gates enforced between steps"
---

Runs the front half of the BuilderOS pipeline in one session. Frame, then discover, then define, with each gate enforced before the next phase starts.

**REQUIRED BACKGROUND:** `builder-os` for dispatch, `gate-checks` for the gates between steps.

## Steps

1. **Check pipeline state.** If `.builderos/` is missing, run `/bos-init` first and continue from there. If `current_phase` is already past 0, ask whether to continue from where it stands or start a new cycle.

2. **Phase 0.** Dispatch `problem-framer` per `/bos-frame`. Wait for `## FRAME COMPLETE`.
   Run gate 0. Failed and not overridden → stop the sprint, report the condition. A sprint that carries a broken frame forward produces three artifacts built on the same mistake.

3. **Phase 1.** Dispatch `research-planner` per `/bos-discover`, passing `00-frame.md`.
   - Transcripts or mineable sources available → full phase, verdict expected
   - Neither available → the agent delivers the research plan and the sprint pauses here. This is the normal outcome for a new idea: the conversations have to actually happen. Report what the user needs to bring back
   - Verdict `KILLED` → stop the sprint and report it as a successful outcome, naming what it saved

4. **Phase 2.** Dispatch `opportunity-mapper` per `/bos-define`, passing `00-frame.md` and `01-discovery.md`. Wait for `## DEFINITION COMPLETE`.
   Run gate 2.

5. **Synthesize.** One summary across the three phases: the problem, the evidence, the chosen opportunity, the metric with its baseline and target. Name every gate that was overridden and why.

## Arguments

- `[idea]` — Seeds phase 0.
- `[--transcripts <paths>]` — Interview material for phase 1, enabling a verdict in the same session.
- `[--stop-at N]` — End the sprint after phase N.

## Output

```markdown
## DISCOVERY SPRINT COMPLETE

**Problem:** {}
**Evidence:** {N} primary units, {M} sources · verdict {}
**Opportunity:** {}
**Metric:** {} · {baseline} → {target} by {date}

| Gate | Result |
|------|--------|
| 0 | {} |
| 1 | {} |
| 2 | {} |

{Overrides in force, with reasons.}

**Next:** `/bos-ideate`
```

## Notes

The sprint pauses rather than fakes. If phase 1 has nobody to talk to, it stops with a plan and says so: the pipeline's value is that it refuses to produce a confident opportunity tree out of zero conversations.
