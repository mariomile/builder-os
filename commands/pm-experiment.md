---
name: pm-experiment
description: "Design an experiment or analyze results — hypothesis, sample size, metrics triad, and statistical analysis"
---

Dispatch the `experiment-designer` agent. Operates in two modes:

- **Design mode**: User provides hypothesis or idea → generates experiment spec
- **Analysis mode**: User provides results → statistical analysis and recommendation

## Steps

1. Determine mode from user input
2. Dispatch agent:

```
Agent({
  description: "Experiment [design/analysis] for [topic]",
  subagent_type: "experiment-designer",
  prompt: "[PM-CONTEXT.md content if available]\n\nMode: [design/analysis]\n\n[For design: hypothesis or idea]\n[For analysis: control rate, treatment rate, sample sizes, duration]\n\nProvide full experiment spec with metrics triad and sample size calculation."
})
```

3. Verify `## EXPERIMENT DESIGN COMPLETE` or `## EXPERIMENT ANALYSIS COMPLETE`
4. Present results
