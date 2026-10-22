---
name: bug-diagnosis
description: "Diagnoses a bug before anyone fixes it: a red loop that reproduces it, a minimal case, the cause found by elimination. Use when something is broken, throws, regressed, got slower, fails sometimes, or is reported in production."
---

# Bug Diagnosis

A fix proposed before the bug is reproduced is a guess with a commit attached. Diagnosis turns a report into a **red loop** (a fast, repeatable signal that fails on this bug and passes when it is gone), shrinks it to a **minimal case**, finds the cause by elimination, and makes the bug impossible to bring back unnoticed.

**Mode.** Standalone diagnoses, and fixes when authorized, with no lifecycle state. In the lifecycle, phase 5 calls it for a bug found while building, phase 6 for a problem after exposure, phase 7 when a watch breach looks like a defect; the fix follows phase 5's rules. Both per [operating modes](../../references/operating-modes.md).

## Procedure

1. **Build the red loop.** A failing test, a script, a request, a timing with a threshold: whatever fails fastest on this bug alone. Capture it failing (`run-check` where commands run). For a production-only bug the loop starts as the narrowest log or trace query that shows it, and reproducing it locally is the next move; a flaky failure gets a loop that repeats until it fails and reports the rate. Done when the loop is captured red.
2. **Shrink it.** Strip data, steps, configuration and code paths while the loop stays red. Done when removing anything else turns it green: that is the minimal case, and it often names the cause.
3. **List the hypotheses.** Up to three, ranked, each with the observation that would kill it. A recent change counts as a hypothesis with its commit named; `git bisect` against the loop settles it mechanically. Done when each hypothesis has its killing observation written next to it.
4. **Eliminate one at a time.** Add the log line, assertion or timing that tests the top hypothesis, run the loop, cross it out or confirm it. Instrumentation observes; behavior stays as it was until the cause is known. Done when one hypothesis is confirmed by an observation and the instrumentation is removed.
5. **Fix where the bad value is created.** The fix turns the minimal loop green with the loop untouched; then the full suite runs. Done when both are captured green.
6. **Close the class.** The loop becomes a regression test at the module's seam. A mechanical cause (a banned call, a missing await, a forbidden import) gets the check that catches the whole class, per `delivery-discipline` → Guardrails. The trap goes into `TECH.md` → Known traps with the commit. Done when the regression test is in the suite and any new check has run once.
7. **Say it in plain words.** Four lines the owner can repeat: what broke and for whom, why, what changed, how we know it will stay fixed. In the lifecycle a production bug also goes into the release or outcome artifact of the initiative that shipped it. Done when those four lines are written.

## Watch for

| Do | Instead of |
|---|---|
| Red loop first, then shrink | A fix read off the stack trace, where it crashed rather than where it broke |
| One hypothesis per run | Five changes at once, none attributable |
| Narrow the production signal until it reproduces, or record what is missing | Closing as "could not reproduce" |
| Fix where the bad value is born | A guard clause around the symptom |
| A check that catches the class, then the trap in `TECH.md` | A rule about the bug in prose only |

## Capabilities

| Capability | Used for | Floor if absent |
|---|---|---|
| `shell.exec` | The loop, the tests, the instrumented build | Write the exact commands for the person and wait for their output |
| `repo.read` | The code path, recent changes | Ask for the relevant files |
| `logs.query` | Production errors, traces, timings around the report | Ask for the error text, time and affected account; tag it `[doc:user-…]` |
| `analytics.replay` | What the user did before it broke | Ask for the steps |
| `db.query` | The rows in the state that triggers it | Ask; read the schema from migrations |

## Output Contract

`## BUG DIAGNOSED` with the red loop (captured failing and passing), the minimal case, the hypotheses and which one held, the fix, the regression test and any new check, and the plain-words summary.
