---
name: using-builder-os
description: "Use at the start of any session where BuilderOS is installed, and whenever unsure whether a request belongs to the lifecycle, the analysis surface, or neither"
---

# Using BuilderOS

BuilderOS has two surfaces. Pick one before answering, because they behave differently.

- **Lifecycle** (`builder-os`): an idea, a problem, or a change to a product, walked toward production through gated phases. Stateful: it lives in `.builderos/state.json` and `PRODUCT.md`.
- **Analysis** (`pm-toolkit`): a standalone question about a product that already exists. Stateless: it answers and stops.

Neither: a request with no product question in it goes to whatever else this session offers.

## First Move

1. **Look for `.builderos/state.json`.** If it exists, the user is mid-pipeline: read the current phase, its track and its last gate, and route through `builder-os`. A request that belongs to another phase is named as such before anything runs.
2. **No state, and the request is a product change** ("I have an idea", "we want to add X", "is Y worth doing"): load `builder-os`. Initialization classifies the track (`spike`, `feature` or `product`) and says the classification out loud so the user can correct it.
3. **No state, and the request is a question about existing numbers** ("what's our churn", "write a PRD for this"): load `pm-toolkit`.

`files.read` is the only capability this needs. A host that cannot load skills by name reads the named `SKILL.md` directly.

## Red Flags

Each of these thoughts is a reason to slow down, not to proceed.

| Thought | Reality |
|---------|---------|
| "The user already knows the solution, so framing is pointless" | Initialization offers the `feature` track for exactly this case. Classify it; the track decides what gets skipped, and the skip is recorded |
| "This number is plausible enough to write down" | Unsourced numbers break the Iron Law. Tag it `[assumption:unvalidated]` or ask |
| "The gate is a formality, the artifact is clearly fine" | A gate is checked, not judged. Run it |
| "The agent reported the completion marker, so the phase is done" | A marker is a claim. The gate run on the written artifact is the evidence |
| "It's just a quick question, no need to check state" | A quick question in the middle of a pipeline can contradict a decision already recorded. Read state first |
| "This spike turned into a build, I'll keep going" | A spike ends with a recommendation. Building is a new classification, stated to the user |

## Common Mistakes

| Mistake | Consequence | Fix |
|---------|-------------|-----|
| Answering from memory of a previous session | Stale phase, stale decisions | Read `state.json` every time |
| Routing a pipeline request to `pm-toolkit` | No state written, no gate run | Product changes go to `builder-os` |
| Starting phase 0 on a small change to a live product without offering the `feature` track | The user overrides every gate and the gates stop meaning anything | Classify first, announce the track |
