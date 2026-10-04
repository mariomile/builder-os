---
name: delivery-discipline
description: "Use when a spec needs decomposing into buildable work, when implementation needs a test baseline and a red-green loop, or when built work needs reviewing against the spec rather than only against code standards"
---

# Delivery Discipline

Phase 5 turns a spec into working, tested, instrumented software, and proves it did so. It starts with a plan a person accepts before any code changes, and ends with a captured execution record the gate can resolve. The gate then judges whether that run covers the criteria and current change, and whether the diff matches the plan; an exit code alone cannot prove conformance.

Load `tracking-standards` for requested instrumentation verification, `evidence-ledger` for lifecycle claims, and `gate-checks` when completing a lifecycle build. Resolve [capabilities](../../references/capability-map.md) only for resources actually needed.

Read [operating modes](../../references/operating-modes.md) first. For a standalone request, use supplied requirements and sources; keep the requested format and destination. Lifecycle artifact paths, gates and state writes below apply only to an explicitly selected initiative.

## Interop

Where a plan-then-test-then-review toolchain is present in this session, delegate the implementation loop to it. This skill keeps the three things that chain does not own: the acceptance-criterion-to-test mapping, the scope-creep check against the phase 4 out-of-scope list, and instrumentation verification.

Where none is present, this skill carries the loop natively. Detection is a check for what is in the session, never an install prompt, and absence is the normal case.

## The Plan Comes First

The first reviewable artifact of a build is the plan, not the diff. A wrong assumption caught in the plan costs an edit to a document; the same assumption caught in review costs the work built on it.

Write the plan **reading only**: read the spec, `TECH.md` and the codebase, and change no code or test. Capturing the baseline writes only evidence files. Where the host has a read-only planning mode, use it; elsewhere the rule is the same and kept by discipline. The plan holds:

| Part | What it says |
|------|--------------|
| **Slices** | The tracer bullets below, each with the files it creates or changes, the acceptance criteria it owns and what it blocks on |
| **Critical path** | The longest chain of blocking edges |
| **Risks** | What can break, which step is riskiest, and what limits apply (a rate limit, a migration, a shared table) with the mitigation |
| **Rejected alternatives** | The approaches considered and why each lost, so the reviewer does not re-propose them |
| **Criteria to tests** | Every numbered acceptance criterion mapped to at least one planned test |

**The completeness test:** an engineer who never saw this conversation could build from the plan alone. If they would have to ask which file, which order or which test, the plan is not done.

Interrogate it before asking for acceptance: what does this break, what is the riskiest step, what was rejected and why. Then present it and ask for acceptance. Record it in the artifact as `**Accepted:** {who} · {ISO timestamp}`, taken from the person's own words; never accept on their behalf. A standing instruction given earlier ("proceed through the build without stopping") counts, quoted with its date. Gate 5.6 checks the record, the Files column and the Risks; gate 5.7 judges that acceptance came before the code and that the final diff matches the plan.

**The plan stays true.** When the implementation has to deviate (a file the plan did not name, a slice split in two, a risk that turned real), update the plan in the same change and say why. A plan corrected only in a "Deviations" paragraph at the end is a plan nobody could review against.

Independent slices (no blocking edge, no shared files) can run in parallel, each in its own isolated workspace where the host supports it. Slices that share files stay in one sequence.

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

Before writing any code, record what the test suite does today: how many pass, how many fail, how long it takes. Capture it with `run-check`, not a summary.

Run the commands in `TECH.md` → Verify: one command each for build, test and lint, each exiting non-zero on failure, with an example of healthy output. Where that section is empty, find the commands, run them, and write them there before going further. Where verifying takes a sequence of commands and environment knowledge, the first slice wraps it in a single target, because a check that needs a person to remember how to run it will not be run by an agent.

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

Verification is part of done: before reporting a slice finished, run the `TECH.md` → Verify commands and show their output.

### Fixing a bug

1. **Reproduce it as a test** and run it. It fails, and for the reason the bug describes: a test failing on a typo reproduces nothing.
2. **Fix the test in place**: capture it (commit, or a recorded `run-check`) before touching the code.
3. **Make it pass without changing it.** A test that existed before the fix, and that the fix could not rewrite, is the evidence the bug is gone.

### Never weaken a test to pass it

A red test is a finding about the code until shown otherwise. Changing an assertion, skipping a case, loosening a match or deleting a test to turn the run green removes the check the loop exists to provide. When a test is genuinely wrong (it encodes behavior the spec does not require), say so, show the spec line, and change it as its own visible step, never folded into a fix. Where the host or CI can block edits to test files during a fix, that is the deterministic version of this rule; recommend it, never require it.

## Two-Axis Review

Every slice is reviewed twice, and the second axis is the one BuilderOS adds.

| Axis | Question | Failure looks like |
|------|----------|-------------------|
| **Standards** | Is this good code? | Duplication, unhandled errors, poor naming, missing edge cases |
| **Spec conformance** | Is this the specified thing? | Well-built code that solves a slightly different problem |

A review that only runs the first axis will approve a beautifully implemented misunderstanding. Per slice, name the acceptance criteria it claims to satisfy and check the built behavior against each one, including the states enumerated in phase 4. A criterion "satisfied" by code nobody exercised in the enumerated error state is not satisfied. Read the diff against the accepted plan too: a file the plan did not name, or a slice built differently, is either recorded in the plan or a finding.

**Review in a fresh context.** Where the host can delegate to a separate agent, the review runs there, with the spec, the plan and the diff but without the build conversation, so the verdict is not shaped by the assumptions that produced the code. Where it cannot, reread the diff from the start as if someone else wrote it. The context that wrote the code never approves it.

### Severity

| Severity | Means | Handling |
|----------|-------|----------|
| **Important** | Breaks an acceptance criterion or an enumerated state, exposes data, violates a `TECH.md` constraint, or weakens a test | Fixed in this phase, or the gate fails |
| **Nit** | Style, naming, a cleaner shape | At most five listed; the rest summarized as a count |

Skip what the toolchain already checks (formatting, lint rules) and generated files. Tag each finding with its axis (standards or spec).

**Findings become memory.** A finding that has appeared before goes into `TECH.md` (Conventions, or Known traps) in this phase, so the next build avoids it instead of the next review catching it. A change that makes a `TECH.md` line wrong updates that line.

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

Every status claim in the build artifact or the review is backed by resolving execution evidence from the final change, with its captured output. The claim alone is not evidence, and neither is a delegated agent reporting it.

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

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `repo.read` | The codebase, the test suite, the existing patterns | Phase 5 cannot run without code access. Say so plainly rather than planning in the abstract |
| `shell.exec` | Running the Verify commands through `run-check` | Without execution the run cannot be captured and gate 5.2 cannot pass; deliver the plan and say what must run |
| `analytics.events` / `analytics.query` | Confirming events arrive with their properties | Verify from the emission log or the code path, tagged as weaker evidence |
| `subagent.dispatch` | Delegating the implementation loop | Run the loop inline, slice by slice |
| `files.read` / `files.write` | Previous artifacts, this artifact, state | Required |

Phase 5 is the one phase with a real prerequisite: something has to write code. A planning-only run is legitimate (`--plan-only`) and produces the accepted plan without the loop, but it does not pass gate 5.

A rule that must hold every time (no edits to generated files, no change to a frozen package) is written in `TECH.md` → Technical constraints together with the deterministic check that enforces it, when one exists: a hook in the host or a CI check. This skill makes a violation unlikely; only the deterministic check makes it impossible.

## Standalone Procedure

For task decomposition, produce the plan (slices with files, dependencies, risks, rejected alternatives, tests) from the supplied spec; do not implement or run a lifecycle gate. For an authorized implementation, write the plan first and wait for acceptance unless the request already authorized going straight to code. For a review, apply the two axes and the severity scale. Use supplied requirements and existing project conventions without requiring phase filenames. Size tests to the changed behavior.

## Lifecycle Procedure

Run in order. Delegate where the host allows it, run inline where it does not.

1. **Read `04-spec.md`, `DESIGN.md` and `TECH.md`.** Numbered acceptance criteria, the state matrix, the out-of-scope list, the not-yet-specified decisions, the conflicts and the tracking plan; the stack, constraints, conventions and Verify commands. No `04-spec.md` means stop: building from a bet without a spec reproduces the ambiguity phase 4 exists to remove.

2. **Record the test baseline.** Run the `TECH.md` → Verify commands through `run-check`, note pass count, fail count and duration. Where no suite exists, say so; slice one creates it. Where Verify is empty, fill it now.

3. **Write the plan, reading only.** Tracer bullets with their files, blocking edges, the critical path, risks, rejected alternatives and the criterion-to-test mapping, per The Plan Comes First. A criterion with no planned test is the gate 5.1 failure, found now rather than at the gate. Apply the completeness test.

4. **Get the plan accepted.** Present it, ask, and record `**Accepted:** {who} · {ISO timestamp}` from the person's words, or the standing instruction that already covered it, quoted. No code changes before this line exists.

5. **Run the loop per slice.** Test first, watch it fail, minimum code, refactor green, verify instrumentation, run Verify, review on both axes with severity. Bugs found on the way follow Fixing a bug. Where a delivery toolchain is present, delegate steps 1 to 4 of the loop to it and keep steps 5 and 6.

6. **Keep the plan true.** Every deviation updates the plan in the same change, with the reason.

7. **Run the scope-creep check.** The diff against the phase 4 out-of-scope list, item by item.

8. **Verify instrumentation end to end.** Every event in the tracking plan, triggered and confirmed arriving with its properties.

9. **Write and gate.** Complete `.builderos/initiatives/{initiative}/05-build-plan.md` with the final run, the instrumentation evidence and the scope check. Run gate 5 and record it (`scripts/bos.mjs record 5 --judged "{judge-id}=pass|fail,..."` where commands run), which advances to phase 6 on pass. Before reporting, update `TECH.md`: Verify if it changed, any convention the build had to follow, any trap it hit, any finding that recurred, any must-always-hold rule with its check. Move the initiative to phase 6 in `ROADMAP.md`.

Completion marker: `## BUILD VERIFIED` with the accepted plan, the mapping, the test output, the instrumentation evidence, the scope-creep result and the gate result.

## Output Contract

`.builderos/initiatives/{initiative}/05-build-plan.md`:

```markdown
# Build — {feature}

## Plan
**Accepted:** {who} · {ISO timestamp with Z or an offset, before the first code change}

## Test baseline
**Run:** {project-relative evidence/runs/*.json captured before any change}
{passing, failing, duration}

## Slices
| # | Slice | Files | Acceptance criteria | Blocks on | Status |
| 1 | {end-to-end description} | {files created or changed} | 1, 4 | none | done |

**Critical path:** {the longest blocking chain, and its length}

## Risks
| Risk | Mitigation |
| {what can break, the riskiest step, the limit that applies} | {how the plan handles it} |

## Rejected alternatives
| Alternative | Why not |

## Acceptance criteria to tests
| # | Criterion | Test | Result |
| 1 | {from 04-spec.md} | {literal or backticked test file path, optionally followed by the test name} | pass |

## Test output
**Run:** {project-relative evidence/runs/*.json from the final run}
{captured runner output; command, exit status and log are resolved from the record}

## Instrumentation
| Event | Triggered by | Arrived | Properties verified | Evidence |
| {event} | {action} | yes | {list} | `[tag]` |

## Eval results
**Run:** {project-relative captured eval run JSON}
**Results:** {project-relative JSON array of unique {id, pass: boolean} entries covering the dataset}
{only for model-output specs: dataset/result hashes bound in the run, pass rate, must-pass results, prompt/model versions and rubric}

## Scope check
| Out-of-scope item (phase 4) | Built? | Note |

## Review findings
| Finding | Axis | Severity | Resolution |
{Important findings all resolved; at most five nits, the rest as a count}

## Deviations from spec
{anything built differently, with the reason and whether the spec was amended; deviations from the plan are recorded in the plan itself}
```

## Common Mistakes

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
