# Gate 5 — Build

Read when running gate 5. E.1, E.2 and the procedure in `SKILL.md` apply too. **Acceptance:** whoever will own the change accepts the build plan, recorded as `**Accepted:** {who} · {ISO timestamp}` in `05-build-plan.md`, before any code (gate 5.6; `SKILL.md`, Acceptance).

| # | Condition | Check |
|---|-----------|-------|
| 5.1 | Every acceptance criterion maps to ≥1 test | Explicit mapping table, with an existing regular test file under the project root for every criterion. Use a literal path or a backticked path alongside the test name, with optional :line or #fragment; preserve spaces and route punctuation. No language extension whitelist |
| 5.2 | Those tests pass | Test output names a valid `Run` JSON record with exit 0 and matching output digest, no known failed-runner summary; model verifies the command/output covers all mapped tests and current code. A suite that was already red: see Pre-existing failures below |
| 5.3 | Instrumentation verified firing | Evidence from a real environment, `data` or `code` tagged |
| 5.4 | No scope creep | Nothing from the Gate 4 out-of-scope list was built |
| 5.5 | The eval set passes | Eval results names `Run` and `Results` files. The captured run binds dataset/results digests, every case has one boolean result, computed pass rate reaches threshold, every must-pass passes; model verifies execution/rubric correspondence |
| 5.6 | The plan was accepted before the build, and could be understood | `## Plan` has `**In plain words:**` and `**Accepted:**` with who and an actual ISO timestamp; `## Seams` has at least one row, each with its interface, where tests sit and a plain-words line; the Slices table has a Files column; `## Risks` has at least one row |
| 5.7 | The build followed the plan | Model confirms acceptance preceded implementation, and the final diff matches the plan or the plan records each deviation with its reason |
| 5.8 | A guardrail runs Verify | `TECH.md` has `**Guardrail:**` naming the CI job or pre-commit hook that runs Verify on every change, not "none". `**Guardrail:** declined by {person} ({why}), {date}` is a warning, not a pass: on a repository whose CI belongs to someone else, adding it is their decision |
| 5.9 | The built interface was looked at | `05-build-plan.md` → `## Interface review`: `**Widths:**` naming two widths (the widest and the narrowest the ICP uses), and a table (State / Screenshot or route / Matches the chosen direction) with a row for each of the six states of the primary flow (empty, loading, partial, error, success, permission), each with screenshot files that exist or routes, or `not applicable, {reason}` for a state the flow does not have, each answering yes (a deviation is fixed, or recorded in `DESIGN.md` and then yes). On the change track, empty and error at one width. Skipped when the visual direction is not applicable; `**Interface review:** not applicable, {reason}` passes |
| 5.10 | Quality a machine can check runs every time | `TECH.md` → `**Quality checks:**` names accessibility, end-to-end on the primary flow, dependency audit, secret scan and static analysis in the guardrail; with an interface, a token check (raw colours and spacing outside the token file fail); once `TECH.md` → `## Design system` has a kit, visual regression on the primary flow. `declined by {person} ({why})` is a warning, as in 5.8 |
| 5.12 | Someone who did not build it reviewed the craft | `## Craft critique`: `**Run by:**` (a separate agent given only `DESIGN.md`, the voice, the captures and the reference screens, or a person who did not build it) and a table (Aspect / Finding / What happened) with a row each for hierarchy, spacing rhythm, typography, copy against the voice, focus states, motion with reduced motion, interaction states, and next to the references; every row has a finding ("none found" counts) and what happened to it (fixed, or recorded in `DESIGN.md`). Skipped with 5.9 |
| 5.13 | Someone who did not write it reviewed the security | `## Security review`: `**Run by:**` (a separate agent given the diff, the threat model and `TECH.md`, or a person who did not build it) and a table (Area / Finding / What happened) with a row each for access control, input handling, secrets and configuration, abuse limits and data exposure; every row has a finding ("none found" counts) and what happened to it. Skipped when the threat model is not applicable |
| 5.14 | The performance budget was measured | `## Performance`: a table (Measure / Budget / Measured / Within budget / Evidence), each row with numbers in budget and measured, "yes" within budget, and a captured run file or a `data`/`code` tag; with an interface, a page-load row (largest contentful paint, interaction to next paint or layout shift). Skipped when the spec's quality bar says performance does not apply |
| 5.11 | The next session can find its way in the code | `TECH.md` has `## Map` (where the entry points, modules, tests and generated files are, one row each) or "not applicable, {reason}", and every path named in the map, in `AGENTS.md` and in `CLAUDE.md` exists |
| 5.15 | The feature was seen working | `05-build-plan.md` → `## Demo` (`feature-demo`): `**Test:**` names the end-to-end test that walks the flow, a file that exists; `**Run:**` a captured passing run of the recording (or, on the floor, `**Recorded by:**` the person who recorded the screen); a table (Flow / Recording / Shows) with the primary flow, and `First day` on the product track, each recording an `https://` link, a video file that exists, or at least two step screenshots that exist, each with what it shows; a recording git would commit fails, because media stays out of the codebase (`.builderos/media/` is git-ignored). Skipped when the visual direction is not applicable, and on the change track when it is inherited; `**Demo:** not applicable, {reason}` passes |

Script-decided: 5.1, 5.3, 5.4, 5.6, 5.8, 5.9, 5.10, 5.11, 5.12, 5.13, 5.14, 5.15. 5.2 and 5.5 fail deterministic prechecks when execution records/results are missing or failed, then become model-judged for coverage and provenance. Model-judged: 5.7. The emitted `checked_by` split is authoritative.

## Pre-existing Failures

A product with history often has a suite that was red before this initiative touched it. Fixing those tests is scope creep (5.4); pretending they pass is fiction. Gate 5.2 then reads the final run against the baseline instead of demanding exit 0:

- `## Test baseline` names a captured `**Run:**` from before any change, and that run failed;
- `## Pre-existing failures` lists each failing test by the name the baseline log prints, one row each;
- the final run fails no more often than the baseline, and every listed name was in the baseline log;
- `## Test output` adds `**Mapped run:**`, a captured run of the mapped tests alone, exiting 0.

Then 5.2 becomes a judgment: confirm no new failure hides among the old ones. A green baseline turns every failure into a new one. Repairing a pre-existing failure is its own `change` initiative, or a recorded deviation in the plan.

## Execution Evidence

Run checks only when the user has authorized the underlying command; checking the gate never runs them.

```sh
node scripts/bos.mjs run-check --label unit-tests -- pnpm test
node scripts/bos.mjs run-check --label evals --dataset evals/cases.jsonl --results evals/results.json -- node evals/run.mjs
```

The script prints `**Run:** .builderos/initiatives/{slug}/evidence/runs/{label}-{timestamp}.json`. Put that line under `## Test output`, or under `## Eval results` with `**Results:** evals/results.json`. Result JSON is an array such as `[{"id":"1","pass":true}]`, one result per dataset case. The check records argv, cwd, timestamps, exit code, log and digest; eval captures also record dataset and result digests. Any failed precheck blocks advancement without an explicit logged override. These editable local records detect drift, not adversarial fabrication; coverage and provenance remain model judgments. External runner evidence is unverified by this recorder: retain its raw source and explain the gap; never fabricate a `bos-run-check` record or rerun unauthorized work to close it.
