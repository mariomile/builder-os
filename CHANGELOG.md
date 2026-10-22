# Changelog

All notable changes to BuilderOS. Dates are the date the work landed on a branch, not a publication date.

## [Unreleased]

A deep pass against what a tier-1 product team would do, and against the Claude Code plugin guidance. Analysis and decisions (Q1 to Q7) in the project thread.

### Added

- **Hooks for rules that must hold every time.** PreToolUse denies a hand-written `state.json` (`bos.mjs guard`); UserPromptSubmit adds one line per message with the phase and what to check the request against (`bos.mjs context`).
- **The script travels with the project.** `bos.mjs vendor` copies it to `.builderos/bin/bos.mjs`; init runs it and writes the Session Start block into both `AGENTS.md` and `CLAUDE.md`. The briefing flags a stale copy.
- **Evidence from outside the session.** `bos.mjs evidence add --class interview|doc|data --id --where [--shared] [--from file]` saves notes, tickets, exports or excerpts as evidence files the tags resolve to. Raw material is required, files are never overwritten, one participant per interview file. Starting with no evidence is described in `references/lifecycle-setup.md`.
- **Quality of what is built.** Gate 4.12 quality bar (permissions, personal data, performance as criteria or a reason), 4.13 a real-user session before the build on the product track, 5.9 interface review of the built states against the chosen direction, 5.10 automatic quality checks in the guardrail (accessibility, end-to-end, dependency audit, secret scan), 6.10 production readiness (errors seen before users report them, a restore tested), 6.11 first real use on the product track. New capability `ui.capture`.
- **Eval suite** in `evals/` for `claude plugin eval`: routing, briefing, evidence, gates, with and without the plugin. CI runs `npm test` on GitHub Actions.

### Changed

- **Session context** from 8,440 to about 2,100 characters on a project, briefing first; two lines outside a project.
- **Code before an accepted build plan is a stop, not a flag**, even when the user says to skip: name what the gate needs and offer to finish it, a `change`, or a recorded override. Found by the first eval run, where the plugin wrote code at phase 2.
- **`product-analysis`** replaces `saas-metrics-reference`, `growth-frameworks`, `financial-models`, `okr-frameworks`, `strategy-frameworks` and `competitive-intel`; their procedures are its references. `product-diagnostician` runs any of its areas; the agents `growth-architect`, `finance-analyst`, `okr-architect`, `north-star-analyst`, `competitive-analyst` and `product-strategist` are removed.
- **Skill descriptions** say what the skill does and when to use it. With the new outside-project session line, skills loaded on a standalone PRD and a retention question went from 0 of 4 eval runs to 4 of 4.

**Upgrading.** Specs fail 4.12 until `## Quality bar` is written (and 4.13 on the product track until `## Real users`); build plans fail 5.9 until `## Interface review`, and 5.10 until `TECH.md` has `**Quality checks:**`; releases fail 6.10 until `## Production readiness` (and 6.11 on the product track until `## First real use`). Run `bos.mjs vendor` once in each existing project.

### The person decides, and four skills from Matt Pocock (2026-10-21)

Where BuilderOS still let the agent decide, it now asks; and the parts of Pocock's skills it lacked are in. Analysis in the project thread "Skill scritte alla Pocock" (`skill-alla-pocock-2026-10-21.md`), decisions 1A 2A 3A 4A.

- **Decisions belong to a person.** The agent analyses and recommends in a round; the person chooses, recorded as `**Chosen by:**` and checked by the script: the assumption phase 1 tests (gate 0.5), what a discovery verdict means for the work (1.6), the opportunity and its target (2.8), the rollout (6.13), keep, iterate or kill (7.7), next to the bet (3.6) and the look (4.9) that already were. Scope boundaries in the spec and the slicing of the build plan are round questions too.
- **`pressure-testing` is relentless.** It keeps a design tree and stops when the frontier is empty, not after one round; each question is worded so "yes" accepts the recommendation; facts are looked up in parallel while the rest of the round is asked.
- **`wayfinding`** (from Pocock's `wayfinder`): work too big for one session becomes a map in `.builderos/maps/{slug}/` with decision tickets (research, prototype, grilling, task), the fog of war and out of scope, one ticket per session. `bos.mjs map` prints the frontier; the briefing shows the next ticket of every open map.
- **`retro`, `to-spec`, `to-tickets`**, called by name on Claude Code and Codex (`disable-model-invocation`, `agents/openai.yaml`), each over one method: `retro` holds the environment retrospective that phases 5 and 7 now run; `to-spec` runs the new Synthesis Procedure of `spec-writing` (no interview, one question on the test seams, gaps named); `to-tickets` runs `delivery-discipline/references/tickets.md` (vertical slices, expand–contract for wide refactors, a quiz on the breakdown, one ticket per file or per issue). The spec template gains `## User stories` and `## Test seams`; the build plan gains `**Tickets:**` and `## Retro`.
- New capabilities `tickets.write` and `sessions.read`.
- **Every skill rewritten to one writing standard** (decision 1A), after Pocock's writing-for-agents and Anthropic's skill guidance, and a test that keeps it (`tests/scripts/skill-writing.test.mjs`): descriptions at most 250 characters with what the skill does and when to use it; one **Mode** line pointing at `references/operating-modes.md` instead of five copied variants (delegation now lives there, once); every skill that drives work has `## Procedure` with numbered steps that each end on **Done when**, and an output contract with its completion marker; guidance written as the behavior wanted, in **Watch for** tables (Do / Instead of) that replace the Common Mistakes tables; every relative link resolves. Across the 28 skills: prohibitions 148 → 31, description text 8,334 → 6,575 characters, completion criteria 14 → 193, words 30,718 → 28,924. `spec-writing` moves its synthesis procedure to `references/synthesis.md` and the real-user session script to its methods; `delivery-discipline` and `spec-writing` collapse their standalone and lifecycle procedures into one, so the step numbers named by the agents changed (build reviewer: steps 7 to 10).
- **The coding agent stays on the code** (round 2, decisions 5A 6A 7A 8A). `TECH.md` → `## Map` says where the entry points, modules, tests and generated files are; `AGENTS.md` stays a short index of pointers, commands and must-hold rules. New skill `agents-md` creates or prunes `AGENTS.md` and `CLAUDE.md` on any repository, showing the diff before touching the person's lines; init runs it, the build updates the map, ship adds pointers to promoted files. Gate 5.11: a map exists and every path in it, `AGENTS.md` and `CLAUDE.md` exists. The briefing flags a dead pointer, a `DOMAIN.md` older than the last schema or migration change, and an `AGENTS.md` over 150 lines.

**Upgrading.** Frames, discoveries, definitions, releases and outcomes fail their gate until the decision carries `**Chosen by:**` from the person's answer. Build plans fail 5.11 until `TECH.md` has `## Map`; run `agents-md` once in each existing project.

### From one bet to a product that earns (2026-10-21)

The lifecycle shipped one bet well and said nothing between bets or around the product: no stage, no link from initiatives to a North Star, no channel, price or payment, no operations beyond the first incident. Analysis in the project thread "Da zero a milioni" (`da-zero-a-milioni-2026-10-21.md`), decisions 1A 2A 3A 4A.

- **The product loop.** `PRODUCT.md` → `## Business` replaces `## Success`: stage exit thresholds, North Star, revenue model, growth engine and a metric tree of three to six levers. A product review (`skills/builder-os/references/product-review.md`, `/builder-os:bos-review`, checked by `bos.mjs review`, conditions R.1 to R.5) reads every lever, judges the stage, and proposes one to three initiatives for a person to pick; it is written to `.builderos/reviews/`. The briefing flags it weekly before PMF and monthly after. Gate 2.7: each initiative names the lever it moves.
- **The stage changes the rules.** Before PMF scale work is rejected (2.5, new 3.8 and 4.15, model-judged), experiments are judged qualitatively against thresholds written first, concierge and Wizard of Oz are the preferred tests. After PMF, operations carry an SLO, incident response and a cost per active user.
- **Distribution and money in the bet.** Gate 3.7 (product track): `## Business case` with the first 100 users, cost per user, and for a product for sale the price and the willingness-to-pay test. Gate 4.14: a tagged willingness-to-pay result and a payments row in the stack (payments and tax join the layer catalogue, with the Italian SdI and EU OSS case). Gate 6.12: a first real payment before phase 7. Products "not for sale" skip the money lines. Subscription states join the domain method.
- **Operations by stage.** Gate 6.10 now also reads `TECH.md` → `## Operations`: Privacy always, AI disclosure when a model speaks (AI Act Article 50), SLO, incident response and cost per active user after PMF. Product facts written once, not per release.

**Upgrading.** Gate 2.7 warns until a first product review writes the metric tree. Product-track bets fail 3.7 until `PRODUCT.md` declares a revenue model and the bet has a business case; specs for products for sale fail 4.14 until a willingness-to-pay result and a payments layer exist; releases fail 6.10 until `TECH.md` → Operations has Privacy (plus the post-PMF lines at `emerging-PMF` or `scaling`), and 6.12 until a first payment on a product for sale.

## [2.3.0] - 2026-10-21

Work on a product that already exists (#14): a new `change` track, the request's own evidence on the feature track, the impact on what exists, project-level `DOMAIN.md` and design system, cleanup after a decision, and gates that cope with a suite already red. New gates M.1 to M.4, C.5, C.6, 4.11, 6.9 and 7.6; new command `bos.mjs upgrade`. No new phases, skills or slash commands.

### Work on a product that already exists (2026-10-20)

BuilderOS was shaped around a new product walking from phase 0 to 7 once. On a live product the work is different: many small changes, in parallel, in code with history, red tests, CI owned by others and users who already rely on the old behavior. Analysis in the project thread; decisions 1A to 4A.

#### Added

- **`change` track.** A modification whose solution is already decided (bug, debt, compliance, contract, exactly specified request, removal). `00-request.md` carries the request, its evidence, its population and the mandate; the mandate check (gate M: M.1 source, M.2 kind, M.3 why no bet, M.4 judged) covers phases 0 to 3 and the work starts at the spec in lite mode. Gate 4.4 is skipped, the look can be `inherited` with a reason, phase 5 is unchanged, and phase 6 closes the initiative unless the release sets an outcome review. A failed mandate check moves the work to `feature`. `bos.mjs new --track change`, `cover --m4`.
- **`bos.mjs upgrade --to feature|product --reason`**: the ratchet as a command, back to phase 0 with the artifacts kept.
- **The request's own evidence on the feature track.** `00-request.md` is required there too; C.5 checks its evidence and population (only the requester's words is a warning), C.6 warns on problem evidence older than a year, and gate 2.1 accepts tags from `00-request.md` and the initiative's own `evidence/`. Init on a live product harvests the evidence that already exists (tickets, analytics, call notes) before the coverage check judges it.
- **Gate 4.11, impact on what exists.** The spec states, for existing data, contracts, tracking events, permissions and current users, what changes and how it is handled. Never relaxed in lite.
- **`DOMAIN.md` and `TECH.md` → Design system, and gate 6.9.** What an initiative modeled and chose leaves its folder at ship: entities and rules into `DOMAIN.md`, kit and token location into `TECH.md`. `domain-model` and `design-direction` start from them and ask only the delta.
- **Gate 7.6, cleanup.** Every decision schedules what to remove: the flag and old path after KEEP, the shipped code after KILL.
- **Release notes say what changes for existing users**, not only what they can now do.
- **Pre-existing failures.** A suite already red before the change: gate 5.2 compares the final run with the captured baseline (listed failures present in the baseline log, no more failures than before, a separate green run of the mapped tests) instead of demanding exit 0. `TECH.md` gains Known failing and Test (fast).
- **Where the work lives.** Lifecycle files before code on the default branch, from the build with the code on its branch, an abandoned branch recorded as a decision; the briefing names initiatives that exist only on another branch. Multi-repository and monorepo limits stated.

#### Changed

- **C.3 no longer accepts a `code` tag** as evidence of a problem.
- **Gate 5.8** accepts `declined by {person} ({why}), {date}` as a visible warning when the CI belongs to someone else.

**Upgrading.** Specs written before this fail 4.11 until `## Impact on what exists` is added; releases fail 6.9 until the domain and look are promoted; outcomes fail 7.6 until `**Cleanup:**` is written. Feature initiatives created before this keep their covered phases; new ones need `00-request.md`.

**Verification.** 89 Node tests pass. Behavioral scenarios on Claude Code 2.1.305: the two new cases (`live-product-first-feature`, `change-with-red-suite`) and both feature-track cases pass; the first runs found three defects, fixed (see `tests/scenarios/README.md`). The other five cases were not rerun.

## [2.2.0] - 2026-10-20

Everything merged since 2.1.1, in three blocks: the SDLC alignment (#9), BuilderOS as a copilot (#10, #11), and the design, stack and guardrail rework (#12, #13). Four new skills (`stack-decisions`, `design-direction`, `domain-model`, `bug-diagnosis`), two new capabilities (`ui.render`, `logs.query`), new gates 3.5, 3.6, 4.7 to 4.10, 5.6 to 5.8, 6.8 and 7.5. No new phases or commands.

**Upgrading.** Specs and build plans written with 2.1.1 fail gates 4.7 to 4.10 and 5.6 to 5.8 until the new sections are added. `bos.mjs new` now refuses to run without `--track`.

**Verification.** 74 Node tests pass. All 9 behavioral scenarios passed on Claude Code on 2026-10-05, before #12 and #13; they were not rerun after them.

### Design, stack and guardrails (2026-10-20)

The design and stack choices stop happening by accident. Before this, no phase decided the stack (`TECH.md` stayed "no code yet" until the first build slice picked one), the visual layer was declared out of scope when no design tool was connected, and phase 3 stopped at the three options the gate counted and could pick the bet itself. Now each of these is a choice the user makes, in rounds, knowing what is chosen, why, what it costs and what the alternatives were.

#### Added

- **`stack-decisions` skill.** Layers the work touches are inherited, decided or not needed; every open layer becomes a decision card (plain-language gloss, cost tagged or flagged unverified, lock-in, what would make us switch, the boring default always among the options) asked in rounds, with drivers traced to `PRODUCT.md` and an ADR for hard-to-reverse choices. Feature track inherits the stack and asks only what the feature adds or strains.
- **`design-direction` skill.** At least three visual directions on a new product, two layout versions inside an existing design system (or in lite mode), differing in structure (layout, hierarchy, primary affordance, density), never only in colour. On a running product they mount inside the real page behind a `?variant=` switch on a throwaway branch; otherwise each is a self-contained HTML file under the initiative's `design/` folder. Revisions are new numbered files; after three rounds without a choice it proposes fixing the strongest. The design kit is chosen after the interface layer; tokens and composition rules are extracted into `DESIGN.md`, and the HTML stays a reference, never code.
- **`domain-model` skill.** The entities the work touches, their states and transitions (who, under which condition, with which effect), invariants, awkward scenarios, and the business rules put to the user as round questions ("can a closed ticket be reopened?"). A clickable logic prototype (one HTML file, pure module, guided scenarios) when the rules are non-trivial, and a data sketch the stack decision reads. New terms go into `PRODUCT.md` → Language.
- **Seams in the build plan.** The modules the work creates or changes, their interfaces, what they hide and where tests sit, each with one plain line; the central module is designed two or three ways and the losers go under rejected alternatives. The plan opens with `**In plain words:**`, presented before acceptance. Tests are written at the seams the plan names.
- **`ui.render` capability**, with HTML files as its floor.
- **Gates 3.5 and 3.6**: at least eight raw ideas before convergence (five in lite), and `**Chosen by:**` naming the person who chose the bet.
- **Gate 4.10**: `DESIGN.md` → `## Domain model` with entities, transitions naming who, invariants, data and the person who decided the rules, or "not applicable" with a reason.
- **Gate 5.6 extended**: the plain-words summary and the Seams table (interface, tests at, plain line per module).
- **Gates 4.8 and 4.9**: the spec's `## Stack` lists every layer with its status, a person on every decided layer and existing ADRs, plus `## What we chose`, a plain-language summary shown before acceptance; `DESIGN.md` → `## Visual direction` with the versions, their files, who chose, the kit and the tokens, or "not applicable" with a reason.
- **Briefing line** when an open initiative is past phase 4 while `TECH.md` still has open or empty stack layers. Gates already passed are not re-checked.

- **`bug-diagnosis` skill.** A loop that goes red on this bug, captured before any change; the case made minimal; at most three hypotheses, each killed or confirmed by instrumentation one at a time; the cause fixed rather than the symptom; a regression test at the seam and a check for the whole class when it is mechanical; four plain lines for the owner. Phase 5 uses it for bugs, phase 6 for problems after exposure.
- **Guardrails and gate 5.8.** `TECH.md` gains `**Guardrail:**`: the CI job or pre-commit hook that runs Verify on every change. Slice zero adds one when there is none; gate 5.8 fails on "none". Mechanical review findings become checks in it; judgment calls go to Conventions for the reviewer.
- **Environment retro in phase 7.** What slowed or misled the agent this cycle, turned into a pointer, a check or a convention, recorded under Pipeline notes.
- **`logs.query` capability**, with the user's error text as its floor.

#### Changed

- **Phase 3 diverges, then converges, and the person chooses.** `ideation-methods` adds the `## Divergence` list (with the user's own ideas) and makes selection a round; the solution-architect agent returns the round instead of picking.
- **Phase 4 runs flows, rules, look, stack, kit, then the spec.** `/bos-shape` runs `domain-model`, `design-direction` and `stack-decisions` in the main conversation, where the user can answer.
- **Phase 5 builds on what was decided.** A structural addition (framework, database, hosted service, paid API, runtime) stops the slice and returns to `stack-decisions`; utility libraries are listed in the review. An undecided layer or a departure from the tokens and kit is an Important review finding.
- **Init no longer guesses a stack.** Undecided layers are written `open` in `TECH.md`.

#### Verification

74 Node tests pass (67 existing, 6 new in `tests/scripts/design-and-stack.test.mjs`, 1 new for gate 5.8). The model-based behavioral scenarios were not rerun.

### Copilot (2026-10-05)

BuilderOS as a copilot, shaped by the first real use (an internal team tool taken to phase 6): the questions offer choices instead of blanks, the start needs one sentence, the agent flags drift while you work, and the skills are half as long. No new phases, commands or capabilities.

#### Added

- **Option rounds.** Every `pressure-testing` question lists two to four options, each with its consequence, and recommends one with the reason. At most four questions per round, answered by code (`1B, 2A`). "Go with the recommendations" decides only when the user says it, records each decision as theirs and never fills a factual gap. Factual questions offer ways to close the gap, never guessed values. An answer that maps to no option and lifts a gate or scope limit is confirmed before it counts.
- **Watch While Working** in `using-builder-os`: before doing a product request, check it against decisions, `PRODUCT.md` non-goals, conditions set by earlier phases and the spec's out-of-scope (contradiction), update files the decision made wrong (stale truth), name unvalidated ground (shaky ground), and put measurement before more work on an unread result or an unstarted pilot. Two lines, never a block.
- **Briefing attention**: decisions past their `Revisit when` date or without one, `[assumption:unvalidated]` left in `PRODUCT.md` after phase 1, and history events outside the schema's list.
- **Plain recap**: every phase report opens with at most five lines for someone who did not follow the work.

#### Changed

- **One-sentence start.** `/bos-init [idea]` drafts `PRODUCT.md` from the sentence, announces name, track and mode as defaults the user can override, and opens the first round of the starting phase in the same turn. Procedure in `references/lifecycle-setup.md`.
- **`bos.mjs new` requires `--track`.** Without it the script created a `product` initiative, which a later classification could not undo.
- **`/bos --phase`** logs a `phase_jump` event.
- **Editorial pass.** `SKILL.md` files keep the procedure (42k → 21.6k words in total); methods, templates and examples moved unchanged into each skill's `references/`, read on demand. `gate-checks` is split into one file per gate, so a gate loads only its own conditions. The rule on retrieving facts before asking lives once, in `references/operating-modes.md`.

#### Fixed

- The `financial-models` output template was split across two files; a `release-ops` step pointed at the wrong step.

#### Verification

67 Node tests pass (3 new). All 9 behavioral scenarios pass on Claude Code; `feature-track` failed on the first run (the track defaulted to `product`) and passed 3 of 3 after the `--track` fix.

### SDLC alignment (2026-10-04)

Aligns the delivery half of the lifecycle with Anthropic's AI-Native SDLC Playbook: the plan is reviewed before the code, a person accepts the work where it changes hands, the test loop cannot be weakened from inside, and production feeds the next cycle. No new phases, commands or capabilities; skills stay host-agnostic and every addition keeps a floor.

#### Added

- **Acceptance, separate from the gate.** `bos.mjs record` refuses to pass phases 0, 4 and 6 without `--accepted-by "who"`, taken from the person's own words, and stores `accepted_by` and `accepted_at` with the gate and in history. A failed gate records no acceptance. `gate-checks` gains the Acceptance protocol; a standing instruction counts when it named the scope.
- **Gate 4.7**: the spec states its constraint conflicts (`PRODUCT.md` against `TECH.md`) with who decides each, or that none were found.
- **Gates 5.6 and 5.7**: the build plan (slices with files, risks, rejected alternatives, tests) is accepted before any code, and the final diff is judged against it.
- **Gate 6.8**: exposure names who authorized it.
- **Gate 7.5**: a closing KEEP sets a watch (metric, bands, owner, recheck date). `record` stores it in `state.json`; `brief` raises it when due; `bos.mjs watch` rolls the recheck date after a check without breach, or clears it when a breach started a new initiative.
- **`bos.mjs pace`**: time per phase, gates failed before passing, who accepted, spec rework after the plan (from git), and phase 1 kills across initiatives. Phase 7 reads it into Pipeline notes.
- **`TECH.md` → Verify**: one command each for build, test and lint with their healthy output, filled at init or by the first build. Phase 5 baselines and verifies with them.

#### Changed

- **Phase 5 plans first.** `delivery-discipline` writes the plan reading only, gets it accepted, keeps it true on every deviation, and only then runs the loop. The planner agent changes no code.
- **The test loop is protected.** A bug fix starts from a captured failing test the fix cannot edit; changing an assertion to pass is a named mistake and an Important review finding.
- **Review has severity and a fresh context.** Important against Nit, five nits at most, the diff read against the plan, and recurring findings written into `TECH.md`.
- **Eval sets keep growing.** Failed production outputs and model-caused incidents become dataset cases; the dataset reruns on every prompt or model change.
- **`problem-framing`** accepts three ways in (idea, ticket, anomaly) and lists open questions for phase 1.
- **Must-always-hold rules** are written in `TECH.md` with the deterministic check that enforces them, when one exists. Skills stay advisory.

#### Verification

64 Node tests pass (55 existing, 9 new in `tests/scripts/acceptance-and-loop.test.mjs`). The model-based behavioral scenarios were not rerun.

## [2.1.1] - 2026-09-30

Hardening from a skill audit (#7). No new phases or commands; the gates ask for stronger evidence and the host adapters load the whole bundle.

### Changed

- **Phase 5 counts only recorded test runs.** `bos.mjs run-check` runs the command and writes a `Run` record (argv, cwd, timestamps, exit code, log digest); gate 5.2 resolves it. Pasted test output no longer passes. Eval runs bind dataset and result digests the same way.
- **Phase 6 separates ready from shipped.** A release plan ends at `## RELEASE READY`; `## SHIPPED` and the move to phase 7 need observed exposure: verified status, an actual timestamp, environment, version and a resolvable source (gates 6.6 and 6.7). Baseline capture is compared with the actual exposure time, never a planned date.
- **Standalone requests stay standalone.** A PRD, research guide or plan asked for on its own keeps its scope and destination and creates no lifecycle state.
- **Namespaced commands on Claude Code**: `/builder-os:bos-*`. Commands dispatch in the foreground and await delegated work.
- **Codex installs as a plugin** (`codex plugin marketplace add mariomile/builder-os`, `codex plugin add builder-os@builder-os`). Manual setups keep a complete checkout; copying `skills/` alone is unsupported.

### Fixed

- Historical MRR, churn, cohort and account-ARPA calculations, A/B sample sizes, partial PMF scoring and unsupported growth inferences in the specialist skills.
- Host adapters resolve the installation root, handle resume and fork safely, and use capabilities available in the current session.

### Verification

55 Node tests and 17 SQL contract checks pass. The model-based behavioral scenarios were not rerun for this release.

## [2.1.0] - 2026-09-27

The first initiative taken from `/bos-init` to phase 7, rehearsed on a stand-in for a captoo feature, and the first install on Codex. Everything below was found by those two runs. Report: `docs/runs/2026-09-27-captoo-rehearsal.md`.

### Added

- **`bos.mjs record N`** writes a gate result to `state.json`: the script's verdict on its own conditions plus the model's verdict on the judge ones, passed as `--judged "id=pass|fail"` and refused when one is missing. It sets status, `checked_at`, `checked_by`, failed conditions and the history event (`gate_passed`, `gate_failed`, `gate_overridden`, `closed`, `cycle_started`), advances, holds or closes the phase, records the phase 1 verdict, the phase 6 review date and the phase 7 re-entry, and regenerates the roadmap. The rehearsal's model had written four passes by hand with invented timestamps, one of them over a failing gate.
- **Gate 2.6**: the success metric measures an outcome, not the build. A metric the code hits by shipping ("alerts sent within 24 hours") makes phase 7 measure nothing.
- **Scenarios** `feature-track-ai-domain` and `gate-recorded-by-script`, and the `captoo` fixture they run on. `tests/scripts/manifests.test.mjs` checks manifest versions and command sizes.

### Changed

- **Initialization procedure moved into `builder-os`** (section Initialization); `/bos-init` routes to it. Hosts without commands run the same steps.
- Phase agents are dispatched in the foreground: a backgrounded reviewer let a headless session end before gate 5 was recorded.
- The roadmap's bet column falls back to phase 3's selected option.

### Fixed

- **Codex**: the manifest's empty `hooks` object switched off the session-start hook; Codex 0.157.1 discovers `hooks/hooks.json` once it is gone. Codex silently dropped `/bos-init` and `/bos-build` when importing commands as skills (limit 3875 bytes); both are now well under it and a test keeps every command there. The Codex manifest still said 1.0.0.
- Coverage check and gate 0: a term defined in `PRODUCT.md` → Language is not solution language ("AI answer engine" for a product that monitors them); the three copies of the word list are one; "ai" as an Italian preposition no longer matches. The procedure runs `gate C` before `cover`, so a drafting error is fixed before a verdict is recorded.
- Gate 5.1 no longer counts "no test, reasoned exception" as a mapped criterion. E.1 resolves `code` tags with line lists and ignores `[code:...]` used in prose to name the class.
- Gate 6.4 in lite mode printed "undefined"; it is judged in both modes and a lite fail is a warning.

## [2.0.0] - 2026-09-26

### Added

- **Tracks.** Work is classified before the first phase runs and the classification is announced: `spike` (an answer, stops at the phase 1 verdict), `feature` (a change to an existing product, starts at phase 2 after a coverage check against `PRODUCT.md`), `product` (all eight phases). New `track` field in `state.json`, absent meaning `product`; new phase statuses `covered` and `answered`; history events `track_set`, `phase_covered`, `track_upgraded`. A track only upgrades. The coverage check (C.1 to C.4) and the spike stop live in `gate-checks`. Pattern from Superpowers' three brainstorming paths.
- **`using-builder-os`**, the single entry point: it briefs from the project memory, routes a request to the lifecycle or to one specialist skill, asks at most three routing questions with recommended answers when the route is unclear, and carries a red-flags table of the rationalizations that skip a phase or a gate. Pattern from Superpowers' `using-superpowers`, without the all-caps emphasis.
- **Project memory.** `.builderos/ROADMAP.md` (the master plan: direction, now, next, later, done and dropped), `TECH.md` (stack, technical constraints, conventions, known traps), and several initiatives at once, each in `.builderos/initiatives/{name}/` with its own track, phases and gates. State moves to schema 2: one `state.json` per initiative, in its folder, so two people advancing two initiatives never edit the same file; the active initiative lives in a gitignored `.builderos/local.json`, because it belongs to a checkout, not to the project. Stated migration from schema 1. `/bos-init` on an initialized project adds an initiative; `/bos` and `/bos-status` take `--initiative`. Phases 5, 6 and 7 keep `TECH.md` and the roadmap current.
- **Every session starts briefed.** `using-builder-os` reads state, roadmap, `PRODUCT.md` and `TECH.md` and briefs the user in five lines before answering. `/bos-init` writes the same instruction into the project's own `AGENTS.md`, so a session on a host with no plugin reads the memory too.
- **`/bos-ask`**: the routing interview on demand. Proposes a route of one to four skills with the file each writes, and refuses a route that skips a gate through a standalone skill. Pattern from Pocock's `ask-matt`, turned from a static map into an interview.
- **Evidence files.** Every `interview`, `doc` and `data` tag points at a file in `evidence/` (the initiative's, then the project's) holding the raw material. Gate condition E.1 checks it on every gate. What the user says becomes `[doc:user-{date}-{topic}]` with their words saved, replacing the bare `[doc:user-provided]` that pointed at nothing.
- **`scripts/bos.mjs`**, Node built-ins only: `gate N` decides the structural gate conditions (32 of 43, including E.1 and the coverage check; 1.1 and 1.2 go to the model when only `doc` sources reach the threshold) and lists the rest for the model to judge, so the author does not grade its own artifact; `brief` computes the session briefing; `roadmap` regenerates the Now and Done tables from the initiative states; `migrate` moves schema 1 to schema 2; `new` and `cover` write a new initiative's state and the feature-track coverage result, because the first live run showed the model improvising the state shape (no history events, invented fields). The briefing flags any state file that does not follow the schema. `gate.checked_by` records which conditions the script decided. The session-start hook appends the scripted briefing when Node is available. Optional everywhere: where commands cannot run, the model applies the same rules and the state says so.
- **Memory that notices it is stale.** `ROADMAP.md` and `TECH.md` carry a `Verified` date and commit. The briefing adds one attention line for an outcome review past its `review_due` date (set at phase 6), a `TECH.md` not re-verified since a dependency manifest changed, an initiative untouched for 30 days, or a roadmap that disagrees with the states.
- **Eval sets for model output.** A spec whose acceptance criteria depend on what a model generates declares it and carries an eval set: cases, expected properties, judge, threshold, must-pass cases, production sampling. Gate 4.6 checks the set, gate 5.5 checks the pasted run against the threshold, and phase 6 measures production quality as a guardrail.
- **Tests.** `tests/scripts/bos.test.mjs` (16 tests, `npm test`) on a fixture project; `tests/scenarios/` runs a real host headless on a copy of the fixture and checks the files it changed; triggering prompts for the tracks and for routing.
- **Interview rounds** in `pressure-testing`: ask every independent question at once, numbered, each with a recommended answer; dependent questions wait for the next round; facts the session can retrieve are retrieved, never asked. `problem-framing` asks ICP, why-now and prior art as one round, `/bos-init` interviews for `PRODUCT.md` the same way. Pattern from Matt Pocock's `grilling`.
- **The gate is re-run, not the marker trusted.** Every `/bos-*` phase command and the hub re-read the written artifact and run the gate on it; a completion marker is a claim. `delivery-discipline` and `release-ops` gain a claims-and-evidence table. Pattern from Superpowers' `verification-before-completion`.
- **Async questionnaire** in `research-methods`, for knowledge held by someone the user cannot interview, written to `.builderos/questionnaires/`, with tagging rules that keep secondhand answers out of the gate 1 count. Pattern from Pocock's `to-questionnaire`.
- **ADR test** in `/bos-adr`: hard to reverse, surprising without context, a real trade-off; all three or no ADR. **Language** section in the `PRODUCT.md` template. Both from Pocock's `domain-modeling`.
- **Not yet specified** in the spec output contract, separate from out of scope, with who decides and which acceptance criteria wait; `delivery-discipline` turns each open question into a blocking edge. From Pocock's `wayfinder`.
- **Codex plugin manifest** `.codex-plugin/plugin.json` and `.agents/plugins/marketplace.json`, shaped on Superpowers' published files, with the manual setup kept as the fallback in `docs/hosts.md`.

### Removed

- **The `pm-*` surface as a separate product**: the `pm-toolkit` hub, the `orchestrator` skill (folded into `using-builder-os`), the 16 `/pm-*` commands and `references/pm-context-template.md`. The specialist skills and their agents stay and are reached by routing or by their descriptions, which also works on hosts with no commands. `pm-toolkit` carried a literal subagent-dispatch call, against portability rule 3, and a personal vault path. `PM-CONTEXT.md` is still read as a fallback and migrated by `/bos-init`.
- Duplicated rules: the Iron Law now lives in `evidence-ledger` only, the operating modes in `capability-map` only, and the lifecycle hub no longer repeats the red flags that `using-builder-os` carries.

### Fixed

- The evidence tag class `mcp` named a protocol, not a provenance. It is now `data` (`[data:posthog:funnel_q3]`) everywhere, gates included.
- `AGENTS.md` still listed ~74 hardcoded tool references as known debt; none remain, and the line is gone. The manifests no longer describe BuilderOS as connecting "via MCP" or list `mixpanel` as a keyword.

- The session-start hook and the OpenCode plugin injected `pm-toolkit`, the analysis hub, so a fresh session did not know the lifecycle existed. Both now inject `using-builder-os`.
- Six skills still named a host tool (`Grep`) in their capability floors, against portability rule 4. They now say "search the repository" or "search the vault".
- `DESIGN.md` lived at the working-directory root but was missing from the state schema, and would have collided between initiatives. It now lives in the initiative folder.
- `/bos-init` let an existing product start at phase 2 or 3, but `/bos-define` then refused because phase 1 had never passed. The `feature` track and the `covered` status close that gap.

## [1.0.0] — 2026-09-23

The full lifecycle. Eight phases from idea to production, each with its own skills, its own procedure and a gate that cannot be argued with.

### Added

- **The spine.** `.builderos/state.json` and `PRODUCT.md` as the pipeline's memory, `gate-checks` with all eight gates as machine-checkable conditions plus the refusal and override protocols, `evidence-ledger` for the tagging grammar gates count, and `pressure-testing` as the adversarial interview primitive any gate can call. Commands `/bos`, `/bos-init`, `/bos-status`, `/bos-gate`.
- **Phases 0 to 2.** `problem-framing`, `research-methods`, `opportunity-mapping`, with `problem-framer`, `research-planner` and `opportunity-mapper`. Commands `/bos-frame`, `/bos-discover`, `/bos-define`, and the `/bos-discovery-sprint` chain.
- **Phase 3, Ideate.** `ideation-methods` with mechanical distinctness as a deterministic check, four-axis scoring, kill criteria as metric plus threshold plus date, and the cheapest-test catalogue with the 20% rule. Agent `solution-architect`, command `/bos-ideate`.
- **Phase 4, Shape.** `spec-writing` (scope boundaries in three forms, the adjective test for acceptance criteria, four edge-case categories, tracking designed backwards from the phase 2 metric) and `ux-architecture` (placement, flows with abandonment behavior, six states per step with real error copy, component inventory, accessibility floor). Agents `spec-writer` and `ux-architect`, command `/bos-shape`.
- **Phase 5, Build.** `delivery-discipline` with tracer-bullet decomposition, a pasted test baseline before any change, the red-green loop including "watch it fail", two-axis review, the scope-creep check and instrumentation verified by arrival. Agents `delivery-planner` and `build-reviewer`, command `/bos-build`.
- **Phase 6, Ship.** `release-ops` with five rollout strategies, rollback as mechanism plus owner plus an actual test, the data-written-while-live question, and the baseline captured and timestamped before exposure. Agent `release-manager`, command `/bos-ship`.
- **Phase 7, Learn.** `outcome-review` with the identical-rerun rule, two separate comparisons against target and kill criteria, three honest handlings of an ambiguous result, and the test that separates a learning from a summary. Commands `/bos-learn` and `/bos-adr`.
- **Host portability.** `AGENTS.md` as the shared contract, `docs/hosts.md` for per-host setup, `references/capability-map.md` with fifteen capabilities and a degradation ladder each. `CLAUDE.md` imports `AGENTS.md` so the two cannot drift.
- **`references/analytics-contract.md`.** Five analytics question shapes (catalogue, volume, funnel, retention, breakdown) with result shapes, floors, and the provider vocabulary for Mixpanel, Amplitude and PostHog.
- **`references/product-md-template.md`** and **`references/builderos-state-schema.md`**.
- **`tests/skill-triggering/`** with the manual protocol stated in its README and 27 triggering prompts: one for every lifecycle phase entry point, most of the analysis surface, and the cross-cutting skills. `/bos` and `/bos-status` have none, since routing and status are not triggering decisions.
- **`docs/architecture.md`**, a visual map of how the pieces fit.

### Changed

- **Procedure moved from agents into skills, everywhere.** Every agent in the repo is now a thin adapter of at most 35 lines: role, Iron Law, context contract, reporting. The method lives in the skill, where a host with no `agents/` directory can still reach it. The eleven v0.1 and v0.2 agents were up to 305 lines.
- **Capabilities replaced tools.** No skill, agent or command names a tool identifier. 43 literal references were removed, including one user's personal Mixpanel connector, which resolved for nobody else.
- **Zero prerequisites.** Every skill declares a Capabilities table with a floor per capability. `files.read` and `files.write` are the only hard dependency. No skill tells a user to install or connect a named product; it states the capability gap and the question closing it would answer.
- **`pm-toolkit` mode detection** became the capability resolution protocol, with the four operating modes restated as summaries of what resolved.
- **README** rewritten around the lifecycle.

### Removed

- **The `pm-*` surface as a separate product**: the `pm-toolkit` hub, the `orchestrator` skill (folded into `using-builder-os`), the 16 `/pm-*` commands and `references/pm-context-template.md`. The specialist skills and their agents stay and are reached by routing or by their descriptions, which also works on hosts with no commands. `pm-toolkit` carried a literal subagent-dispatch call, against portability rule 3, and a personal vault path. `PM-CONTEXT.md` is still read as a fallback and migrated by `/bos-init`.
- Duplicated rules: the Iron Law now lives in `evidence-ledger` only, the operating modes in `capability-map` only, and the lifecycle hub no longer repeats the red flags that `using-builder-os` carries.

### Fixed

- The evidence tag class `mcp` named a protocol, not a provenance. It is now `data` (`[data:posthog:funnel_q3]`) everywhere, gates included.
- `AGENTS.md` still listed ~74 hardcoded tool references as known debt; none remain, and the line is gone. The manifests no longer describe BuilderOS as connecting "via MCP" or list `mixpanel` as a keyword.

- Dangling `b2b-saas-analytics` reference in `saas-metrics-reference` and `growth-frameworks`: the skill does not exist.
- The five `pm-*` commands that asked for an analytics project id as a precondition.

### Known limitations

- **Nothing has been executed in a live session.** The repo is structurally complete and mechanically checked; behavioral verification is open (plan tasks 1.9, 2.6, 2b.6, 3.4, 4.3, 5.6).
- The benchmark bands in `saas-metrics-reference` are working heuristics for triage, not sourced industry benchmarks.
- No automated skill-triggering runner. The prompts exist and the protocol is manual, by design: a real eval loop deserves its own spec.

## [0.2.0] — 2026-05-03

Strategy and Vision cluster.

### Added

- Skills `strategy-frameworks` and `okr-frameworks`.
- Agents `product-strategist`, `north-star-analyst`, `okr-architect`.
- Commands `/pm-strategy`, `/pm-northstar`, `/pm-okr`, `/pm-strategy-session`.

Never tagged or version-bumped at the time; recorded here retroactively.

## [0.1.0] — 2026-04

First release. The analysis surface.

### Added

- Hub skill `pm-toolkit` with tri-modal detection.
- Skills `pm-artifacts`, `growth-frameworks`, `tracking-standards`, `financial-models`, `experiment-methodology`, `competitive-intel`, `discovery-methods`, `saas-metrics-reference`.
- Agents `product-diagnostician`, `growth-architect`, `finance-analyst`, `tracking-architect`, `experiment-designer`, `competitive-analyst`, `discovery-synthesizer`, `product-writer`.
- Commands `/pm`, `/pm-health`, `/pm-growth`, `/pm-track`, `/pm-finance`, `/pm-experiment`, `/pm-compete`, `/pm-discovery`, `/pm-prd`, `/pm-release`, `/pm-audit`, `/pm-metrics`.
