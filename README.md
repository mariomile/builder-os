# BuilderOS

**The operating system for product builders.** From an idea or a problem to a product running in production, in eight gated phases.

Not a prompt pack. A pipeline with state, evidence rules and gates that refuse to let you build on fiction.

```mermaid
flowchart LR
    I([idea or problem]) --> P0
    P0["0<br/>FRAME"] --> P1["1<br/>DISCOVER"]
    P1 --> P2["2<br/>DEFINE"]
    P2 --> P3["3<br/>IDEATE"]
    P3 --> P4["4<br/>SHAPE"]
    P4 --> P5["5<br/>BUILD"]
    P5 --> P6["6<br/>SHIP"]
    P6 --> P7["7<br/>LEARN"]
    P7 -.->|keep / iterate| P2
    P7 -.->|new evidence| P1
    P1 -.->|KILLED| K(["stop: problem killed"])

    classDef dt fill:#e8f0fe,stroke:#4285f4,color:#111
    classDef dl fill:#e6f4ea,stroke:#34a853,color:#111
    classDef term fill:#fff,stroke:#999,color:#111,stroke-dasharray:3 3
    class P0,P1,P2,P3,P4 dt
    class P5,P6,P7 dl
    class I,K term
```

Phases 0–4 are design thinking: empathize, define, ideate, prototype, test. Phases 5–7 are delivery and learning. Phase 7 re-enters the loop rather than ending it.

Between every pair of phases sits a **gate**.

---

## The three ideas

### 1. Gates you cannot argue with

Each phase ends at a list of conditions decided by *reading* the artifact, not by judging it. Gate 1 does not ask "was the research good?" It asks for five evidence units from five distinct sources and an explicit verdict. Gate 3 wants three options with mechanically different user actions, and kill criteria with a metric, a threshold and a date.

```mermaid
stateDiagram-v2
    [*] --> Working
    Working --> Checking: phase artifact written
    Checking --> Passed: all conditions met
    Checking --> Failed: condition N.N fails
    Failed --> Working: fix the named condition
    Failed --> Overridden: explicit reason, logged forever
    Passed --> [*]: next phase
    Overridden --> [*]: next phase, flagged
    Checking --> Killed: problem did not survive
    Killed --> [*]: pipeline stops. This is a win
```

A failed gate produces the failed condition, what was found, what would satisfy it, and the cheapest path there. Overrides exist, take a written reason, and stay visible in every status report afterwards. An undocumented bypass is worse than a documented one.

Not every request needs all eight phases. Before the first one runs, the work is classified into a **track** and the classification is said out loud: a `spike` wants an answer and stops at the phase 1 verdict, a `feature` changes an existing product and starts at phase 2 once `PRODUCT.md` passes a coverage check, a `product` runs everything. A track only ever upgrades: a feature whose evidence turns out missing becomes a product and re-enters phase 0.

### 2. The evidence ledger

Every factual claim in every artifact carries a source tag:

```markdown
Activation drops 62% between signup and first call.  [mcp:mixpanel:funnel_q3]
Users describe onboarding as "a second job".         [interview:P3,P7]
Enterprise buyers need SSO before evaluating.        [assumption:unvalidated]
```

Gates count the tags. An artifact resting on assumptions cannot pass a gate that requires evidence, and no agent has to exercise taste to decide that. This is what turns "never invent data" from a wish into a mechanism.

Phase 0 is *supposed* to be mostly assumptions. Phase 2 is not: gate 2.4 rejects an estimated baseline outright, because a target measured against a guess makes phase 7 decorative.

### 3. Host-agnostic by construction

The skills hold both the method **and the procedure**. Agents and slash commands are thin adapters over them.

```mermaid
flowchart TB
    subgraph portable["portable — the product"]
        S["skills/<br/>method + procedure"]
        R["references/<br/>templates, state schema, capability map"]
        A["AGENTS.md<br/>shared contract"]
    end
    subgraph adapters["adapters — deletable"]
        AG["agents/<br/>subagent wrappers, ~30 lines"]
        CM["commands/<br/>slash commands"]
        PL[".claude-plugin/<br/>manifest"]
        CL["CLAUDE.md<br/>imports AGENTS.md"]
    end
    AG --> S
    CM --> AG
    CL --> A

    classDef p fill:#e6f4ea,stroke:#34a853,color:#111
    classDef ad fill:#fef7e0,stroke:#f9ab00,color:#111
    class S,R,A p
    class AG,CM,PL,CL ad
```

**The test:** delete `agents/`, `commands/` and `.claude-plugin/`, and BuilderOS still takes someone from idea to production. That is why the procedure lives in the skill.

---

## How a phase actually runs

Same steps, same artifacts, same gates, whatever the host.

```mermaid
flowchart TD
    START([phase requested]) --> ST["read .builderos/state.json"]
    ST --> G{"previous gate<br/>passed?"}
    G -->|no| REF["refuse<br/>name the failed condition"]
    G -->|yes| CAP["resolve capabilities<br/>against this session's tools"]
    CAP --> PREV["read PRODUCT.md<br/>+ previous phase artifact"]
    PREV --> SUB{"host can delegate<br/>to a subagent?"}
    SUB -->|yes| DEL["dispatch agent<br/>isolated context"]
    SUB -->|no| INL["run the skill's procedure<br/>inline, in sequence"]
    DEL --> ART["write .builderos/NN-phase.md"]
    INL --> ART
    ART --> GATE["run this phase's gate"]
    GATE --> OUT([advance, or refuse])

    classDef warn fill:#fce8e6,stroke:#d93025,color:#111
    class REF warn
```

The only difference between the two paths is context isolation, which is a performance property, not a capability. Nothing is unavailable because of the host.

### Capabilities, not tools

No skill names a tool. It names a capability and resolves it at runtime.

```mermaid
flowchart LR
    NEED["phase needs<br/>analytics.query"] --> R{"resolve against<br/>session tools"}
    R -->|found| LIVE["live query<br/>tag: mcp:posthog:funnel_q3"]
    R -->|not found| D1{"numbers recorded<br/>in docs?"}
    D1 -->|yes| DOC["dated figure<br/>tag: doc:board-deck-jul"]
    D1 -->|no| D2{"instrumentation<br/>readable in code?"}
    D2 -->|yes| CODE["tag: code:src/track.ts:42"]
    D2 -->|no| FLOOR["state the gap<br/>ask the user<br/>tag: doc:user-provided"]

    classDef ok fill:#e6f4ea,stroke:#34a853,color:#111
    classDef fl fill:#fef7e0,stroke:#f9ab00,color:#111
    class LIVE,DOC,CODE ok
    class FLOOR fl
```

The floor is always the same: say what could not be retrieved and ask. The floor is never a plausible-sounding number.

A hardcoded tool name breaks three ways at once: on a different agent, on a different analytics stack, and on a different user's connector. So there are none. Full list in [`references/capability-map.md`](references/capability-map.md).

**Prerequisites are zero.** Nothing connected, no API key, no vault, no analytics account: every command still runs and still writes its artifact. Reading and writing files is the only hard dependency.

Analytics in particular is a category, not a product. BuilderOS asks five question shapes (catalogue, volume, funnel, retention, breakdown) and Mixpanel, Amplitude, PostHog, a warehouse or a pasted CSV are all valid answers. The shapes, the provider differences that matter, and the floor for each are in [`references/analytics-contract.md`](references/analytics-contract.md).

---

## Two surfaces

| | Lifecycle | Analysis |
|---|---|---|
| **Hub** | `builder-os` | `pm-toolkit` |
| **Commands** | `/bos-*` | `/pm-*` |
| **Shape** | Stateful, gated, sequential | Stateless, immediate |
| **For** | Taking something from idea to production | Answering a question about an existing product |

`/bos-learn` is the bridge: phase 7 orchestrates the analysis agents against the phase 2 target and the phase 3 kill criteria. Every `/pm-*` command stays usable on its own — if you only want a health scorecard, run `/pm-health` and never touch the pipeline.

---

## Install

### Claude Code

```bash
/plugin marketplace add mariomile/builder-os
```

Skills, agents and slash commands all load. The richest surface: each phase runs in an isolated subagent context.

```
/bos-init        start a pipeline from an idea
/bos             stateful hub — routes to the current phase
/bos-status      pipeline state on one screen
/bos-gate        run the current gate
/bos-frame … /bos-learn
```

### Codex and other agents

`AGENTS.md` at the repo root is picked up automatically. Make `skills/` reachable by your host, then name the phase or the skill instead of a slash command. Phases run inline. Same procedure, same artifacts, same gates.

Details and the per-host difference table: [`docs/hosts.md`](docs/hosts.md).

---

## What's in the box

**25 skills.** Three cross-cutting (`gate-checks`, `evidence-ledger`, `pressure-testing`), two hubs, a session-start bootstrap (`using-builder-os`) that routes between them, and the rest split between the eight lifecycle phases and the analysis surface.

**20 agents.** Claude Code adapters, none longer than 35 lines by contract. They name the skill they load and add only what a delegated context needs: role, Iron Law, context contract, reporting.

**30 commands.** Fourteen `/bos-*`, sixteen `/pm-*`.

### Pipeline state

```
PRODUCT.md              durable truth: ICP, problem, non-goals, constraints, voice
.builderos/
  state.json            current phase, gate status, override log, history
  00-frame.md           problem, ICP, riskiest assumption
  01-discovery.md       evidence ledger, JTBD, VALIDATED / KILLED / RESHAPED
  02-definition.md      opportunity tree, selected bet, success metric
  03-solution-bet.md    options scored, kill criteria
  04-spec.md            scope, flows, acceptance criteria, tracking plan
  05-build-plan.md      tracer tickets, test map, review record
  06-release.md         rollout, instrumentation check, baseline
  07-outcome.md         actual vs target, keep / iterate / kill
  decisions/            ADRs
```

Each phase reads the one before it. Starting phase 3 without `02-definition.md` produces confident fiction, so the hub refuses.

---

## Status

Version 1.0.0. Honest state:

| Area | Status |
|------|--------|
| Spine — state, gates, evidence ledger, pressure testing, `/bos-init`, `/bos`, `/bos-status`, `/bos-gate` | Shipped |
| Phases 0–7 — all eight, each with its own skills, procedure and enforceable gate | Shipped |
| Host portability | Applied across the whole repo. No tool identifier in any skill, agent or command |
| Zero prerequisites | Every command runs with nothing connected; files are the only hard dependency |
| Runtime verification | **Not yet run end to end in a live session.** Structurally complete, behaviorally unverified |

That last row is the one to read. Everything here is written to contract and checked mechanically; none of it has been executed against a real product yet.

Roadmap and task state: [`docs/plans/2026-09-20-lifecycle-os-v1.md`](docs/plans/2026-09-20-lifecycle-os-v1.md).

---

## Influences

Patterns borrowed, not dependencies. BuilderOS installs on its own.

- [obra/superpowers](https://github.com/obra/superpowers) — phase discipline with hard refusal to skip ahead, "evidence over claims", the short bootstrap skill with its red-flags table, and classifying work into paths before starting
- [mattpocock/skills](https://github.com/mattpocock/skills) — small composable skills, the interview primitive, durable shared context
- [pbakaus/impeccable](https://github.com/pbakaus/impeccable) — durable product truth kept separate from surface decisions, deterministic detectors

---

## Docs

| | |
|---|---|
| [`AGENTS.md`](AGENTS.md) | The shared contract: architecture, principles, non-negotiables |
| [`docs/architecture.md`](docs/architecture.md) | How the pieces fit, in diagrams |
| [`docs/hosts.md`](docs/hosts.md) | Running on Claude Code, Codex, anything else |
| [`references/capability-map.md`](references/capability-map.md) | The 15 capabilities and their degradation ladders |
| [`references/analytics-contract.md`](references/analytics-contract.md) | The five analytics question shapes, and what they mean per provider |
| [`references/builderos-state-schema.md`](references/builderos-state-schema.md) | `.builderos/` layout and `state.json` |

MIT.
