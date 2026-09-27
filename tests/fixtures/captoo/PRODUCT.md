# PRODUCT.md — captoo

**Stage:** pre-PMF
**Last amended:** 2026-09-27
**Amendment count:** 0

## Purpose

captoo runs a fixed set of buyer prompts against AI answer engines every day and gives B2B marketing teams share-of-voice visibility per engine, delivered as a weekly report. `[doc:readme]`

## The Problem

Customers only learn about a meaningful share-of-voice drop on an AI answer engine when someone downstream notices — sales asking why demo requests mentioning an engine dried up, or a client telling their own agency — typically three to four weeks after it happened, because the weekly email is skimmed only when something looks different and otherwise goes unread. `[interview:C1]` `[interview:C4]` Seven of eleven support tickets tagged "visibility" ask some version of "why did our visibility drop and when did it start" `[doc:support-tickets]`. Report open rate fell from 49% to 30% over twelve weeks `[data:captoo-analytics:weekly_report_opens]`, consistent with customers no longer expecting the weekly email to carry anything actionable.

**Who has it:** Marketing/growth/content leads at B2B SaaS companies who are captoo customers, and agencies managing several client accounts on captoo `[interview:C1,C2,C3]` `[interview:C4]`
**How they solve it today:** Skim the weekly email (some skip weeks when "nothing moved"), check the dashboard only before a monthly review, or find out from someone downstream — sales or, for an agency, the client itself `[interview:C1]` `[interview:C4]`
**What that costs them:** Weeks of unexplained pipeline impact before the cause is found; for an agency, the embarrassment of a client reporting the drop before captoo does `[interview:C1]` `[interview:C4]`

## ICP

| | Primary | Secondary |
|---|---------|-----------|
| **Segment** | Marketing/growth/content leads at B2B SaaS companies | Agencies running captoo for several client brands |
| **Size** | 25–150 employees `[interview:C1,C2,C3]` | 12-person agency, 4 client accounts `[interview:C4]` |
| **Trigger** | A share-of-voice drop goes unnoticed long enough that someone downstream asks about it | A client notices their own drop before the agency does `[interview:C4]` |
| **Buying power** | The marketing/growth lead who owns the captoo relationship | The agency founder |
| **Where they are** | Already a captoo customer, reading the weekly email | Already a captoo customer on behalf of clients |

## Jobs To Be Done

When our share of voice on an AI answer engine falls off a cliff, I want to be tapped on the shoulder immediately, so I can act before sales or a client notices first. `[interview:C1]` `[interview:C4]`

## Non-Goals

- Not a new real-time scanning system — the alert reads the existing daily-scan/weekly-report data on the existing cadence, because a two-person team cannot absorb new polling infrastructure right now `[assumption:unvalidated]`.
- Not a general anomaly-detection platform for arbitrary metrics — scoped to share-of-voice drops only, because that is the evidenced request `[doc:support-tickets]`.
- Not automatic root-cause attribution ("was it us or did the engine change how it cites sources") in v1 — one customer wants it `[interview:C2]`, but distinguishing a brand-caused drop from an engine-caused one is a materially harder, separate problem.
- Not a replacement for the weekly report — the weekly report stays as the summary; the alert is additive for out-of-band drops `[interview:C3]` `[interview:C4]`.

## Constraints

| Type | Constraint | Source |
|------|-----------|--------|
| Technical | No external dependencies; small codebase (`sov.mjs`, `weekly-report.mjs`, `notify.mjs`, `track.mjs`); no alerting channel today beyond the dev-mode email-to-outbox stub | `[code:src/notify.mjs:5]` |
| Regulatory | None stated | `[doc:user-2026-09-27-sov-drop-alert]` |
| Resource | Two people: founder and one developer | `[doc:user-2026-09-27-sov-drop-alert]` |
| Distribution | Existing customer base only, via the same email channel already used for the weekly report | `[code:src/notify.mjs:8]` |

## Voice

Direct — states the number and the engine, not "significant changes". Calm, not alarmist — a drop is reported, not sounded like a siren; one customer already worries that a noisy alert gets muted within a month `[interview:C3]`. Specific — names the competitor that displaced the brand, not "something changed"; a customer explicitly wants to know who took their spot `[interview:C2]`.

## Language

| Term | Means | Not to be confused with |
|------|-------|------------------------|
| AI answer engine | One of the AI systems (e.g. ChatGPT, Perplexity) captoo runs buyer prompts against daily | A traditional search engine |
| Share of voice (SoV) | The fraction of answers, per engine, that cite the brand | Ranking position or click-through rate |
| Displaced by | The competitors cited in answers where the brand is absent | A direct competitor list unrelated to a specific prompt run |

## Success

**North Star:** not yet selected — phase 2
**Current baseline:** 0 `[assumption:unvalidated]`

## Data Sources

| Source | Status | What it answers |
|--------|--------|-----------------|
| captoo warehouse (SoV per account/engine) | manual, pasted export `[data:captoo-warehouse:sov_weekly_swings]` | How often and how far share of voice swings week over week, and how often it recovers |
| captoo product analytics (report sent/opened) | manual, pasted export `[data:captoo-analytics:weekly_report_opens]` | Whether the weekly email is still being read |
| Support tickets tagged "visibility" | manual export `[doc:support-tickets]` | What customers are already asking for |

## Amendment Log

| Date | What changed | Why | Evidence |
|------|-------------|-----|----------|
| 2026-09-27 | Created | — | — |
