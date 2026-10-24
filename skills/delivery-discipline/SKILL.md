---
name: delivery-discipline
description: "Plans and runs a build: seams and tracer-bullet slices, a plan the owner accepts before code, a test baseline, red-green per criterion, fresh-context review, CI guardrails. Use when breaking a spec into work, implementing it, or reviewing built work."
---

# Delivery Discipline

Phase 5 turns a spec into working, tested, instrumented software and proves it: a plan a person accepts before any code changes, then a **captured** execution record the gate judges against the criteria, the change and the plan. An exit code alone proves nothing.

**Mode.** Standalone decomposition produces the plan (step 3) from the supplied spec and stops there. A standalone implementation plans first and waits for acceptance unless the request already authorized going straight to code; a standalone review applies the two axes and the severity scale of step 5. The lifecycle runs every step and gate 5. Both per [operating modes](../../references/operating-modes.md).

Read [the build method](references/build-method.md) for Verify, review grading, run capture, status claims and the reasoning behind a step. Load `tracking-standards` for instrumentation checks and `gate-checks` when completing a lifecycle build. Where a plan-then-test-then-review toolchain is present in this session, it may run loop steps 1 to 4; keep the criterion-to-test mapping, the scope-creep check and the instrumentation verification here.

## Procedure

1. **Read `04-spec.md`, `DESIGN.md`, `TECH.md`.** The build uses the spec's `## Stack` and `## Architecture`, and the tokens and kit in `DESIGN.md` → Visual direction, applied per the [interface details](../design-direction/references/interface-details.md). A layer the work needs that is still open, or a **structural** addition found later (a framework, a database, a hosted service, a paid API, a runtime), pauses the slice and returns to `stack-decisions` as a card for the person; plan and `TECH.md` are updated before it resumes. Utility libraries are listed in the review with their reason. Done when the spec exists and every layer the work touches is decided.
2. **Record the test baseline** before any code: run `TECH.md` → Verify through `run-check` and note passes, failures and duration. A suite already red: list each failure under `## Pre-existing failures` and in `TECH.md` → Known failing; gate 5.2 then compares the final run against this baseline. An empty Verify gets filled first; several commands get wrapped in one target; no suite means slice one creates it. No guardrail running Verify means slice zero adds the cheapest one per [Guardrails](references/build-method.md#guardrails), with the automatic quality checks (gates 5.8 and 5.10); where the CI belongs to someone else, the plan asks them. Slice zero also puts production online behind a door, with a preview per change, per `production-setup` (gate 5.16). Work on the branch the plan names; a slow suite uses `TECH.md` → Test (fast) per slice ([where the work lives](references/build-method.md#slow-suites-and-where-the-work-lives)). Done when the baseline capture exists and every failure in it is listed.
3. **Write the plan, reading only:** spec, `TECH.md`, codebase, in the host's read-only planning mode where one exists; the baseline writes only evidence files. The plan holds the **seams** (each module this work creates or changes, its interface, what it hides, where its tests sit, per [the build method](references/build-method.md#seams)), with the central module designed twice; slices with files, criteria and blocking edges, per the [slice rules](references/build-method.md#slice-rules) and [tickets](references/tickets.md) (expand–contract for a wide refactor); the critical path; risks with mitigations; rejected alternatives with why each lost; a planned test for every numbered criterion. Slices are **tracer bullets**, each end to end, sized to one fresh session. Open it with `**In plain words:**`: what gets built, in what order, what the person can try after each slice, the riskiest step, and one line per seam a non-engineer can follow. Done when an engineer new to this conversation could build from it without asking.
4. **Get the plan accepted.** Present `**In plain words:**` first. Quiz the person on the slices per [tickets](references/tickets.md), section 3, until they approve the breakdown; then the riskiest step and what was rejected. Record `**Accepted:** {who} · {ISO timestamp}` from the person's own words, or quote an earlier standing instruction that named the build, with its date. Code starts after that line. Publish one ticket per slice per [tickets](references/tickets.md), section 4, and name where under `**Tickets:**`. Done when the plan carries the person's acceptance and the tickets exist.
5. **Run the loop per slice**, in order:
   1. **Write the test first** from the criterion, by number, at a seam the plan names; a test that reaches into internals is rewritten at the seam. An untestable criterion returns to phase 4.
   2. **Watch it fail.**
   3. **Write the least code that passes it.**
   4. **Refactor with the test green.**
   5. **Verify the slice's instrumentation** fires in a real environment with the tracking plan's properties.
   6. **Review on two axes**, tagging each finding **standards** (good code?) or **spec conformance** (the specified thing?): behavior against each criterion the slice claims, including phase 4's enumerated states, and the diff against the plan. The review runs in a fresh context holding spec, plan and diff and none of the build conversation; where the host cannot delegate, reread the diff from the start as someone else's. **Important** findings (break a criterion or enumerated state, expose data, violate a `TECH.md` constraint or a threat-model mitigation, weaken a test, add an undecided structural layer, depart from the chosen tokens or kit) are fixed now; list at most five **nits** and count the rest. A recurring finding becomes a check or a `TECH.md` convention ([Guardrails](references/build-method.md#guardrails)).

   A bug found on the way runs `bug-diagnosis`. **Fix the code, keep the test:** a test changes only when it encodes behavior the spec does not require, as its own visible step citing the spec line. Done when Verify, captured after the slice's last change, is green on every criterion the slice owns and no important finding is open.
6. **Keep the plan true.** A deviation (an unnamed file, a split slice, a risk that turned real) updates the plan in the same change, with the reason. Done when the plan describes the diff as it is.
7. **Check scope creep** (gate 5.4): the diff against the phase 4 out-of-scope list, item by item. Anything built from it is removed, or promoted deliberately as a logged, visible override. Done when every out-of-scope item has a verdict.
8. **Verify instrumentation end to end** (gate 5.3): per tracking-plan event, trigger the action, confirm arrival with its properties at the destination, record the evidence tagged by source. Done when every event in the tracking plan has its evidence.
9. **Look at what was built** (gates 5.9, 5.12). Capture the six states of the primary flow (only empty and error on the change track) at the widest and the narrowest width the ICP uses, with `ui.capture`, and compare each with the chosen version and the tokens. A difference is fixed, or recorded in `DESIGN.md` with its reason. Then a **craft critique** from a fresh context (a separate agent given only `DESIGN.md`, the voice, the captures and the reference screens; inline, a person who did not build it) against the interface details, on the eight aspects of gate 5.12; each finding is fixed or recorded. Each message in `DESIGN.md` → Messages is sent by the built product to a test inbox or phone and captured under `**Messages received:**`. With no interface, `**Interface review:** not applicable, {reason}`. Last, the demo (gate 5.15, `feature-demo`). Done when `## Interface review` has an image or route per state and width, `## Craft critique` every aspect with what happened, and `## Demo` its recording.
10. **Check security and speed** (gates 5.13, 5.14). A fresh context given the diff, the threat model and `TECH.md` reviews the five areas of gate 5.13; each finding is fixed or recorded. Then measure every budget in the spec's quality bar on the built product through `run-check` (the primary action at p95; with an interface, the page load at the narrowest width), and fix what is over. Done when `## Security review` has every area with what happened, and `## Performance` has every budget measured and met.
10b. **Put it in the person's hands** (gate 5.17) per `production-setup` step 7, recorded under `## Tried`. Done when the person has tried it and every finding is fixed or recorded.
11. **Write, gate, and leave the code legible.** Complete `.builderos/initiatives/{initiative}/05-build-plan.md` per [the build-plan template](references/build-plan-template.md), headings, bold labels and tables exact, with every status claim backed by a `run-check` capture from the final change. Run gate 5 and record it (`scripts/bos.mjs record 5 --judged "{judge-id}=pass|fail,..."` where commands run). Update `TECH.md`: Map for every module, entry point or test location added, moved or removed (gate 5.11 checks every path), Verify, conventions, traps, recurring findings, and each must-always-hold rule under Technical constraints with its deterministic check. Move the initiative to phase 6 in `ROADMAP.md`. Then run [retro](../retro/SKILL.md) on the build sessions and list the changes under `**Environment:**`; a finding about `AGENTS.md` or `CLAUDE.md` runs `agents-md`. Done when gate 5 is recorded, `TECH.md` matches the code, and the retro's changes are listed.

A planning-only run (`--plan-only`) is legitimate: it produces the accepted plan without the loop and leaves gate 5 for later.

## Watch for

| Do | Instead of |
|---|---|
| Capture the final run and have coverage judged | Pasting green output |
| Test the criterion where its surface lives, or return it to phase 4 | Mapping it to "no test, reasoned exception" |
| Plan reading only, get acceptance, then build | Code before the `**Accepted:**` line |

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `repo.read` | Codebase, tests, patterns | Phase 5 needs it; say so and stop at the plan's questions |
| `shell.exec` | Verify through `run-check` | Deliver the plan, say what must run; gate 5.2 waits for a capture |
| `analytics.events` / `analytics.query` | Events arriving with properties | Emission log or code path, tagged weaker |
| `ui.capture` | Screenshots of each state of the built interface (step 9) | The person opens the routes and says what they see |
| `subagent.dispatch` | The fresh-context review, the loop | Run it inline, slice by slice |
| `files.read` / `files.write` | Artifacts, state | Required |

## Output Contract

`## BUILD VERIFIED` with the accepted plan, the criterion-to-test mapping, the test output, the instrumentation evidence, the scope-creep result, the interface review, the craft critique, the demo, the security review, the performance measured, the production check, who tried it and the gate result.
