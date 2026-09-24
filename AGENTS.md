# AGENTS.md — BuilderOS

The shared contract for any agent working in this repository, and the project instructions for any host that reads `AGENTS.md`. Host-specific additions live in `CLAUDE.md`, which imports this file.

## What This Is

BuilderOS is the operating system for taking an idea or a problem to a product running in production. Eight gated phases, each with its own skills:

```
FRAME → DISCOVER → DEFINE → IDEATE → SHAPE → BUILD → SHIP → LEARN
  0        1          2        3        4       5      6      7
```

Phases 0–4 are design thinking. Phases 5–7 are delivery and learning. Phase 7 re-enters the loop rather than ending it.

## Architecture

```
Lifecycle hub (builder-os) → phase skills → artifacts in .builderos/
                                  ↓                    ↑
                          capabilities resolved    gates enforced
                          at runtime               between phases

Analysis hub (pm-toolkit) → specialist skills → standalone answers
```

### Components

| Directory | Contains | Portable |
|-----------|----------|----------|
| `skills/` | Method **and** procedure. The product | Yes |
| `references/` | Templates, state schema, capability map | Yes |
| `docs/` | Specs, plans, host setup | Yes |
| `agents/`, `commands/`, `.claude-plugin/` | Claude Code adapters | No |
| `.codex-plugin/`, `.agents/plugins/` | Codex plugin manifest and marketplace. Metadata only, no procedure | No |

Project memory lives in the user's working directory: `PRODUCT.md` and `TECH.md` at the root, and `.builderos/` with `state.json`, `ROADMAP.md`, `decisions/` and one folder per initiative. Layout and rules in `references/builderos-state-schema.md`. Read memory before starting a phase; write it after finishing one.

Entry point on every host: `skills/using-builder-os`. Hosts with a session-start hook inject it; elsewhere, read it first. It routes to one of the two surfaces.

Two surfaces: the **lifecycle** (`builder-os` plus the phase skills) walks the pipeline, stateful and gated; the **analysis** surface (`pm-toolkit` plus its specialists) answers a standalone question about an existing product, stateless.

## Design Principles

1. **Zero dependencies** — only Node.js built-ins in the plugin loader
2. **Data over guessing** — every number comes from a real source and carries a source tag
3. **Structured output** — every phase has a completion marker and a handoff contract
4. **Capabilities, not tools** — name a capability and resolve it at runtime; never a literal tool identifier
5. **Graceful fallback** — every capability has a degradation ladder ending in "state the gap, ask the user, tag the answer"
6. **Host-agnostic** — skills run on any agent that reads `SKILL.md`; host features are adapters, never requirements

## Non-Negotiables

**Never invent data.** Every factual claim in every artifact carries a source tag per `skills/evidence-ledger`. Gates count them. If a number cannot be retrieved, say so and ask; a plausible-sounding guess is worse than a stated gap.

**Never skip a gate.** `skills/gate-checks` holds eight gates as mechanically checkable conditions. Failing one means refusing to advance and naming the condition. Overrides exist, are logged in `state.json` with a reason, and stay visible afterwards.

**Never name a tool in a skill.** Skills name capabilities (`analytics.query`, `docs.search`, `subagent.dispatch`, …) and resolve them against whatever this session exposes. See `references/capability-map.md`. A hardcoded tool name breaks on another host, another analytics stack, and another user's connector.

**Prerequisites are zero.** Every skill runs with nothing connected. `files.read` and `files.write` are the only hard dependency; every other capability has a floor, and no floor is a fabricated number. Never tell the user to install or connect a named product: state the capability gap and the question closing it would answer.

**Analytics is a contract, not a vendor.** Five question shapes in `references/analytics-contract.md`. A skill asks for a shape; whichever provider resolved answers it.

**Never require a host feature.** Where a host can delegate to a separate agent, phases run in isolated contexts. Where it cannot, the identical procedure runs inline. No phase is unavailable because of the host.

## Host Portability

BuilderOS must run on Claude Code and on Codex, and degrade sanely anywhere else. Contract in `docs/specs/2026-09-21-host-portability.md`, capability names in `references/capability-map.md`, host setup in `docs/hosts.md`.

**The test:** delete `agents/`, `commands/` and `.claude-plugin/`, and the skills must still take someone from idea to production.

Rules, enforced on every change:

1. **No literal tool identifiers** in any skill, agent or command. No `mcp__*`, no connector instance names, no vendor names as requirements. Name the capability.
2. **Procedure lives in the skill.** An agent containing numbered execution phases has stolen them from its skill.
3. **No host-specific syntax in skills.** No subagent dispatch calls, no slash commands. A skill may say "delegate if the host supports it, otherwise run inline".
4. **Capitalized tool names belong to one host.** Skills say "search the repository", not `Grep`.
5. **Vendor names in prose only as examples:** "a session-replay capability (PostHog, FullStory, …)".
6. **Every phase states its capability requirements and its floor.** A phase with no floor is not portable, only lucky.

Known debt: the 11 v0.1/v0.2 agents still carry ~74 hardcoded tool references, several of them one user's connector instances. Scheduled for retrofit before the 1.0.0 release; see `docs/plans/2026-09-20-lifecycle-os-v1.md`, Cluster 5.

## File Naming

- Skills: `skills/{skill-name}/SKILL.md`
- References: `references/{topic}.md`
- All names hyphenated, lowercase

## Skill Frontmatter

```yaml
---
name: skill-name
description: "Use when [specific triggering conditions]"
---
```

Description states triggering conditions ONLY. Not a workflow summary.

## Skill Contract

Every skill that drives work (as opposed to pure reference) MUST:

1. State when to use it, in triggering-condition form
2. Hold the method **and the numbered procedure** for its phase
3. List its capability requirements and the floor for each
4. Define its output contract and its completion marker
5. Include a "Common Mistakes" table

## Testing

Skills are tested via pressure scenarios, following the TDD-for-skills methodology popularized by Superpowers:

1. Run the prompt WITHOUT the skill loaded — document the failures
2. Load the skill — verify compliance
3. Find the rationalization loopholes — plug them

Triggering tests live in `tests/skill-triggering/`; the protocol is in its README.

## Contributing

- Read two or three existing files before creating a new one. Follow their shape.
- No placeholder content: no TBD, no TODO, no "implement later".
- Every skill change includes updated examples.
- Every capability change updates `references/capability-map.md`.
- Every change to what BuilderOS asks of analytics updates `references/analytics-contract.md`.
