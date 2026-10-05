---
name: delivery-discipline
description: "Use when a spec needs decomposing into buildable work, when implementation needs a test baseline and a red-green loop, or when built work needs reviewing against the spec rather than only against code standards"
---

# Delivery Discipline

Phase 5 turns a spec into working, tested, instrumented software and proves it: a plan a person accepts before any code changes, then a captured execution record the gate can resolve and judge against the criteria, the current change and the plan. An exit code alone cannot prove conformance.

Read [operating modes](../../references/operating-modes.md) first. Load `tracking-standards` for requested instrumentation verification, `evidence-ledger` for lifecycle claims, `gate-checks` when completing a lifecycle build. Resolve [capabilities](../../references/capability-map.md) only for resources actually needed. Read [the build method](references/build-method.md) when filling `TECH.md` → Verify, grading a review finding, capturing a run, writing a status claim, or when you need a step's reasoning.

**Interop.** Where a plan-then-test-then-review toolchain is present in this session, delegate loop steps 1 to 4 to it and keep the criterion-to-test mapping, scope-creep check and instrumentation verification. Detect only what is present; never prompt an install.

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `repo.read` | Codebase, tests, patterns | Phase 5 cannot run; say so rather than plan in the abstract |
| `shell.exec` | Verify through `run-check` | No capture, so gate 5.2 cannot pass; deliver the plan and say what must run |
| `analytics.events` / `analytics.query` | Events arriving with properties | Emission log or code path, tagged weaker |
| `subagent.dispatch` | Delegating the loop | Run it inline, slice by slice |
| `files.read` / `files.write` | Artifacts, state | Required |

A planning-only run (`--plan-only`) is legitimate and produces the accepted plan without the loop; it does not pass gate 5.

## Standalone Procedure

For task decomposition, produce the plan (step 3) from the supplied spec; do not implement or run a lifecycle gate. For an authorized implementation, plan first and wait for acceptance unless the request already authorized going straight to code. For a review, apply the two axes and the severity scale (loop step 6). Use supplied requirements and project conventions without requiring phase filenames. Size tests to the changed behavior.

## Lifecycle Procedure

Run in order; delegate where the host allows, inline where it does not.

**1. Read `04-spec.md`, `DESIGN.md`, `TECH.md`.** No `04-spec.md` means stop.

**2. Record the test baseline** before any code: run `TECH.md` → Verify through `run-check`; note passes, failures and duration. Where Verify is empty, fill it first. Where verifying needs several commands and environment knowledge, slice one wraps them in a single target. No suite: say so; slice one creates it.

**3. Write the plan, reading only** (spec, `TECH.md`, codebase): change no code or test, and use the host's read-only planning mode where one exists; the baseline writes only evidence files. The plan holds slices with files, criteria and blocking edges; the critical path; risks with mitigations; rejected alternatives with why each lost; and a planned test for every numbered criterion (one without is the gate 5.1 failure, found now). Slices are tracer bullets, each end to end and mapped to criteria by number; apply the slice rules in [the build method](references/build-method.md#slice-rules) while writing the plan.

**Completeness test:** an engineer who never saw this conversation could build from the plan without asking which file, which order or which test.

**4. Get the plan accepted.** Interrogate it (what breaks, the riskiest step, what was rejected and why), then ask. Record `**Accepted:** {who} · {ISO timestamp}` from the person's own words, or quote an earlier standing instruction ("proceed through the build without stopping") with its date. Never accept on their behalf. No code before that line.

**5. Run the loop per slice**, in order:

1. **Write the test first** from the criterion, by number. An untestable criterion goes back to phase 4.
2. **Watch it fail.**
3. **Write the least code that passes it.**
4. **Refactor with the test green.**
5. **Verify the slice's instrumentation** fires in a real environment with the tracking plan's properties.
6. **Review** on two axes, tagging each finding with its axis, **standards** (good code?) or **spec conformance** (the specified thing?): behavior against each criterion the slice claims, including phase 4's enumerated states, and the diff against the plan. Review in a fresh context holding spec, plan and diff but not the build conversation; where the host cannot delegate, reread the diff from the start as someone else's. The context that wrote the code never approves it. **Important** findings (break a criterion or enumerated state, expose data, violate a `TECH.md` constraint, weaken a test) are fixed now or the gate fails; list at most five **nits** and count the rest. A recurring finding goes into `TECH.md` (Conventions or Known traps) now; a change that falsifies a `TECH.md` line updates it.

Before reporting a slice finished, run Verify and show the output.

**A bug:** reproduce it as a test failing for the reason the bug describes; capture it (commit or `run-check`) before touching code; make it pass without changing it.

**Fix the code, keep the test.** Changing an assertion, skipping a case, loosening a match or deleting a test removes the check. A genuinely wrong test (encoding behavior the spec does not require) changes only as its own visible step, citing the spec line. Recommend, never require, a host or CI block on test edits during a fix.

**6. Keep the plan true:** a deviation (unnamed file, split slice, a risk that turned real) updates the plan in the same change, with the reason.

**7. Run the scope-creep check** (gate 5.4): the diff against the phase 4 out-of-scope list, item by item. Anything built from it is removed, or promoted deliberately as a logged, visible override.

**8. Verify instrumentation end to end** (gate 5.3): per tracking-plan event, trigger the action, confirm arrival with its properties at the destination, record the evidence tagged by source. With no analytics capability, use the code path plus a local emission log, tagged and stated as weaker evidence.

**9. Write and gate.** Complete `.builderos/initiatives/{initiative}/05-build-plan.md` per [the build-plan template](references/build-plan-template.md), headings, bold labels and tables exact. Back every status claim with a `run-check` capture from the final change; a claim, or a delegated agent reporting one, is not evidence. Run gate 5 and record it (`scripts/bos.mjs record 5 --judged "{judge-id}=pass|fail,..."` where commands run), which advances to phase 6 on pass. Before reporting, update `TECH.md`: Verify if changed, conventions, traps, recurring findings, and each must-always-hold rule (no edits to generated files, no change to a frozen package) under Technical constraints with its deterministic check (host hook or CI) when one exists. Move the initiative to phase 6 in `ROADMAP.md`.

Completion marker: `## BUILD VERIFIED` with the accepted plan, the mapping, the test output, the instrumentation evidence, the scope-creep result and the gate result.

## Common Mistakes

| Mistake | Correct |
|---------|---------|
| Green output pasted with no captured run | Capture the final run; have coverage judged |
| A criterion mapped to "no test, reasoned exception" | Test it where its surface lives, or return it to phase 4 |
| A finding that biases the phase 2 metric or a guardrail carried to phase 6 | Fix it now, or fail gate 5.3 and say why |
| Code before the plan is accepted | Plan reading only, get acceptance, then build |
