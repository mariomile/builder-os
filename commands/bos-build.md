---
name: bos-build
description: "Phase 5 — decompose the spec into tracer bullets, build test-first, review against spec as well as standards, and verify instrumentation fires"
---

Dispatch `delivery-planner`, run the loop, then dispatch `build-reviewer` to close BuilderOS phase 5.

## Steps

1. **Check pipeline state.** Read `.builderos/state.json`. Phase 4 must have passed or been overridden. Without numbered acceptance criteria there is nothing to map tests to.
2. **Read `.builderos/initiatives/{initiative}/04-spec.md` and `DESIGN.md`.** Criteria, the state matrix, the out-of-scope list and the tracking plan.
3. **Resolve capabilities** per `references/capability-map.md`. `repo.read` is required for this phase; without it, say so and offer `--plan-only`.
4. **Detect a delivery toolchain** in this session (plan → test-driven development → code review, or equivalent). If present, the implementation loop delegates to it and BuilderOS keeps spec conformance, the scope-creep check and instrumentation verification. Absence is the expected case; never prompt an install.
5. **Dispatch the planner:**

```
Agent({
  description: "Delivery plan for [feature]",
  subagent_type: "delivery-planner",
  prompt: "Operating mode: [detected mode]
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
criterion-to-test mapping into .builderos/initiatives/{initiative}/05-build-plan.md."
})
```

6. **Run the loop, slice by slice.** Test first, watch it fail, minimum code, refactor green, verify the slice's instrumentation, review both axes. Delegate to the detected toolchain where one exists; otherwise run `delivery-discipline` step 5 inline.

7. **Dispatch the reviewer:**

```
Agent({
  description: "Build review for [feature]",
  subagent_type: "build-reviewer",
  prompt: "Operating mode: [detected mode]
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

Complete .builderos/initiatives/{initiative}/05-build-plan.md and run gate 5 before declaring completion."
})
```

8. **Verify completion:** `## BUILD VERIFIED` with a gate 5 verdict. The marker is the agent's claim, not the evidence: re-read the artifact it wrote and run gate 5 on it yourself per `gate-checks`. A missing artifact or a failed condition is what gets reported, whatever the marker says.
9. **Present** the criterion-to-test mapping, the test output, the instrumentation evidence and the scope check.

## Arguments

- `[--plan-only]` — Decompose and map, stop before the loop. Does not pass gate 5.
- `[--review-only]` — Review an existing diff against the spec.
- `[--slice N]` — Run the loop for one slice.

## Notes

Gate 5.2 is the only gate in BuilderOS that refuses a summary. Paste the runner output. "All tests pass" is the most frequently untrue sentence in software, and the gate exists because of that, not because anyone is being difficult.

Gate 5.3 asks whether events arrived, not whether the calls were written. Trigger the action, confirm the properties. Where no analytics capability resolved, the emission log is acceptable evidence and is labelled as the weaker evidence it is.

Gate 5.4 reads the phase 4 out-of-scope list against the diff, item by item. The thing that was easy to add while you were in there is exactly what it is looking for.

In lite mode, nothing in gate 5 relaxes. These four conditions are what stop the pipeline from building on fiction.
