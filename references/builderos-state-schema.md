# .builderos/ State Schema

The project's memory. Created by `/bos-init`, read at the start of every session and by every lifecycle command, written by every phase.

## Layout

```
PRODUCT.md                what the product is: problem, ICP, non-goals, constraints, voice, language
DOMAIN.md                 the product's things and their rules: entities, states, invariants, settled business rules
TECH.md                   how it is built and run: stack, design system, verify commands, operations, technical constraints, conventions, known traps
AGENTS.md                 the project's own agent instructions; /bos-init adds the pointer below
CLAUDE.md                 the same pointer, for every Claude Code surface (cloud project threads load only this)
.builderos/
  bin/bos.mjs             a copy of the BuilderOS script (`bos.mjs vendor`), for sessions without the plugin
  local.json              this checkout's active initiative; gitignored, never shared
  person-log.jsonl        what the person wrote, one JSON line per message ({at, text}), appended by the message hook and by nothing else; person fields quote it
  media/{initiative}/     demo recordings (feature-demo); gitignored, shared by link
  ROADMAP.md              the master plan: direction, initiatives now / next / later / dropped
  maps/
    {slug}/MAP.md         a wayfinding map: destination, notes, decisions so far, the fog, out of scope (`skills/wayfinding`)
    {slug}/tickets/NN-{slug}.md  one decision ticket: type, status, blocked by, claimed by, question, resolution
  reviews/
    {YYYY-MM-DD}.md       one product review: levers read, stage verdict, 1-3 proposals, who decided (`skills/builder-os/references/product-review.md`)
  decisions/
    ADR-001-{slug}.md     one file per decision that is hard to reverse (shared across initiatives)
  evidence/               sources cited by PRODUCT.md, DOMAIN.md and TECH.md, same format as an initiative's
  initiatives/
    {initiative}/         one folder per initiative: a change, a feature, a bet, a new product
      state.json          this initiative's pipeline state, the machine-read file
      00-request.md       feature and change tracks: the request verbatim, its evidence, its population, the mandate
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

Throughout the skills and commands, a bare artifact name (`state.json`, `00-frame.md`, `DESIGN.md`, `evidence/`, `questionnaires/`) means the file in the **active initiative's folder**: `.builderos/initiatives/{initiative}/`. `PRODUCT.md`, `DOMAIN.md`, `TECH.md`, `ROADMAP.md` and `decisions/` are project-wide.

**What an initiative settles about the product leaves its folder at ship.** An initiative's `DESIGN.md` holds what it modeled and chose; once it ships, the entities, states, invariants and business rules go to `DOMAIN.md`, and the chosen look's kit and token location to `TECH.md` → Design system (gate 6.9). The next initiative starts from those files and asks only about what it adds or changes. Without this, every feature remodels the same entities from scratch and the third one contradicts the first.

Phase artifacts are Markdown for humans. Each initiative's `state.json` is the machine surface: no agent should have to parse prose to know where an initiative stands.

State is split per initiative so that two people advancing two initiatives never edit the same file. The only shared files that change often are `ROADMAP.md`, whose tables are regenerated from the initiative states (a merge conflict there is resolved by regenerating, never by hand), and `decisions/`, which only ever gains files.

## Active Initiative

Which initiative a command acts on is a property of the person and the checkout, not of the project, so it is not committed. Resolve it in this order:

1. `.builderos/local.json` → `{ "active": "{slug}" }`, when the slug names an initiative that is still open.
2. Otherwise, the only open initiative, if exactly one is open.
3. Otherwise, ask which one, listing the open initiatives, and write the answer to `local.json`.

`/bos-init` (`bos.mjs init` where commands run) adds `.builderos/local.json` and `.builderos/media/` to `.gitignore`. Switching initiative rewrites `local.json` and is named to the user.

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

**Version control:** commit `.builderos/`, `PRODUCT.md`, `DOMAIN.md` and `TECH.md`. Product decisions belong next to the code they caused, and a teammate cloning the repo inherits the reasoning. Teams that want it private add `.builderos/` to `.gitignore` at init time; `/bos-init` asks once and records the answer.

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
2. Read `PRODUCT.md`, `DOMAIN.md` when the work touches the product's things or rules, and `TECH.md` when the work touches code.
3. Give the user a briefing of at most five lines: the active initiative and its phase, the last gate result, open overrides, the most recent decision, and what comes next. Add one line per open map in `.builderos/maps/`: its destination and the next ticket on its frontier.
4. Add one **Attention** line when any of these holds, and only then:
   - an outcome review is overdue: an initiative's `review_due` date has passed and phase 7 has not run;
   - `TECH.md` is stale: its `Verified` commit is older than the latest commit touching a dependency manifest or lockfile, or, without git, its date is more than 60 days old;
   - an open initiative has not changed in 30 days: its `updated_at` says so;
   - the roadmap disagrees with an initiative's state.
   - a decision in `decisions/` has a `Revisit when` date that has passed, or has no `Revisit when` section at all;
   - `PRODUCT.md` still carries `[assumption:unvalidated]` tags while an open initiative is past phase 1;
   - an open initiative is past phase 4 while `TECH.md` → Stack has no rows, or a layer still `open` or empty: the stack was never decided with the user;
   - an initiative folder exists on another branch and not on this checkout: its state is travelling with code nobody here is looking at.
   - a ticket in a map has no `**Type:**`;
   - `AGENTS.md`, `CLAUDE.md` or `TECH.md` → Map names a path that no longer exists;
   - `DOMAIN.md` was last changed before the latest commit touching a migration, a schema or a models folder;
   - `AGENTS.md` is longer than 150 lines: it loads into every session, so it holds pointers and must-hold rules (`agents-md`);
   - the product review is due: none in `.builderos/reviews/` yet, or the latest is older than 7 days before PMF (`idea`, `pre-PMF`) or 31 days after it;
   - a passed gate never checked a condition now in force, and its artifact does not meet it yet: debt from a later release, listed per initiative (`gate-checks`, Debt After a Release);
   - a claim on an open initiative is older than 14 days.

When the active initiative has a round asked and not answered, the Next line says so: draft ahead on the recommended options, marked provisional (`pressure-testing`, Working Ahead). A claim shows on the initiative's line.

The model adds what needs judgment while it works, per `using-builder-os` (Watch While Working): a request that contradicts a decision or non-goal, work resting on an untested assumption, a shipped result nobody has read.

Where commands can be executed, `node scripts/bos.mjs brief` (in the plugin) computes all of them from the files and prints the briefing; the model only relays it. Where they cannot, the model reads the same files and applies the same rules.

Hosts with a session-start hook get this from the plugin's hook. Every other session, including a cloud session or a teammate's checkout without the plugin, gets it from the block `/bos-init` writes into the project's own `AGENTS.md` and `CLAUDE.md`:

```markdown
## BuilderOS

This project is run with BuilderOS. Before any product or planning work, run `node .builderos/bin/bos.mjs brief` from the project root (or read `.builderos/ROADMAP.md`, each `.builderos/initiatives/*/state.json`, `PRODUCT.md`, `DOMAIN.md` and `TECH.md`), then brief the user in at most five lines on where things stand, plus one line if an outcome review is overdue or `TECH.md` is stale. Decisions live in `.builderos/decisions/`; each initiative's reasoning lives in `.builderos/initiatives/`. Before changing code, read `TECH.md` → Map, Conventions and Technical constraints; the business rules are in `DOMAIN.md`.

If the BuilderOS skills are not loaded in this session, say so in one line and keep these rules: state and gate results are written only by `node .builderos/bin/bos.mjs` (never `state.json` by hand); no number without a source tag backed by a file in `evidence/`; no code before the build plan is accepted by a person; new scope after that is a change of its own.
```

`CLAUDE.md` gets the block even when it has to be created, because it is the one project file every Claude Code surface loads, project threads in the cloud included; `AGENTS.md` carries it for the other hosts. The script copy at `.builderos/bin/bos.mjs` comes from `bos.mjs vendor` (only Node built-ins, one file); the briefing says when it differs from the installed plugin's.

## ROADMAP.md

```markdown
# Roadmap — {Product}

**Verified:** {YYYY-MM-DD} @ {short commit, or "no git"}

## Direction
{Two or three sentences: where the product is going this year and why, citing PRODUCT.md and any ADR that set the direction.}

## Now
| Initiative | Track | Phase | Bet in one line | Folder |
|------------|-------|-------|-----------------|--------|
| {name} | {spike/change/feature/product} | {N — name} | {the change and the metric it should move} | `initiatives/{slug}/` |

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
| {interface / backend / data / auth / hosting / jobs / model / integrations / analytics / design kit} | {choice, or "open"} | {one line} | {ADR link, "inherited", or "decide in phase 4"} |

## Map
| Where | What it holds | Read when |
|-------|---------------|-----------|
| {a path: an entry point, a module, the tests, a config} | {one line} | {the change that needs it} |

**Generated:** {paths that are generated and never edited by hand, or "none"}

{Only what the agent cannot find in one search: the entry points, the module that holds the domain rules, where each kind of test lives, the files that look editable and are not. Kept true by phase 5 at every build; gate 5.11 checks that every path exists.}

## Design system
**Kit:** {component library or "custom"}
**Tokens:** {where the tokens live in the code, e.g. src/styles/tokens.css}
**Composition:** {grid, density, where primary actions sit; one or two lines}

## Verify
| Check | Command | Healthy output |
|-------|---------|----------------|
| Run | {the one command that starts the product locally (gate 5.17)} | {the ready line, e.g. "Ready on http://localhost:3000"} |
| Build | {one command, exits non-zero on failure} | {what success prints} |
| Test | {one command} | {e.g. "N passed, 0 failed"} |
| Test (fast) | {optional: the command that runs only the tests for a path or a pattern, used per slice when the full suite is slow} | {} |
| Lint | {one command} | {e.g. "0 problems"} |

**Known failing:** {tests already red before BuilderOS, by name, with the date; "none"}
**Guardrail:** {where Verify runs without anyone asking: a CI job, a pre-commit hook, or both, with the file that defines it; "none" until phase 5 adds one; "declined by {person} ({why}), {date}" when the CI belongs to someone else who said no}
**Quality checks:** {the automatic checks in the guardrail: accessibility (an axe-style scan on every route), end-to-end on the primary flow, dependency audit, secret scan, static analysis; with an interface, a token check (raw colours and spacing outside the token file fail); once `## Design system` has a kit, visual regression on the primary flow; each named with its command or "n/a, {why}"; "declined by {person} ({why}), {date}" as for the guardrail}
**Demo:** {with an interface: the one command that runs the end-to-end test of a flow with recording on, and where the video lands (`feature-demo`); written by the first build that records one}

## Environments
| Environment | URL | Deploys from | Who can see it |
|-------------|-----|--------------|----------------|
| production | {https:// address} | {branch and the CI job that deploys it} | {the team behind a password or flag, until the rollout; then everyone} |
| preview | {the per-change URL pattern, or staging} | {each pull request} | {the team} |

**Domain:** {domain, who registered it, HTTPS on}
**Secrets:** {where production secrets live, who can read them; development uses other values, out of git}
**Email sender:** {the sending domain with SPF, DKIM and DMARC verified and the date, or "sends no email"}
**Live keys:** {payment and provider keys in live mode, production only; or "not applicable, {why}"}
**Legal pages:** {terms, privacy notice, cookie consent before analytics; URLs, in each language of PRODUCT.md → Markets}
**Production check:** {`**Run:**` path of a captured request to the production URL, or the person's observation with its `[doc:...]` tag}

{Set up by `production-setup` from the first slice of a new product (gate 5.16, all lines on the product track); on a product that already runs, written from its deploy configuration at init.}

## Operations
**Privacy:** {where the privacy notice lives; sub-processors (hosting, model provider, email, analytics) with their data processing agreements; how a person's data is deleted on request; data region; or "no personal data, {why}"}
**AI disclosure:** {where people are told they are dealing with an AI system, when the product has model output; omit otherwise}
**SLO:** {after PMF: one or two promises on the primary flow (availability, response time) and the alert when the error budget burns}
**Incident response:** {after PMF: who is alerted and how, how users are told, and the postmortem that becomes an initiative}
**Cost per active user:** {after PMF: infrastructure plus model cost per active user per month, with the budget alert}
**Load tested:** {after PMF: the date, the load (ten times the expected peak from the spec's `**Capacity:**`), how long, and the result against the SLO}
**Model degradation:** {after PMF, with model output: the must-pass cases run on sampled production turns, how often, and the pass rate that alerts; omit otherwise}

## Technical constraints
{Limits the code must respect: performance budgets, regulatory rules on data, supported platforms. Each with a source tag. A rule that must hold every time names the deterministic check that enforces it (a host hook, a CI check), or says none exists.}

## Conventions
{How this codebase does things that a newcomer would get wrong: naming, error handling, where tests live, how features are flagged. Where a feature depends on model output: its eval dataset reruns, through `run-check`, on every prompt or model change.}

## Known traps
{What has bitten before, with the initiative or commit where it happened.}
```

Written at init from the repository when one is readable, otherwise from the user; left as the headings with "no code yet" for an idea with nothing built. A Stack layer nobody has decided is written `open`, never guessed: phase 4 decides it with the user (`stack-decisions`), and the briefing flags an open initiative past phase 4 whose `TECH.md` still has open or empty layers. Phase 5 fills Verify when it is empty, adds the Guardrail and the Quality checks when there are none, and adds the conventions, traps and recurring review findings it discovers; phase 6 adds anything the release taught and fills Operations as the stage requires (gate 6.10): Privacy, and AI disclosure when a model speaks, from the first release; SLO, Incident response, Cost per active user and Load tested once `PRODUCT.md` says `emerging-PMF` or `scaling`. These are product facts, written once and kept true, not repeated per release. A trap is recorded the first time it costs time, not the second. Keep the file under a page: an agent reads all of it every session, so a line that is no longer true is cut, not kept for history. `Verified` moves when the file has been checked against the repository (manifests, lockfiles, config), not when a line is appended; a briefing flags it when dependencies changed after it.

## DOMAIN.md

```markdown
# DOMAIN.md — {Product}

## Entities
| Entity | Means | Lifecycle | Since |
|--------|-------|-----------|-------|
| {name in the product's words} | {one sentence} | {states, or "none"} | {initiative that introduced or last changed it} |

## Transitions: {entity}
| From | To | Who | Guard | Effect |

## Invariants
- {a rule that holds whatever happens} ({initiative})

## Business rules
- {a rule a person decided, with who and when} ({initiative}, {decision file if any})
```

Written at init from the repository when it holds schemas, migrations or status enums (marked unverified until a person confirms them), otherwise the heading only. Grows at every ship (gate 6.9). A rule that a later initiative changes is rewritten with the new initiative named, and the change is a decision in `decisions/` when it passes the ADR test. Terms stay defined in `PRODUCT.md` → Language; this file holds how the things behave.

## Where the work lives

BuilderOS state is files, so in a git repository it lives on a branch. Rules that keep it findable:

- **Before code, on the default branch.** Phases 0 to 4 (or the request and the spec on a `change`) change only `.builderos/`, `PRODUCT.md`, `DOMAIN.md` and `TECH.md`; commit them where everyone reads them, directly or through a small pull request, as the team works.
- **From the build, with the code, a slice at a time.** Each slice is a short branch and a small pull request to the default branch, behind a flag while the feature is incomplete; `05-build-plan.md` → `**Branch:**` names the pattern. The initiative's folder changes with each slice and reaches the default branch with it, so the trunk always holds the plan as built. Each pull request description links the initiative folder and names its slice.
- **An abandoned branch is a decision.** A branch closed without merging means the initiative is killed or paused: merge its folder back on its own with that event recorded, so the reasoning survives the code.
- **The briefing looks at other branches.** Where git is available it names initiatives that exist only on another branch.
- **`ROADMAP.md` conflicts are regenerated**, never merged by hand.

**Limits, stated.** One `PRODUCT.md` and one `TECH.md` per checkout. A product split across several repositories keeps its memory in the repository that owns the product decision and names the others in `TECH.md` → Stack; a change spanning repositories names, in its build plan, the branch in each. A monorepo holding several products gets one BuilderOS root per product directory (`--root`).

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
    "bos_version": "3.0.0",
    "checked_by": { "script": ["E.1", "E.2", "0.1", "0.2", "0.5"], "model": ["0.3", "0.4"] },
    "skipped": [],
    "failed_conditions": ["0.4"],
    "overridden": true,
    "override_reason": "No dated external change found; problem judged durable, revisit after interviews",
    "accepted_by": "Mario",
    "accepted_at": "2026-09-13T11:00:00Z"
  }
}
```

An initiative someone is working on carries its claim at the top level, `null` once released:

```json
"claim": { "by": "Mario", "at": "2026-10-22T16:20:00Z" }
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
| `track` | `spike` \| `change` \| `feature` \| `product` | How much of the pipeline this work needs. Set at init, announced to the user, only ever upgraded. Absent means `product`, so files written before the field existed stay valid. See `builder-os`, section Tracks |
| `current_phase` | `0`–`7` | Where the pipeline stands |
| `cycle` | `1`+ | Increments when phase 7 explicitly re-enters any integer phase 0–6 |
| `phases.N.status` | `pending` \| `in_progress` \| `passed` \| `killed` \| `covered` \| `answered` | `killed` ends the pipeline at the phase it is in (`record N --kill`, or a phase 1 KILLED verdict). `covered` marks a phase the `feature` track skipped because `PRODUCT.md` passed the coverage check, or the `change` track skipped because its mandate passed the mandate check. `answered` ends a `spike` at phase 1 |
| `phases.N.verdict` | phase 1: `validated` \| `killed` \| `reshaped`; phase 7: `keep` \| `iterate` \| `kill` | Must match the artifact. `answered` is a spike phase status, never a discovery verdict |
| `gate.failed_conditions` | condition ids | Populated even when overridden: this is the audit trail |
| `gate.waived` | condition ids | The conditions an override waived by name; a jumped phase records `not run` |
| `gate.checked_by` | `{ script: [ids], model: [ids] }` | Which conditions the gate script decided and which the model judged. With no command execution, every id is under `model` |
| `gate.bos_version`, `gate.skipped` | version, condition ids | The BuilderOS release whose script recorded the gate, and the conditions it skipped as not applicable. Together with `checked_by` they tell a later release which of its conditions this record never saw. Absent on records written before gates carried them; the briefing then treats every condition missing from `checked_by` as unseen |
| `claim` | `{ by, at }`, `null` or absent | Who is working on the initiative, from `bos.mjs claim --by`. One owner at a time: a second claim is refused unless taken over with `--take --reason`. Commit it so other sessions and checkouts see it |
| `gate.accepted_by`, `gate.accepted_at` | name, ISO timestamp | The person who accepted the artifact, from their own words, and when. Required to pass phases 0, 4 and 6; see `gate-checks`, Acceptance. Absent on a failed gate |
| `watch` | `{ metric, bands, owner, recheck }` or absent | Set when phase 7 closes with KEEP (gate 7.5). The briefing raises it once `recheck` has passed. `bos.mjs watch` rolls `recheck` after a check without breach (`watch_checked`) or sets it to `null` when a breach became a new initiative (`watch_breached`) |
| `history` | append-only | Never rewritten. Phase 7 reads it to judge how the bet was actually run. Track events: `track_set` (at init, with the reason), `phase_covered` (per skipped phase, with the tags that covered it), `track_upgraded` (from, to, and the observation that forced it). Review event: `review_deferred` (new review_due and observed reason, no verdict). Gate events: `gate_passed`, `gate_failed`, `gate_overridden` (with the failed conditions and the reason, and `accepted_by` when a person accepted), `closed` (phase 7, a phase 1 kill or answer, or `verdict: killed` with the reason from `record N --kill`). Routing events: `phase_jump` (`bos.mjs jump`, with from, to and the reason), `initiative_switched` (`bos.mjs resume`), `paused`, `migrated`. Cycle and watch events: `cycle_started` (phase 7 re-entry, or `bos.mjs reframe` with from and the reason), `watch_checked`, `watch_breached`. Ownership events: `claimed`, `claim_released`, `claim_taken` (with `from` and the reason). Round events: `round_asked` (phase, number of questions), `round_answered` (phase, the answer as given, who gave it, `waited_hours` since the round was asked). No other event exists: shipped slices, reviews and notes belong in the phase artifacts, and the briefing flags any other event name. `bos.mjs pace` reads these events for time per phase and time waiting on rounds |

## Rules

0. **Write state through the script where commands run.** `bos.mjs new` creates an initiative, `bos.mjs cover` records the coverage or mandate check, `bos.mjs upgrade` moves an initiative to a heavier track, `bos.mjs record {N}` records a gate result (and a phase 1 verdict, the acceptance at phases 0, 4 and 6, a phase 6 review date, a closing watch, a close), `bos.mjs run-check` records only an explicitly authorized command, `bos.mjs defer-review` moves only the review date while holding phase 7, `bos.mjs watch` rolls or clears a KEEP watch, `bos.mjs claim` sets or releases the owner, `bos.mjs round` records a round asked and its answer, `bos.mjs doctor` reports the install, the memory and the debt without writing, and the briefing flags any state file that does not follow this schema. By hand, follow the example above field for field; do not add fields.

1. **Every phase reads and writes the active initiative.** "`current_phase`", "phase 1 passed" and every other state check in a skill or command means the active initiative's `state.json`, resolved per Active Initiative. A phase never writes another initiative's file.
2. **`state.json` is append-oriented.** `history` is never edited or truncated. Correcting a mistake means adding an event, not deleting one.
3. **A phase owns its artifact and gate result.** Only the lifecycle recorder sets the next phase in progress, or resets phase entries when a new cycle starts. Agents never rewrite another phase's artifact.
4. **`current_phase` advances only through a gate.** Passed or overridden. The `feature` track's coverage check and the `change` track's mandate check are gates too: they are how a phase becomes `covered`. A `change` with no outcome review closes at phase 6. A forced move goes through `jump`, which records the jumped phases as overridden, not run, and through `reframe`, which starts a new cycle.
5. **A `killed` phase stops the pipeline.** `/bos` reports the kill and offers to start a new cycle from phase 0 with the learning carried forward.
6. **A track only goes up.** `change` → `feature` → `product`; an answered `spike` starts a new initiative instead. Never down: complexity found mid-pipeline does not un-find itself. An upgrade re-enters the earliest phase the new track requires and keeps every artifact already written.
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

ADRs are written at phase 7, and any time a decision is hard to reverse, surprising without context, and the result of a real trade-off. All three, or no ADR: `/bos-adr` runs the test. "Revisit when" is mandatory: a decision without a reopening condition becomes dogma. Write a date in it when time alone should reopen the decision (`By 2027-01-15, or when …`); the briefing raises it once that date passes, and raises any decision file without the section.
