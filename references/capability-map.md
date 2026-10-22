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
| `tickets.write` | Create and update issues, with parent links and blocking edges where the tracker has them | Linear, Jira, GitHub Issues |
| `meetings.read` | Read call transcripts and notes | Granola, Gong, Fireflies, Otter |
| `research.search` | Search saved reading and highlights | Readwise, Raindrop, Pocket |
| `web.search` | Search the open web | any web search tool |
| `web.fetch` | Fetch and read a URL | any fetch tool |
| `logs.query` | Read production errors, traces and timings, including a model's turns with their tool calls, latency and cost | Sentry, Datadog, the hosting provider's logs, an LLM tracing tool (Langfuse, LangSmith, …) |
| `ui.render` | Show the user a rendered interface: a design version, a prototype screen | host previews and artifacts, design tools (Figma, Claude Design, v0), a browser screenshot of a local page |
| `ui.capture` | Open the built product and capture a state of a screen as an image | a browser the host drives, an end-to-end runner's screenshots, the host's preview |
| `repo.read` | Read source code, configs, git history | any file and shell access |
| `files.read` / `files.write` | Read and write local files, including the pipeline's own artifacts | any file access |
| `subagent.dispatch` | Delegate a bounded task to a separate agent context | runtime agent support, including Claude Code and Codex when exposed |
| `shell.exec` | Run a command in the project: the BuilderOS script for gates and briefings, a test suite | any shell access |
| `sessions.read` | Read the transcripts or logs of earlier agent sessions in this project | the host's own session history, exported transcripts |
| `schedule.run` | Run a procedure on a schedule without anyone opening a session: the product review, a watch recheck | host routines or scheduled tasks, a cron job running a headless agent |

`files.read` and `files.write` are the only capabilities BuilderOS assumes are always present. Everything in `.builderos/` depends on them. Every other capability is optional and every skill states what it does without one.

## Resolution Protocol

At the start of any phase that needs data:

1. **Enumerate** the tools the host actually exposes in this session.
2. **Match by shape, not by name.** A tool whose name contains `mixpanel`, `posthog`, `amplitude` and which accepts a query provides `analytics.query`. A tool containing `supabase`, `postgres`, `sql` provides `db.query`.
3. **Record what resolved.** The phase artifact states which capability resolved to which concrete tool, so the numbers stay traceable: `[data:posthog:activation_funnel]` names the provider, not a BuilderOS abstraction.
4. **Degrade explicitly** when nothing resolves. State concrete access failures and blockers; never invent data or require a named product.

Never write a literal tool identifier into a skill, an agent or a command. Write the capability, and let resolution happen in the session that has the tools.

## Degradation Ladder

Every capability has a defined fallback chain. The phase continues down the ladder until something works.

| Capability | 1st | 2nd | 3rd | Floor |
|-----------|-----|-----|-----|-------|
| `analytics.query` | live query | numbers recorded in docs, dated | instrumentation read from code | ask the user, tag `[doc:user-{date}-{topic}]` and save the words in `evidence/` |
| `db.query` | live query | exports or reports in docs | schema read from migrations | ask the user |
| `docs.search` | connected knowledge base | local vault or repo docs | — | ask the user |
| `tickets.read` | connected tracker | exported tickets in repo | — | ask the user |
| `tickets.write` | connected tracker, files in `.builderos/` stay the record and each ticket file carries its link | — | — | the files in `.builderos/` are the tracker |
| `meetings.read` | connected transcripts | transcript files the user provides, saved with `bos.mjs evidence add` | — | ask the user |
| `research.search` | connected library | local notes | `web.search` | skip, note the gap |
| `web.search` | live search | — | — | skip, note the gap |
| `logs.query` | live query | exported logs or error reports | — | ask the user for the error text, time and account, tag it and save the words in `evidence/` |
| `ui.render` | host preview or design tool | self-contained HTML files the user opens from disk | — | text wireframes, only for a standalone answer kept in chat |
| `ui.capture` | drive a browser on the running product | screenshots from the end-to-end run | — | the user opens each route and says whether it matches the chosen version; record the route and their words |
| `subagent.dispatch` | delegate | **run the same procedure inline, in sequence** | — | — |
| `shell.exec` | run `scripts/bos.mjs` | — | — | the model checks the same conditions and records them as `checked_by: model` |
| `sessions.read` | the host's session history | a transcript the user exports | — | work from the current conversation and say which sessions were not read |
| `schedule.run` | a scheduled run of the product review | — | — | the briefing flags the review as due when someone next opens a session |

The floor is always the same: state what could not be retrieved, ask for it, and tag whatever the user provides. The floor is never a plausible-sounding number.

## Operating Modes, Restated

The tri-modal detection from v0.1 is a summary of which capabilities resolved. It stays, now defined in capability terms rather than tool terms:

| Mode | Means |
|------|-------|
| **connected** | `analytics.query` or `db.query` resolved. Baselines are real; gates 2.4, 5.3 and 6.2 are satisfiable |
| **vault-based** | `docs.search` resolved against local notes; no live data. Phases 0–4 fully usable |
| **codebase-based** | Only `repo.read` and `files.*`. Phases 4–6 strongest |
| **conversational** | Nothing resolved. Phases 0–3 fully usable. This is the normal state for a new idea, not a degraded one |

A phase never asks the user to connect a specific product. It states which capability would sharpen the work and what it would answer, in capability terms: "a live analytics query would give this metric a real baseline instead of an unknown baseline."

## Host Notes

What each host provides is discovered at runtime, not assumed here. Two things are worth recording because they change the shape of a phase rather than just its data:

- **Subagent dispatch** is a runtime capability, not a host label. Claude Code and some Codex sessions support it; other sessions do not. Also check the user’s authorization to delegate. A generic agent can receive the portable skill and its context; a named BuilderOS profile is a separate adapter capability. On Claude Code those profiles are namespaced `builder-os:{agent}`. Dispatch in the foreground and await completion before a dependent read, dispatch or gate. Without delegation, run the same skill inline.
- **MCP** is supported by several hosts including Claude Code and Codex, so `mcp__`-style tools may appear in either. That is still not a reason to hardcode one: the instance names differ per user.

This file records capabilities, not host inventories. If a host detail turns out to be wrong, it is wrong in one place.
