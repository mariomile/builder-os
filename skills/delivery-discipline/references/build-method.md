# Build Method

The reasoning and detail behind the phase 5 procedure in [the skill](../SKILL.md). Read the section you need.

## The Plan

Step 1 reads, from `04-spec.md`, `DESIGN.md` and `TECH.md`: the numbered acceptance criteria, the state matrix, the out-of-scope list, the not-yet-specified decisions, the conflicts and the tracking plan; the stack, constraints, conventions and Verify commands.

Building from a bet without a spec reproduces the ambiguity phase 4 exists to remove, which is why a missing `04-spec.md` stops the phase.

The first reviewable artifact of a build is the plan, not the diff. A wrong assumption caught in the plan costs an edit to a document; the same assumption caught in review costs the work built on it.

| Part | What it says |
|------|--------------|
| **Slices** | The tracer bullets below, each with the files it creates or changes, the acceptance criteria it owns and what it blocks on |
| **Critical path** | The longest chain of blocking edges |
| **Risks** | What can break, which step is riskiest, and what limits apply (a rate limit, a migration, a shared table) with the mitigation |
| **Rejected alternatives** | The approaches considered and why each lost, so the reviewer does not re-propose them |
| **Criteria to tests** | Every numbered acceptance criterion mapped to at least one planned test |

Gate 5.6 checks the `**Accepted:**` record, the Files column and the Risks; gate 5.7 judges that acceptance came before the code and that the final diff matches the plan.

A plan corrected only in a "Deviations" paragraph at the end is a plan nobody could review against.

## Tracer Bullets

### Slice rules

Decompose the spec into slices that each go all the way through: interface, logic, storage, instrumentation. Not layers.

1. **Each slice is end-to-end.** A user can do something, however narrow, and the event fires.
2. **Each slice maps to acceptance criteria by number.** A slice mapping to none is not in the spec and is scope creep arriving early.
3. **Blocking edges are explicit.** Slice B blocks on A, or it does not. Write them as a list, not a diagram: `3 blocks on 1`. Then check the critical path; where that chain is most of the work, the decomposition is still layered in disguise.
4. **The first slice is the riskiest one that is still small.** Not the easiest.
5. **Open decisions are edges.** A slice whose acceptance criteria appear in the spec's **Not yet specified** table blocks on that decision. Write it as an edge (`4 blocks on decision: retry limit`) and build the unblocked slices first; never resolve the open question in code.
6. **Parallel only when independent.** Independent slices (no blocking edge, no shared files) can run in parallel, each in its own isolated workspace where the host supports it. Slices that share files stay in one sequence.

### Why

A layer-first decomposition ("build the schema, then the API, then the UI") produces three weeks of work before anything is demonstrable and four weeks before anything is falsifiable. A tracer-bullet decomposition produces something thin and end-to-end on day two, which is when the spec's wrong assumptions become visible while they are still cheap.

| Decomposition | First demonstrable | First falsifiable |
|--------------|-------------------|------------------|
| By layer | After the last layer | After the last layer |
| By tracer bullet | Slice one | Slice one |

The first slice is the riskiest one that is still small, not the easiest: the point of going end-to-end early is to hit the unknown early. An implicit dependency discovered mid-build costs a day. The longest chain of blocking edges is the minimum duration regardless of how many people work on it.

## Test Baseline

Without a baseline, a suite with four pre-existing failures makes gate 5.2 unarguable in the wrong direction: nobody can tell your failures from the ones that were already there. The baseline is also the honest answer to "did this change break anything", which a green suite alone cannot give when it was never fully green.

`TECH.md` → Verify holds one command each for build, test and lint, each exiting non-zero on failure, with an example of healthy output. Where that section is empty, find the commands, run them, and write them there before going further.

A check that needs a person to remember how to run it will not be run by an agent, which is why a multi-command verification gets wrapped in a single target. A phase 5 that ends with no tests fails gate 5.1 by construction.

## The Loop

If you cannot write the test from the criterion, the criterion failed the adjective test in phase 4. A test that passes before the code exists is testing nothing, and watching it fail is the step people skip. Write the least code that passes, not the general solution: the general solution arrives when a second case demands it.

Steps 1 and 2 are the discipline. Everything else is craft that survives without them; those two do not survive being skipped, because a suite written after the code tests what the code does rather than what the spec required.

A bug test failing on a typo reproduces nothing. A test that existed before the fix, and that the fix could not rewrite, is the evidence the bug is gone.

A red test is a finding about the code until shown otherwise. Where the host or CI can block edits to test files during a fix, that is the deterministic version of the never-weaken rule.

## Two-Axis Review

| Axis | Question | Failure looks like |
|------|----------|-------------------|
| **Standards** | Is this good code? | Duplication, unhandled errors, poor naming, missing edge cases |
| **Spec conformance** | Is this the specified thing? | Well-built code that solves a slightly different problem |

A review that only runs the first axis will approve a beautifully implemented misunderstanding. A criterion "satisfied" by code nobody exercised in the enumerated error state is not satisfied. A fresh-context review keeps the verdict from being shaped by the assumptions that produced the code.

| Severity | Means | Handling |
|----------|-------|----------|
| **Important** | Breaks an acceptance criterion or an enumerated state, exposes data, violates a `TECH.md` constraint, or weakens a test | Fixed in this phase, or the gate fails |
| **Nit** | Style, naming, a cleaner shape | At most five listed; the rest summarized as a count |

Skip what the toolchain already checks (formatting, lint rules) and generated files. Tag each finding with its axis (standards or spec).

Recording a recurring finding in `TECH.md` means the next build avoids it instead of the next review catching it. The scope-creep check catches the most common quiet failure in delivery: the thing that was easy to add while you were in there.

## Instrumentation

Gate 5.3 wants proof that the events arrive, not that the code calling them was written. Three failures worth expecting: the event fires but a required property is null, the event fires twice for one action, and the event fires in development but the production configuration was never set. Each one is invisible until someone tries to use the data, which is phase 7, which is too late to fix cheaply. Emission-log evidence is weaker; it is still evidence, and it still catches the null property.

## Claims and Their Evidence

| Claim | Requires | Not enough |
|-------|----------|------------|
| Tests pass | A verified run record, output and review of coverage, from a run after the last change | An earlier run, "should pass" |
| This test covers AC-3 | The test failing with the behavior removed, then passing with it restored | The test passing once |
| The bug is fixed | A test that reproduced it, captured before the fix and unchanged by it, now passing | The suite green after a fix that also edited the test |
| The build follows the plan | The diff read against the accepted plan, deviations recorded in the plan | "Built as planned" |
| Instrumentation works | The event observed arriving, with its properties | The tracking call present in the code |
| The model behaves as specified | The eval set run against the final prompt and model, pass rate and every must-pass case shown | A few good examples in a demo, or a run before the last prompt change |
| Nothing out of scope was built | The diff read against the spec's scope boundaries | The implementer saying so |
| The slice is done | Every acceptance criterion it owns mapped to a test that ran | Tests green overall |

## Capture Runs

Use the installation's `scripts/bos.mjs run-check --label {slug} [--cwd {relative-dir}] [--initiative {slug}] [--root {project-root}] -- {executable} {args}` for explicit execution. It records command, working directory, exit status, timestamp and output hash and prints the `**Run:**` pointer. For an eval, also pass `--results {relative-json} --dataset {relative-dataset}` to bind both files to the capture. Commands are executed as arguments, never interpolated shell strings. A failed run cannot satisfy gate 5.2. Gate reads do not execute anything; relevant verification must still judge coverage and correspondence to the final change.

## Prerequisites and Hard Rules

Phase 5 is the one phase with a real prerequisite: something has to write code. This skill makes a violation of a must-always-hold rule unlikely; only the deterministic check makes it impossible.

## Common Mistakes, Full List

| Mistake | Why it fails | Correct |
|---------|-------------|---------|
| Pasted green output with no captured run | Prose or an old run can hide failed execution | Capture the final run and have relevance/coverage judged |
| Mapping a criterion to "no test, reasoned exception" | Gate 5.1 counts it as unmapped: an excuse is not a test | Test it where its surface lives, or send it back to phase 4 as out of scope or not yet specified |
| Carrying a review finding that biases the phase 2 metric or a guardrail to phase 6 | Instrumentation that reads wrong is a gate 5.3 failure; phase 7 would judge the bet on it | Fix it in this phase, or fail the gate and say why |
| No baseline before starting | Pre-existing failures become indistinguishable from new ones | Record and paste the baseline first |
| Layer-first decomposition | Nothing is falsifiable until the last layer lands | Tracer bullets, end to end |
| A slice mapping to no acceptance criterion | It is not in the spec | Remove it, or amend the spec deliberately |
| Writing tests after the code | Tests what the code does, not what the spec required | Test first, watch it fail |
| Skipping "watch it fail" | A test that never failed proves nothing | Run it red before writing code |
| Review on standards only | Approves a well-built misunderstanding | Check built behavior against each criterion |
| Instrumentation "verified" by reading the code | The property is null and nobody finds out until phase 7 | Trigger it and confirm arrival |
| Building the easy out-of-scope item while in there | Gate 5.4 fails, and the timeline quietly moved | Remove it, or log the promotion as an override |
| Implicit blocking edges | Discovered mid-build, costs a day each | Write them as a list |
| Writing code before the plan is accepted | The first reviewable artifact becomes the diff, when changing course is expensive | Plan reading only, get it accepted, then build |
| A plan only its author can follow | The completeness test fails; review has nothing to check against | Name files, order, risks and tests until someone else could build from it |
| Fixing the plan only at the end | Gate 5.7 has nothing honest to compare | Update the plan in the same change as the deviation |
| Changing an assertion to turn a test green | The loop stops checking the code it was built to check | Fix the code; change a wrong test only as its own visible step |
| Twelve findings of equal weight | The Important one drowns in nits | Important first, five nits at most, the rest counted |
| The building context approving its own work | The verdict inherits the assumptions that produced the code | Review in a fresh context, or reread the diff from scratch |
