---
name: bos-build
description: "Phase 5: plan the build and get it accepted, build test-first, review against spec and plan as well as standards, and verify instrumentation fires"
---

**Resources:** The installation root is the parent of this loaded `commands/` directory (or the hook’s installation-root line). Resolve `skills/`, `references/` and `scripts/` there; project artifacts belong in the working project.

**Dispatch:** On Claude Code use the namespaced profiles below, foreground (`run_in_background: false`), and await completion before the next dispatch or gate. On any other host resolve `subagent.dispatch`: pass the skill and context to an available generic agent, or run inline. Load delivery-discipline; qualify skill names with `builder-os:` on Claude.

Dispatch `builder-os:delivery-planner`, get the plan accepted, run the loop, then dispatch `builder-os:build-reviewer` to close BuilderOS phase 5.

## Steps

1. **Check pipeline state.** Read the active initiative's `state.json` (schema, Active Initiative). Phase 4 must have passed or been overridden; numbered acceptance criteria are required.
2. **Read** `04-spec.md`, `DESIGN.md` and `TECH.md` (Verify commands).
3. **Resolve capabilities** per `references/capability-map.md`. `repo.read` is required; without it, say so and offer `--plan-only`.
4. **Detect a delivery toolchain** (plan, test-driven development, code review, or equivalent). If present, the loop delegates to it and BuilderOS keeps the plan, spec conformance, scope creep and instrumentation. Never prompt an install.
5. **Dispatch `builder-os:delivery-planner`** (reads only, changes no code):

```text
Operating mode: [mode] · Capabilities: [resolved]
Pipeline state: initiative [slug], phase 5, cycle [C], mode [full|lite]
Delivery toolchain present: [yes, named | no]
PRODUCT.md, TECH.md, 04-spec.md, DESIGN.md: [content]

Write the plan into .builderos/initiatives/{initiative}/05-build-plan.md:
slices with files, critical path, risks, rejected alternatives, captured
baseline, criterion-to-test mapping. Leave **Accepted:** for the person.
```

6. **Get the plan accepted.** Show it, ask, record `**Accepted:** {who} · {ISO timestamp}` from their words (or a standing instruction, quoted). No code before this.
7. **Run the loop, slice by slice:** test first, watch it fail, minimum code, refactor green, instrumentation, Verify, update the plan on any deviation. Delegate to the toolchain where present, else `delivery-discipline` step 5 inline.
8. **Dispatch `builder-os:build-reviewer`** in a fresh context (no build conversation):

```text
Operating mode: [mode] · Capabilities: [resolved]
Pipeline state: initiative [slug], phase 5, cycle [C], mode [full|lite]
TECH.md, 04-spec.md (criteria, out of scope), DESIGN.md (states),
05-build-plan.md (accepted plan): [content]
Diff under review: [the changes]

Review both axes with severity, complete 05-build-plan.md, run gate 5.
```

9. **Verify completion:** `## BUILD VERIFIED` with a gate 5 verdict. Re-read the artifact and rerun gate 5 per `gate-checks`; report failed conditions despite any marker.
10. **Present** the plan, the mapping, the test output, the instrumentation evidence, the findings and the scope check.

## Arguments

- `[--plan-only]`: write the plan and get it accepted, stop before the loop. Does not pass gate 5.
- `[--review-only]` — Review an existing diff against the spec.
- `[--slice N]` — Run the loop for one slice.

## Notes

Use `run-check` and its **Run:** capture, actual log and `gate-checks` judgement. Eval runs require hashed dataset/results with `{id, pass}` rows. Plan-only output cannot emit BUILD VERIFIED.
