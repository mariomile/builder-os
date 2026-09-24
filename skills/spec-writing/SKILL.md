---
name: spec-writing
description: "Use when a chosen bet needs a buildable specification — scope boundaries, testable acceptance criteria, enumerated states and edge cases, and the tracking plan that will measure whether it worked"
---

# Spec Writing

Phase 3 chose the bet. Phase 4 makes it buildable by someone who was not in the conversation, and measurable by someone who reads the result three months later.

A spec has one job: remove the decisions an implementer would otherwise make silently. Every ambiguity left in the document becomes a choice made at 4pm by whoever hit it first.

**REQUIRED BACKGROUND:** `evidence-ledger` for tagging. `ux-architecture` for flows, states and the accessibility floor. `tracking-standards` for the event design. `pm-artifacts` for the PRD template when the output is also a document for humans. `references/capability-map.md` before touching any data source.

## Scope Boundaries

Gate 4.2 fails an empty out-of-scope list, because an empty one means the scope was never bounded, only described.

Three kinds of boundary, all worth writing:

| Boundary | Form | Why it matters |
|----------|------|---------------|
| **Not now** | "Bulk editing is out of scope for this release" | The common case. Protects the timeline |
| **Not ever, by design** | "We will not support offline editing; the conflict model would cost more than the feature is worth" | Prevents the same argument every quarter |
| **Not until X** | "Multi-workspace support waits until a second workspace exists in production" | Names the trigger rather than the date |

Write the boundary that someone will argue with. An out-of-scope list containing only things nobody wanted is not a boundary, it is padding.

**Out of scope is not the same as not yet specified.** Out of scope lies beyond what this release is for: it never comes back unless the bet changes. Not yet specified lies inside the scope and is simply not decided yet: how a limit is enforced, which of two error behaviors applies. Filing an open question under out of scope quietly drops it; leaving it unfiled hands the decision to whoever implements it. Each open question goes under **Not yet specified** with who decides it and which acceptance criteria wait on it, so phase 5 can build the slices that do not.

## Acceptance Criteria

Gate 4.1: **every criterion is a testable assertion.** The mechanical check is a subject plus a verifiable verb, with no adjective doing the work.

| Not testable | Testable |
|--------------|----------|
| "The import should be fast" | "A 10,000-row file finishes importing within 30 seconds on the standard plan" |
| "Errors are handled gracefully" | "A malformed row is skipped, counted, and reported in the summary; the remaining rows still import" |
| "The UX should be intuitive" | "A user who has never imported completes the flow without opening help, in usability testing with 5 participants" |
| "Data is secure" | "A user cannot read a record belonging to another workspace through any documented endpoint" |

The adjective test: strike every adjective from the criterion. If nothing verifiable remains, it was not a criterion.

Each criterion needs a subject that exists in the product, a verb that produces an observable outcome, and a condition under which it is checked. Anything else is a hope, and phase 5 will map a test to it and discover there is nothing to assert.

## State and Edge-Case Enumeration

Gate 4.3 requires an error state and an empty state for every flow. Those two are the enumerated minimum, not the complete set. The full set per screen or step:

| State | The question it answers |
|-------|------------------------|
| **Empty** | What does a new user see before anything exists? |
| **Loading** | What is shown while waiting, and for how long before that changes? |
| **Partial** | What if some of it worked? Half-imported, some permissions, stale cache |
| **Error** | What broke, whose fault, what do they do now? |
| **Success** | What confirms it worked, and what is the next action? |
| **Permission** | What does someone without access see? Not a blank screen |

Partial is the state teams skip and the one that generates support tickets. Any operation over a collection has a partial state by construction.

### Edge cases worth enumerating

Work these four categories against each flow; they cover most of what ships broken:

1. **Zero, one, many, too many.** Empty collection, single item, normal, and the volume that breaks the page.
2. **Concurrency.** Two people acting at once, the same person in two tabs, an action arriving after a state change.
3. **Interrupted.** The user closes the tab mid-flow, the connection drops, the token expires halfway.
4. **Hostile or malformed input.** Not only security: a spreadsheet with merged cells, an emoji in a name field, a 50MB file.

Each enumerated case gets an expected behavior in the spec. "Undefined" is an acceptable answer only when written down as a deliberate choice.

## Tracking Before Build

Gate 4.4: the tracking plan names the events that will measure the phase 2 success metric. Designed now, not after launch, because instrumentation added afterwards cannot measure the launch.

Per the phase 2 metric, work backwards: which events, with which properties, would compute this number? Then check each against what already exists via `tracking-standards`. The output is a table the implementer can build from, and the input to gate 5.3 and gate 6.3.

A spec whose tracking plan cannot compute the phase 2 metric has failed to connect the build to the reason for building it, and phase 7 will have nothing to evaluate.

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `repo.read` | What exists, what the current flows do, what is already instrumented | Ask the user to describe the current behavior; mark the spec as written without code access |
| `analytics.events` | Which of the planned events already exist | Read the instrumentation from source; where there is no source, design from scratch and note it |
| `docs.search` | Prior specs, design decisions, constraints already agreed | Ask |
| `tickets.read` | Bugs and requests that bound the scope | Skip |
| `files.read` / `files.write` | Previous artifacts, this artifact, state | Required |

**Phase 4 needs no data capability.** A spec is a design artifact. Missing `repo.read` makes effort estimates softer and the "what exists today" section thinner; it does not block the phase.

## Procedure

Run in order. Delegate where the host allows it, run inline where it does not.

1. **Read `03-solution-bet.md` and `02-definition.md`.** The selected bet with its primary user action, the kill criteria, and the success metric with its baseline. No `03-solution-bet.md` means stop: a spec without a chosen bet specifies a guess.

2. **State what exists today.** The current behavior in the area the bet touches, read from the code where `repo.read` resolved, from the user where it did not. A spec that does not say what it is changing produces a diff nobody can review against it.

3. **Bound the scope.** In scope, then out of scope in the three boundary forms. Write the boundary someone will argue with. Gate 4.2 fails an empty list.

4. **Design the flows.** Hand to `ux-architecture` for information architecture, flow design, the six states per step, the component inventory and the accessibility floor. Where a design-quality toolchain is present in the session, delegate visual craft to it and keep the structure here. `DESIGN.md` comes out of that skill; this procedure consumes its flow list.

5. **Write acceptance criteria.** One per requirement, each a testable assertion. Run the adjective test on every line. Criteria are numbered, because phase 5 maps tests to them by number.

6. **Enumerate states and edge cases.** The six states per flow, then the four edge-case categories. Every case gets an expected behavior, including the deliberate "undefined".

7. **Design the tracking plan.** Work backwards from the phase 2 metric to the events and properties that compute it. Check each against the existing catalogue via `tracking-standards`. Mark each event new or existing.

8. **Write and gate.** Write `.builderos/04-spec.md`, confirm `DESIGN.md` exists, run gate 4, update `state.json`, advance to phase 5 on pass.

Completion marker: `## SPEC COMPLETE` with the scope boundaries, the numbered acceptance criteria, the state coverage, the tracking plan and the gate result.

## Output Contract

`.builderos/04-spec.md`:

```markdown
# Spec — {feature}

## The bet
{from 03-solution-bet.md: the primary user action, the kill criteria}

## Today
{current behavior in the area this changes, with file references where code was read}

## In scope
{what this release does}

## Out of scope
| Item | Kind | Reason |
| {item} | not now / not ever / not until X | {reason, or the trigger} |

## Not yet specified
| Open question | Decides | Blocks |
| {in-scope question still open} | {person} | {AC numbers that wait on it, or "none"} |

## Flows
{reference to DESIGN.md, with the flow list and where each is specified}

## Acceptance criteria
| # | Criterion | Flow |
| 1 | {subject + verifiable verb + condition} | {flow} |

## States
| Flow / step | Empty | Loading | Partial | Error | Success | Permission |

## Edge cases
| Case | Category | Expected behavior |

## Tracking plan
| Event | Trigger | Properties | Measures | New or existing |

**Computes the phase 2 metric:** {how the named events produce that number}

## Open questions
{decisions deferred, each with who decides and by when}
```

## Common Mistakes

| Mistake | Why it fails | Correct |
|---------|-------------|---------|
| Empty out-of-scope list | Gate 4.2 fails; scope was described, not bounded | Write the boundary someone will argue with |
| An open question filed under out of scope | The question disappears and the implementer answers it silently | Out of scope is beyond the bet; an undecided in-scope question goes under Not yet specified |
| An adjective doing the work in a criterion | Nothing to test in phase 5 | Strike the adjectives; what remains must be verifiable |
| Unnumbered acceptance criteria | Phase 5 maps tests by number | Number them |
| Only happy-path states | The partial and permission states generate the support load | Six states per flow, every time |
| Tracking designed after the build | Cannot measure the launch it was meant to measure | Work backwards from the phase 2 metric, before building |
| A tracking plan that cannot compute the success metric | Gate 4.4 fails; phase 7 has nothing to evaluate | State explicitly how the events produce the number |
| Open questions with no owner | They resolve themselves badly, at implementation time | Who decides, by when |
| Specifying a flow the bet did not choose | Scope creep before a line is written | Every flow traces to the phase 3 primary action |
