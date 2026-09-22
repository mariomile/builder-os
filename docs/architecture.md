# Architecture

How the pieces fit. Start at the [README](../README.md) for what BuilderOS does; this is how it is built.

---

## 1. The inversion

The single decision that shapes everything else: **skills hold the procedure, agents are adapters.**

```mermaid
flowchart LR
    subgraph before["before — Claude-only"]
        direction TB
        B1["agents/x.md<br/>~200 lines<br/>numbered phases<br/>hardcoded tool calls"]
        B2["skills/y/SKILL.md<br/>reference material<br/>frameworks, tables"]
        B1 -->|loads as background| B2
    end
    subgraph after["after — host-agnostic"]
        direction TB
        A1["agents/x.md<br/>~30 lines<br/>role, Iron Law<br/>context contract"]
        A2["skills/y/SKILL.md<br/>method + PROCEDURE<br/>capabilities + floors<br/>output contract + gate"]
        A1 -->|run its procedure| A2
    end
    before ==>|invert| after

    classDef bad fill:#fce8e6,stroke:#d93025,color:#111
    classDef good fill:#e6f4ea,stroke:#34a853,color:#111
    class B1,B2 bad
    class A1,A2 good
```

Before the inversion, loading a BuilderOS skill on a host without subagents gave you a PMF scoring table and no idea what to do with it. The workflow lived in a Claude Code construct.

After it, the skill is self-executing. The agent adds only what a *delegated* context needs: who it is, its Iron Law, the context package it receives, how to report.

**Enforced by contract.** An agent longer than about 40 lines has almost certainly stolen something from its skill. See `CLAUDE.md`.

---

## 2. Layers

```mermaid
flowchart TB
    U([user]) --> ENTRY
    subgraph ENTRY["entry points"]
        direction LR
        SLASH["/bos-* /pm-*<br/>Claude Code"]
        NAME["name the skill<br/>Codex, others"]
    end
    ENTRY --> HUB
    subgraph HUB["hubs"]
        direction LR
        BOS["builder-os<br/>stateful pipeline"]
        PM["pm-toolkit<br/>stateless questions"]
    end
    HUB --> PHASE["phase skills<br/>problem-framing, research-methods,<br/>opportunity-mapping, …"]
    PHASE --> CROSS
    subgraph CROSS["cross-cutting, model-invoked"]
        direction LR
        GC["gate-checks"]
        EL["evidence-ledger"]
        PT["pressure-testing"]
    end
    PHASE --> CAP["capability resolution"]
    CAP --> DATA[("analytics · db · docs<br/>tickets · meetings · repo")]
    PHASE --> ART[("PRODUCT.md<br/>.builderos/")]

    classDef store fill:#f1f3f4,stroke:#5f6368,color:#111
    class DATA,ART store
```

`references/` sits beside all of it: templates, the state schema, the capability map. Not a layer, a shared vocabulary.

---

## 3. Instruction files

Which file the host reads as project instructions, and why this repo is arranged the way it is.

```mermaid
flowchart TD
    START([host starts in repo]) --> WHICH{which host?}
    WHICH -->|Codex and other<br/>AGENTS.md readers| RA["reads AGENTS.md<br/>directly"]
    WHICH -->|Claude Code| CC{"CLAUDE.md present in cwd<br/>or any directory above?"}
    CC -->|no| RA2["reads AGENTS.md<br/>directly"]
    CC -->|yes| RC["reads CLAUDE.md only<br/>AGENTS.md ignored"]
    RC --> IMP{"does CLAUDE.md<br/>import AGENTS.md?"}
    IMP -->|no| DRIFT["shared contract shadowed<br/>two files drift"]
    IMP -->|yes| BOTH["CLAUDE.md + AGENTS.md<br/>single source, both hosts"]

    classDef bad fill:#fce8e6,stroke:#d93025,color:#111
    classDef good fill:#e6f4ea,stroke:#34a853,color:#111
    class DRIFT bad
    class BOTH,RA,RA2 good
```

This repo takes the right-hand path: `CLAUDE.md` starts with `@AGENTS.md`.

| File | Holds | Read by |
|------|-------|---------|
| `AGENTS.md` | Architecture, design principles, non-negotiables, portability rules, skill contract, testing, contributing | Codex directly; Claude Code through the import |
| `CLAUDE.md` | Adapter directories, agent contract, command contract, dispatch context package | Claude Code |

**Rule for contributors:** true on every host → `AGENTS.md`. About subagents, slash commands or the plugin manifest → `CLAUDE.md`. Never the same rule in both.

Two things worth knowing. A `CLAUDE.md` *above* the working directory also suppresses direct `AGENTS.md` reading, which matters when BuilderOS sits inside a larger repo. And direct reading needs a recent Claude Code, while the import works regardless. Both are reasons the import is not optional here.

---

## 4. The artifact chain

Every phase consumes the previous artifact and produces the next. This is what makes the pipeline stateful rather than a themed prompt sequence.

```mermaid
flowchart LR
    F["00-frame.md<br/>problem · ICP<br/>riskiest assumption"] --> D["01-discovery.md<br/>evidence ledger<br/>JTBD · verdict"]
    D --> DF["02-definition.md<br/>opportunity tree<br/>success metric"]
    DF --> B["03-solution-bet.md<br/>options · bet<br/>kill criteria"]
    B --> SP["04-spec.md<br/>scope · flows<br/>acceptance criteria"]
    SP --> BP["05-build-plan.md<br/>tickets · test map"]
    BP --> RL["06-release.md<br/>rollout · baseline"]
    RL --> OC["07-outcome.md<br/>actual vs target<br/>decision"]
    OC -.->|next cycle| D

```

`PRODUCT.md` sits outside the chain and is read by every phase.

Concretely, what each phase inherits:

| Phase | Reads | Extracts from it |
|-------|-------|------------------|
| 1 Discover | `00-frame.md` | The riskiest assumption becomes the research target; reachability shapes recruiting; prior-art class shapes who to chase first |
| 2 Define | `01-discovery.md` | Every evidence tag becomes a candidate node in the opportunity tree |
| 3 Ideate | `02-definition.md` | The selected opportunity and the metric the bet must move |
| 4 Shape | `03-solution-bet.md` | The bet, its kill criteria, the assumption still to test |
| 5 Build | `04-spec.md` | Acceptance criteria map one-to-one to tests |
| 6 Ship | `05-build-plan.md` | What to roll out, what to instrument |
| 7 Learn | `06-release.md` + live data | Baseline and target to judge against |

`PRODUCT.md` is separate on purpose: it holds identity, not decisions. It changes when the ICP or the problem changes, never because a feature shipped.

---

## 5. The eight gates

Full conditions in `skills/gate-checks/SKILL.md`. The shape of each:

| Gate | Refuses to pass when |
|------|---------------------|
| 0 Frame | Problem statement contains solution language · no single ICP with a sourced size · riskiest assumption not falsifiable · why-now is a preference, not a dated change |
| 1 Discover | Fewer than 5 primary evidence units from 5 distinct sources · no explicit verdict · no JTBD · disconfirming evidence never sought |
| 2 Define | Fewer than 3 traced opportunities · no written rejections · **baseline is an estimate** · scale bet at pre-PMF |
| 3 Ideate | Options share the same primary user action · kill criteria missing a metric, threshold or date · riskiest assumption has no priced test |
| 4 Shape | Acceptance criteria not testable · out-of-scope list empty · flows missing error and empty states · tracking plan does not measure the phase 2 metric |
| 5 Build | An acceptance criterion with no test · tests claimed rather than shown · instrumentation not verified firing · out-of-scope items got built |
| 6 Ship | No rollback path · baseline captured after exposure · no dashboard for the metric · no outcome review scheduled |
| 7 Learn | Actual not compared to target · kill criteria never evaluated · no keep/iterate/kill decision |

Two design notes.

**`KILLED` is a pass.** Phase 1 returning "this problem is not worth solving" stops the pipeline and is the cheapest outcome the system can produce. It is reported as a win.

**Lite mode** relaxes elaboration conditions for small features, and never relaxes the ones that prevent building on fiction: evidence thresholds, kill criteria, test mapping, rollback, baseline.

---

## 6. Phase map

| # | Phase | Skills | Agents | Command |
|---|-------|--------|--------|---------|
| 0 | Frame | `problem-framing` | `problem-framer` | `/bos-frame` |
| 1 | Discover | `research-methods`, `discovery-methods` | `research-planner`, `discovery-synthesizer` | `/bos-discover` |
| 2 | Define | `opportunity-mapping`, `strategy-frameworks` | `opportunity-mapper`, `product-strategist`, `north-star-analyst` | `/bos-define` |
| 3 | Ideate | `ideation-methods`*, `experiment-methodology` | `solution-architect`*, `experiment-designer` | `/bos-ideate`* |
| 4 | Shape | `spec-writing`*, `ux-architecture`*, `pm-artifacts` | `spec-writer`*, `ux-architect`*, `product-writer` | `/bos-shape`* |
| 5 | Build | `delivery-discipline`*, `tracking-standards` | `delivery-planner`*, `build-reviewer`*, `tracking-architect` | `/bos-build`* |
| 6 | Ship | `release-ops`*, `pm-artifacts` | `release-manager`*, `product-writer` | `/bos-ship`* |
| 7 | Learn | `saas-metrics-reference`, `growth-frameworks`, `okr-frameworks`, `financial-models` | `product-diagnostician`, `growth-architect`, `finance-analyst`, `okr-architect` | `/bos-learn`* |

`*` not yet shipped. Their gates exist and are enforceable; the hub runs those phases inline against `gate-checks` and says which specialist is missing rather than faking a dispatch.

Cross-cutting, callable from any phase: `gate-checks`, `evidence-ledger`, `pressure-testing`.

---

## 7. Capabilities

Fifteen named capabilities, resolved at runtime by matching the tools a session actually exposes. Never by name, never assumed.

```
analytics.query · analytics.events · analytics.replay
db.query
docs.search · docs.read · docs.write
tickets.read · meetings.read · research.search
web.search · web.fetch
repo.read · files.read · files.write
subagent.dispatch
```

`files.read` and `files.write` are the only ones always assumed — `.builderos/` depends on them. Everything else has a degradation ladder and a floor, listed in [`../references/capability-map.md`](../references/capability-map.md).

The operating mode is a *summary* of what resolved, not a list of installed products:

| Mode | Resolved | Consequence |
|------|----------|-------------|
| connected | `analytics.query` or `db.query` | Real baselines; gates 2.4, 5.3, 6.2 satisfiable |
| vault-based | `docs.search` over local notes | Phases 0–4 fully usable |
| codebase-based | `repo.read` only | Phases 4–6 strongest |
| conversational | nothing beyond files | Phases 0–3 fully usable |

An idea with no product and no data is the normal entry point, not a degraded one.

---

## 8. Design debt

Stated plainly rather than discovered later.

| Debt | Size | Plan |
|------|------|------|
| 11 legacy agents carry ~74 hardcoded tool references, several of them one user's connector instances | Large | Cluster 5, before 1.0.0 |
| Those agents also hold procedure that belongs in their skills | Large | Same cluster |
| Version is 0.1.0 while the repo is mid-v1.0 | Small | Release cluster |
| No automated skill-triggering harness — prompts exist, no runner | Medium | Out of scope for v1.0; gates are the mechanical safety net |
| Runtime verification of the v1.0 surface not yet executed | Medium | Tasks 1.9, 2.6, 2b.6 in the plan |

Roadmap: [`plans/2026-09-20-lifecycle-os-v1.md`](plans/2026-09-20-lifecycle-os-v1.md).
