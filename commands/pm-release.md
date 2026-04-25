---
name: pm-release
description: "Write release notes — customer-facing, benefit-focused, with highlights and improvements"
---

Dispatch the `product-writer` agent in release notes mode.

## Steps

1. Find product context (PM-CONTEXT.md)
2. Ask for changes/features to document if not provided
3. Dispatch agent:

```
Agent({
  description: "Release notes for [version/date]",
  subagent_type: "product-writer",
  prompt: "[PM-CONTEXT.md content]\n\nMode: Release Notes\n\nChanges to document:\n[list of features, improvements, bug fixes]\n\nWrite customer-facing release notes with highlights, improvements, and bug fixes. Tone: friendly, benefit-focused, no jargon."
})
```

4. Verify `## ARTIFACT WRITTEN` marker
5. Present release notes
