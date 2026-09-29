---
name: bos-build
description: "Phase 5 — decompose the spec into tracer bullets, build test-first, review against spec as well as standards, and verify instrumentation fires"
---

**Resources:** The installation root is the parent of this loaded `commands/` directory (or the hook’s installation-root line). Resolve `skills/`, `references/` and `scripts/` there; project artifacts belong in the working project.

**Dispatch:** On Claude Code use the namespaced profiles below, foreground (`run_in_background: false`), and await completion before the next dispatch or gate. On any other host resolve `subagent.dispatch`: pass the skill and context to an available generic agent, or run inline. Load delivery-discipline; qualify skill names with `builder-os:` on Claude.

Dispatch `builder-os:delivery-planner`, run the loop, then dispatch `builder-os:build-reviewer` to close BuilderOS phase 5.

## Steps

1. **Check pipeline state.** Read the active initiative's `state.json` (resolved per the schema, Active Initiative). Phase 4 must have passed or been overridden. Numbered acceptance criteria are required.
2. **Read `.builderos/initiatives/{initiative}/04-spec.md` and `DESIGN.md`.** Criteria, states, exclusions and tracking.
3. **Resolve capabilities** per `references/capability-map.md`. `repo.read` is required for this phase; without it, say so and offer `--plan-only`.
4. **Detect a delivery toolchain** in this session (plan → test-driven development → code review, or equivalent). If present, the implementation loop delegates to it and BuilderOS keeps spec conformance, the scope-creep check and instrumentation verification. Absence is the expected case; never prompt an install.
5. **Dispatch the planner:**

Dispatch `builder-os:delivery-planner` with this context:

```text
Operating mode: [detected mode]
Resolved capabilities: [per references/capability-map.md]
Pipeline state: initiative [slug], phase 5, cycle [C], mode [full|lite]
Delivery toolchain present: [yes, named | no]

PRODUCT.md:
[content]

04-spec.md:
[content]

DESIGN.md:
[content]

Write the slice table, the critical path, the pasted test baseline and the
criterion-to-test mapping into .builderos/initiatives/{initiative}/05-build-plan.md.
```

6. **Run the loop, slice by slice.** Test first, watch it fail, minimum code, refactor green, verify the slice's instrumentation, review both axes. Delegate to the detected toolchain where one exists; otherwise run `delivery-discipline` step 5 inline.

7. **Dispatch the reviewer:**

Dispatch `builder-os:build-reviewer` with this context:

```text
Operating mode: [detected mode]
Resolved capabilities: [as above]
Pipeline state: initiative [slug], phase 5, cycle [C], mode [full|lite]

04-spec.md:
[content, including the numbered criteria and the out-of-scope list]

DESIGN.md:
[content, including the state matrix]

05-build-plan.md:
[content]

Diff under review:
[the changes]

Complete .builderos/initiatives/{initiative}/05-build-plan.md and run gate 5 before declaring completion.
```

8. **Verify completion:** `## BUILD VERIFIED` with a gate 5 verdict. Re-read the artifact and rerun gate 5 per `gate-checks`; report missing artifacts or failed conditions despite any marker.
9. **Present** the criterion-to-test mapping, the test output, the instrumentation evidence and the scope check.

## Arguments

- `[--plan-only]` — Decompose and map, stop before the loop. Does not pass gate 5.
- `[--review-only]` — Review an existing diff against the spec.
- `[--slice N]` — Run the loop for one slice.

## Notes

Use `run-check` and its **Run:** capture, actual log and `gate-checks` judgement. Eval runs require hashed dataset/results with `{id, pass}` rows. Plan-only output cannot emit BUILD VERIFIED.
