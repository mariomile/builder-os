---
name: pm-metrics
description: "Deep dive into a specific metric — pull current value, trend, segments, and anomalies"
---

Dispatch the `product-diagnostician` agent in deep-dive mode for a specific metric.

## Steps

1. Find product context (PM-CONTEXT.md)
2. Identify which metric the user wants to analyze
3. Dispatch agent:

```
Agent({
  description: "Metric deep dive: [metric name] for [product]",
  subagent_type: "product-diagnostician",
  prompt: "[PM-CONTEXT.md content]\n\nMode: Metric Deep Dive\n\nMetric to analyze: [specific metric name]\n\nPull current value, 90-day trend, breakdown by all key segments, anomaly detection. Compare to benchmarks for stage."
})
```

4. Verify `## DIAGNOSIS COMPLETE` marker
5. Present focused metric analysis
