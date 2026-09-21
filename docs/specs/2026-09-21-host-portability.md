# Host Portability: Skills That Run Anywhere

**Date:** 2026-09-21
**Status:** Approved — implementing
**Constraint:** BuilderOS must work on Claude Code and on Codex, and degrade sanely on anything else that reads `SKILL.md`.

---

## The Problem

Three separate portability failures, in increasing order of severity.

**1. Hardcoded connector instances.** 74 references across the repo name tools like `mcp__claude_ai_DeepAgent_Mixpanel__Run-Query` and `mcp__plugin_supabase-toolkit_supabase__execute_sql`. These are one person's connectors. They fail for a different Claude user, for a team on PostHog, and for every non-Claude host. This was already a bug before portability was a requirement.

**2. Procedure lives in the wrong layer.** BuilderOS puts execution logic in `agents/*.md` and reference material in `skills/*/SKILL.md`. A subagent is a Claude Code construct. On a host without it, loading a BuilderOS skill gives frameworks and no workflow: the user gets a PMF scoring table and no idea what to do with it.

**3. Entry points are Claude-shaped.** `commands/*.md` and `.claude-plugin/plugin.json` are Claude Code packaging. Other hosts use `AGENTS.md` for standing rules and load skills from their own directory.

Problem 2 is the structural one. Problems 1 and 3 are mechanical.

---

## The Inversion

**Skills become self-executing. Agents become thin adapters.**

| Layer | Contains | Portable |
|-------|----------|----------|
| **Skill** (`skills/*/SKILL.md`) | When to use, method and frameworks, **the numbered procedure**, capability requirements, output contract, gate, common mistakes | Yes — this is the whole product |
| **Agent** (`agents/*.md`) | "You are {role}. Load {skill}. Run its procedure. Report with {marker}." Plus the dispatch-time context contract | Claude Code only |
| **Command** (`commands/*.md`) | Slash-command entry point and argument parsing | Claude Code only |
| **AGENTS.md** | Standing project rules and the pipeline map, for hosts that read it | Codex and others |

The test: **delete `agents/` and `commands/` entirely, and the skills must still take someone from idea to production.** If they cannot, the procedure is in the wrong file.

A host with subagent dispatch gets isolated contexts per phase, which is better. A host without it runs the identical procedure inline, in sequence. Same steps, same artifacts, same gates, same output. Only the context isolation differs, and that is a performance property, not a capability.

---

## Capabilities, Not Tools

No skill, agent or command names a concrete tool. They name a capability from `references/capability-map.md` (`analytics.query`, `db.query`, `docs.search`, `tickets.read`, `subagent.dispatch`, …) and resolve it at runtime by matching the tools the session actually exposes.

Each capability has a degradation ladder ending in the same floor: state what could not be retrieved, ask the user, tag whatever they provide. The floor is never an invented number, which keeps portability and the Iron Law aligned rather than in tension.

The evidence tag keeps naming the real provider, not the abstraction: `[mcp:posthog:activation_funnel]`, not `[analytics.query]`. Traceability is about where the number came from.

---

## Writing Rules

These become part of the agent contract in `CLAUDE.md`.

1. **No literal tool identifiers** in any skill, agent or command. Name the capability.
2. **Procedure lives in the skill.** An agent that contains numbered execution phases has stolen them from its skill.
3. **No host-specific syntax in skills.** No `Agent({...})`, no `subagent_type`, no slash commands, no `mcp__` prefixes. A skill may say "delegate this if the host supports it, otherwise run it inline".
4. **Tool names in prose only where unavoidable**, and always as an example: "a session-replay capability (PostHog, FullStory, …)".
5. **Capitalized tool names** like `Grep`, `Read`, `Glob` are Claude Code's. Skills say "search the repository", "read the file".
6. **Every phase states its capability requirements and its floor.** A phase with no floor is not portable, it is merely lucky.

---

## Packaging

| Host | Mechanism | Status |
|------|-----------|--------|
| **Claude Code** | `.claude-plugin/plugin.json`, `skills/`, `agents/`, `commands/` | Live |
| **Codex** | `AGENTS.md` at repo root plus the same `skills/` directory copied or linked into the host's skills location | Live via `AGENTS.md`; install path documented in `docs/hosts.md` |
| **Anything else reading SKILL.md** | `skills/` alone | Works; no slash commands |

The `skills/` directory is the single source of truth and is byte-identical across hosts. Adapters wrap it, never fork it.

One detail deliberately not asserted here: the exact on-disk location a given host scans for skills, and any host-specific manifest it accepts. Those change, they are one line of documentation each, and they live in `docs/hosts.md` where a correction costs nothing. Nothing in the architecture depends on getting them right.

---

## Migration

| Scope | Work | When |
|-------|------|------|
| v1.0 surface (spine, phases 0–2) | Move procedure into skills, convert agents to adapters, replace tool names with capabilities | Now |
| `AGENTS.md`, `docs/hosts.md`, `CLAUDE.md` rules | New files, new contract | Now |
| Phases 3–6 | Written capability-first from the start | Cluster 3 and 4 |
| 11 legacy agents (v0.1 / v0.2) | 74 tool references to convert, procedure to move into their skills | Cluster 5, before the 1.0.0 release |

The legacy retrofit is deliberately not done blind in the same pass. Each of those agents has a working MCP call sequence that a careless rewrite would break, and they are the only part of BuilderOS with real usage behind it.

---

## Success Criteria

A user on Codex, with no Claude Code and no MCP connectors, runs the pipeline from an idea to a selected opportunity with a success metric, and every gate behaves identically to Claude Code. The only visible difference is that phases run inline instead of in isolated subagent contexts.
