# .builderos/ State Schema

The project's memory. Created by `/bos-init`, read at the start of every session and by every lifecycle command, written by every phase.

## Layout

```
PRODUCT.md                what the product is: problem, ICP, non-goals, constraints, voice, language
TECH.md                   how it is built: stack, verify commands, technical constraints, conventions, known traps
AGENTS.md                 the project's own agent instructions; /bos-init adds the pointer below
.builderos/
  local.json              this checkout's active initiative; gitignored, never shared
  ROADMAP.md              the master plan: direction, initiatives now / next / later / dropped
  decisions/
    ADR-001-{slug}.md     one file per decision that is hard to reverse (shared across initiatives)
  evidence/               sources cited by PRODUCT.md and TECH.md, same format as an initiative's
  initiatives/
    {initiative}/         one folder per initiative: a feature, a bet, a new product
      state.json          this initiative's pipeline state, the machine-read file
      evidence/           one file per source a tag cites: interview notes, query output, excerpts
        runs/             explicitly captured checks: command/exit metadata JSON and raw output logs
      00-frame.md         problem statement, ICP, riskiest assumption
      01-discovery.md     evidence ledger, JTBD, verdict
      02-definition.md    opportunity tree, selected opportunity, success metric
      03-solution-bet.md  options scored, selected bet, kill criteria
      DESIGN.md           information architecture, flows, states, components
      04-spec.md          scope, flows, acceptance criteria, tracking plan
      05-build-plan.md    accepted plan, test map, review record
      06-release.md       rollout, instrumentation check, baseline
      07-outcome.md       actual vs. target, decision, watch
      questionnaires/
        {recipient}.md    async questions for someone the user cannot interview, phase 1
      cycle-{N}/          artifacts of an earlier cycle of this initiative
```

Throughout the skills and commands, a bare artifact name (`state.json`, `00-frame.md`, `DESIGN.md`, `evidence/`, `questionnaires/`) means the file in the **active initiative's folder**: `.builderos/initiatives/{initiative}/`. `PRODUCT.md`, `TECH.md`, `ROADMAP.md` and `decisions/` are project-wide.

Phase artifacts are Markdown for humans. Each initiative's `state.json` is the machine surface: no agent should have to parse prose to know where an initiative stands.

State is split per initiative so that two people advancing two initiatives never edit the same file. The only shared files that change often are `ROADMAP.md`, whose tables are regenerated from the initiative states (a merge conflict there is resolved by regenerating, never by hand), and `decisions/`, which only ever gains files.

## Active Initiative

Which initiative a command acts on is a property of the person and the checkout, not of the project, so it is not committed. Resolve it in this order:

1. `.builderos/local.json` → `{ "active": "{slug}" }`, when the slug names an initiative that is still open.
2. Otherwise, the only open initiative, if exactly one is open.
3. Otherwise, ask which one, listing the open initiatives, and write the answer to `local.json`.

`/bos-init` adds `.builderos/local.json` to `.gitignore`. Switching initiative rewrites `local.json` and is named to the user.

## Evidence Files

Every tag of class `interview`, `doc` or `data` names a file in `evidence/`: the initiative's own folder first, then `.builderos/evidence/` for sources shared across initiatives. The file name is the identifier with every `:` and `/` replaced by `-`, plus `.md`: `[interview:P3]` → `evidence/P3.md`, `[data:posthog:funnel_q3]` → `evidence/posthog-funnel_q3.md`. A multi-participant tag (`[interview:P1,P4]`) needs one file per participant. `code` tags resolve to the cited file in the repository; `estimate` and `assumption` need no file.

```markdown
# {identifier}

**Class:** interview | doc | data
**Captured:** {YYYY-MM-DD} · **By:** {who recorded it} · **Where:** {call, ticket URL, query tool and parameters, file path}
**Source identity:** {optional stable identity of the underlying source, shared across excerpts/query variants}

{The raw material: notes or verbatim quotes, the pasted query output, the excerpt. Not a summary of it.}
```

What the user says in the conversation is evidence too, and gets the same treatment: `[doc:user-{YYYY-MM-DD}-{topic}]`, with the user's words copied verbatim into the file. This replaces the old bare `[doc:user-{date}-{topic}]`, which pointed at nothing.

Code citations to different lines in the same real file count as one source, including symlink/path aliases. Interview groups count each participant. Data/doc evidence declaring the same `Source identity` counts as one underlying source; without it, identity falls back to the tag identifier. Distinct file identities do not prove independent observations: the model must inspect population, provenance and repeated sources.

A tag whose file does not exist fails the gate exactly like an untagged claim. The file makes a source auditable, not true: a person reviewing the initiative can open the notes behind P3, and an invented P3 now has to be invented twice, in a place someone will read.

**Version control:** commit `.builderos/`, `PRODUCT.md` and `TECH.md`. Product decisions belong next to the code they caused, and a teammate cloning the repo inherits the reasoning. Teams that want it private add `.builderos/` to `.gitignore` at init time; `/bos-init` asks once and records the answer.

## Captured Checks and Release Exposure

`gate` and `record` inspect evidence; they never rerun project commands. `run-check --label <slug> [--cwd <dir>] [--dataset <file> --results <file>] -- <executable> [args...]` explicitly executes argv without an implicit shell. Options precede `--`; everything after it belongs to the executable. Use only commands already within the user's authorization.

Each run writes a timestamped JSON and `.log` under the active initiative's `evidence/runs/`:

```json
{
  "schema": 1,
  "provenance": "bos-run-check",
  "command": ["pnpm", "test"],
  "cwd": ".",
  "started_at": "2026-09-29T10:00:00.000Z",
  "finished_at": "2026-09-29T10:00:02.000Z",
  "exit_code": 0,
  "signal": null,
  "output_file": ".builderos/initiatives/csv-export/evidence/runs/tests-2026-09-29T10-00-00-000Z.log",
  "output_sha256": "sha256 of the recorded log"
}
```

This is a format example; the script generates the actual digest. Failed and interrupted executions remain recorded. Add the printed `**Run:** <project-relative-json>` under `## Test output`. The gate checks record structure, timestamps, exit status, log digest, known failure summaries and mapped file existence. Successful captured checks still require model judgment of current-code coverage and execution provenance. Editable metadata and hashes cannot authenticate adversarial forged records. External execution evidence remains unverified by this helper; preserve its raw source and disclose the gap rather than fabricating a local capture.

For evals, `--dataset` binds the input dataset digest before execution and `--results` binds the produced JSON digest after execution. Metadata adds `dataset_file`, `dataset_sha256`, `results_file`, `results_sha256`. Under `## Eval results`, include both `**Run:** <record>` and `**Results:** <results.json>`. Results are an array of unique `{ "id": "case-id", "pass": true }` entries covering every case. The gate computes the pass rate and verifies all must-pass cases; the model verifies the real run used the specified rubric and current implementation. JSON/JSONL dataset cases require unique `id`, `input`, `expected`, optional named `judge`, and boolean `must_pass`. Markdown uses columns # / Input / Expected / Judge / Must pass. Prose counts, invalid files and unsupported formats fail.

A release plan is readiness, leaving phase 6 open. Actual advancement requires this section in `06-release.md`:

```markdown
## Exposure verification
**Status:** verified
**Exposed at:** 2026-09-29T10:00:00Z
**Environment:** production
**Version:** {deployed release identifier}
**Verification:** {observed intended behavior available to users} [doc:release-observation]
```

The source must resolve and be `data` or `doc`; code existence alone does not demonstrate exposure. `Exposed at` is a valid non-future ISO timestamp; the baseline capture precedes it. The model checks that evidence actually proves availability. Use the actual timestamp/version/observation; this format example is not a production claim. The CLI review date matches the artifact's Outcome review date. `RELEASE READY` denotes preparation; `SHIPPED` denotes verified exposure, with any gate overrides explicitly visible.

## Session Start

The files above only help if a new session reads them. Every session, on any host, before answering anything product-related:

1. Read `.builderos/ROADMAP.md` and every `.builderos/initiatives/*/state.json`; resolve the active initiative.
2. Read `PRODUCT.md`, and `TECH.md` when the work touches code.
3. Give the user a briefing of at most five lines: the active initiative and its phase, the last gate result, open overrides, the most recent decision, and what comes next.
4. Add one **Attention** line when any of these holds, and only then:
   - an outcome review is overdue: an initiative's `review_due` date has passed and phase 7 has not run;
   - `TECH.md` is stale: its `Verified` commit is older than the latest commit touching a dependency manifest or lockfile, or, without git, its date is more than 60 days old;
   - an open initiative has not changed in 30 days: its `updated_at` says so;
   - the roadmap disagrees with an initiative's state.

Where commands can be executed, `node scripts/bos.mjs brief` (in the plugin) computes all four from the files and prints the briefing; the model only relays it. Where they cannot, the model reads the same files and applies the same rules.

Hosts with a session-start hook get this from `using-builder-os`. Every other host gets it from the pointer `/bos-init` writes into the project's own `AGENTS.md`:

```markdown
## BuilderOS

This project is run with BuilderOS. Before any product or planning work, read `.builderos/ROADMAP.md`, each `.builderos/initiatives/*/state.json`, `PRODUCT.md` and `TECH.md`, then brief the user in at most five lines on where things stand, plus one line if an outcome review is overdue or `TECH.md` is stale. Decisions live in `.builderos/decisions/`; each initiative's reasoning lives in `.builderos/initiatives/`.
```

If the project has a `CLAUDE.md` that does not import `AGENTS.md`, the same block goes there too.

## ROADMAP.md

```markdown
# Roadmap — {Product}

**Verified:** {YYYY-MM-DD} @ {short commit, or "no git"}

## Direction
{Two or three sentences: where the product is going this year and why, citing PRODUCT.md and any ADR that set the direction.}

## Now
| Initiative | Track | Phase | Bet in one line | Folder |
|------------|-------|-------|-----------------|--------|
| {name} | {spike/feature/product} | {N — name} | {the change and the metric it should move} | `initiatives/{slug}/` |

## Next
| Initiative | Why next | What must be true first |
|------------|----------|-------------------------|

## Later
{Ideas worth keeping, one line each, with the reason they wait.}

## Done and dropped
| Initiative | Outcome | Learning | Date |
|------------|---------|----------|------|
| {name} | KEEP / ITERATE / KILL / killed at phase 1 / answered | {the phase 7 learning, or the verdict} | {date} |
```

`ROADMAP.md` is an index, not a store: each line points at the folder or ADR that holds the detail, and never restates it. Only `Direction`, `Next` and `Later` are written by hand. `Now` and `Done and dropped` are regenerated from the initiative states whenever one is created, changes phase or closes (`node scripts/bos.mjs roadmap` does it where commands run); when a table and a state disagree, the state wins. `Verified` moves only when someone re-reads the Direction and confirms it still holds.

## TECH.md

```markdown
# TECH.md — {Product}

**Verified:** {YYYY-MM-DD} @ {short commit, or "no git"}

## Stack
| Layer | Choice | Why | Decision |
|-------|--------|-----|----------|
| {frontend / backend / data / hosting / analytics} | {choice} | {one line} | {ADR link, or "inherited"} |

## Verify
| Check | Command | Healthy output |
|-------|---------|----------------|
| Build | {one command, exits non-zero on failure} | {what success prints} |
| Test | {one command} | {e.g. "N passed, 0 failed"} |
| Lint | {one command} | {e.g. "0 problems"} |

## Technical constraints
{Limits the code must respect: performance budgets, regulatory rules on data, supported platforms. Each with a source tag. A rule that must hold every time names the deterministic check that enforces it (a host hook, a CI check), or says none exists.}

## Conventions
{How this codebase does things that a newcomer would get wrong: naming, error handling, where tests live, how features are flagged. Where a feature depends on model output: its eval dataset reruns, through `run-check`, on every prompt or model change.}

## Known traps
{What has bitten before, with the initiative or commit where it happened.}
```

Written at init from the repository when one is readable, otherwise from the user; left as the headings with "no code yet" for an idea with nothing built. Phase 5 fills Verify when it is empty and adds the conventions, traps and recurring review findings it discovers; phase 6 adds anything the release taught. A trap is recorded the first time it costs time, not the second. Keep the file under a page: an agent reads all of it every session, so a line that is no longer true is cut, not kept for history. `Verified` moves when the file has been checked against the repository (manifests, lockfiles, config), not when a line is appended; a briefing flags it when dependencies changed after it.

## state.json

One per initiative, at `.builderos/initiatives/{slug}/state.json`:

```json
{
  "schema": 2,
  "slug": "csv-export",
  "title": "CSV export for enterprise reports",
  "mode": "lite",
  "track": "feature",
  "status": "open",
  "current_phase": 2,
  "cycle": 1,
  "created_at": "2026-09-20T10:00:00Z",
  "updated_at": "2026-09-20T14:30:00Z",
  "review_due": null,
  "phases": {
    "0": { "status": "covered", "artifact": null, "gate": null },
    "1": { "status": "covered", "artifact": null, "gate": null },
    "2": { "status": "in_progress", "artifact": null, "gate": null }
  },
  "history": [
    { "at": "2026-09-20T10:00:00Z", "event": "track_set", "track": "feature", "reason": "Existing product; PRODUCT.md problem and ICP carry interview tags" },
    { "at": "2026-09-20T10:00:00Z", "event": "phase_covered", "phase": 0, "tags": ["interview:P1,P4,P6"] },
    { "at": "2026-09-20T10:00:00Z", "event": "phase_covered", "phase": 1, "tags": ["interview:P1,P4,P6", "doc:support-tickets-aug"] }
  ]
}
```

A phase that passed through an overridden gate:

```json
"0": {
  "status": "passed",
  "artifact": "00-frame.md",
  "gate": {
    "passed": true,
    "checked_at": "2026-09-13T11:00:00Z",
    "checked_by": { "script": ["0.1", "0.2"], "model": ["0.3", "0.4"] },
    "failed_conditions": ["0.4"],
    "overridden": true,
    "override_reason": "No dated external change found; problem judged durable, revisit after interviews",
    "accepted_by": "Mario",
    "accepted_at": "2026-09-13T11:00:00Z"
  }
}
```

A closed initiative that ended with KEEP carries its watch at the top level:

```json
"watch": { "metric": "share of managers with a weekly export", "bands": "1σ note, 2σ diagnose read-only, 3σ new initiative", "owner": "Mario", "recheck": "2027-01-15" }
```

### Fields

| Field | Values | Meaning |
|-------|--------|---------|
| `schema` | `2` | Schema version. Agents refuse to write a file whose schema they do not know. A `1` file is migrated, see Rules |
| `slug` | text | Same as the folder name |
| `title` | text | The name the roadmap shows |
| `status` | `open` \| `paused` \| `closed` | `closed` after phase 7 closes the cycle, a phase 1 kill, or a spike's answer |
| `review_due` | date or `null` | Set at phase 6 from the outcome review date (gate 6.5). The briefing flags it once passed |
| `mode` | `full` \| `lite` | Gate strictness. See `gate-checks` |
| `track` | `spike` \| `feature` \| `product` | How much of the pipeline this work needs. Set at init, announced to the user, only ever upgraded. Absent means `product`, so files written before the field existed stay valid. See `builder-os`, section Tracks |
| `current_phase` | `0`–`7` | Where the pipeline stands |
| `cycle` | `1`+ | Increments when phase 7 explicitly re-enters any integer phase 0–6 |
| `phases.N.status` | `pending` \| `in_progress` \| `passed` \| `killed` \| `covered` \| `answered` | `killed` ends the pipeline: the problem did not survive. `covered` marks a phase the `feature` track skipped because `PRODUCT.md` passed the coverage check. `answered` ends a `spike` at phase 1 |
| `phases.N.verdict` | phase 1: `validated` \| `killed` \| `reshaped`; phase 7: `keep` \| `iterate` \| `kill` | Must match the artifact. `answered` is a spike phase status, never a discovery verdict |
| `gate.failed_conditions` | condition ids | Populated even when overridden — this is the audit trail |
| `gate.checked_by` | `{ script: [ids], model: [ids] }` | Which conditions the gate script decided and which the model judged. With no command execution, every id is under `model` |
| `gate.accepted_by`, `gate.accepted_at` | name, ISO timestamp | The person who accepted the artifact, from their own words, and when. Required to pass phases 0, 4 and 6; see `gate-checks`, Acceptance. Absent on a failed gate |
| `watch` | `{ metric, bands, owner, recheck }` or absent | Set when phase 7 closes with KEEP (gate 7.5). The briefing raises it once `recheck` has passed; a breach starts a new initiative |
| `history` | append-only | Never rewritten. Phase 7 reads it to judge how the bet was actually run. Track events: `track_set` (at init, with the reason), `phase_covered` (per skipped phase, with the `PRODUCT.md` tags that covered it), `track_upgraded` (from, to, and the observation that forced it). Review event: `review_deferred` (new review_due and observed reason, no verdict). Gate events: `gate_passed`, `gate_failed`, `gate_overridden` (with the failed conditions and the reason, and `accepted_by` when a person accepted), `closed` (phase 7, or a phase 1 kill or answer). `bos.mjs pace` reads these events for time per phase |

## Rules

0. **Write state through the script where commands run.** `bos.mjs new` creates an initiative, `bos.mjs cover` records the coverage check, `bos.mjs record {N}` records a gate result (and a phase 1 verdict, the acceptance at phases 0, 4 and 6, a phase 6 review date, a closing watch, a close), `bos.mjs run-check` records only an explicitly authorized command, `bos.mjs defer-review` moves only the review date while holding phase 7, and the briefing flags any state file that does not follow this schema. By hand, follow the example above field for field; do not add fields.

1. **Every phase reads and writes the active initiative.** "`current_phase`", "phase 1 passed" and every other state check in a skill or command means the active initiative's `state.json`, resolved per Active Initiative. A phase never writes another initiative's file.
2. **`state.json` is append-oriented.** `history` is never edited or truncated. Correcting a mistake means adding an event, not deleting one.
3. **A phase owns its artifact and gate result.** Only the lifecycle recorder sets the next phase in progress, or resets phase entries when a new cycle starts. Agents never rewrite another phase's artifact.
4. **`current_phase` advances only through a gate.** Passed or overridden. The `feature` track's coverage check is a gate too: it is how a phase becomes `covered`. There is no other path.
5. **A `killed` phase stops the pipeline.** `/bos` reports the kill and offers to start a new cycle from phase 0 with the learning carried forward.
6. **A track only goes up.** `spike` → `feature` or `product`, `feature` → `product`. Never down: complexity found mid-pipeline does not un-find itself. An upgrade re-enters the earliest phase the new track requires and keeps every artifact already written.
7. **Missing state is not an error.** If `.builderos/` does not exist, any `bos-*` command offers `/bos-init` rather than failing.
8. **Decision and re-entry agree.** Phase 7 `ITERATE` requires `Re-enters at: phase N` (N = 0–6) and matching `--reenter N`; `KILL` requires `none` and no re-entry; `KEEP` permits either form. A spike always closes after gate 1 with status `answered` and its actual verdict retained. A closed initiative cannot record another gate; coverage cannot reset a feature past phase 0.
9. **Deferred reviews do not invent decisions.** At phase 7, use `defer-review --review-due YYYY-MM-DD --reason "observed evidence gap"` with a future date. It appends `review_deferred`, keeps phase 7 in progress, sets review_due, and records no KEEP/ITERATE/KILL verdict.
10. **Cycle increments preserve prior artifacts.** An initiative's phase artifacts from cycle 1 move to its own `cycle-1/` folder when cycle 2 begins.
11. **The roadmap follows state.** Creating an initiative, advancing a phase, killing or closing one updates `ROADMAP.md` in the same step. A phase that changed `state.json` and left the roadmap stale has not finished.
12. **Migrating schema 1.** A `.builderos/state.json` with `schema: 1` describes a single pipeline. Pick a slug from the product name, move its fields to `initiatives/{slug}/state.json` with `schema: 2`, `slug`, `status: "open"` and a `migrated` history event, move the phase artifacts and `DESIGN.md` into the same folder, write `local.json` with the slug, create `ROADMAP.md` with that initiative under Now, and delete the old file. Tell the user what moved; never migrate silently. `node scripts/bos.mjs migrate` does exactly this where commands run.

## ADR Format

Write one only when all three hold: **hard to reverse** (changing your mind later costs something real), **surprising without context** (a reader in six months would ask why), and **a real trade-off** (genuine alternatives existed). Missing any one, skip it.

```markdown
# ADR-{NNN}: {Decision}

**Date:** {YYYY-MM-DD}
**Phase:** {N}
**Status:** accepted | superseded by ADR-{NNN}

## Context
{What forced a decision. Evidence tags required.}

## Decision
{What was decided, in one paragraph, active voice.}

## Alternatives rejected
{Each with the reason it lost.}

## Consequences
{What this makes easy, what it makes hard, what it forecloses.}

## Revisit when
{The observation that would reopen this.}
```

ADRs are written at phase 7, and any time a decision is hard to reverse, surprising without context, and the result of a real trade-off. All three, or no ADR: `/bos-adr` runs the test. "Revisit when" is mandatory: a decision without a reopening condition becomes dogma.
