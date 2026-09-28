# Rehearsal: one captoo feature from `/bos-init` to phase 7

**Date:** 2026-09-27 · **Host:** Claude Code 2.1.283, headless (`claude -p`), plugin loaded with `--plugin-dir` · **BuilderOS:** 2.0.0 plus the fixes listed below, each applied before the phase that needed it was re-run

## What was run

The first time an initiative went through every phase. The feature: an alert when a brand's share of voice on an AI answer engine drops ten points or more week over week, instead of waiting for the customer to notice it in the weekly report. `feature` track, lite mode.

The project was a stand-in for captoo: a small Node codebase (share of voice, weekly report, notify, track) with three passing tests, and a `materials/` folder of synthetic customer notes, a support-ticket export and two query outputs, all written for the rehearsal and marked as such. A person played the founder, answering the interview and deciding what only a founder can decide. No real captoo data was used, so what the run proves is the machinery, not the bet.

Each phase ran as its own headless session in the same project directory, briefed only by the files BuilderOS writes, which is also a test of the memory layer: nothing reached a later phase except through `PRODUCT.md`, `TECH.md`, `.builderos/` and the code.

| Phase | Outcome |
|-------|---------|
| Init | `feature` track, phases 0 and 1 `covered` by `PRODUCT.md` (second attempt, see finding 1) |
| 2 Define | 4 opportunities, one selected; success metric: share of qualifying drop alerts opened within 24 hours, baseline explicit 0, target ≥50% (second attempt, see finding 2) |
| 3 Ideate | 4 options, fixed-threshold alert selected; kill criterion: below 50% by 2027-01-04, rebuild the trigger rule |
| 4 Shape | `DESIGN.md` and a spec with 18 acceptance criteria, 9 out-of-scope items, 2 "not yet specified" questions |
| 5 Build | First honest run failed gate 5 on three dependencies the spec had left open; after the founder decided them, 29 tests passing, 4 events verified from a real run, gate recorded by the script |
| 6 Ship | Pilot of 20 accounts behind an environment variable, both rollback tiers executed, baseline captured before exposure, review date 2027-01-04 |
| 7 Learn | Run once on 2026-09-27: refused, the review window had not opened. Run again against a synthetic pilot log framed as 2027-01-05: ack rate 40.9% against 50%, kill criterion triggered, decision ITERATE, cycle 2 re-enters phase 3 with cycle 1 archived |

Tasks 1.9 and 2.6 of the v1 plan were checked in the same session on empty projects: a deliberately weak `00-frame.md` fails gate 0 on four named conditions and the phase does not advance; `/bos-discovery-sprint` on an idea with no data passes gate 0 and stops phase 1 at a research plan, with no verdict.

## Findings and what changed

| # | Found | Fix | Guarded by |
|---|-------|-----|------------|
| 1 | Coverage check C.1 rejected "AI answer engines" as solution language, in a product whose domain is AI answer engines; the model then bent the sentence to dodge the list, and `cover` recorded the failure before the drafting error could be fixed, locking an evidenced feature onto the `product` track | Terms defined in `PRODUCT.md` → Language are exempt; one word list instead of three; lowercase "ai" (an Italian preposition) no longer matches; the procedure runs `gate C` (read-only) before `cover` | Script test, scenario `feature-track-ai-domain` |
| 2 | Phase 2 chose "drops alerted within 24 hours", a metric the code satisfies by shipping | Gate 2.6: the success metric measures an outcome, not the build. Model-judged, never relaxed in lite | Gate table, `opportunity-mapping` |
| 3 | The model wrote four phase passes into `state.json` by hand, with round invented timestamps and extra fields, and recorded gate 5 as passed while the script failed it | `bos.mjs record N --judged ...` writes every gate result from the script's verdict plus the model's verdict on the judge conditions; handles phase 1 verdicts, the phase 6 review date, phase 7 close or re-entry | Script test, scenario `gate-recorded-by-script` |
| 4 | Gate 5.1 counted "no test, reasoned exception" as a mapped criterion; E.1 failed on `code` tags with line lists and on `[code:...]` used in prose to name the class | Excuses do not count as tests; line lists resolve; a class named in prose is not a citation | Script test |
| 5 | `/bos-build` and `/bos-ship` dispatched their agent in the background; the headless session ended before the reviewer wrote anything | Phase agents are dispatched in the foreground; headless runs set `CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS=0` | `CLAUDE.md` command contract |
| 6 | Gate 6.4 in lite mode printed "undefined" | Judged in both modes, a lite fail recorded as a warning | Script test |
| 7 | The roadmap's bet column stayed empty from phase 3 to 7 | Filled from phase 3's selected option until someone writes one | Script test |

## What held

- Every source tag resolved to a file (E.1 passed at every recorded gate), and the synthetic material stayed labelled synthetic from `materials/` to `07-outcome.md`. The evidence audit still counted untagged lines with numbers in the phase 5 and 6 artifacts (10 in `06-release.md`), mostly operational figures like test counts and times; it reports them, it does not fail on them.
- Once `record` existed, gate 5 refused to pass on work that was not done and named the three missing decisions; the founder's answers were saved as evidence and the spec was amended before the rebuild.
- Phase 7 refused to judge before the review date, and on the simulated data read the kill criterion literally.

## Not covered

- A real captoo codebase, real customers and a real release. Phase 6 exercised the mechanics against a stand-in; nothing reached production.
- Codex running the phases with a model: see `docs/hosts.md`, Codex, for what was and was not verified.
