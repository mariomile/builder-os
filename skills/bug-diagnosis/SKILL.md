---
name: bug-diagnosis
description: "Diagnoses a bug before anyone fixes it: a failing loop that reproduces it, captured first, then the cause found by eliminating hypotheses one at a time. Use when something is broken, throws, regressed, got slower, fails only sometimes, or a user or monitor reports a problem in production."
---

# Bug Diagnosis

A fix proposed before the bug is reproduced is a guess with a commit attached. This skill turns a report into a loop that goes red on this bug and green when it is gone, then finds the cause by elimination rather than intuition, then makes the bug impossible to bring back unnoticed.

## Mode and resources

Follow [operating modes and resource paths](../../references/operating-modes.md). **Standalone:** diagnose and, when authorized, fix the reported problem; write no lifecycle state. **Lifecycle:** phase 5 calls it for a bug found while building, phase 6 for a problem after exposure, phase 7 when a watch breach looks like a defect rather than an outcome. The fix follows phase 5's rules: a test captured failing before the code changes, never edited to pass.

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `shell.exec` | Running the reproduction, the tests, the instrumented build | Write the exact commands for the user and wait for their output |
| `repo.read` | The code path, recent changes (`git log`, blame) | Ask for the relevant files |
| `logs.query` | Production errors, traces, timings around the report | Ask for the error text, time and affected account; tag it `[doc:user-…]` |
| `analytics.replay` | What the user did before it broke | Ask for the steps |
| `db.query` | The rows in the state that triggers it | Ask; read the schema from migrations |

## Procedure

1. **Build the loop that goes red.** The fastest repeatable signal that fails on this bug and only this bug: a failing test, a script, a request, a timing measurement with a threshold. Capture it failing (`run-check` where commands run). Without a red loop there is no diagnosis yet; for a production-only bug, the loop is the narrowest log or trace query that shows it, and making it reproducible locally is the next step. A flaky failure gets a loop that runs it until it fails and reports the rate.

2. **Make it small.** Remove everything that does not change the result: data, steps, configuration, code paths. Stop when removing anything else turns the loop green. The minimal case usually names the cause on its own.

3. **List hypotheses before touching code.** At most three, ranked by likelihood, each with the observation that would kill it. "Recent change" is a hypothesis only with the commit named; `git bisect` against the loop settles it mechanically.

4. **Instrument, one hypothesis at a time.** Add the log line, the assertion or the timing that would kill the top hypothesis, run the loop, read the result, cross it out or confirm it. Never change behavior while instrumenting. Remove the instrumentation afterwards.

5. **Fix the cause, not the symptom.** A null check where the value should never be null hides the bug that produced it. The fix makes the minimal loop green without editing it; then the full suite runs.

6. **Make it impossible to bring back.** The red loop becomes a regression test at the module's seam. When the cause is mechanical (a banned call, a missing await, an import that should never happen), add the check that catches the whole class (a lint rule, a type, a hook) per `delivery-discipline` → Guardrails. Add the trap to `TECH.md` → Known traps with the commit.

7. **Explain it in plain words.** Four lines the owner can repeat: what broke and for whom, why, what changed, and how we know it will not come back unnoticed. In lifecycle mode, a production bug also goes into the release or outcome artifact of the initiative that shipped it.

Completion marker: `## BUG DIAGNOSED` with the red loop (captured failing and passing), the minimal case, the hypotheses and which one held, the fix, the regression test and any new check, and the plain-words summary.

## Common Mistakes

| Mistake | Why it fails | Correct |
|---------|-------------|---------|
| Proposing a fix from the stack trace | Treats the place it crashed as the place it broke | Red loop first, then minimize |
| Five hypotheses tested at once | No change can be attributed | One at a time, each with its killing observation |
| "Could not reproduce", closed | The bug comes back in front of a customer | Narrow the production signal until it reproduces, or record what is missing |
| A guard clause around the symptom | The cause keeps producing bad state elsewhere | Fix where the bad value is created |
| The reproduction edited until it passes | The check is gone, not the bug | The loop is fixed before the fix; only the code changes |
| A rule about the bug written in prose only | The next agent repeats it | A check that catches the class, then the trap in `TECH.md` |
