# Changelog

All notable changes to BuilderOS. Dates are the date the work landed on a branch, not a publication date.

## [Unreleased]

### Added

- **Tracks.** Work is classified before the first phase runs and the classification is announced: `spike` (an answer, stops at the phase 1 verdict), `feature` (a change to an existing product, starts at phase 2 after a coverage check against `PRODUCT.md`), `product` (all eight phases). New `track` field in `state.json`, absent meaning `product`; new phase statuses `covered` and `answered`; history events `track_set`, `phase_covered`, `track_upgraded`. A track only upgrades. The coverage check (C.1 to C.4) and the spike stop live in `gate-checks`. Pattern from Superpowers' three brainstorming paths.
- **`using-builder-os`**, a short bootstrap skill that routes between the lifecycle and the analysis surface, with a red-flags table of the rationalizations that skip a phase or a gate. Pattern from Superpowers' `using-superpowers`, without the all-caps emphasis.
- Triggering prompts for the `feature` and `spike` tracks and for routing an analysis question.

### Fixed

- The session-start hook and the OpenCode plugin injected `pm-toolkit`, the analysis hub, so a fresh session did not know the lifecycle existed. Both now inject `using-builder-os`.
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

### Fixed

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
