---
name: to-tickets
description: "Breaks a plan, a spec or the current conversation into tracer-bullet tickets with blocking edges, quizzes the person on the breakdown, and publishes one ticket per file or to the tracker."
disable-model-invocation: true
---

# To Tickets

Each ticket is a **tracer bullet**: a thin slice through every layer that runs end to end, so the first one proves the path and the rest widen it. Adapted from Pocock's `to-tickets` (MIT).

## Procedure

1. **Slice and quiz.** Run the method in [tickets](../delivery-discipline/references/tickets.md) on what the person passed (a spec, a build plan, an issue) or on the current conversation. Done when the person approved the breakdown: the slices, their blocking edges and their order.
2. **Publish.** Inside a BuilderOS initiative the slices are the build plan's, the quiz comes before the plan's acceptance, and the tickets go to `.builderos/initiatives/{initiative}/tickets/`. Elsewhere they go to `.builderos/tickets/{slug}/`, the tracker, or the destination the person named. Done when every approved slice exists as one ticket with its blockers written in it.

## Output Contract

`## TICKETS PUBLISHED` with where they went, the frontier (the tickets with no open blocker) and the critical path.
