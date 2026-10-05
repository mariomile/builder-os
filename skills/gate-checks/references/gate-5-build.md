# Gate 5 — Build

Read when running gate 5. E.1 and the procedure in `SKILL.md` apply too. **Acceptance:** whoever will own the change accepts the build plan, recorded as `**Accepted:** {who} · {ISO timestamp}` in `05-build-plan.md`, before any code (gate 5.6; `SKILL.md`, Acceptance).

| # | Condition | Check |
|---|-----------|-------|
| 5.1 | Every acceptance criterion maps to ≥1 test | Explicit mapping table, with an existing regular test file under the project root for every criterion. Use a literal path or a backticked path alongside the test name, with optional :line or #fragment; preserve spaces and route punctuation. No language extension whitelist |
| 5.2 | Those tests pass | Test output names a valid `Run` JSON record with exit 0 and matching output digest, no known failed-runner summary; model verifies the command/output covers all mapped tests and current code |
| 5.3 | Instrumentation verified firing | Evidence from a real environment, `data` or `code` tagged |
| 5.4 | No scope creep | Nothing from the Gate 4 out-of-scope list was built |
| 5.5 | The eval set passes | Eval results names `Run` and `Results` files. The captured run binds dataset/results digests, every case has one boolean result, computed pass rate reaches threshold, every must-pass passes; model verifies execution/rubric correspondence |
| 5.6 | The plan was accepted before the build | `## Plan` has `**Accepted:**` with who and an actual ISO timestamp; the Slices table has a Files column; `## Risks` has at least one row |
| 5.7 | The build followed the plan | Model confirms acceptance preceded implementation, and the final diff matches the plan or the plan records each deviation with its reason |

Script-decided: 5.1, 5.3, 5.4, 5.6. 5.2 and 5.5 fail deterministic prechecks when execution records/results are missing or failed, then become model-judged for coverage and provenance. Model-judged: 5.7. The emitted `checked_by` split is authoritative.

## Execution Evidence

Run checks only when the user has authorized the underlying command; checking the gate never runs them.

```sh
node scripts/bos.mjs run-check --label unit-tests -- pnpm test
node scripts/bos.mjs run-check --label evals --dataset evals/cases.jsonl --results evals/results.json -- node evals/run.mjs
```

The script prints `**Run:** .builderos/initiatives/{slug}/evidence/runs/{label}-{timestamp}.json`. Put that line under `## Test output`, or under `## Eval results` with `**Results:** evals/results.json`. Result JSON is an array such as `[{"id":"1","pass":true}]`, one result per dataset case. The check records argv, cwd, timestamps, exit code, log and digest; eval captures also record dataset and result digests. Any failed precheck blocks advancement without an explicit logged override. These editable local records detect drift, not adversarial fabrication; coverage and provenance remain model judgments. External runner evidence is unverified by this recorder: retain its raw source and explain the gap; never fabricate a `bos-run-check` record or rerun unauthorized work to close it.
