# Running BuilderOS on Different Hosts

`skills/` is the product and is byte-identical everywhere. Everything else is an adapter.

| Layer | Portable | Notes |
|-------|----------|-------|
| `skills/` | Yes | Method **and** procedure. Works on any agent that reads `SKILL.md` |
| `references/` | Yes | Templates, schema, capability map |
| `AGENTS.md` | Yes | Standing rules, read by Codex and other `AGENTS.md`-aware tools |
| `agents/` | No | Claude Code subagent wrappers. Thin by design |
| `commands/` | No | Claude Code slash commands |
| `.claude-plugin/` | No | Claude Code plugin manifest |

Delete `agents/`, `commands/` and `.claude-plugin/` and BuilderOS still takes someone from idea to production. That is the portability test, and it is the reason procedure lives in skills.

## Claude Code

Install as a plugin. Skills, agents and slash commands all load: this is the richest surface, because `subagent.dispatch` resolves and each phase runs in an isolated context.

```
/bos-init          start a pipeline
/bos               stateful hub, routes to the current phase
/bos-status        pipeline state on one screen
/bos-gate          run the current gate
/bos-frame … /bos-learn
```

## Codex

Two pieces, no plugin manifest involved.

1. **`AGENTS.md`** is picked up from the repository root automatically, giving Codex the pipeline map and the non-negotiables.
2. **The skills** need to be discoverable by the host. Copy or symlink this repo's `skills/` into the directory your Codex version scans for skills, then invoke a skill by name or let the description match your request.

Check your installed version's documentation for the exact skills directory and invocation syntax — those are host details that change, and nothing in BuilderOS depends on them. What matters is that `skills/` is reachable.

No slash commands. Name the phase instead ("run the frame phase on this idea") or the skill (`builder-os`, `problem-framing`, …). Phases run inline, in sequence, in one conversation. Same procedure, same artifacts, same gates.

## Any other SKILL.md-aware agent

Make `skills/` reachable. Everything works except the slash commands and the isolated per-phase contexts.

## What Changes Between Hosts

| | With `subagent.dispatch` | Without |
|---|---|---|
| Phase execution | Isolated context per phase | Inline, sequential, one conversation |
| Context pressure | Lower; each phase starts clean | Higher on long pipelines |
| Artifacts | Identical | Identical |
| Gates | Identical | Identical |
| Multi-agent chains (`/pm-audit`) | Parallel | Sequential |

Lower context pressure is the only real advantage, and on a long pipeline it is worth having. It is not a capability difference: nothing is unavailable without it.

## Data Sources

BuilderOS never requires a specific analytics, database or documentation product. Phases resolve capabilities at runtime and degrade down a defined ladder to a floor that is always the same: state the gap, ask the user, tag what they provide. See `references/capability-map.md`.

MCP is supported by several hosts, so MCP-provided tools may resolve on any of them. That is a runtime fact to discover, never an assumption to encode.
