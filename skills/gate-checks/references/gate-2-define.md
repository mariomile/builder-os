# Gate 2 — Define

Read when running gate 2. E.1 and the procedure in `SKILL.md` apply too. On the feature track, `PRODUCT.md` tags count as phase 1 evidence tags for 2.1.

| # | Condition | Check |
|---|-----------|-------|
| 2.1 | ≥3 opportunities in the tree | Each traceable to a Phase 1 evidence tag |
| 2.2 | Exactly one selected | With a stated rejection reason for each of the others |
| 2.3 | Success metric named | With baseline and target, both source-tagged |
| 2.4 | Baseline is real | Baseline tag is `data`, `code`, or `doc` — not `estimate` or `assumption`. An unsourced zero requires product track plus `Product exists: no`, `Zero rationale`, and valid `First measurement` date under Success metric; then a model must judge applicability to this metric. Existing products require a real source even for zero; missing access stays unavailable |
| 2.5 | Coherent with PMF stage | Pre-PMF (signal score ≤4 per `strategy-frameworks`) rejects scale-oriented opportunities |
| 2.6 | The metric measures an outcome | Shipping the change cannot by itself satisfy the target. A count of what the system does (alerts sent, emails delivered, a feature released) is output: it goes to the tracking plan or a guardrail, and the metric names what the user does or gets differently |

Script-decided: 2.1, 2.2, 2.3. 2.4 is script-decided for sourced baselines, model-judged for a structurally justified pre-product zero. Model-judged: 2.5, 2.6. The emitted `checked_by` split is authoritative.

Example: An existing feature's baseline `0, first measured 2026-09-20` fails 2.4 without a source. A nonexistent product's `Baseline: 0`, `Product exists: no`, `Zero rationale: No users exist to complete this event`, `First measurement: 2026-10-01` reaches model judgment; the rationale must actually apply to the metric.

| Mistake | Why it fails | Correct |
|---------|-------------|---------|
| Accepting a success metric the build satisfies by existing | "Alerts sent within 24 hours" hits its target the day the code ships, so phase 7 measures nothing | Name what the user does differently: acts on the drop, recovers, stays |
| Accepting an `[estimate:*]` baseline | Targets measured against estimates are unfalsifiable | Require a real baseline or an metric-specific, justified pre-product zero |
