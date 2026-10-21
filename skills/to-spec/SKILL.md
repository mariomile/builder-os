---
name: to-spec
description: "Turns the current conversation into a spec without an interview: synthesis of what was already discussed, one check on the test seams, gaps named instead of guessed."
disable-model-invocation: true
---

# To Spec

Run the **Synthesis Procedure** in [spec-writing](../spec-writing/SKILL.md) on the current conversation and whatever the person passed (a file, an issue, a thread). It asks one question, on the test seams, and writes every unsettled point under **Not yet specified** with who decides it.

Inside a BuilderOS initiative the result is `04-spec.md` and gate 4 runs on it; outside one it goes where the person asked, with no lifecycle state. Adapted from Pocock's `to-spec` (MIT).

Completion marker: `## SPEC DRAFTED` with the destination, the number of user stories and criteria, the seams the person confirmed, and the open points.
