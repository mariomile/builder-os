---
name: bos-status
description: "One-screen view of the BuilderOS pipeline: phases done, gates passed, what blocks the next step"
---

Renders the pipeline state. Read-only — never advances a phase, never writes state.

**REQUIRED BACKGROUND:** `builder-os` for the phase map, `references/builderos-state-schema.md` for the state fields.

## Steps

1. Read `.builderos/state.json`. If missing, say so and offer `/bos-init`.
2. Read `PRODUCT.md` for the header line.
3. For each phase 0–7, resolve: status, gate result, overrides, artifact presence.
4. Identify the single blocking item: the failed condition of the current gate, or the next action if the gate has not been run.
5. Surface every override ever recorded. Overrides do not expire.

## Output

```markdown
## {Product} — cycle {C}, mode {full|lite}

| # | Phase | Status | Gate | Artifact |
|---|-------|--------|------|----------|
| 0 | Frame | passed | ✓ | 00-frame.md |
| 1 | Discover | passed | ⚠ overridden (1.5) | 01-discovery.md |
| 2 | Define | in progress | — | — |
| 3 | Ideate | pending | — | — |
| … | | | | |

**Verdicts:** phase 1 → VALIDATED

**Overrides in force**
- Phase 1, condition 1.5 (disconfirming evidence sought) — "No churned users reachable before the board meeting; revisit in cycle 2" · 2026-09-20

**Blocking now:** {the failed condition, or "gate 2 not yet run"}
**Next:** `/bos-define`
```

Keep it to one screen. If everything passed and phase 7 is done, report the decision (`KEEP` / `ITERATE` / `KILL`) and the re-entry phase instead of the table.

## Arguments

- `[--verbose]` — Include the full `history` log.
- `[--overrides]` — Overrides only.
