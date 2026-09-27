# Running BuilderOS on Different Hosts

`skills/` is the product and is byte-identical everywhere. Everything else is an adapter.

| Layer | Portable | Notes |
|-------|----------|-------|
| `skills/` | Yes | Method **and** procedure. Works on any agent that reads `SKILL.md` |
| `references/` | Yes | Templates, schema, capability map |
| `scripts/bos.mjs` | Yes, where commands run | Gates, briefing, roadmap, migration. Node built-ins only. Where it cannot run, the model applies the same rules |
| `AGENTS.md` | Yes | The shared contract. Read directly by Codex, and by Claude Code through the import in `CLAUDE.md` |
| `CLAUDE.md` | No | Claude Code additions only. First line imports `AGENTS.md` |
| `agents/` | No | Claude Code subagent wrappers. Thin by design |
| `commands/` | No | Claude Code slash commands |
| `.claude-plugin/` | No | Claude Code plugin manifest |

## One Contract, Two Files

Claude Code reads `AGENTS.md` directly only when no `CLAUDE.md` exists in the working directory or above it. This repo has both, so `CLAUDE.md` starts with `@AGENTS.md`: the shared contract is imported, and `CLAUDE.md` carries only what is Claude-specific. Codex reads `AGENTS.md` on its own.

The rule for contributors: anything true on every host goes in `AGENTS.md`. Anything about subagents, slash commands or the plugin manifest goes in `CLAUDE.md`. Never duplicate a rule across both.

Two caveats worth knowing. Reading `AGENTS.md` directly needs a recent Claude Code; the import path works regardless, which is why this repo uses it. And a `CLAUDE.md` anywhere *above* the working directory also suppresses direct `AGENTS.md` reading, so the import is what makes the contract reliable when BuilderOS sits inside a larger repo.

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

**As a plugin.** Checked on 2026-09-27 against Codex CLI 0.157.1: installed from this repository, then a full `codex exec` run against a local stand-in model that recorded what Codex sent. Not yet checked: a real model following the skills under Codex, because no OpenAI credentials were available.

```
codex plugin marketplace add mariomile/builder-os     # or a local checkout's path
codex plugin add builder-os@builder-os
```

What was verified:

- `.agents/plugins/marketplace.json` is read and `.codex-plugin/plugin.json` installs as `builder-os@builder-os`. A local marketplace is cloned with git, so Codex installs the last commit, not uncommitted edits.
- All 24 skills reach the model's skill list as `builder-os:{skill}`.
- Codex imports `commands/*.md` as skills named `builder-os:source-command-{command}`, so `/bos-init` becomes a skill the model can pick by its description. It silently drops a command file over 3875 bytes: `npm test` keeps every command under 3800, and the procedure lives in the skills anyway.
- The session-start hook in `hooks/hooks.json` is discovered as a `sessionStart` plugin hook, on one condition: the Codex manifest must not declare `"hooks": {}`, which replaces it with nothing. Codex marks a plugin hook untrusted until the user approves it once, in the interactive client; until then the session starts without the briefing and `using-builder-os` is picked by its description instead.

Commands name Claude Code subagents (`Agent({...})`). On Codex the imported command reads as instructions to follow, and the phase runs inline per `builder-os`, Run Protocol.

**Manually.** Two pieces.

1. **`AGENTS.md`** is picked up from the repository root automatically, giving Codex the pipeline map and the non-negotiables.
2. **The skills** need to be discoverable by the host. Copy or symlink this repo's `skills/` into the directory your Codex version scans for skills, then invoke a skill by name or let the description match your request.

**The session briefing.** Where the hook is not trusted or not present, the briefing comes from the block initialization writes into the project's `AGENTS.md`. Where Codex may run commands, `node {path-to-builder-os}/scripts/bos.mjs brief` prints it from the files, and `... gate N` checks a gate.

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
| Gate provenance | Script-decided where commands run, on any host | Model-judged where they do not, and recorded as such |
| Multi-skill routes (a full product audit) | Parallel | Sequential |

Lower context pressure is the only real advantage, and on a long pipeline it is worth having. It is not a capability difference: nothing is unavailable without it.

## Data Sources

BuilderOS never requires a specific analytics, database or documentation product. Phases resolve capabilities at runtime and degrade down a defined ladder to a floor that is always the same: state the gap, ask the user, tag what they provide. See `references/capability-map.md`.

MCP is supported by several hosts, so MCP-provided tools may resolve on any of them. That is a runtime fact to discover, never an assumption to encode.
