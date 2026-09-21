# AGENTS.md — BuilderOS

Standing rules for any agent working in this repository, and the entry point for hosts that read `AGENTS.md` rather than a plugin manifest.

## What BuilderOS Is

The operating system for taking an idea or a problem to a product running in production. Eight gated phases, each with its own skills:

```
FRAME → DISCOVER → DEFINE → IDEATE → SHAPE → BUILD → SHIP → LEARN
  0        1          2        3        4       5      6      7
```

Phases 0–4 are design thinking. Phases 5–7 are delivery and learning. Phase 7 re-enters the loop rather than ending it.

## Using It

Start from `skills/builder-os/SKILL.md`. It holds the phase map, the run protocol and the routing. Each phase's skill holds that phase's method **and its procedure**, so a phase runs the same way whether the host delegates it to a separate agent or executes it inline in one conversation.

Pipeline state lives in `.builderos/state.json` and `PRODUCT.md` at the working-directory root. Read state before starting any phase; write it after finishing one.

Two surfaces:
- **Lifecycle** (`skills/builder-os` and the phase skills) walks the pipeline. Stateful, gated, sequential.
- **Analysis** (`skills/pm-toolkit` and its specialists) answers a standalone question about an existing product. Stateless.

## Non-Negotiables

**Never invent data.** Every factual claim in every artifact carries a source tag per `skills/evidence-ledger`. Gates count them. If a number cannot be retrieved, say so and ask; a plausible-sounding guess is worse than a stated gap.

**Never skip a gate.** `skills/gate-checks` holds eight gates as mechanically checkable conditions. Failing one means refusing to advance and naming the condition. Overrides exist, are logged in `state.json` with a reason, and stay visible afterwards.

**Never name a tool in a skill.** Skills name capabilities (`analytics.query`, `docs.search`, `subagent.dispatch`, …) and resolve them at runtime against whatever this session exposes. See `references/capability-map.md`. A hardcoded tool name breaks on another host, another analytics stack, and another user's connector.

**Never require a host feature.** Where a host can delegate to a separate agent, phases run in isolated contexts. Where it cannot, the identical procedure runs inline. No phase is unavailable because of the host.

## Contributing

- Read two or three existing files before creating a new one. Follow their shape.
- No placeholder content: no TBD, no TODO, no "implement later".
- Skill frontmatter is `name` plus a `description` that states **triggering conditions only**, never a workflow summary.
- Procedure belongs in the skill. An agent file that contains numbered execution phases has stolen them from its skill.
- Every phase states its capability requirements and what it does when each is absent.

Architecture and conventions: `CLAUDE.md`. Portability contract: `docs/specs/2026-09-21-host-portability.md`. Host setup: `docs/hosts.md`.
