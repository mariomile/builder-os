# Gate 6 — Ship

Read when running gate 6. E.1 and the procedure in `SKILL.md` apply too. **Acceptance:** whoever can authorize exposure, recorded as `**Authorized by:**` in Exposure verification (gate 6.8), and `record 6 --accepted-by "who"` (`SKILL.md`, Acceptance).

| # | Condition | Check |
|---|-----------|-------|
| 6.1 | Rollback path documented | Named mechanism, named owner, tested once |
| 6.2 | Baseline captured before exposure | Capture timestamp precedes the actual `Exposed at` timestamp, never a planned rollout date |
| 6.3 | Measurement exists | Dashboard or saved query for the success metric |
| 6.4 | Release notes written for the audience | Addressed to users or buyers, not a commit list |
| 6.5 | Outcome review scheduled | Owner and date; `--review-due` matches the artifact |
| 6.6 | Exposure observed | Exposure verification has `Status: verified`, non-future ISO `Exposed at`, `Environment`, `Version`, and an observed `Verification` result with resolving data/doc evidence |
| 6.7 | Exposure evidence proves availability | Model confirms intended behavior is available to users in the stated environment/version |
| 6.8 | Exposure was authorized by a person | Exposure verification names `**Authorized by:**` with who and how (the message, the ticket, the approval) |

Script-decided: 6.2, 6.3, 6.5, 6.6, 6.8. Model-judged: 6.1, 6.4, 6.7. The emitted `checked_by` split is authoritative.

**Recording.** Phase 6 passes the artifact's outcome review date with `--review-due`.

A ready release stays at phase 6 and emits `RELEASE READY`. `SHIPPED` requires the exposure conditions.
