# Gate 5 — Build

Read when running gate 5. E.1 and the procedure in `SKILL.md` apply too. **Acceptance:** whoever will own the change accepts the build plan, recorded as `**Accepted:** {who} · {ISO timestamp}` in `05-build-plan.md`, before any code (gate 5.6; `SKILL.md`, Acceptance).

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
| 5.9 | The built interface was looked at | `05-build-plan.md` → `## Interface review` table (State / Screenshot or route / Matches the chosen direction): rows for at least the empty and error states of the primary flow, each with a screenshot file that exists or a route, each answering yes (a deviation is fixed, or recorded in `DESIGN.md` and then yes). Skipped when the visual direction is not applicable; `**Interface review:** not applicable, {reason}` passes |
| 5.10 | Quality a machine can check runs every time | `TECH.md` → `**Quality checks:**` names accessibility, end-to-end on the primary flow, dependency audit and secret scan in the guardrail. `declined by {person} ({why})` is a warning, as in 5.8 |

Script-decided: 5.1, 5.3, 5.4, 5.6, 5.8, 5.9, 5.10. 5.2 and 5.5 fail deterministic prechecks when execution records/results are missing or failed, then become model-judged for coverage and provenance. Model-judged: 5.7. The emitted `checked_by` split is authoritative.

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
