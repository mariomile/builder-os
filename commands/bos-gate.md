---
name: bos-gate
description: "Run the current phase's gate check and report pass/fail per condition"
---

Checks whether the current phase artifact satisfies its gate. The only path that advances `current_phase`.

**REQUIRED BACKGROUND:** `gate-checks` for the conditions and the refusal protocol, `evidence-ledger` for tag counting.

## Steps

1. Read the active initiative's `state.json` → `current_phase`, `mode`.
2. Read the current phase artifact. If it does not exist, report that the phase has not produced output and stop.
3. **Run the script** where commands can be executed: `node {plugin}/scripts/bos.mjs gate {N}` from the project root (`--json` for the machine form). It decides the script-decided conditions, E.1 included, applies lite mode, runs the evidence audit, and lists the rest as `judge`.
4. **Judge the `judge` lines** against the artifact, per `gate-checks`. Do not re-judge what the script decided.
5. **Without command execution**, load the conditions from `gate-checks` and check every one against the artifact yourself, E.1 and the evidence audit per `evidence-ledger` included. Record them all under `checked_by.model`.
6. **All pass** → advance `current_phase`, write `gate.checked_by`, append `gate_passed` to `history`, report the next command.
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
