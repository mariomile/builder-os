---
name: to-tickets
description: "Breaks a plan, a spec or the current conversation into tracer-bullet tickets with blocking edges, quizzes the person on the breakdown, and publishes one ticket per file or to the tracker."
disable-model-invocation: true
---

# To Tickets

Run the method in [tickets](../delivery-discipline/references/tickets.md) on what the person passed (a spec, a build plan, an issue) or on the current conversation: vertical slices, blocking edges, the quiz until the person approves, then one ticket per file or per issue.

Inside a BuilderOS initiative the slices are the build plan's, the quiz happens before the plan's acceptance, and the tickets go to `.builderos/initiatives/{initiative}/tickets/`. Outside one, they go to `.builderos/tickets/{slug}/` or the destination the person named. Adapted from Pocock's `to-tickets` (MIT).

Completion marker: `## TICKETS PUBLISHED` with where they went, the frontier (the tickets with no open blocker) and the critical path.
