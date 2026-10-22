# Tickets

How a plan, a spec or a conversation becomes **tickets**: tracer-bullet slices that each declare the tickets that **block** them, small enough that a fresh session (or a parallel one) can take one and finish it. Used by phase 5, step 3 and step 4, and by `to-tickets`. Adapted from Pocock's `to-tickets` (MIT).

## 1. Gather

Work from the plan, the spec or the conversation; fetch any reference passed in and read its full body. Explore the code the work touches where `repo.read` resolved, using the terms in `PRODUCT.md` → Language and respecting the ADRs in the area. Look for a **prefactor**: make the change easy, then make the easy change. A prefactor is the first ticket.

## 2. Slice

- Each slice cuts a narrow but complete path through every layer the behavior needs (schema, API, interface, tests): vertical, never one layer at a time.
- A finished slice is demoable or verifiable on its own, against acceptance criteria named by number.
- Each slice fits one fresh session.
- Each slice lists the tickets that block it; one with no blocker can start now.

**Wide refactors are the exception.** One mechanical change whose blast radius crosses the codebase (renaming a column, retyping a shared symbol) breaks thousands of call sites at once, so no vertical slice can land green. Sequence it **expand–contract**: expand (add the new form beside the old, nothing breaks), migrate the call sites in batches sized by blast radius (per package, per directory), each batch its own ticket blocked by the expand and green on its own because the old form still exists, then contract (delete the old form) in a ticket blocked by every batch. When even the batches cannot stay green alone, keep the sequence on one integration branch and promise green only at a final integrate-and-verify ticket.

## 3. Quiz the person

Present the breakdown as a numbered list: per ticket its title, what it blocks on, and what it delivers end to end. Then one `pressure-testing` round, with your recommendation on each:

- Is the granularity right, or too coarse or too fine?
- Does each ticket depend only on tickets that really gate it?
- Should any be merged or split?

Iterate until the person approves the breakdown. In phase 5 this happens before the plan is accepted, and the accepted plan's slices are these tickets.

## 4. Publish

One ticket per file, numbered in dependency order (blockers first): `.builderos/initiatives/{initiative}/tickets/NN-{slug}.md` in an initiative, `.builderos/tickets/{slug}/NN-{slug}.md` outside one, or the destination the person named. Where `tickets.write` resolved and the person wants the tracker, publish one issue per ticket in the same order, using the tracker's native blocking links and parent issue, and write each link into its file. Leave any parent issue unchanged.

```markdown
# NN: {ticket title}

**What to build:** {the end-to-end behavior this ticket makes work, from the user's side, not a list per layer}
**Acceptance criteria:** {the spec's criteria by number, or the checks for this ticket}
**Blocked by:** {numbers and titles of the tickets that gate it, or none}
**Status:** ready

- [ ] {criterion or check}
```

Leave file paths and code out of tickets: they go stale. The exception is a snippet from a prototype that states a decision more exactly than prose (a state machine, a schema, a type), trimmed to the decision.

Work the **frontier**: any ticket whose blockers are all done. A purely linear chain is worked top to bottom.
