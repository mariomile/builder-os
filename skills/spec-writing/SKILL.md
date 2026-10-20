---
name: spec-writing
description: "Use when a chosen bet needs a buildable specification — scope boundaries, testable acceptance criteria, enumerated states and edge cases, and the tracking plan that will measure whether it worked"
---

# Spec Writing

Phase 4 makes the chosen bet buildable by someone who was not in the conversation, and measurable by someone who reads the result three months later. A spec has one job: remove the decisions an implementer would otherwise make silently.

Read [operating modes](../../references/operating-modes.md) first. Lifecycle artifact paths, gates and state writes below apply only to an explicitly selected initiative.

Load `ux-architecture` only for flows needing design work, `domain-model`, `design-direction` and `stack-decisions` in lifecycle SHAPE and when a standalone spec needs the look or the stack, `tracking-standards` only for event design, `pm-artifacts` only for a requested PRD template, and `evidence-ledger` only for lifecycle tags. Read [capability mapping](../../references/capability-map.md) only before resolving external context. Do not recursively load the same skill through UX.

Read the relevant section of [spec methods](references/spec-methods.md) for the forms, examples and rules behind steps 3 to 7c.

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `repo.read` | What exists, what the current flows do, what is already instrumented | Ask the user to describe the current behavior; mark the spec as written without code access |
| `analytics.events` | Which of the planned events already exist | Read the instrumentation from source; where there is no source, design from scratch and note it |
| `docs.search` | Prior specs, design decisions, constraints already agreed | Ask |
| `tickets.read` | Bugs and requests that bound the scope | Skip |
| `files.read` / `files.write` | Previous artifacts, this artifact, state | Required |

**Phase 4 needs no data capability.** Missing `repo.read` makes effort estimates softer and the "what exists today" section thinner; it does not block the phase.

## Standalone Procedure

Use supplied requirements, current behavior and constraints. Write the requested scope, numbered assertions and relevant states. Mark unknown facts and owner decisions; do not require a solution-bet file or initialize an initiative. A request for a draft does not authorize implementation.

## Lifecycle Procedure

Run in order. Delegate where the host allows it, run inline where it does not.

1. **Read `03-solution-bet.md` and `02-definition.md`.** The selected bet with its primary user action, the kill criteria, and the success metric with its baseline. No `03-solution-bet.md` means stop: a spec without a chosen bet specifies a guess.

2. **State what exists today.** The current behavior in the area the bet touches, read from the code where `repo.read` resolved, from the user where it did not. Read `TECH.md` and the constraints in `PRODUCT.md` first: they bound what the spec may ask for, and a spec that contradicts one names it and says why.

3. **Bound the scope.** In scope, then out of scope as not now, not ever by design, or not until X, including the boundary someone will argue with. Gate 4.2 fails an empty list. An undecided in-scope question goes under **Not yet specified** with who decides it and which acceptance criteria wait on it, never under out of scope.

4. **Design the flows.** Hand information architecture, flows, per-step states, the component inventory and the accessibility floor to `ux-architecture`, which writes `DESIGN.md`; consume its flow list. Every flow traces to the phase 3 primary action.

4a. **Model the domain with the user.** Run `domain-model`: the entities this work touches, their states and transitions with who and under which condition, the invariants, the awkward scenarios, the business rules put to the user as round questions, a clickable logic prototype when the rules are non-trivial, and the data sketch. `## Domain model` in `DESIGN.md` (gate 4.10). The stack in step 4c reads the data sketch.

4b. **Let the user choose the look.** Run `design-direction` on the primary flow: rendered versions as files, a choice in rounds, `## Visual direction` in `DESIGN.md` (gate 4.9). The design kit waits for step 4c to settle the interface layer.

4c. **Decide the stack with the user.** Run `stack-decisions`: inherited layers read from the repository, every open layer the work needs put to the user as a decision card in rounds, ADRs for the hard-to-reverse ones, `TECH.md` → Stack updated, and the `## Stack` section of the spec written (gate 4.8). Then return to `design-direction` for the kit. These steps ask the user; where this phase runs delegated, the delegate returns the round and the main conversation asks it.

5. **Write acceptance criteria.** One per requirement, numbered, because phase 5 maps tests to them by number. Gate 4.1: each is a testable assertion with a subject that exists in the product, a verb with an observable outcome, and a condition under which it is checked. Adjective test: strike every adjective; if nothing verifiable remains, it was not a criterion.

6. **Enumerate states and edge cases.** Six states per flow: empty, loading, partial, error, success, permission; gate 4.3 requires empty and error for every flow. Then the four edge-case categories: zero/one/many/too many, concurrency, interrupted, hostile or malformed input. Every case gets an expected behavior; "undefined" only when written down as a deliberate choice.

7. **Design the tracking plan, before the build.** Gate 4.4: work backwards from the phase 2 metric to the events and properties that compute it. Check each against the existing catalogue via `tracking-standards`, mark it new or existing, and state how the events produce the number.

7b. **If a criterion depends on model output, write the eval set** before the build and before the prompt. Declare `**Model output:** yes`; gate 4.6 checks an actual dataset file of at least 20 cases (10 in lite mode) with a threshold, a judge and must-pass cases. Label synthetic cases; never invent unavailable real inputs as observations.

7c. **List the constraint conflicts.** Check each requirement against the `PRODUCT.md` and `TECH.md` constraints. Write every collision with who decides it and the criteria it blocks, or state which constraints were checked and that none collide; gate 4.7 requires the `## Conflicts` section. Close conflicts with their owner before acceptance, or carry them as blocking edges into phase 5.

8. **Write and gate.** Write `.builderos/initiatives/{initiative}/04-spec.md`, confirm `DESIGN.md` exists, run gate 4. Write `## What we chose` in plain words: the product's main objects and the rules that will surprise someone, then per stack layer and for the visual direction and kit, what was chosen, why, the alternative set aside, what it costs, and what would make us change it; one line each, readable by someone who was not in the rounds (gate 4.8 checks the section exists). On a pass, present that summary first, then the spec, and ask for acceptance (a technical reviewer joins for a high-risk change); record it with the person's answer (`scripts/bos.mjs record 4 --judged "{judge-id}=pass|fail,..." --accepted-by "who"` where commands run), which advances to phase 5. Never accept on their behalf.

Completion marker: `## SPEC COMPLETE` with the scope boundaries, the conflicts, the domain rules, the stack and visual direction with who chose them, the numbered acceptance criteria, the state coverage, the tracking plan, the gate result and who accepted.

## Output Contract

`.builderos/initiatives/{initiative}/04-spec.md`, written to the [spec template](references/spec-template.md). Gate 4 parses its headings, bold labels and tables, so keep them exactly.

## Common Mistakes

| Mistake | Why it fails | Correct |
|---------|-------------|---------|
| An open question filed under out of scope | The question disappears and the implementer answers it silently | Out of scope is beyond the bet; an undecided in-scope question goes under Not yet specified |
| An adjective doing the work in a criterion | Nothing to test in phase 5 | Strike the adjectives; what remains must be verifiable |
| Only happy-path states | The partial and permission states generate the support load | Six states per flow, every time |
| "The summary is accurate" as a criterion for model output | Nothing to assert; the build is judged by whoever demos it | Declare model output, write the eval set with a threshold |
| Leaving the stack to the first build slice | The most durable choice is made by whoever scaffolds | Step 4c decides every open layer with the user |
| A status field with no transitions in the spec | The build decides the business rules one handler at a time | Step 4a: transitions, guards and invariants, decided with the user |
| One mock-up presented as the design | Nothing to compare, so nothing was chosen | Step 4b: several rendered versions, then a choice |
| Recording gate 4 because it passed | Nobody accepted the spec; the agent approved its own work | Ask, and record only with the person's answer |

More rows close spec methods.
