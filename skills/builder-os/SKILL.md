---
name: builder-os
description: "Use when taking an idea or problem toward a shipped product — framing a problem, planning research, mapping opportunities, choosing a bet, shaping a spec, driving delivery, releasing, or reviewing an outcome"
---

# BuilderOS — Lifecycle Hub

The operating system for taking an idea or a problem to a product running in production. Eight phases, each with its own skills and agents, each ending at a gate that cannot be argued with.

**REQUIRED BACKGROUND:** `gate-checks` before advancing any phase. `evidence-ledger` before writing any artifact. `pressure-testing` whenever a gate fails on reasoning rather than on missing work. `references/capability-map.md` before touching any data source.

## Host Independence

This skill and every skill it routes to run on any agent that can read files and follow instructions. Nothing here names a tool, a connector or a vendor: phases name capabilities and resolve them at runtime.

Where a host can delegate to a separate agent, phases run in isolated contexts. Where it cannot, the same procedures run inline. The procedures live in the skills, so both paths produce the same artifacts and enforce the same gates.

## Iron Law

**Never invent data.** Stated once, in `evidence-ledger`: every claim carries a tag, every tag resolves to a file in `evidence/`, and gates count them.

## The Pipeline

```
FRAME → DISCOVER → DEFINE → IDEATE → SHAPE → BUILD → SHIP → LEARN
  0         1         2        3        4       5      6      7
  └─────────────────────────── gates ───────────────────────────┘
                                                                │
                            LEARN re-enters DISCOVER or DEFINE ─┘
```

Phases 0–4 are design thinking: empathize, define, ideate, prototype, test. Phases 5–7 are delivery and learning. The loop closes — phase 7 is not a terminus.

## Phase Routing

| Phase | Intent | Skills | Agents | Command |
|-------|--------|--------|--------|---------|
| **0 Frame** | "I have an idea", "X is broken for Y", problem framing | `problem-framing` | `problem-framer` | `/bos-frame` |
| **1 Discover** | Talk to users, validate the problem, synthesize research | `research-methods`, `discovery-methods` | `research-planner`, `discovery-synthesizer` | `/bos-discover` |
| **2 Define** | Which opportunity, which metric, does it fit the strategy | `opportunity-mapping`, `strategy-frameworks` | `opportunity-mapper`, `product-strategist`, `north-star-analyst` | `/bos-define` |
| **3 Ideate** | Solution options, which bet, how to test it cheaply | `ideation-methods`, `experiment-methodology` | `solution-architect`, `experiment-designer` | `/bos-ideate` |
| **4 Shape** | Spec, scope, flows, UX, acceptance criteria, tracking plan | `spec-writing`, `ux-architecture`, `pm-artifacts` | `spec-writer`, `ux-architect`, `product-writer` | `/bos-shape` |
| **5 Build** | Decompose, test-first, review against spec, verify instrumentation | `delivery-discipline`, `tracking-standards` | `delivery-planner`, `build-reviewer`, `tracking-architect` | `/bos-build` |
| **6 Ship** | Rollout, rollback, baseline capture, release notes | `release-ops`, `pm-artifacts` | `release-manager`, `product-writer` | `/bos-ship` |
| **7 Learn** | Did it move the number, keep/iterate/kill | `outcome-review`, `saas-metrics-reference`, `growth-frameworks`, `okr-frameworks` | `product-diagnostician`, `growth-architect`, `finance-analyst`, `okr-architect` | `/bos-learn` |

Cross-cutting, model-invoked from any phase: `gate-checks`, `evidence-ledger`, `pressure-testing`. When it is unclear which phase or skill a request belongs to, `using-builder-os` finds out by asking.

Chains: `/bos-discovery-sprint` runs phases 0 → 1 → 2 in one session with gates enforced between steps. `/bos-adr` is callable from any phase, the moment a decision becomes expensive to unwind.

The Command column lists the Claude Code slash-command entry points. On hosts without slash commands, name the phase or the skill instead: the skills are the product, the commands are one host's front door.

### Availability

All eight phases are live: every phase has its own skills, its own procedure and its enforceable gate. `/bos-discovery-sprint` chains 0 → 1 → 2 in one session, and `/bos-adr` writes a decision record from any phase.

Phase 7 adds no new specialist. It orchestrates the analysis surface (`product-diagnostician`, `growth-architect`, `finance-analyst`, `okr-architect`) against the phase 2 target and the phase 3 kill criteria, and `outcome-review` holds the judging procedure so the phase runs on a host with no agents at all.

If a skill or agent this hub names is genuinely unreachable in a session, do not fabricate a dispatch and do not silently skip. Say what is missing, then run the phase inline using this hub, `pressure-testing` for the interview and `gate-checks` for the exit conditions, writing the same artifact to `.builderos/`.

## Run Protocol

Host-agnostic. Every step below works whether or not this host can delegate to a separate agent.

Before starting any phase:

1. **Read `.builderos/ROADMAP.md`, resolve the active initiative and read its `state.json`.** The roadmap says what is in flight; the active initiative's state says which phase is current and which gates passed. Everything below applies to that initiative, in its folder `.builderos/initiatives/{initiative}/`. If `.builderos/` does not exist, offer initialization — do not guess a phase.
2. **Read `PRODUCT.md`, and `TECH.md` from phase 4 on.** Durable truth carries into every phase; technical context carries into every phase that touches code. If `PRODUCT.md` is absent, fall back to `PM-CONTEXT.md`, then to asking.
3. **Resolve capabilities** per `references/capability-map.md` and derive the operating mode.
4. **Read the previous phase artifact.** Every phase consumes the one before it. Starting phase 3 without `02-definition.md` produces confident fiction.
5. **Check the previous gate.** If it did not pass, was not overridden and is not `covered`, refuse and say which condition blocks.

Then run the phase. Two paths, same procedure:

**If `subagent.dispatch` resolved** — delegate to the phase's agent with a context package containing: operating mode and resolved capabilities, pipeline state (phase, cycle, mode), `PRODUCT.md`, the previous phase artifact, the user's request, and the instruction to write `.builderos/initiatives/{initiative}/{NN-name}.md`, update `state.json`, and run the phase gate before reporting. Isolated context per phase, which is the better path where it exists.

**If it did not** — load the phase's skill and run its procedure inline, in sequence, in this conversation. Identical steps, identical artifacts, identical gates. The procedure lives in the skill precisely so that this path loses nothing but context isolation.

Never make the second path apologize for itself. It is the normal path on most hosts.

On either path, the phase is not done when a completion marker appears. The marker is a claim. Re-read the artifact on disk and run the phase gate on it per `gate-checks`; only that result advances `state.json`. A delegated agent that reports success over a missing file or a failing condition has not finished the phase.

After the gate, keep the project memory current in the same step: `ROADMAP.md` gets the initiative's new phase or its closing line, `TECH.md` gets any convention or trap phases 5 and 6 discovered, and a decision that passes the ADR test goes to `decisions/`. The next session knows only what these files say.

## Operating Modes

The mode summarizes which capabilities resolved; definitions and their lifecycle implications live in `references/capability-map.md`. An idea with no product and no data is the normal starting point: phases 0 to 3 need no data capability, only a human who talks to users. When a capability would sharpen the work, say what it would answer, never which product to install.

## Gate Model

A phase advances only through its gate. `gate-checks` holds the conditions; this hub enforces the sequence.

- **Passed** → `current_phase` advances, state written
- **Failed** → refusal with the failed condition, the cheapest path to satisfy it, and no advancement
- **Overridden** → advances, logged in `state.json`, visible in every `/bos-status` from then on
- **Killed** (phase 1 or 7) → pipeline stops. Report it as a win: an unbuilt wrong thing is the cheapest outcome available

Never skip a phase to be helpful. A user who asks to jump from an idea straight to a spec gets one sentence naming what phases 1 and 2 would have caught, and then a choice: run them, or override and proceed with the risk logged. The one sanctioned way to start later is the `feature` track, and it is earned by `PRODUCT.md`, not by the user's confidence.

## Initiatives

A project runs several pieces of work over its life, sometimes at once: a new onboarding in discovery while an export feature ships. Each is an **initiative** with its own folder, its own track, its own phase and gates. `PRODUCT.md`, `TECH.md`, `ROADMAP.md` and `decisions/` are shared across all of them.

One initiative is **active** at a time; every command acts on it. Starting a new one (initialization run again on an initialized project) pauses the current one, never closes it. Switching is explicit and named to the user. An initiative closes at phase 7, at a phase 1 kill, or at a spike's answer, and moves to Done and dropped in the roadmap with its learning.

Two initiatives touching the same part of the product is a signal, not an error: say so when the second one reaches phase 4, because their specs will collide.

## Tracks

Not every request needs all eight phases. Before the first phase runs, classify the work into a track and **say the classification out loud**, with its reason, so the user can correct it: "this is a change to a product that already has evidence behind it, so I'm treating it as a feature and starting at phase 2".

| Track | The request | Runs | Ends |
|-------|-------------|------|------|
| `spike` | "Is X worth doing?", "does anyone actually have this problem?" The output is an answer, not a product | Phases 0 and 1 | The phase 1 verdict is the answer. Status `answered`, pipeline stops |
| `feature` | A change to a product that exists, whose `PRODUCT.md` already carries evidence for the problem and the ICP | Coverage check, then phases 2 to 7 | Phase 7, like any pipeline |
| `product` | A new product, a new segment, or anything whose problem has never been evidenced | Phases 0 to 7 | Phase 7 |

When torn between two tracks, take the heavier one. Choosing a track to avoid work is the doubt itself.

**The coverage check** stands in for phases 0 and 1 on the `feature` track. `gate-checks` holds its conditions. Pass, and phases 0 and 1 are recorded `covered`, each with the `PRODUCT.md` tags that covered it. Fail, and the work is a `product`, starting at phase 0: say which condition failed and why that means the problem has not been evidenced yet.

**The ratchet goes one way.** A track upgrades when the work reveals it was heavier than classified, and never downgrades:

- A `spike` whose answer is "build it" becomes `feature` or `product` by a new classification stated to the user. The spike's phase 0 and 1 artifacts carry over as they are.
- A `feature` upgrades to `product` when a phase 2 or later gate fails because the evidence the covered phases should have supplied is missing: an opportunity that traces to nothing, an ICP that the change does not serve, a problem the phase 2 work contradicts. Re-enter phase 0, keep every artifact written so far, log `track_upgraded` with the observation that forced it.

Stop and say so the moment an upgrade is due. Finishing the current phase on a track already known to be wrong produces an artifact built on the wrong foundation.

## Interop

BuilderOS is self-contained and requires no other plugin. When neighbors are installed, it hands off instead of duplicating:

| Detected | Phase | Handoff |
|----------|-------|---------|
| A plan → TDD → code-review discipline (Superpowers and equivalents) | 5 Build | Delegate the loop. BuilderOS keeps spec conformance, scope-creep and instrumentation checks |
| A design-quality toolchain (Impeccable and equivalents) | 4 Shape | Delegate visual craft and detector runs. BuilderOS keeps IA, flows, states and acceptance criteria |
| Neither, or a host that has neither available | 4, 5 | `ux-architecture` and `delivery-discipline` carry the phase natively |

Detection is a check for what is present in this session, never an install prompt. Absence is the expected case and costs nothing.

## Answers Outside the Pipeline

A standalone question about a product that exists (health, growth, finance, competition, OKRs) is not a pipeline. `using-builder-os` routes it straight to the specialist skill, which answers and writes no state. Phase 7 is the bridge: `outcome-review` uses the same specialists against the phase 2 target and the phase 3 kill criteria.

## Completion Markers

| Phase | Agent | Marker |
|-------|-------|--------|
| 0 | Problem Framer | `## FRAME COMPLETE` |
| 1 | Research Planner | `## DISCOVERY COMPLETE` |
| 2 | Opportunity Mapper | `## DEFINITION COMPLETE` |
| 3 | Solution Architect | `## BET SELECTED` |
| 4 | UX Architect, then Spec Writer | `## DESIGN COMPLETE`, then `## SPEC COMPLETE` |
| 5 | Delivery Planner, then Build Reviewer | `## BUILD VERIFIED` (the reviewer emits it) |
| 6 | Release Manager | `## SHIPPED` |
| 7 | `outcome-review`, over the analytics cluster | `## OUTCOME RECORDED` |

The specialist skills define their own markers in their output contracts.

## Red Flags

| Behavior | Problem | Fix |
|----------|---------|-----|
| Advancing a phase without reading the previous artifact | The output will be confident and unfounded | Read it, or refuse |
| Skipping to phase 4 because "we know what to build" | Phases 1–3 exist to test exactly that belief | Name what is being skipped, offer the override |
| Passing a gate because the user is frustrated | The gate is the only thing preventing expensive fiction | Offer the logged override instead |
| Treating `KILLED` as a failure | Killing early is the highest-ROI outcome in the system | Report it as a successful pass, stop the pipeline |
| Building a phase artifact without updating `state.json` | The pipeline loses its memory | Write both, always |
| Naming a concrete tool or connector in a procedure | Breaks on another host, another stack, another user's connector | Name the capability, resolve it at runtime |
| Skipping a phase because this host cannot delegate | The procedure is in the skill for exactly this reason | Run it inline |
