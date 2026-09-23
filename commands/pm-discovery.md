---
name: pm-discovery
description: "Synthesize user research — interview analysis, pattern extraction, opportunity scoring, and insight cards"
---

Dispatch the `discovery-synthesizer` agent for research synthesis.

## Steps

1. Gather the research. Text the user provides is the primary input in every case; connected sources enrich it:
   - Transcripts, feedback or survey responses pasted in, or files on disk
   - Research records reachable via `docs.search`
   - Support tickets via `tickets.read`, call transcripts via `meetings.read`
2. Dispatch agent:

```
Agent({
  description: "Discovery synthesis for [topic/research batch]",
  subagent_type: "discovery-synthesizer",
  prompt: "[PM-CONTEXT.md content if available]\n\nResolved capabilities: [capability → concrete tool, or 'none']\n\nResearch data:\n[transcripts, file paths, or the records to search]\n\nSynthesize into themes with participant counts, opportunity scores (ODT), and insight cards."
})
```

3. Verify `## DISCOVERY SYNTHESIS COMPLETE` marker
4. Present synthesis with insight cards and opportunity scores
