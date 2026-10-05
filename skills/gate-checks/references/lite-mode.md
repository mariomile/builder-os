# Lite Mode

Read when `state.json` sets `mode: "lite"`.

`state.json` may set `mode: "lite"` for small features. Lite mode keeps every hard condition (evidence thresholds, kill criteria, test mapping, rollback, baseline) and drops the elaboration conditions: 2.1 relaxes to ≥2 opportunities, 3.1 to ≥2 options, 4.5 and 6.4 become warnings rather than failures.

Lite mode never relaxes: E.1, 1.1, 1.3, 2.3, 2.4, 2.6, 3.2, 4.7, 5.1, 5.2, 5.3, 5.5, 5.6, 6.1, 6.2, 6.8, 7.3, 7.5, nor the acceptance at phases 0, 4 and 6. It lowers the 4.6 case count, never the threshold. Those are the conditions that prevent building on fiction.
