# BuilderOS v1.0 — Lifecycle OS: Design Spec

**Date:** 2026-09-20
**Status:** Draft — pending approval
**Scope:** Repositioning BuilderOS from an operational PM toolkit into a full idea → production lifecycle OS
**Supersedes:** the implicit v0.1/v0.2 architecture (8 analytics agents + 3 strategy agents, no delivery layer)

---

## Problem Statement

BuilderOS today covers the **back half** of product work. Eleven agents diagnose health, analyze growth, design tracking, model finances, assess PMF, select North Stars, write OKRs and PRDs. Every one of them assumes a product that already exists and already emits data.

Someone arriving with an idea or a problem — not a product — gets nothing. There is no path from "I think X is broken for Y" to code running in production. The phases between framing a problem and measuring a launch (research, opportunity mapping, solution selection, UX shaping, delivery discipline, release ops) are entirely absent.

This spec defines the full lifecycle, assigns one or more skills to every phase, and makes the pipeline *stateful*: each phase writes a durable artifact that the next phase reads, and cannot be entered until the previous gate passes.

---

## Design Influences

Three projects solved adjacent problems well. BuilderOS borrows their **patterns**, not their code — it stays self-contained and installable on its own.

| Source | Pattern borrowed | How BuilderOS applies it |
|--------|-----------------|--------------------------|
| [obra/superpowers](https://github.com/obra/superpowers) | Phase discipline with hard refusal to skip ahead: `brainstorming` → `writing-plans` → `test-driven-development` → `requesting-code-review` → `finishing-a-development-branch`. Core rules: "evidence over claims", "verify before declaring success". | The **gate model**. Each lifecycle phase has mechanical exit criteria. RED-GREEN-REFACTOR maps to product work as hypothesis → test → evidence → decision. |
| [mattpocock/skills](https://github.com/mattpocock/skills) | Small composable skills over one mega-workflow; `grilling` as a reusable interview primitive; `CONTEXT.md` + ADRs as durable shared language; tracer-bullet tickets; explicit user-invoked vs model-invoked split. | The **pressure-test primitive** (`pressure-testing` skill, callable from any gate) and the split between user-invoked phase commands and model-invoked method skills. |
| [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | `PRODUCT.md` holding durable product truth, deliberately separated from surface-level direction; 61 deterministic detector rules that run without an LLM call; `init` as the entry point. | The **spine artifact** (`PRODUCT.md`) and **deterministic gate checks** — a gate failure must be mechanically decidable, not a matter of taste. |

Interop, not dependency: if Superpowers or Impeccable are installed alongside BuilderOS, the Build and Shape phases detect them and hand off. If not, BuilderOS's own skills carry the phase. No external install is ever required.

---

## Architecture

```
                      PRODUCT.md  (durable truth, written once at init, amended rarely)
                            │
   ┌────┬────────┬────────┬─┴──────┬────────┬────────┬────────┬────────┐
   │ 0  │   1    │   2    │   3    │   4    │   5    │   6    │   7    │
 FRAME  DISCOVER  DEFINE   IDEATE   SHAPE    BUILD    SHIP    LEARN
   │       │        │        │        │        │        │        │
  gate    gate     gate     gate     gate     gate     gate     gate
   │       │        │        │        │        │        │        │
   └───────┴────────┴────────┴────────┴────────┴────────┴────────┴──► .builderos/
                                                                       phase artifacts
                                    ▲                                        │
                                    └────────────────────────────────────────┘
                                         LEARN feeds DISCOVER or DEFINE
```

Design thinking (Empathize → Define → Ideate → Prototype → Test) covers phases 0–4. Product development and delivery cover 5–7. The loop closes: LEARN is not a terminus, it re-enters the pipeline with evidence.

### The Spine

Two persistent structures, both in the working directory:

**`PRODUCT.md`** — durable product truth: who it is for, the problem, the ICP, constraints, voice, non-goals. Written by `/bos-init`, amended only on strategic change. Separated from phase artifacts so that transient decisions never pollute foundational ones. Replaces the current `references/pm-context-template.md`, which becomes its generator.

**`.builderos/`** — the pipeline state:

```
.builderos/
  state.json          current phase, gate status per phase, timestamps
  00-frame.md         problem statement, riskiest assumption
  01-discovery.md     evidence ledger, JTBD, validated/killed verdict
  02-definition.md    opportunity tree, selected opportunity, success metric
  03-solution-bet.md  options scored, selected bet, kill criteria
  04-spec.md          scope, flows, acceptance criteria, tracking plan
  05-build-plan.md    tracer tickets, test map, review record
  06-release.md       rollout, instrumentation check, baseline capture
  07-outcome.md       result vs hypothesis, keep/kill/iterate decision
  decisions/          ADRs — one file per irreversible decision
```

### The Evidence Ledger

Extends the existing Iron Law ("Never invent data") from a prohibition into a mechanism. Every factual claim in every phase artifact carries a source tag:

```markdown
Activation drops 62% between signup and first call. `[mixpanel:funnel_q3]`
Users describe onboarding as "a second job". `[interview:P3,P7]`
Enterprise buyers need SSO before evaluating. `[assumption:unvalidated]`
```

Four tag classes: `[mcp:*]` live query, `[interview:*]` / `[doc:*]` primary source, `[estimate:*]` derived with stated method, `[assumption:*]` unvalidated. Gates count tags. A phase whose artifact is mostly `[assumption:*]` cannot pass a gate that requires evidence. This is what makes gate checks deterministic rather than a judgment call.

---

## Phase Map

| # | Phase | Question answered | Skills | Agents | Command |
|---|-------|-------------------|--------|--------|---------|
| 0 | **Frame** | What problem, for whom, why now? | `problem-framing` *(new)* | `problem-framer` *(new)* | `/bos-frame` |
| 1 | **Discover** | Is the problem real and painful enough? | `research-methods` *(new)*, `discovery-methods` *(exists)* | `research-planner` *(new)*, `discovery-synthesizer` *(exists)* | `/bos-discover` |
| 2 | **Define** | What opportunity do we attack? | `opportunity-mapping` *(new)*, `strategy-frameworks` *(exists)* | `opportunity-mapper` *(new)*, `product-strategist` *(exists)*, `north-star-analyst` *(exists)* | `/bos-define` |
| 3 | **Ideate** | Which solution do we bet on? | `ideation-methods` *(new)*, `experiment-methodology` *(exists)* | `solution-architect` *(new)*, `experiment-designer` *(exists)* | `/bos-ideate` |
| 4 | **Shape** | What exactly are we building? | `spec-writing` *(new)*, `ux-architecture` *(new)*, `pm-artifacts` *(exists)* | `spec-writer` *(new)*, `ux-architect` *(new)*, `product-writer` *(exists)* | `/bos-shape` |
| 5 | **Build** | Does it work, and is it the right thing? | `delivery-discipline` *(new)*, `tracking-standards` *(exists)* | `delivery-planner` *(new)*, `build-reviewer` *(new)*, `tracking-architect` *(exists)* | `/bos-build` |
| 6 | **Ship** | Is it live, measured, announced, reversible? | `release-ops` *(new)*, `pm-artifacts` *(exists)* | `release-manager` *(new)*, `product-writer` *(exists)* | `/bos-ship` |
| 7 | **Learn** | Did it move the number? What now? | `saas-metrics-reference`, `growth-frameworks`, `okr-frameworks` *(all exist)* | `product-diagnostician`, `growth-architect`, `finance-analyst`, `okr-architect`, `competitive-analyst` *(all exist)* | `/bos-learn` |

Cross-cutting, model-invoked, callable from any phase: `pressure-testing` *(new)*, `evidence-ledger` *(new)*, `gate-checks` *(new)*.

Eleven of the existing agents and eight of the existing skills survive unchanged and get placed on the map. Nothing built in v0.1/v0.2 is thrown away: the analytics cluster becomes phase 7, the strategy cluster becomes phase 2, the writing cluster splits across phases 4 and 6.

---

## Phase Definitions

Each phase below states its gate. A gate is a list of conditions that a script or a mechanical read of the artifact can decide. Agents refuse to advance past a failed gate and say exactly which condition failed.

### Phase 0 — Frame

**Input:** a sentence from a human. "Sales reps waste time on manual call logging."
**Work:** separate problem from solution; name the ICP; state why now; surface the single riskiest assumption; check the problem is not already solved (quick competitive scan via `competitive-analyst`).
**Output:** `.builderos/00-frame.md` + first draft of `PRODUCT.md`.

**Gate 0:**
- Problem statement contains no solution language (deterministic: no "build", "add", "app", "platform", "dashboard" in the problem sentence)
- Exactly one primary ICP named, with a size estimate carrying a source tag
- Riskiest assumption stated as a falsifiable sentence
- "Why now" cites a change in the world, not a preference

### Phase 1 — Discover

**Input:** `00-frame.md`.
**Work:** design the research plan (who to talk to, how many, what to ask — JTBD-style, non-leading); run or ingest interviews; mine existing sources (Notion, Readwise, Raindrop, support tickets, analytics if a product exists); synthesize into an evidence ledger; return a verdict.
**Output:** `.builderos/01-discovery.md`.

**Gate 1:**
- ≥5 evidence units from primary sources (`[interview:*]`, `[doc:*]`, `[mcp:*]`), not `[assumption:*]`
- Each evidence unit attributed to a distinct source
- Explicit verdict: `VALIDATED` / `KILLED` / `RESHAPED` with the reasoning
- If `KILLED`, pipeline stops and says so. Killing a problem is a successful outcome, not a failure.
- JTBD statement in the form "When \_\_\_, I want to \_\_\_, so I can \_\_\_"

### Phase 2 — Define

**Input:** `01-discovery.md`, `PRODUCT.md`.
**Work:** build the opportunity solution tree from the evidence; size and score each opportunity; select one; connect it to strategy (PMF stage via `product-strategist`, metric via `north-star-analyst`); define the success metric with its current baseline.
**Output:** `.builderos/02-definition.md`.

**Gate 2:**
- Opportunity tree has ≥3 opportunities, each traceable to a Phase 1 evidence tag
- Exactly one opportunity selected, with the rejection reason for the others
- Success metric named, with baseline and target, both source-tagged
- Selected opportunity coherent with the PMF stage (pre-PMF products do not get scale bets)

### Phase 3 — Ideate

**Input:** `02-definition.md`.
**Work:** generate ≥3 genuinely distinct solution options (not variations of one); score on impact / confidence / effort / reversibility; select the bet; write kill criteria *before* building; design the cheapest test of the riskiest assumption (fake door, prototype, concierge, Wizard of Oz).
**Output:** `.builderos/03-solution-bet.md`.

**Gate 3:**
- ≥3 options, each with a distinct mechanism (deterministic check: different primary user action)
- Selected bet has kill criteria: a metric, a threshold, a date
- Riskiest assumption has a designed test with a cost estimate
- If the test costs less than 20% of the build, the test runs first. Non-negotiable.

### Phase 4 — Shape

**Input:** `03-solution-bet.md`.
**Work:** write the spec (scope in/out, user flows, states, edge cases, acceptance criteria); design the UX (information architecture, flows, component inventory, accessibility floor); define the tracking plan *before* the build, not after; detect Impeccable and hand off visual craft if present.
**Output:** `.builderos/04-spec.md`, `DESIGN.md`.

**Gate 4:**
- Every acceptance criterion written as a testable assertion
- Explicit out-of-scope list (an empty one fails the gate)
- Every user flow has an error and an empty state
- Tracking plan names the events that will measure the Phase 2 success metric
- Accessibility floor stated (keyboard path, contrast, focus order)

### Phase 5 — Build

**Input:** `04-spec.md`.
**Work:** decompose into tracer-bullet tickets with blocking edges; establish a test baseline; drive implementation test-first; review against both standards and spec; verify instrumentation is actually firing.
**Output:** `.builderos/05-build-plan.md`, code.

**Gate 5:**
- Every acceptance criterion maps to ≥1 test, and those tests pass (evidence: pasted output, not a claim)
- No ticket merged without review against spec
- Tracking events verified firing in a real environment
- Out-of-scope items from Gate 4 did not get built (scope-creep check)

Interop: if Superpowers is installed, `/bos-build` delegates to its `writing-plans` → `test-driven-development` → `requesting-code-review` chain and only owns the spec-conformance and instrumentation checks. If not, `delivery-discipline` carries them natively.

### Phase 6 — Ship

**Input:** `05-build-plan.md`.
**Work:** rollout plan (flag, canary, percentage); rollback path; pre-launch instrumentation verification; baseline capture *before* exposure; release notes; launch assets; internal comms.
**Output:** `.builderos/06-release.md`.

**Gate 6:**
- Rollback path documented and tested
- Baseline of the success metric captured with a timestamp, before exposure
- Dashboards or queries exist for the success metric
- Release notes written for the actual audience, not the changelog
- Owner and check-in date for the outcome review

### Phase 7 — Learn

**Input:** `06-release.md` + live data.
**Work:** measure actual vs. hypothesized; run the existing analytics cluster (health, growth, finance, cohorts); judge against the Phase 3 kill criteria; write the ADR; decide keep / iterate / kill; feed the next cycle.
**Output:** `.builderos/07-outcome.md`, `.builderos/decisions/ADR-*.md`.

**Gate 7:**
- Actual result stated with a source tag, compared to the Phase 2 target
- Kill criteria from Phase 3 explicitly evaluated
- Decision recorded: `KEEP` / `ITERATE` / `KILL`, with the next phase entry point
- Learning generalized into one sentence that outlives the feature

---

## Cross-Cutting Skills

### `pressure-testing` (model-invoked)

A reusable interview primitive, modeled on Pocock's `grilling`. Any gate can call it. It asks adversarial questions until every branch of a decision is resolved or explicitly deferred: "What would have to be true for this to be wrong?", "Which evidence would change your mind?", "What is the cheapest way to find out you are wrong?". Ends when no unresolved branch remains, not when the user seems satisfied.

### `evidence-ledger` (model-invoked)

Owns the tagging grammar, the source hierarchy, and the counting rules used by gates. Single source of truth for what counts as evidence.

### `gate-checks` (model-invoked)

Holds the machine-checkable conditions for all eight gates plus the refusal protocol: name the failed condition, state what would satisfy it, offer the cheapest path to satisfy it, do not advance. Borrowed directly from Impeccable's detector philosophy — mechanical, boring, non-negotiable.

---

## Command Surface

**Lifecycle (new, `bos-` prefix):**

| Command | Purpose |
|---------|---------|
| `/bos` | Stateful hub. Reads `state.json`, reports where the project stands, routes to the next phase |
| `/bos-init` | Creates `PRODUCT.md` and `.builderos/`. Entry point for any new idea |
| `/bos-frame` … `/bos-learn` | The eight phase commands |
| `/bos-gate` | Runs the current phase's gate check and reports pass/fail per condition |
| `/bos-status` | One-screen pipeline state: phases done, gates passed, blocking condition |
| `/bos-adr` | Records an architectural or product decision |

**Analysis (existing, `pm-` prefix, unchanged):** all 16 current commands stay. They are the phase-7 toolbox and remain usable standalone on an existing product. No breaking change for current users.

The two prefixes are the honest reflection of two jobs: `bos-` walks a pipeline, `pm-` answers a question.

---

## What Changes for Existing Assets

| Asset | Change |
|-------|--------|
| `skills/pm-toolkit/SKILL.md` | Stays as the analysis hub; loses its claim to be *the* hub. New `skills/builder-os/SKILL.md` becomes the lifecycle hub and routes to `pm-toolkit` for phase 7 |
| `references/pm-context-template.md` | Becomes the `PRODUCT.md` generator, extended with ICP, non-goals, voice, constraints |
| 11 existing agents | Unchanged files; each gets a phase assignment row in the new hub |
| Tri-modal detection | Unchanged and inherited by every new agent. It is the most valuable thing v0.1 built |
| Iron Law | Extended into the evidence ledger. Same principle, now mechanically enforced |
| `README.md` | Full rewrite. Currently claims 8 agents and 11 commands — both wrong since v0.2 |
| Version | `0.1.0` → `1.0.0` in `package.json` and `.claude-plugin/plugin.json`, with a `CHANGELOG.md` |

---

## Build Order

Four clusters, each independently shippable and independently useful.

1. **Spine** — `builder-os` hub skill, `/bos-init`, `/bos`, `/bos-status`, `/bos-gate`, `PRODUCT.md` template, `.builderos/` schema, the three cross-cutting skills. Nothing else works without this.
2. **Front half (0–2)** — Frame, Discover, Define. The part that is missing entirely and the part that makes the promise true: an idea can now enter the system.
3. **Middle (3–5)** — Ideate, Shape, Build. The largest cluster; where interop with Superpowers and Impeccable lands.
4. **Close (6–7)** — Ship, plus the rewiring of the existing analytics cluster into Learn. Mostly integration; the agents already exist.

Ordered by dependency, not by value: the spine gates everything, and the front half is what currently returns nothing to a new user.

---

## Open Questions

1. `.builderos/` committed to the repo or gitignored? Committed makes it shared team memory; gitignored keeps it personal. Default proposal: committed, because product decisions belong in version control next to the code they caused.
2. Does `/bos-build` write code itself, or only plan and review it? Proposal: plans, reviews and verifies instrumentation; writing the code stays with the human or with Superpowers. BuilderOS is a product OS, not a coding agent.
3. Gate strictness: hard refusal, or refusal with an explicit `--override` that gets logged in `state.json`? Proposal: the override exists and is logged. Undocumented bypasses are worse than documented ones.

---

## Success Criteria for v1.0

Someone with an idea, no product and no analytics runs `/bos-init`, answers questions for twenty minutes, and walks out of phase 2 with a validated (or killed) problem, a named opportunity and a success metric with a baseline — without a single fabricated number anywhere in the artifacts.
