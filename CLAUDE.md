# CLAUDE.md — BuilderOS

## What This Is

BuilderOS is a Claude Code plugin — The Operating System for Product Builders. It provides operational Product Management capabilities via specialized agents connected to live data sources (Mixpanel, PostHog, Supabase, Notion) through MCP.

## Architecture

```
Hub Skill (pm-toolkit) → Routes intent → Specialized Agents → MCP Data Sources
                                              ↓
                                        Knowledge Skills (frameworks, formulas, templates)
```

### Components

- **Skills** (`skills/`): Knowledge modules — frameworks, formulas, templates. Loaded by agents as reference.
- **Agents** (`agents/`): Execution specialists — pull data, analyze, produce artifacts. Each has explicit MCP call sequences.
- **Commands** (`commands/`): Quick-access entry points — thin routing layers that dispatch to agents.
- **References** (`references/`): Shared templates, context schemas, prompt fragments.

### Design Principles

1. **Zero dependencies** — Only Node.js built-ins in plugin loader
2. **Data over guessing** — Every number comes from a real source and carries a source tag
3. **Structured output** — Every agent has a completion marker and handoff contract
4. **Capabilities, not tools** — Skills name a capability and resolve it at runtime; never a literal tool identifier
5. **Graceful fallback** — Every capability has a degradation ladder ending in "state the gap, ask the user, tag the answer"
6. **Host-agnostic** — Skills run on any agent that reads `SKILL.md`; host features are adapters, never requirements

### Host Portability

BuilderOS must run on Claude Code and on Codex, and degrade sanely anywhere else. Contract in `docs/specs/2026-09-21-host-portability.md`, capability names in `references/capability-map.md`, host setup in `docs/hosts.md`.

**The test:** delete `agents/`, `commands/` and `.claude-plugin/`, and the skills must still take someone from idea to production.

Rules, enforced on every change:

1. **No literal tool identifiers** in any skill, agent or command. No `mcp__*`, no connector instance names, no vendor names as requirements. Name the capability.
2. **Procedure lives in the skill.** An agent containing numbered execution phases has stolen them from its skill. Agents are thin: role, required skills, context contract, reporting format.
3. **No host-specific syntax in skills.** No `Agent({...})`, no `subagent_type`, no slash commands. A skill may say "delegate if the host supports it, otherwise run inline".
4. **Capitalized tool names are Claude Code's.** Skills say "search the repository", not `Grep`.
5. **Vendor names in prose only as examples:** "a session-replay capability (PostHog, FullStory, …)".
6. **Every phase states its capability requirements and its floor.** A phase with no floor is not portable, only lucky.

Known debt: the 11 v0.1/v0.2 agents still carry ~74 hardcoded tool references, several of them one user's connector instances. Scheduled for retrofit before the 1.0.0 release; see the implementation plan.

### File Naming

- Skills: `skills/{skill-name}/SKILL.md`
- Agents: `agents/{agent-name}.md`
- Commands: `commands/{command-name}.md`
- All names use hyphens, lowercase

### Skill Frontmatter

```yaml
---
name: skill-name
description: "Use when [specific triggering conditions]"
---
```

Description = triggering conditions ONLY. Not a workflow summary.

### Agent Frontmatter

```yaml
---
name: agent-name
description: "Brief purpose description"
model: inherit
---
```

### Skill Contract

Every skill that drives work (as opposed to pure reference) MUST:
1. State when to use it, in triggering-condition form
2. Hold the method and the **numbered procedure** for its phase
3. List its capability requirements and the floor for each
4. Define its output contract and its completion marker
5. Include a "Common Mistakes" table

### Agent Contract

Agents are Claude Code adapters over skills. Every agent MUST:
1. Name the skill it loads and instruct running that skill's procedure
2. State its role and its Iron Law
3. Define the context contract its dispatch prompt carries
4. End with a completion marker (`## TYPE COMPLETE`)

Agents MUST NOT duplicate the procedure, the frameworks or the output contract. Those live in the skill, where every host can reach them.

### Testing

Skills are tested via pressure scenarios (following Superpowers TDD-for-skills methodology):
1. Run prompt WITHOUT skill loaded — document agent failures
2. Load skill — verify agent complies
3. Find rationalization loopholes — plug them

## Contributing

- Every agent change must be tested against real MCP data
- Every skill change must include updated examples
- No placeholder content ("TBD", "TODO", "implement later")
- Follow existing patterns — read 2-3 existing files before creating new ones
