# Zero Prerequisites, Vendor-Neutral Analytics

**Date:** 2026-09-23
**Status:** accepted
**Supersedes nothing. Extends:** `docs/specs/2026-09-21-host-portability.md`
**Implements:** Cluster 5 of `docs/plans/2026-09-20-lifecycle-os-v1.md`

## The Requirement

Two rules, stated by the project owner on 2026-09-23:

1. **Prerequisites are zero.** Someone installs BuilderOS with nothing connected, no API key, no vault, no analytics account, and every command still runs and still produces a usable artifact.
2. **Analytics is a category, not a product.** Mixpanel, Amplitude and PostHog are interchangeable. So is a CSV a user pastes in.

The portability spec of 2026-09-21 established the first half of this: skills name capabilities, not tools. It was applied only to the v1.0 surface (phases 0–2 and the spine). The eleven v0.1/v0.2 agents were left untouched and still violate both rules.

## The Violation, Measured

43 literal tool identifiers across 14 files, plus 129 vendor-name mentions in prose that assume one specific stack.

| File | Literal tool refs | What it hardcodes |
|------|------------------|-------------------|
| `agents/product-diagnostician.md` | 8 | One user's Mixpanel connector, 5 times |
| `agents/product-strategist.md` | 5 | Mixpanel queries, Notion search |
| `agents/finance-analyst.md` | 4 | Supabase SQL, Mixpanel revenue events |
| `agents/okr-architect.md` | 3 | Supabase, Mixpanel, Notion page creation |
| `agents/growth-architect.md` | 3 | Mixpanel funnel and retention queries |
| `agents/competitive-analyst.md` | 3 | Readwise, Raindrop, one paid newsletter's dataset |
| `agents/discovery-synthesizer.md` | 3 | Notion search and fetch, Readwise |
| `agents/tracking-architect.md` | 3 | Mixpanel event catalogue and dashboard creation |
| `agents/product-writer.md` | 3 | Notion page creation, Google Drive file creation |
| `agents/north-star-analyst.md` | 2 | Mixpanel events and queries |
| `skills/competitive-intel/SKILL.md` | 3 | Readwise, Raindrop, newsletter dataset |
| `skills/pm-toolkit/SKILL.md` | 7 | The whole mode-detection block, by connector instance name |
| `skills/okr-frameworks/SKILL.md` | 1 | Mixpanel or Supabase as the baseline source |
| `commands/pm-strategy-session.md` | 1 | Notion as the storage target |

`mcp__claude_ai_DeepAgent_Mixpanel__Run-Query` is the sharpest case: it is not "Mixpanel", it is one named workspace belonging to one person. It resolves for nobody else on earth.

The second, quieter violation is structural. All eleven agents carry their procedure in the agent file. On a host with no `agents/` directory the method disappears, which is exactly what the portability spec forbids.

## What Zero Prerequisites Means, Concretely

Not "degrades gracefully". Four testable properties:

1. **No command refuses to start** for want of a connection. The only hard dependency is reading and writing files.
2. **Every phase has a files-only floor** that produces the same artifact shape as the connected path, with different evidence tags.
3. **Absent data is named, never estimated.** A missing baseline is written as a missing baseline with the question that would fill it, never as a plausible number. This is already the Iron Law; the retrofit makes it reachable without a connector.
4. **No skill, agent or command names a product the user must go install.** It names the capability and what that capability would answer.

The conversational mode in the capability map is not a degraded mode. For a new idea it is the normal one.

## What Vendor-Neutral Analytics Means

BuilderOS asks product analytics five questions and no others. They are written in `references/analytics-contract.md` as question shapes with a defined result shape, so the skill asks for a funnel and does not care whether a funnel arrives from Mixpanel, Amplitude, PostHog, a warehouse query, or a screenshot the user pastes.

The contract carries the vocabulary differences between the three named providers, because "retention" means slightly different defaults in each, and a number copied across that difference without noting it is a wrong number.

## Approach

Four steps, in dependency order. Each leaves the repo working.

1. **`references/analytics-contract.md`** — the five question shapes, their result shapes, provider vocabulary, and the floor for each.
2. **Move procedure into skills** — `pm-artifacts`, `growth-frameworks`, `tracking-standards`, `financial-models`, `experiment-methodology`, `competitive-intel`, `discovery-methods`, `strategy-frameworks`, `okr-frameworks` each gain the Capabilities table and the numbered Procedure their agents currently hold.
3. **Convert agents to adapters** — same shape as `problem-framer`: role, Iron Law, context contract, reporting. Nothing else.
4. **De-vendor `pm-toolkit`** — mode detection in capability terms, enhancement suggestions as capability gaps rather than product recommendations.

## Verification

The retrofit is done when all four hold:

- `grep -r 'mcp__' skills/ agents/ commands/` returns nothing outside `references/capability-map.md`, where two instances survive deliberately as the examples of what not to write.
- No skill, agent or command tells the user to connect a named product.
- Each retrofitted agent is under 60 lines and contains no procedure.
- Each corresponding skill contains a Capabilities table with a stated floor per capability, and a numbered Procedure that a host with only file access can execute end to end.

Behavioral equivalence (task 5.5 in the plan) stays open: it needs a live session with the plugin installed, like the other verification tasks.

## What This Does Not Do

It does not remove vendor names from reference material where naming them is the point: the analytics contract names Mixpanel, Amplitude and PostHog precisely so their differences are visible, and `saas-metrics-reference` cites benchmark sources by name. The rule is about dependency, not about vocabulary.
