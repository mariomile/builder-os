# Gate 1 — Discover

Read when running gate 1. E.1 and the procedure in `SKILL.md` apply too. On the spike track, also read Spike Stop below.

| # | Condition | Check |
|---|-----------|-------|
| 1.1 | ≥5 evidence units from primary sources | `evidence-ledger` count of `data` + `interview` + `code` + primary `doc` units ≥ 5 |
| 1.2 | ≥5 distinct sources | Code citations normalize to the real file, ignoring lines and aliases; interview tags split per participant; data/doc files may declare `Source identity` to deduplicate the underlying source. Distinct files still require semantic independence review |
| 1.3 | Explicit verdict | One of `VALIDATED` / `KILLED` / `RESHAPED`, with reasoning that cites tags |
| 1.4 | JTBD statement present | Form: "When \_\_\_, I want to \_\_\_, so I can \_\_\_" |
| 1.5 | Disconfirming evidence sought | The artifact names what would have killed the problem and whether it was looked for |

Script-decided: 1.1, 1.2, 1.3, 1.4. Model-judged: 1.5. The emitted `checked_by` split is authoritative.

`KILLED` is a successful gate pass. The pipeline stops and reports. Killing a problem in phase 1 is the cheapest outcome BuilderOS can produce.

**Recording.** Phase 1 records `validated|killed|reshaped`, matching the artifact; `answered` is a phase status derived from the spike track, never a verdict. A spike closes at phase 1 regardless of its verdict.

## Spike Stop (spike track)

A `spike` ends at gate 1. Gate 1 runs unchanged; on pass, phase 1 is written `answered` instead of `passed`, `current_phase` does not advance and the initiative `status` becomes `closed`. The verdict (`VALIDATED`, `KILLED` or `RESHAPED`) is the answer, reported as a recommendation. Continuing means reclassifying to `feature` or `product`, stated to the user and logged as `track_upgraded`.
