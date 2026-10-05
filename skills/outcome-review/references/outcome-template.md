# Outcome Template

Read when writing the phase 7 artifact. `scripts/bos.mjs` parses its headings and bold labels for gates 7.1 to 7.5.

```markdown
# Outcome — {feature}

## Measured {date}, {n} days after rollout

**Method:** {the phase 6 query shape and parameters, rerun identically — or what changed and why}

| Metric | Baseline | Actual | Target | Delta | Tag |
| {success metric} | | | | | |
| {guardrail} | | | — | | |

## Against target
{met / missed / ambiguous, with the number}

## Against kill criteria
**Criterion:** {restated verbatim from 03-solution-bet.md}
**Verdict:** {cleared / triggered}, {the arithmetic}

## Pipeline notes
**Overrides:** {which gates, and what that means for how to read this result}
**Pace:** {time per phase, gates failed before passing, spec rework after the plan, from `bos.mjs pace` or the history}
**Confounders:** {anything else that changed in the window}
**Eval cases added:** {production failures turned into dataset cases, or "no model output"}

## Decision: {KEEP | ITERATE | KILL}
**Why:** {reasoning against both comparisons}
**Re-enters at:** {phase N for ITERATE; none for KILL or a closed KEEP}
**Next:** {the specific thing that happens now}

## Learning
{one sentence that is true when the feature is gone}

**Learning record:** {decisions/learning-{initiative}-cycle-{N}.md or ADR path}
**Scope / confidence:** {population, supporting evidence and uncertainty}
**Revisit when:** {new evidence or changed conditions}

## Watch
{only for KEEP with Re-enters at: none}
**Metric:** {the phase 2 success metric}
**Bands:** {1σ note, 2σ diagnose read-only, 3σ new initiative, against the baseline}
**Owner:** {person who triages a breach}
**Recheck:** {YYYY-MM-DD}
```
