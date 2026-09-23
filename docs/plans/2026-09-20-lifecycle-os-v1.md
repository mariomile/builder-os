# BuilderOS v1.0 — Lifecycle OS Implementation Plan

**Spec:** `docs/specs/2026-09-20-lifecycle-os-v1-design.md`
**Goal:** Ship the 8-phase idea → production pipeline: 1 lifecycle hub, 3 cross-cutting skills, 8 phase skills, 8 phase agents, 12 commands, plus the state spine.
**Approach:** Four clusters in dependency order. Each cluster is independently shippable and leaves the plugin in a working state.

Task syntax: `- [ ]` pending, `- [x]` done. Tick on commit, not on write.

---

## File Map

| # | Path | Type | Cluster |
|---|------|------|---------|
| 1 | `skills/builder-os/SKILL.md` | Lifecycle hub skill | 1 |
| 2 | `skills/gate-checks/SKILL.md` | Cross-cutting skill | 1 |
| 3 | `skills/evidence-ledger/SKILL.md` | Cross-cutting skill | 1 |
| 4 | `skills/pressure-testing/SKILL.md` | Cross-cutting skill | 1 |
| 5 | `references/product-md-template.md` | Template | 1 |
| 6 | `references/builderos-state-schema.md` | Schema | 1 |
| 6b | `references/analytics-contract.md` | Contract | 5 |
| 7 | `commands/bos.md`, `bos-init.md`, `bos-status.md`, `bos-gate.md` | Commands | 1 |
| 8 | `skills/problem-framing/SKILL.md` + `agents/problem-framer.md` + `commands/bos-frame.md` | Phase 0 | 2 |
| 9 | `skills/research-methods/SKILL.md` + `agents/research-planner.md` + `commands/bos-discover.md` | Phase 1 | 2 |
| 10 | `skills/opportunity-mapping/SKILL.md` + `agents/opportunity-mapper.md` + `commands/bos-define.md` | Phase 2 | 2 |
| 11 | `skills/ideation-methods/SKILL.md` + `agents/solution-architect.md` + `commands/bos-ideate.md` | Phase 3 | 3 |
| 12 | `skills/spec-writing/SKILL.md` + `skills/ux-architecture/SKILL.md` + `agents/spec-writer.md` + `agents/ux-architect.md` + `commands/bos-shape.md` | Phase 4 | 3 |
| 13 | `skills/delivery-discipline/SKILL.md` + `agents/delivery-planner.md` + `agents/build-reviewer.md` + `commands/bos-build.md` | Phase 5 | 3 |
| 14 | `skills/release-ops/SKILL.md` + `agents/release-manager.md` + `commands/bos-ship.md` | Phase 6 | 4 |
| 15 | `commands/bos-learn.md` + `commands/bos-adr.md` | Phase 7 + ADRs | 4 |
| 16 | `README.md`, `CHANGELOG.md`, version bumps | Release | 4 |

---

## Cluster 1 — The Spine

Nothing else functions without this. Delivers a working `/bos-init` → `/bos-status` loop even with zero phase skills installed.

- [x] **1.1 — `references/product-md-template.md`**
  Durable product truth: product name, one-line purpose, primary ICP with size, secondary ICP, problem, non-goals, constraints (technical, regulatory, resource), voice, current stage, evidence links. Every field carries a source tag or `[assumption:unvalidated]`. Extends the existing `pm-context-template.md` rather than replacing it; that file stays for `pm-*` command compatibility and gains a pointer to this one.

- [x] **1.2 — `references/builderos-state-schema.md`**
  Documents `.builderos/state.json`: `{ product, current_phase, phases: { "0": { status, gate: { passed, failed_conditions[], overridden, override_reason }, artifact, updated_at } }, history[] }`. Plus the naming rules for phase artifacts and the `decisions/ADR-NNN-slug.md` convention.

- [x] **1.3 — `skills/evidence-ledger/SKILL.md`**
  Tag grammar (`[mcp:*]`, `[interview:*]`, `[doc:*]`, `[estimate:*]`, `[assumption:*]`), source hierarchy, counting rules gates use, and the rewrite protocol for untagged claims. Includes a worked before/after example of an untagged paragraph becoming a tagged one.

- [x] **1.4 — `skills/gate-checks/SKILL.md`**
  All 8 gates with their machine-checkable conditions, the refusal protocol (name failed condition → state what satisfies it → offer cheapest path → do not advance), and the override protocol (allowed, logged in `state.json` with a reason, surfaced in `/bos-status`).

- [x] **1.5 — `skills/pressure-testing/SKILL.md`**
  The adversarial interview primitive. Question banks per phase, the branch-resolution stop condition, and the rule that agreement is not a stop condition. Explicitly model-invoked; any gate may call it.

- [x] **1.6 — `skills/builder-os/SKILL.md`**
  The lifecycle hub. Inherits the tri-modal detection protocol from `pm-toolkit` verbatim, adds phase detection (read `state.json`), the full phase → skill → agent → command routing table, the gate model, and the handoff contract between phases. Routes phase-7 intents to `pm-toolkit`. Declares interop detection for Superpowers and Impeccable.

- [x] **1.7 — Commands `bos`, `bos-init`, `bos-status`, `bos-gate`**
  `bos-init` interviews for `PRODUCT.md` and scaffolds `.builderos/`. `bos` reads state and routes. `bos-status` renders the one-screen pipeline view. `bos-gate` runs the current gate and reports per-condition pass/fail.

- [x] **1.8 — Verify and commit**
  Frontmatter valid on all new skills (`name`, `description` = triggering conditions only) — checked. Every skill referenced by the hub and the new commands resolves to a real directory, or is marked unavailable in the hub's Availability section — checked. Test prompts added for the four spine skills.

- [ ] **1.9 — Runtime verification**
  Run `/bos-init` → `/bos-gate` → `/bos-status` in a clean session on an empty directory. Confirm `PRODUCT.md` and `state.json` are written to schema, and that a deliberately weak `00-frame.md` fails gate 0 with a named condition. Not yet executed: requires a live session with the plugin installed.

---

## Cluster 2 — Front Half (Phases 0–2)

The part that makes the promise true: an idea can now enter the system.

- [x] **2.1 — Phase 0: Frame**
  `problem-framing` skill: problem-vs-solution separation, the "so what" test, ICP definition, why-now analysis, riskiest-assumption extraction. `problem-framer` agent: tri-modal, 5 phases, writes `00-frame.md` + drafts `PRODUCT.md`, marker `## FRAME COMPLETE`. Command `/bos-frame`. Test prompt.

- [x] **2.2 — Phase 1: Discover**
  `research-methods` skill: JTBD interview design, non-leading question construction, sample sizing for qualitative work, source mining (Notion, Readwise, Raindrop, support, analytics), saturation criteria. `research-planner` agent: produces the plan, ingests transcripts, hands to the existing `discovery-synthesizer`. Writes `01-discovery.md` with the evidence ledger and the `VALIDATED`/`KILLED`/`RESHAPED` verdict. Marker `## DISCOVERY COMPLETE`. Command `/bos-discover`. Test prompt.

- [x] **2.3 — Phase 2: Define**
  `opportunity-mapping` skill: opportunity solution trees, opportunity sizing and scoring, the traceability rule (every opportunity cites Phase 1 evidence), coherence check against PMF stage. `opportunity-mapper` agent: builds the tree, scores, selects, chains to `product-strategist` and `north-star-analyst`. Writes `02-definition.md`. Marker `## DEFINITION COMPLETE`. Command `/bos-define`. Test prompt.

- [x] **2.4 — Chain command `/bos-discovery-sprint`**
  Sequential 0 → 1 → 2 in one session, gates enforced between steps. Mirrors the existing `/pm-strategy-session` pattern.

- [x] **2.5 — Structural verification and commit**
  All three agents carry `model: inherit`, Phase 0 mode detection, a Fallback section, a completion marker and a Common Mistakes table — checked. Skill frontmatter is `name` + triggering-condition `description` only — checked. Four test prompts added. Hub Availability section updated to mark phases 0–2 live.

- [ ] **2.6 — Behavioral verification**
  Run `/bos-discovery-sprint` against a real idea in a clean session. Confirm each agent refuses to advance on a failed gate and names the condition. Confirm phase 1 pauses with a plan rather than fabricating a verdict when no transcripts exist. Not yet executed: requires a live session with the plugin installed.

---

## Cluster 2b — Host Portability

Added 2026-09-21. BuilderOS must run on Claude Code and Codex, and degrade sanely anywhere else. Spec: `docs/specs/2026-09-21-host-portability.md`.

- [x] **2b.1 — `references/capability-map.md`**
  15 capabilities, the runtime resolution protocol, the degradation ladder per capability, and operating modes restated in capability terms.

- [x] **2b.2 — Invert skills and agents on the v1.0 surface**
  Procedure moved from `problem-framer`, `research-planner` and `opportunity-mapper` into `problem-framing`, `research-methods` and `opportunity-mapping`. Each skill gained a Capabilities table with a floor per capability and a numbered Procedure. The three agents became thin adapters: role, Iron Law, context contract, reporting.

- [x] **2b.3 — Host-agnostic hub**
  `builder-os` Dispatch Protocol became a Run Protocol with two paths: delegate where `subagent.dispatch` resolves, run inline where it does not. Mode detection rewritten in capability terms. Interop and Red Flags de-vendored.

- [x] **2b.4 — `AGENTS.md` and `docs/hosts.md`**
  Repo-root standing rules for `AGENTS.md`-aware hosts, and the per-host setup and difference table.

- [x] **2b.5 — Portability rules in `CLAUDE.md`**
  Six enforced rules, a new Skill Contract, a rewritten Agent Contract, and design principles 4 and 6 replaced.

- [ ] **2b.6 — Cross-host verification**
  Run phases 0–2 on Codex with `skills/` reachable and no `agents/` or `commands/`, and confirm identical artifacts and gate behavior against a Claude Code run of the same idea. Not yet executed.

---

## Cluster 5 — Legacy Retrofit

The 11 v0.1/v0.2 agents predated the portability contract. Spec: `docs/specs/2026-09-23-zero-prereq-analytics-agnostic.md`, which adds the owner's two rules of 2026-09-23: prerequisites are zero, and analytics is a category rather than a product.

- [x] **5.1 — Audit**
  43 literal tool identifiers across 14 files, plus 129 vendor-name mentions assuming one stack. Per-file table in the spec. The sharpest case was `mcp__claude_ai_DeepAgent_Mixpanel__Run-Query`, one named workspace belonging to one person, which resolves for nobody else.

- [x] **5.2 — Move procedure into skills**
  `saas-metrics-reference`, `growth-frameworks`, `financial-models`, `tracking-standards`, `discovery-methods`, `competitive-intel`, `experiment-methodology`, `strategy-frameworks`, `okr-frameworks` and `pm-artifacts` each gained a Capabilities table with a stated floor per capability, a numbered Procedure and an output contract. `saas-metrics-reference` was not on the original list and is the right home for the diagnostic procedure; `pm-artifacts` absorbed the four document templates that lived in the agent.

- [x] **5.3 — Convert agents to adapters**
  All 11 legacy agents now carry role, Iron Law, context contract and reporting only. No agent in the repo is longer than 35 lines, down from up to 305.

- [x] **5.4 — De-vendor `pm-toolkit`**
  Mode detection replaced by the capability resolution protocol; the four modes restated as summaries of what resolved; MCP enhancement suggestions replaced by capability gaps that name a shape and a question rather than a product. The five `pm-*` commands that asked for a provider account or project id no longer do.

- [x] **5.5 — Added: `references/analytics-contract.md`**
  Five question shapes (catalogue, volume, funnel, retention, breakdown) with their result shapes, their floors, the provider vocabulary for Mixpanel, Amplitude and PostHog, and the two traps that make a number silently wrong: an unread conversion window and a retention definition compared across bounded and unbounded.

- [ ] **5.6 — Behavioral equivalence**
  Each retrofitted agent produces equivalent output on the same input as before the change, on a host where the same capabilities resolve. Not yet executed: requires a live session with the plugin installed.

**Structural verification, run 2026-09-23:** `grep -r 'mcp__' skills/ agents/ commands/` returns nothing. No skill, agent or command names a product for the user to install. All 14 agents are 29 to 31 lines. Skill frontmatter is `name` plus a triggering-condition `description` throughout. The dangling `b2b-saas-analytics` reference is gone.

## Cluster 3 — Middle (Phases 3–5)

- [x] **3.1 — Phase 3: Ideate**
  `ideation-methods`: the four divergence prompts, mechanical distinctness as a deterministic check (different primary user action, written as a sentence), four-axis scoring with confidence read from evidence tags rather than enthusiasm, kill criteria as metric plus threshold plus date, and the cheapest-test catalogue with cost bands and the 20% rule. Agent `solution-architect`, command `/bos-ideate`, test prompt.

- [x] **3.2 — Phase 4: Shape**
  `spec-writing`: scope boundaries in three forms (not now, not ever, not until X), the adjective test for acceptance criteria, six states per flow, four edge-case categories, and tracking designed backwards from the phase 2 metric before the build. `ux-architecture`: placement with a current-versus-proposed diff, flows with every entry point and an explicit abandonment behavior, six states with real error copy, the three-way component inventory, and the accessibility floor as keyboard path, contrast ratio and focus behavior. Agents `spec-writer` and `ux-architect`, command `/bos-shape`, two test prompts. Interop with a design-quality toolchain is a session check, never an install prompt.

- [x] **3.3 — Phase 5: Build**
  `delivery-discipline`: tracer-bullet slices with explicit blocking edges and a computed critical path, a pasted test baseline before any change, the red-green loop with "watch it fail" as a named step, two-axis review that catches a well-built misunderstanding, the scope-creep check against the phase 4 out-of-scope list, and instrumentation verified by arrival rather than by reading the call site. Agents `delivery-planner` and `build-reviewer`, command `/bos-build`, test prompt. Delegates the implementation loop to a delivery toolchain where one is present, natively otherwise.

- [x] **3.4 — Structural verification and commit**
  Every new skill carries a Capabilities table with a stated floor, a numbered Procedure and an output contract. No new agent is longer than 35 lines, and none holds procedure. Frontmatter valid throughout. Behavioral verification (gate 5 proving the mapping with pasted output; the scope-creep check catching a planted item) requires a live session and is open.

---

## Cluster 4 — Close (Phases 6–7) and Release

- [x] **4.1 — Phase 6: Ship**
  `release-ops`: five rollout strategies with the honest note that a full release beats a fake percentage rollout on a small product, rollback as mechanism plus owner plus an actual test, the data-written-while-live question made explicit, irreversibility stated as a fact rather than described away, the baseline captured and timestamped before exposure with its method recorded for phase 7 to rerun, guardrails included, and the production instrumentation check that catches an empty analytics key before launch. Agent `release-manager`, command `/bos-ship`, test prompt.

- [x] **4.2 — Phase 7: Learn**
  The plan called for commands only. Procedure in a command is invisible on a host with no `commands/` directory, so phase 7 gained `outcome-review` like every other phase: the identical-rerun rule, the two separate comparisons against target and against kill criteria, the three honest handlings of an ambiguous result, the override-reading table, and the test that separates a learning from a summary. No new agents: `/bos-learn` orchestrates the analysis cluster against the phase 2 target and the phase 3 kill criteria. `/bos-adr` writes decision records from any phase. Two test prompts.

- [ ] **4.3 — Full-loop test**
  One idea driven 0 → 7 in a single session against a real project. Every gate exercised, every artifact written, every claim audited for a source tag. Not yet executed: requires a live session with the plugin installed.

- [x] **4.4 — Documentation and release**
  README rewritten around the lifecycle with corrected counts (24 skills, 20 agents, 30 commands). `CHANGELOG.md` created with v0.1.0, v0.2.0 and v1.0.0 entries, including the known limitations. Version bumped to `1.0.0` in `package.json` and `.claude-plugin/plugin.json`. `docs/architecture.md` phase map no longer marks phases 3–7 as pending.

- [x] **4.5 — Retro-tick the v0.2 plan**
  All 34 boxes in `docs/plans/2026-04-29-strategy-vision-cluster.md` ticked and the plan marked closed, with a note that the v1.0 retrofit has since rewritten much of what it produced: read it as a record of how v0.2 was built, not as a description of the current files.

## Test Strategy

The existing `tests/skill-triggering/prompts/` holds prompt files with no runner and no pass criteria. Cluster 1 adds `tests/skill-triggering/README.md` defining the manual protocol (run prompt in a clean session, record which skill triggered, expected vs. actual), and each new skill ships its prompt file alongside. A runner is out of scope for v1.0: the gate checks are the mechanical safety net, and a triggering harness needs a real eval loop that deserves its own spec.

Per-cluster verification is the gate model turned on itself: a cluster is done when its agents demonstrably refuse to advance on a failed gate. That refusal is the feature.

---

## Risks

**Scope.** v1.0 is 8 skills, 8 agents and 12 commands. Cluster 1 alone is shippable and already useful. If momentum drops, stop after Cluster 2 and release as v0.5 — an idea can enter the system and reach a defined opportunity, which is the half that does not exist today.

**Gate fatigue.** Eight gates can feel bureaucratic on a small feature. Mitigation: `/bos-init` asks for project size and sets a `mode` in `state.json`; `lite` mode collapses gates 3–6 to their hard conditions only. To be specified in Cluster 3, not before there is evidence the fatigue is real.

**Overlap with the `pm-*` surface.** Two prefixes can confuse. Mitigation: the hub is explicit that `bos-` walks a pipeline and `pm-` answers a question, and `/bos-learn` is the single documented bridge between them.
