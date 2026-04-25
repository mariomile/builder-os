---
name: pm
description: "Product Management hub — routes to the right PM agent based on what you need"
---

Use the `pm-toolkit` skill to understand the user's request and route to the appropriate PM agent.

If the user provides a specific sub-command (e.g., `/pm health`, `/pm growth`), route directly to the corresponding agent. If the request is ambiguous, ask the user what they need:

- **Health check / metrics**: Use `/pm-health`
- **Growth / funnels / retention**: Use `/pm-growth`
- **Tracking plan**: Use `/pm-track`
- **Financial analysis**: Use `/pm-finance`
- **Experiment design**: Use `/pm-experiment`
- **Competitive analysis**: Use `/pm-compete`
- **Write a PRD**: Use `/pm-prd`
- **Release notes**: Use `/pm-release`
- **Research synthesis**: Use `/pm-discovery`
- **Full product audit**: Use `/pm-audit`
