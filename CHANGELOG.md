# Changelog

All notable changes to BuilderOS. Dates are the date the work landed on a branch, not a publication date.

## [Unreleased]

### Added

- **Tracks.** Work is classified before the first phase runs and the classification is announced: `spike` (an answer, stops at the phase 1 verdict), `feature` (a change to an existing product, starts at phase 2 after a coverage check against `PRODUCT.md`), `product` (all eight phases). New `track` field in `state.json`, absent meaning `product`; new phase statuses `covered` and `answered`; history events `track_set`, `phase_covered`, `track_upgraded`. A track only upgrades. The coverage check (C.1 to C.4) and the spike stop live in `gate-checks`. Pattern from Superpowers' three brainstorming paths.
- **`using-builder-os`**, the single entry point: it briefs from the project memory, routes a request to the lifecycle or to one specialist skill, asks at most three routing questions with recommended answers when the route is unclear, and carries a red-flags table of the rationalizations that skip a phase or a gate. Pattern from Superpowers' `using-superpowers`, without the all-caps emphasis.
- **Project memory.** `.builderos/ROADMAP.md` (the master plan: direction, now, next, later, done and dropped), `TECH.md` (stack, technical constraints, conventions, known traps), and several initiatives at once, each in `.builderos/initiatives/{name}/` with its own track, phases and gates. State moves to schema 2: one `state.json` per initiative, in its folder, so two people advancing two initiatives never edit the same file; the active initiative lives in a gitignored `.builderos/local.json`, because it belongs to a checkout, not to the project. Stated migration from schema 1. `/bos-init` on an initialized project adds an initiative; `/bos` and `/bos-status` take `--initiative`. Phases 5, 6 and 7 keep `TECH.md` and the roadmap current.
- **Every session starts briefed.** `using-builder-os` reads state, roadmap, `PRODUCT.md` and `TECH.md` and briefs the user in five lines before answering. `/bos-init` writes the same instruction into the project's own `AGENTS.md`, so a session on a host with no plugin reads the memory too.
- **`/bos-ask`**: the routing interview on demand. Proposes a route of one to four skills with the file each writes, and refuses a route that skips a gate through a standalone skill. Pattern from Pocock's `ask-matt`, turned from a static map into an interview.
- **Evidence files.** Every `interview`, `doc` and `data` tag points at a file in `evidence/` (the initiative's, then the project's) holding the raw material. Gate condition E.1 checks it on every gate. What the user says becomes `[doc:user-{date}-{topic}]` with their words saved, replacing the bare `[doc:user-provided]` that pointed at nothing.
- **`scripts/bos.mjs`**, Node built-ins only: `gate N` decides the structural gate conditions (32 of 43, including E.1 and the coverage check; 1.1 and 1.2 go to the model when only `doc` sources reach the threshold) and lists the rest for the model to judge, so the author does not grade its own artifact; `brief` computes the session briefing; `roadmap` regenerates the Now and Done tables from the initiative states; `migrate` moves schema 1 to schema 2. `gate.checked_by` records which conditions the script decided. The session-start hook appends the scripted briefing when Node is available. Optional everywhere: where commands cannot run, the model applies the same rules and the state says so.
- **Memory that notices it is stale.** `ROADMAP.md` and `TECH.md` carry a `Verified` date and commit. The briefing adds one attention line for an outcome review past its `review_due` date (set at phase 6), a `TECH.md` not re-verified since a dependency manifest changed, an initiative untouched for 30 days, or a roadmap that disagrees with the states.
- **Eval sets for model output.** A spec whose acceptance criteria depend on what a model generates declares it and carries an eval set: cases, expected properties, judge, threshold, must-pass cases, production sampling. Gate 4.6 checks the set, gate 5.5 checks the pasted run against the threshold, and phase 6 measures production quality as a guardrail.
- **Tests.** `tests/scripts/bos.test.mjs` (13 tests, `npm test`) on a fixture project; `tests/scenarios/` runs a real host headless on a copy of the fixture and checks the files it changed; triggering prompts for the tracks and for routing.
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
