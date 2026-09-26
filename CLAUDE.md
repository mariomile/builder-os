@AGENTS.md

# CLAUDE.md — BuilderOS on Claude Code

The shared contract is in `AGENTS.md`, imported above: architecture, design principles, non-negotiables, portability rules, skill contract, testing, contributing. Everything here is Claude Code specific and applies on top of it.

The import exists because Claude Code reads `AGENTS.md` only when no `CLAUDE.md` is present in the working directory or above it. Without it, this file would silently shadow the shared contract and the two would drift. Single source, both hosts.

## Claude Code Adapters

| Directory | Role |
|-----------|------|
| `agents/` | Subagent wrappers. Thin by design: role, Iron Law, context contract, reporting format |
| `commands/` | Slash-command entry points and argument parsing |
| `.claude-plugin/plugin.json` | Plugin manifest |

These three are deletable. Deleting them costs slash commands and per-phase context isolation, nothing else. See `docs/hosts.md`.

## Agent Frontmatter

```yaml
---
name: agent-name
description: "Brief purpose description"
model: inherit
---
```

## Agent Contract

Agents are adapters over skills. Every agent MUST:

1. Name the skill it loads and instruct running that skill's procedure
2. State its role and its Iron Law
3. Define the context contract its dispatch prompt carries
4. End with a completion marker (`## TYPE COMPLETE`)

Agents MUST NOT duplicate the procedure, the frameworks or the output contract. Those live in the skill, where every host can reach them. An agent longer than about 40 lines has almost certainly stolen something from its skill.

## Command Contract

Commands are routing layers, not logic. Every command MUST:

1. Check pipeline state before dispatching, and refuse on a failed upstream gate
2. Resolve capabilities per `references/capability-map.md` and pass the derived mode
3. Read and pass the previous phase artifact
4. Verify the completion marker, then re-run the phase gate on the written artifact before presenting results. The marker is a claim; the gate on the file is the evidence

## Dispatch Context Package

Every lifecycle dispatch carries: operating mode and resolved capabilities, pipeline state (phase, cycle, gate mode), `PRODUCT.md`, the previous phase artifact, the user's request verbatim, and the instruction to write the phase artifact, update `state.json`, and run the gate before reporting.
