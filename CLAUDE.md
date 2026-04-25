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
2. **Data over guessing** — Every number must come from an MCP query
3. **Structured output** — Every agent has a completion marker and handoff contract
4. **Explicit MCP calls** — Agent prompts contain exact MCP tool names and query parameters
5. **Graceful fallback** — If MCP is unavailable, report clearly and ask for manual data

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

### Agent Contract

Every agent MUST:
1. Follow numbered phases
2. Make explicit MCP calls (not vague "analyze data")
3. End with a completion marker (`## TYPE COMPLETE`)
4. Produce output in the documented handoff format
5. Have a fallback if MCP is unavailable
6. Include a "Common Mistakes" table

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
