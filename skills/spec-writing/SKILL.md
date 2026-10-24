---
name: spec-writing
description: "Writes specs and PRDs a team can build from: scope, impact on what exists, numbered testable criteria, states and edge cases, the quality bar, the tracking plan. Use when asked for a PRD, a spec or acceptance criteria, or a bet needs a spec."
---

# Spec Writing

Phase 4 makes the chosen bet buildable by someone who was not in the conversation, and measurable three months later. A spec takes away the decisions an implementer would otherwise make silently.

**Mode.** Standalone writes the requested scope, numbered assertions and relevant states from the supplied requirements, current behavior and constraints, marking unknown facts and owner decisions; a draft authorizes no implementation. The lifecycle runs every step, writes `04-spec.md` and gate 4. Both per [operating modes](../../references/operating-modes.md). To turn a conversation into a spec with no interview, run the [synthesis procedure](references/synthesis.md). Load `ux-architecture`, `domain-model`, `agent-design`, `design-direction`, `stack-decisions` and `system-design` where the steps below call them (a standalone spec loads them when it needs flows, rules, the agent, the look, the stack or the backend), `tracking-standards` for event design, `pm-artifacts` for a requested PRD template. Read the section of [spec methods](references/spec-methods.md) behind the step you are on.

## Procedure

1. **Read `03-solution-bet.md` and `02-definition.md`**: the selected bet with its primary user action, the kill criteria, the success metric with its baseline; a spec with no chosen bet specifies a guess, so a missing bet stops the phase. **Change track:** phases 0 to 3 are `covered` by the mandate in `00-request.md`, which is the bet; there is no phase 2 metric (step 7 runs only for a guardrail event), and a choice between solutions found while writing upgrades the work to feature (`lifecycle-setup`, the ratchet). Done when the bet, its primary action and the metric (or the mandate) are in front of you.
2. **State what exists today** in the area the bet touches, from the code where `repo.read` resolved, from the person otherwise. Read `TECH.md`, `DOMAIN.md` and the constraints in `PRODUCT.md` first: they bound the spec, and a spec that contradicts one names it and says why. Done when current behavior is written and every constraint that bounds it is named.
3. **Write the impact on what exists** (gate 4.11), one row each: **existing data** (shape, backfill or default, rows that break a new rule, counted with `db.query` where it resolved), **contracts** (APIs, webhooks, exports, integrations others consume), **tracking events** (each renamed or redefined event breaks dashboards and baselines), **permissions** (who sees the change), **current users** (default on or off, what moves, how they hear). "Nothing to do" with its reason counts; with nothing built yet, `**Impact on what exists:** not applicable, {reason}`. Done when all five rows have a handling.
4. **Bound the scope.** In scope, then out of scope as not now, not ever by design, or not until X, including the boundary someone will argue with. Each boundary a reasonable person could draw elsewhere is a `pressure-testing` round question (in, out, or not until X, with costs) with a recommendation; the rest you write. An undecided in-scope question goes under **Not yet specified** with who decides it and which criteria wait on it. Done when the out-of-scope list is non-empty (gate 4.2) and every contested boundary has the owner's answer.
5. **Shape it with the person**, in this order; each sub-step asks the person, and where this phase runs delegated the delegate returns the round and the main conversation asks it:
   1. **Flows.** `ux-architecture` writes information architecture, flows, per-step states, the component inventory and the accessibility floor into `DESIGN.md`; every flow traces to the phase 3 primary action. On the product track one flow is the first day, and the spec's `**Activation:**` names its criterion and event (gate 4.17).
   2. **The domain.** `domain-model`: entities, transitions with who and guard, invariants, awkward scenarios, rules put to the person, a logic prototype when the rules are non-trivial, the data sketch (gate 4.10).
   3. **The agent** (model output, gate 4.16). `agent-design`: autonomy per action, hand-off, injection surfaces with must-pass cases, degradation, the latency budget.
   4. **The look.** `design-direction` on the primary flow: reference screens, rendered versions, a choice in rounds (gate 4.9); the kit waits for the stack.
   5. **The stack.** `stack-decisions`: inherited layers read from the repository, a decision card per open layer, ADRs for the hard-to-reverse ones, `TECH.md` → Stack, the spec's `## Stack` (gate 4.8); then back to `design-direction` for the kit.
   6. **The system.** `system-design`: components, contracts, external calls planned for failure, the scale defaults, the capacity, and a threat model whose mitigations are criteria (gates 4.18, 4.19).
   7. **A real user** (product track, gate 4.13): one session with a person from the ICP walking the clickable version, run by the person with the recruiting message, script and note template from [spec methods](references/spec-methods.md#real-user-session); notes saved with `scripts/bos.mjs evidence add --class interview --id P{n}` and recorded under `## Real users`, tagged. It records `**Willingness to pay:**` (4.14) and `**Channel result:**` (4.22).

   Done when `DESIGN.md` carries the flows, the domain model and the visual direction, the spec carries `## Stack`, `## Architecture` and `## Threat model`, and on the product track `## Real users` records a session that happened or the override with its reason.
6. **Write the user stories, then the acceptance criteria.** A long numbered list of stories ("As a {actor}, I want {capability}, so that {benefit}") covering every actor and flow in scope. Then one criterion per requirement, numbered (phase 5 maps tests to them by number), each tracing to a story: a subject that exists in the product, a verb with an observable outcome, and the condition under which it is checked (gate 4.1). Adjective test: strike every adjective; what remains is verifiable. Name the **test seams**: the highest points the behavior can be tested from (an API, a module interface, the UI), existing ones first and as few as possible, each with its criteria. Done when every story has a criterion and every criterion survives the adjective test and has a seam.
7. **Enumerate states and edge cases.** Six states per flow: empty, loading, partial, error, success, permission (gate 4.3 requires empty and error for every flow). Then four edge-case categories: zero/one/many/too many, concurrency, interrupted, hostile input. Done when every case has an expected behavior, or "undefined" written as a deliberate choice.
8. **Write the quality bar** (gate 4.12): **permissions** (who sees and does what; what someone outside the role gets), **personal data** (what is stored, who reads it, retention, deletion), **performance** (a budget with a number on the primary action, measured at gate 5.14), each as numbered criteria or "not applicable" with why. Accessibility, end-to-end, dependencies and secrets are checks phase 5 puts in the guardrail (gate 5.10). Done when all three areas are answered.
9. **Design the tracking plan before the build** (gate 4.4): work backwards from the phase 2 metric to the events and properties that compute it, check each against the existing catalogue via `tracking-standards`, mark it new or existing. Done when the plan shows how its events produce the number.
10. **Write the eval set** when a criterion depends on model output, before the build and before the prompt: declare `**Model output:** yes` and write at least 20 cases (10 in lite mode) with a threshold, a judge and must-pass cases, including one per injection surface (gate 4.6); synthetic cases are labeled synthetic. Done when the dataset file exists, or the spec declares no model output.
11. **List the constraint conflicts** (gate 4.7): each requirement against the `PRODUCT.md` and `TECH.md` constraints, every collision with who decides it and the criteria it blocks, or the constraints checked and none colliding. Conflicts close with their owner before acceptance, or travel as blocking edges into phase 5. Done when `## Conflicts` is written.
12. **Write, gate and get it accepted.** Write `.builderos/initiatives/{initiative}/04-spec.md` per the [spec template](references/spec-template.md), headings, bold labels and tables exact, and confirm `DESIGN.md` exists. Write `## What we chose` in plain words: the main objects and the rules that will surprise someone, then per stack layer, the visual direction and the kit: what was chosen, why, the alternative set aside, what it costs, what would make us change it, one line each. Run gate 4. On a pass, present that summary first, then the spec, and ask for acceptance (a technical reviewer joins for a high-risk change); record it with the person's answer (`scripts/bos.mjs record 4 --judged "{judge-id}=pass|fail,..." --accepted-by "who"` where commands run). Done when gate 4 is recorded with the person's acceptance.

## Watch for

| Do | Instead of |
|---|---|
| An undecided in-scope question under Not yet specified | Filing it out of scope, where the implementer answers it silently |
| Strike the adjectives; keep what is verifiable | An adjective doing the work in a criterion |
| Six states per flow | Happy-path states only |
| Declare model output and write the eval set with a threshold | "The summary is accurate" as a criterion |
| Ask, and record acceptance with the person's answer | Recording gate 4 because it passed |

More in [spec methods](references/spec-methods.md).

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `repo.read` | What exists, what the current flows do, what is already instrumented | Ask the person to describe the current behavior; mark the spec as written without code access |
| `analytics.events` | Which of the planned events already exist | Read the instrumentation from source; where there is no source, design from scratch and note it |
| `docs.search` | Prior specs, design decisions, constraints already agreed | Ask |
| `tickets.read` | Bugs and requests that bound the scope | Skip |
| `ui.render` | The clickable version a real user walks (step 5.7) | Self-contained HTML the person opens and shares |
| `files.read` / `files.write` | Previous artifacts, this artifact, state | Required |

**Phase 4 needs no data capability.** Without `repo.read` "what exists today" is thinner; the phase still runs.

## Output Contract

`## SPEC COMPLETE` with the scope boundaries, the conflicts, the domain rules, the agent's behavior when a model acts, the stack, the architecture, the threat model and the visual direction with who chose them, the numbered acceptance criteria, the quality bar, the real-user session (product track), the state coverage, the tracking plan, the gate result and who accepted. The lifecycle artifact is `04-spec.md` per the [spec template](references/spec-template.md); gate 4 parses its headings, bold labels and tables.
