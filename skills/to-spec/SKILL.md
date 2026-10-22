---
name: to-spec
description: "Turns the current conversation into a spec without an interview: synthesis of what was already discussed, one check on the test seams, gaps named instead of guessed."
disable-model-invocation: true
---

# To Spec

A **synthesis**, not an interview: the conversation already holds the decisions, so the spec is written from it and the person is asked one thing, the test seams. Adapted from Pocock's `to-spec` (MIT).

## Procedure

1. **Synthesize.** Run the [synthesis procedure](../spec-writing/references/synthesis.md) of `spec-writing` on the current conversation and whatever the person passed (a file, an issue, a thread). Done when every decision in the source sits in the spec under its heading, and every unsettled point sits under **Not yet specified** with who decides it.
2. **Write it where it belongs.** Inside a BuilderOS initiative the result is `04-spec.md` and gate 4 runs on it; elsewhere it goes to the destination the person named, with no lifecycle state. Done when the file exists at that destination and, in an initiative, the gate result is recorded.

## Output Contract

`## SPEC DRAFTED` with the destination, the number of user stories and criteria, the seams the person confirmed, and the open points.
