# Experiment Output Contracts

Read when writing a design or an analysis readout. Standalone work keeps its requested format and destination.

```markdown
## EXPERIMENT DESIGN COMPLETE

**Hypothesis:** {statement with mechanism}
**Baseline:** {value, tag} · **MDE:** {absolute pp and relative %, direction} · **Sample per variant:** {n} · **Runtime:** {days, first readable on date}
**Metrics:** output {…} · input {…} · guardrail {…}
**Instrumentation:** {emitted / missing, per metric}
**Decision rule:** ship if {…} · kill if {…} · inconclusive if {…} · permitted extension {method, cap, or none}
```

```markdown
## EXPERIMENT ANALYSIS COMPLETE

**Validity:** {duration, split, instrumentation stability}
**Result:** {metric, control, variant, lift, p-value or interval}
**Guardrails:** {each, with verdict}
**Decision:** {ship / kill / extend / inconclusive}, per the pre-registered rule
**Cannot conclude:** {what this experiment does not answer}
```
