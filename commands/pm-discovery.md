---
name: pm-discovery
description: "Synthesize user research — interview analysis, pattern extraction, opportunity scoring, and insight cards"
---

Dispatch the `discovery-synthesizer` agent for research synthesis.

## Steps

1. Determine data source:
   - User pastes interview transcripts directly
   - Notion interview database
   - Readwise research highlights
2. Dispatch agent:

```
Agent({
  description: "Discovery synthesis for [topic/research batch]",
  subagent_type: "discovery-synthesizer",
  prompt: "[PM-CONTEXT.md content if available]\n\nResearch data:\n[transcripts, Notion database ID, or topic to search]\n\nSynthesize into patterns, opportunity scores (ODT framework), and structured insight cards."
})
```

3. Verify `## DISCOVERY SYNTHESIS COMPLETE` marker
4. Present synthesis with insight cards and opportunity scores
