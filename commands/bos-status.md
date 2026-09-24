---
name: bos-status
description: "One-screen view of the BuilderOS project: every initiative, the active one's phases and gates, what blocks the next step"
---

Renders the pipeline state. Read-only — never advances a phase, never writes state.

**REQUIRED BACKGROUND:** `builder-os` for the phase map, `references/builderos-state-schema.md` for the state fields.

## Steps

1. Read `.builderos/state.json`. If missing, say so and offer `/bos-init`.
2. Read `PRODUCT.md` for the header line and `.builderos/ROADMAP.md` for the other initiatives. If the roadmap disagrees with state, say so: state wins, and the roadmap needs correcting.
3. For the active initiative (or the one named with `--initiative`), for each phase 0–7, resolve: status, gate result, overrides, artifact presence.
4. Identify the single blocking item: the failed condition of the current gate, or the next action if the gate has not been run.
5. Surface every override ever recorded. Overrides do not expire.
6. Show `covered` phases with the `PRODUCT.md` tags that covered them, and every `track_upgraded` event with its reason. A missing `track` reads as `product`.

## Output

```markdown
## {Product} · {initiative title} — cycle {C}, mode {full|lite}, track {spike|feature|product}

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

**Other initiatives**
- {title} · phase {N} · paused since {date}
- {title} · closed · {outcome}
```

Keep it to one screen. If everything passed and phase 7 is done, report the decision (`KEEP` / `ITERATE` / `KILL`) and the re-entry phase instead of the table.

## Arguments

- `[--verbose]` — Include the full `history` log.
- `[--overrides]` — Overrides only.
- `[--initiative slug]` — Show another initiative without switching to it.
