# Capability Map

BuilderOS skills never name a tool. They name a **capability** and resolve it at runtime against whatever the host actually exposes.

This exists because a hardcoded tool name is wrong three ways at once: it breaks on a different agent (Codex has no `mcp__*` namespace), it breaks on a different stack (PostHog instead of Mixpanel), and it breaks on a different user's connector instance (`mcp__claude_ai_DeepAgent_Mixpanel__Run-Query` is one person's Mixpanel, not everyone's).

## The Capabilities

| Capability | What it does | Typical providers |
|-----------|--------------|-------------------|
| `analytics.query` | Run a query over product event data: funnels, cohorts, retention, counts | Mixpanel, PostHog, Amplitude, GA4 |
| `analytics.events` | List the event catalogue and its properties | Mixpanel, PostHog, Amplitude |
| `analytics.replay` | Watch or summarize session recordings | PostHog, FullStory, Hotjar |
| `db.query` | Read the application database | Supabase, Postgres, BigQuery, Snowflake |
| `docs.search` | Search the team knowledge base | Notion, Confluence, Google Drive, Obsidian vault |
| `docs.read` | Fetch a specific document | same |
| `docs.write` | Create or update a document | Notion, Google Docs, local files |
| `tickets.read` | Read issues, bugs, support tickets | Linear, Jira, GitHub Issues, Zendesk, Intercom |
| `meetings.read` | Read call transcripts and notes | Granola, Gong, Fireflies, Otter |
| `research.search` | Search saved reading and highlights | Readwise, Raindrop, Pocket |
| `web.search` | Search the open web | any web search tool |
| `web.fetch` | Fetch and read a URL | any fetch tool |
| `repo.read` | Read source code, configs, git history | any file and shell access |
| `files.read` / `files.write` | Read and write local files, including the pipeline's own artifacts | any file access |
| `subagent.dispatch` | Delegate a bounded task to a separate agent context | Claude Code `Agent`; absent on most hosts |

`files.read` and `files.write` are the only capabilities BuilderOS assumes are always present. Everything in `.builderos/` depends on them. Every other capability is optional and every skill states what it does without one.

## Resolution Protocol

At the start of any phase that needs data:

1. **Enumerate** the tools the host actually exposes in this session.
2. **Match by shape, not by name.** A tool whose name contains `mixpanel`, `posthog`, `amplitude` and which accepts a query provides `analytics.query`. A tool containing `supabase`, `postgres`, `sql` provides `db.query`.
3. **Record what resolved.** The phase artifact states which capability resolved to which concrete tool, so the numbers stay traceable: `[mcp:posthog:activation_funnel]` names the provider, not a BuilderOS abstraction.
4. **Degrade explicitly** when nothing resolves. Never fail, never invent, never tell the user to install a specific product.

Never write a literal tool identifier into a skill, an agent or a command. Write the capability, and let resolution happen in the session that has the tools.

## Degradation Ladder

Every capability has a defined fallback chain. The phase continues down the ladder until something works.

| Capability | 1st | 2nd | 3rd | Floor |
|-----------|-----|-----|-----|-------|
| `analytics.query` | live query | numbers recorded in docs, dated | instrumentation read from code | ask the user, tag `[doc:user-provided]` |
| `db.query` | live query | exports or reports in docs | schema read from migrations | ask the user |
| `docs.search` | connected knowledge base | local vault or repo docs | — | ask the user |
| `tickets.read` | connected tracker | exported tickets in repo | — | ask the user |
| `meetings.read` | connected transcripts | transcript files the user provides | — | ask the user |
| `research.search` | connected library | local notes | `web.search` | skip, note the gap |
| `web.search` | live search | — | — | skip, note the gap |
| `subagent.dispatch` | delegate | **run the same procedure inline, in sequence** | — | — |

The floor is always the same: state what could not be retrieved, ask for it, and tag whatever the user provides. The floor is never a plausible-sounding number.

## Operating Modes, Restated

The tri-modal detection from v0.1 is a summary of which capabilities resolved. It stays, now defined in capability terms rather than tool terms:

| Mode | Means |
|------|-------|
| **connected** | `analytics.query` or `db.query` resolved. Baselines are real; gates 2.4, 5.3 and 6.2 are satisfiable |
| **vault-based** | `docs.search` resolved against local notes; no live data. Phases 0–4 fully usable |
| **codebase-based** | Only `repo.read` and `files.*`. Phases 4–6 strongest |
| **conversational** | Nothing resolved. Phases 0–3 fully usable. This is the normal state for a new idea, not a degraded one |

A phase never asks the user to connect a specific product. It states which capability would sharpen the work and what it would answer, in capability terms: "a live analytics query would give this metric a real baseline instead of a stated zero."

## Host Notes

What each host provides is discovered at runtime, not assumed here. Two things are worth recording because they change the shape of a phase rather than just its data:

- **Subagent dispatch** exists on Claude Code and is absent on most other hosts. Every multi-step phase in BuilderOS is written so that the same procedure runs inline when it is absent. The skill holds the procedure precisely so it survives that difference.
- **MCP** is supported by several hosts including Claude Code and Codex, so `mcp__`-style tools may appear in either. That is still not a reason to hardcode one: the instance names differ per user.

This file records capabilities, not host inventories. If a host detail turns out to be wrong, it is wrong in one place.
