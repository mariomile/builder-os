---
name: bos-gate
description: "Run the current phase's gate check and report pass/fail per condition"
---

Checks whether the current phase artifact satisfies its gate. The only path that advances `current_phase`.

**REQUIRED BACKGROUND:** `gate-checks` for the conditions and the refusal protocol, `evidence-ledger` for tag counting.

## Steps

1. Read `.builderos/state.json` → `current_phase`, `mode`.
2. Read the current phase artifact. If it does not exist, report that the phase has not produced output and stop.
3. Load the gate conditions for that phase from `gate-checks`. Apply lite-mode relaxations if `mode` is `lite`.
4. **Run the evidence audit** per `evidence-ledger`: extract every claim carrying a number, a proportion word, or a causal assertion; flag untagged ones; count primary units and distinct sources.
5. Check each condition against the artifact text. Mechanically — a condition that requires judgment has been written wrong and should be reported as such rather than guessed at.
6. **All pass** → advance `current_phase`, append `gate_passed` to `history`, report the next command.
   **Any fail** → do not advance. Emit the refusal format from `gate-checks`, naming the failed condition, what was found, what would satisfy it, and the cheapest path.
7. If the failure is a reasoning gap rather than missing work (an unfalsifiable assumption, an unresolved branch), offer `pressure-testing` rather than asking the user to rewrite blind.

## Override

```
/bos-gate --override "reason"
```

Advances despite failures. Writes `overridden: true`, the reason, and the failed condition ids to `state.json`, and appends `gate_overridden` to `history`. The override shows in every `/bos-status` from then on and is read by phase 7 when judging the outcome.

Refuse an override with an empty or evasive reason ("later", "fine", "trust me"). The reason is the entire value of the mechanism.

## Arguments

- `[--phase N]` — Check a specific phase instead of the current one. Read-only, never advances.
- `[--override "reason"]` — Advance despite failures, logged.
- `[--audit]` — Evidence audit only, no gate verdict.

## Output

```markdown
## GATE {N} — {PASSED | FAILED}

| # | Condition | Result |
|---|-----------|--------|
| {N}.1 | {condition} | ✓ |
| {N}.2 | {condition} | ✗ |

**Evidence:** {primary units} units from {distinct} sources · {untagged} untagged claims · {assumption ratio}%

{On failure, the refusal block from gate-checks.}
{On pass, the next command.}
```
