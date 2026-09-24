---
name: bos-ask
description: "Not sure which skill or phase fits: answer up to three questions and get a route through the skills"
---

Entry point for "I don't know where to start". Runs the `orchestrator` skill, which reads the project memory, asks at most three routing questions, and proposes the skills to run and in what order.

**REQUIRED BACKGROUND:** `orchestrator`.

## Steps

1. **Read project memory** if it exists: `.builderos/state.json`, `.builderos/ROADMAP.md`, `PRODUCT.md`, `TECH.md`. Missing memory is not an error; the routing questions cover it.
2. **Run the `orchestrator` procedure** with the user's request verbatim. Capabilities resolve inside the routed skills, not here.
3. **Verify** the output carries the route block and `## ROUTE CHOSEN` after the user confirmed.
4. **Hand off** to the first step of the route: its `/bos-*` or `/pm-*` command when one exists, otherwise its skill.

## Arguments

- `[request]` — Optional. What the user is trying to do, in their words. With no argument, the first question is what they want to walk away with.

## Output

The orchestrator's route block, then the first routed command running.
