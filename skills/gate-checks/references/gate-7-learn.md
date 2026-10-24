# Gate 7 — Learn

Read when running gate 7. E.1, E.2 and the procedure in `SKILL.md` apply too. Read the override log (`SKILL.md`, Override Protocol) when judging the outcome: a bet that failed after three overridden gates learned something different from one that failed clean.

| # | Condition | Check |
|---|-----------|-------|
| 7.1 | Actual vs. target stated | Both source-tagged, compared explicitly |
| 7.2 | Kill criteria evaluated | The Phase 3 threshold checked against the actual, verdict stated |
| 7.3 | Decision recorded | `KEEP` / `ITERATE` / `KILL`; `Re-enters at: phase 0-6` or `none`. ITERATE requires a phase, KILL requires none; CLI decision/re-entry must agree |
| 7.4 | Generalized learning | One sentence that outlives the feature, written into `decisions/` |
| 7.6 | Cleanup is scheduled | `**Cleanup:**` under the decision: after KEEP, the flag and the old code path to remove; after KILL, the shipped code to remove (as a `change` initiative); with an owner and a date. `none` only with its reason |
| 7.5 | A closing KEEP sets a watch | When the decision is KEEP with `Re-enters at: none`, `## Watch` names the metric, the bands, the owner and a valid recheck date. Skipped for ITERATE, KILL and a KEEP that re-enters |
| 7.7 | A person made the decision | `**Chosen by:**` under the decision names who chose keep, iterate or kill, from their answer; the agent compares and recommends |
| 7.8 | The go-to-market is read (feature and product tracks) | `## Go-to-market read` (`go-to-market`): a row per channel with a tagged result, or "unavailable" with its question; on the product track `**GTM stage:**` Signal, Resonance or Orbit. Skipped on the change track |

Script-decided: 7.1, 7.2, 7.3, 7.5, 7.6, 7.7, 7.8. Model-judged: 7.4. The emitted `checked_by` split is authoritative.

**Recording.** Phase 7 passes `keep|iterate|kill`, matching its heading and `Re-enters at` field. `iterate` requires `--reenter 0-6`, `kill` prohibits it, and `keep` permits either an explicit re-entry or `none`.

**Deferring.** A review waiting for enough observations stays at phase 7 without a KEEP/ITERATE/KILL verdict:

```sh
node scripts/bos.mjs defer-review --review-due 2030-01-31 --reason "Need a complete observation window"
```

Use the actual next review date and evidence gap, not the example date. A deferral records `review_deferred`, preserves phase 7, and keeps reminders tied to `review_due`.
