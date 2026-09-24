---
name: delivery-discipline
description: "Use when a spec needs decomposing into buildable work, when implementation needs a test baseline and a red-green loop, or when built work needs reviewing against the spec rather than only against code standards"
---

# Delivery Discipline

Phase 5 turns a spec into working, tested, instrumented software, and proves it did so. Gate 5 is the only gate that demands pasted output rather than a claim, because "the tests pass" is the most frequently untrue sentence in software.

**REQUIRED BACKGROUND:** `evidence-ledger` for tagging. `tracking-standards` for instrumentation verification. `gate-checks` before declaring completion. `references/capability-map.md` before touching any data source.

## Interop

Where a plan-then-test-then-review toolchain is present in this session, delegate the implementation loop to it. This skill keeps the three things that chain does not own: the acceptance-criterion-to-test mapping, the scope-creep check against the phase 4 out-of-scope list, and instrumentation verification.

Where none is present, this skill carries the loop natively. Detection is a check for what is in the session, never an install prompt, and absence is the normal case.

## Tracer Bullets

Decompose the spec into slices that each go all the way through: interface, logic, storage, instrumentation. Not layers.

A layer-first decomposition ("build the schema, then the API, then the UI") produces three weeks of work before anything is demonstrable and four weeks before anything is falsifiable. A tracer-bullet decomposition produces something thin and end-to-end on day two, which is when the spec's wrong assumptions become visible while they are still cheap.

| Decomposition | First demonstrable | First falsifiable |
|--------------|-------------------|------------------|
| By layer | After the last layer | After the last layer |
| By tracer bullet | Slice one | Slice one |

### Slice rules

1. **Each slice is end-to-end.** A user can do something, however narrow, and the event fires.
2. **Each slice maps to acceptance criteria by number.** A slice mapping to none is not in the spec and is scope creep arriving early.
3. **Blocking edges are explicit.** Slice B blocks on A, or it does not. An implicit dependency discovered mid-build costs a day.
4. **The first slice is the riskiest one that is still small.** Not the easiest. The point of going end-to-end early is to hit the unknown early.

### Blocking edges

Write them as a list, not a diagram: `3 blocks on 1`. Then check the critical path: the longest chain of blocking edges is the minimum duration regardless of how many people work on it. Where that chain is most of the work, the decomposition is still layered in disguise.

A slice whose acceptance criteria appear in the spec's **Not yet specified** table also blocks on that decision. Write it as an edge (`4 blocks on decision: retry limit`) and build the unblocked slices first; never resolve the open question in code.

## Test Baseline

Before writing any code, record what the test suite does today: how many pass, how many fail, how long it takes. Pasted output, not a summary.

Without a baseline, a suite with four pre-existing failures makes gate 5.2 unarguable in the wrong direction: nobody can tell your failures from the ones that were already there. The baseline is also the honest answer to "did this change break anything", which a green suite alone cannot give when it was never fully green.

Where there is no test suite at all, say so, and the first slice creates one. A phase 5 that ends with no tests fails gate 5.1 by construction.

## The Loop

Per slice, in this order:

1. **Write the test first**, from the acceptance criterion, by number. The criterion is the assertion; if you cannot write the test, the criterion failed the adjective test in phase 4 and goes back.
2. **Watch it fail.** A test that passes before the code exists is testing nothing, and this is the step people skip.
3. **Write the least code that passes it.** Not the general solution. The general solution arrives when a second case demands it.
4. **Refactor with the test green**, and keep it green.
5. **Verify the instrumentation** for that slice fires, in a real environment, with the properties the phase 4 tracking plan specified.
6. **Review** on both axes below.

Steps 1 and 2 are the discipline. Everything else is craft that survives without them; those two do not survive being skipped, because a suite written after the code tests what the code does rather than what the spec required.

## Two-Axis Review

Every slice is reviewed twice, and the second axis is the one BuilderOS adds.

| Axis | Question | Failure looks like |
|------|----------|-------------------|
| **Standards** | Is this good code? | Duplication, unhandled errors, poor naming, missing edge cases |
| **Spec conformance** | Is this the specified thing? | Well-built code that solves a slightly different problem |

A review that only runs the first axis will approve a beautifully implemented misunderstanding. Per slice, name the acceptance criteria it claims to satisfy and check the built behavior against each one, including the states enumerated in phase 4. A criterion "satisfied" by code nobody exercised in the enumerated error state is not satisfied.

### Scope-creep check

Gate 5.4. Read the phase 4 out-of-scope list and check the diff against it, item by item. Anything built that appears on that list is either removed, or promoted deliberately with a logged reason, which is an override and visible afterwards.

This check catches the most common quiet failure in delivery: the thing that was easy to add while you were in there.

## Instrumentation Verification

Gate 5.3 requires evidence from a real environment, tagged, that the events fire. Not that the code calling them was written: that they arrive.

Per event in the phase 4 tracking plan:

1. Trigger the action that should emit it.
2. Confirm arrival, with the expected properties, at the destination.
3. Record the evidence with a tag naming the source.

Three failures worth expecting: the event fires but a required property is null, the event fires twice for one action, and the event fires in development but the production configuration was never set. Each one is invisible until someone tries to use the data, which is phase 7, which is too late to fix cheaply.

Where no analytics capability resolved, verification falls to the code path plus a local emission log, tagged as such. That is weaker evidence and the artifact says so; it is still evidence, and it still catches the null property.

## Claims and Their Evidence

Every status claim in the build artifact or the review is backed by output produced in this phase, pasted, not described. The claim alone is not evidence, and neither is a delegated agent reporting it.

| Claim | Requires | Not enough |
|-------|----------|------------|
| Tests pass | The suite's output with the pass and fail counts, from a run after the last change | An earlier run, "should pass" |
| This test covers AC-3 | The test failing with the behavior removed, then passing with it restored | The test passing once |
| Instrumentation works | The event observed arriving, with its properties | The tracking call present in the code |
| Nothing out of scope was built | The diff read against the spec's scope boundaries | The implementer saying so |
| The slice is done | Every acceptance criterion it owns mapped to a test that ran | Tests green overall |

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `repo.read` | The codebase, the test suite, the existing patterns | Phase 5 cannot run without code access. Say so plainly rather than planning in the abstract |
| `analytics.events` / `analytics.query` | Confirming events arrive with their properties | Verify from the emission log or the code path, tagged as weaker evidence |
| `subagent.dispatch` | Delegating the implementation loop | Run the loop inline, slice by slice |
| `files.read` / `files.write` | Previous artifacts, this artifact, state | Required |

Phase 5 is the one phase with a real prerequisite: something has to write code. A planning-only run is legitimate (`--plan-only`) and produces the decomposition without the loop, but it does not pass gate 5.

## Procedure

Run in order. Delegate where the host allows it, run inline where it does not.

1. **Read `04-spec.md` and `DESIGN.md`.** Numbered acceptance criteria, the state matrix, the out-of-scope list and the tracking plan. No `04-spec.md` means stop: building from a bet without a spec reproduces the ambiguity phase 4 exists to remove.

2. **Record the test baseline.** Run the suite, paste the output, note pass count, fail count and duration. Where no suite exists, say so; slice one creates it.

3. **Decompose into tracer bullets.** Each slice end-to-end, each mapped to acceptance criteria by number, blocking edges explicit, riskiest-but-small first. Compute the critical path and say whether it is most of the work.

4. **Build the mapping table.** Every numbered acceptance criterion to at least one planned test. A criterion with no test is the gate 5.1 failure, found now rather than at the gate.

5. **Run the loop per slice.** Test first, watch it fail, minimum code, refactor green, verify instrumentation, review on both axes. Where a delivery toolchain is present, delegate steps 1 to 4 of the loop to it and keep steps 5 and 6.

6. **Run the scope-creep check.** The diff against the phase 4 out-of-scope list, item by item.

7. **Verify instrumentation end to end.** Every event in the tracking plan, triggered and confirmed arriving with its properties.

8. **Write and gate.** Write `.builderos/initiatives/{initiative}/05-build-plan.md` with the mapping table, the pasted test output and the instrumentation evidence. Run gate 5, update `state.json`, advance to phase 6 on pass. Before reporting, update `TECH.md` with any convention the build had to follow and any trap it hit, and move the initiative to phase 6 in `ROADMAP.md`.

Completion marker: `## BUILD VERIFIED` with the mapping, the test output, the instrumentation evidence, the scope-creep result and the gate result.

## Output Contract

`.builderos/initiatives/{initiative}/05-build-plan.md`:

```markdown
# Build — {feature}

## Test baseline
{pasted runner output from before any change: passing, failing, duration}

## Slices
| # | Slice | Acceptance criteria | Blocks on | Status |
| 1 | {end-to-end description} | 1, 4 | — | done |

**Critical path:** {the longest blocking chain, and its length}

## Acceptance criteria to tests
| # | Criterion | Test | Result |
| 1 | {from 04-spec.md} | {test name and file} | pass |

## Test output
{pasted runner output from after the build. Not a summary, not a claim}

## Instrumentation
| Event | Triggered by | Arrived | Properties verified | Evidence |
| {event} | {action} | yes | {list} | `[tag]` |

## Scope check
| Out-of-scope item (phase 4) | Built? | Note |

## Deviations from spec
{anything built differently, with the reason and whether the spec was amended}
```

## Common Mistakes

| Mistake | Why it fails | Correct |
|---------|-------------|---------|
| "The tests pass" with no pasted output | Gate 5.2 requires evidence, not a claim | Paste the runner output |
| No baseline before starting | Pre-existing failures become indistinguishable from new ones | Record and paste the baseline first |
| Layer-first decomposition | Nothing is falsifiable until the last layer lands | Tracer bullets, end to end |
| A slice mapping to no acceptance criterion | It is not in the spec | Remove it, or amend the spec deliberately |
| Writing tests after the code | Tests what the code does, not what the spec required | Test first, watch it fail |
| Skipping "watch it fail" | A test that never failed proves nothing | Run it red before writing code |
| Review on standards only | Approves a well-built misunderstanding | Check built behavior against each criterion |
| Instrumentation "verified" by reading the code | The property is null and nobody finds out until phase 7 | Trigger it and confirm arrival |
| Building the easy out-of-scope item while in there | Gate 5.4 fails, and the timeline quietly moved | Remove it, or log the promotion as an override |
| Implicit blocking edges | Discovered mid-build, costs a day each | Write them as a list |
