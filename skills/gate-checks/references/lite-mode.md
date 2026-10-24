# Lite Mode

Read when `state.json` sets `mode: "lite"`.

`state.json` may set `mode: "lite"` for small features. Lite mode keeps every hard condition (evidence thresholds, kill criteria, test mapping, rollback, baseline) and drops the elaboration conditions: 2.1 relaxes to ≥2 opportunities, 3.1 to ≥2 options, 3.5 to ≥5 raw ideas, 4.9 to ≥2 design versions, 4.5 and 6.4 become warnings rather than failures.

Lite mode never relaxes: E.1, E.2, 1.1, 1.3, 2.3, 2.4, 2.6, 3.2, 3.6, 4.7, 4.8, 4.10, 4.11, 4.12, 4.13, 4.16, 4.17, 4.18, 4.19, 4.21, 5.1, 5.2, 5.3, 5.5, 5.6, 5.8, 5.9, 5.10, 5.12, 5.13, 5.14, 5.16, 5.17, 6.1, 6.2, 6.8, 6.9, 6.10, 6.11, 7.3, 7.5, 7.6, nor the acceptance at phases 0, 4 and 6. It lowers the 4.6 case count, never the threshold. Those are the conditions that prevent building on fiction.
