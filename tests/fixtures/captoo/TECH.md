# TECH.md — captoo

**Verified:** 2026-09-27 @ 6c40437

## Stack
| Layer | Choice | Why | Decision |
|-------|--------|-----|----------|
| Runtime | Node.js, ES modules (`"type": "module"`) | Matches `package.json`; no framework | inherited |
| Dependencies | None — Node built-ins only | `package.json` declares no `dependencies` | inherited |
| Analytics sink | `src/track.mjs`, appends JSON lines to `events.log` in development; production sends the same payload to "the analytics provider" (unnamed in code) | Comment in `track.mjs` states the dev/prod split explicitly | inherited |
| Notification sink | `src/notify.mjs`, writes a JSON file per account to `outbox/` in development | Same dev-sink pattern as `track.mjs`; no production notification path exists yet | inherited |
| Testing | `node --test test/*.test.mjs` | `package.json` `scripts.test`; no test framework dependency | inherited |
| Hosting | None configured | No deploy config, no CI, no server entry point in the repo | inherited |

## Technical constraints
- No dependencies: any addition (e.g. a scheduler, an email provider SDK) is a deliberate departure from the current zero-dependency stance, not a given.
- `track()` and `sendWeeklyReport()` both write to the local filesystem in development (`events.log`, `outbox/`); there is no live production channel wired up in this repo today `[code:src/track.mjs:5]` `[code:src/notify.mjs:5]`.
- `shareOfVoice` and `displacedBy` operate on an in-memory array of `{ engine, prompt, citedBrands }` runs; nothing in the repo persists or loads that array from a store — the caller is expected to supply it `[code:src/sov.mjs:2]`.

## Conventions
- One module, one responsibility: `sov.mjs` (pure SoV/displacement math), `weekly-report.mjs` (assembles a report from two weeks of runs), `notify.mjs` (delivery), `track.mjs` (analytics events). A new capability that touches more than one of these should still keep the split.
- Tests live in `test/`, one `*.test.mjs` file per source module, using `node:test` and `node:assert/strict` — no third-party test runner.
- `track(event, properties)` is the one call site for product analytics; anything that should show up in analytics goes through it rather than writing `events.log` directly.

## Known traps
- None recorded yet — this is the project's first TECH.md.
