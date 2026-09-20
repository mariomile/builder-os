# PRODUCT.md Template

Durable product truth. Written by `/bos-init`, amended rarely and deliberately. This file answers "what is this and who is it for" — never "what are we building this sprint". Transient decisions live in `.builderos/` phase artifacts; mixing the two is how a product loses its identity one sprint at a time.

Every field carries a source tag per `evidence-ledger`. A fresh `PRODUCT.md` is mostly `[assumption:unvalidated]`, and that is correct: phase 1 exists to change that.

---

```markdown
# PRODUCT.md — {Product Name}

**Stage:** {idea | pre-PMF | emerging-PMF | scaling}
**Last amended:** {YYYY-MM-DD}
**Amendment count:** {n}

## Purpose

{One sentence. What this product does and for whom. If it takes two sentences, the product is two products.}

## The Problem

{The problem as it exists in the world, independent of this product. No solution language.}

**Who has it:** {primary ICP} `[tag]`
**How they solve it today:** {current alternative, including "nothing" and "a spreadsheet"} `[tag]`
**What that costs them:** {time, money, risk, or opportunity} `[tag]`

## ICP

| | Primary | Secondary |
|---|---------|-----------|
| **Segment** | {who} | {who} |
| **Size** | {n} `[tag]` | {n} `[tag]` |
| **Trigger** | {what makes them look for a solution} | |
| **Buying power** | {who signs} | |
| **Where they are** | {channel} | |

## Jobs To Be Done

When {situation}, I want to {motivation}, so I can {expected outcome}. `[tag]`

## Non-Goals

{What this product will not do, and the reason. An empty non-goals list means the product has no shape. Three to five entries.}

- {Not this} — because {reason}
- {Not this either} — because {reason}

## Constraints

| Type | Constraint | Source |
|------|-----------|--------|
| Technical | {} | `[tag]` |
| Regulatory | {} | `[tag]` |
| Resource | {team size, budget, runway} | `[tag]` |
| Distribution | {existing channels, or their absence} | `[tag]` |

## Voice

{How this product speaks. Two or three adjectives with a counter-example each: "direct, not blunt". Used by every artifact-writing agent.}

## Success

**North Star:** {metric, or "not yet selected — phase 2"} `[tag]`
**Current baseline:** {number with date, or 0 for pre-launch} `[tag]`

## Data Sources

| Source | Status | What it answers |
|--------|--------|-----------------|
| {Mixpanel / PostHog / Supabase / Notion / none} | {connected via MCP / manual / absent} | {} |

## Amendment Log

| Date | What changed | Why | Evidence |
|------|-------------|-----|----------|
| {YYYY-MM-DD} | Created | — | — |
```

---

## Amendment Rules

`PRODUCT.md` changes when the product's identity changes, not when a feature ships. Legitimate triggers:

- Phase 1 returns `KILLED` or `RESHAPED` — the problem statement was wrong
- Phase 2 selects an opportunity that shifts the ICP
- Phase 7 produces evidence that contradicts a field
- A strategic decision recorded as an ADR

Every amendment appends to the log with its evidence. An amendment with no evidence tag is a preference change and should be questioned via `pressure-testing` before it lands.

## Relationship to PM-CONTEXT.md

`references/pm-context-template.md` remains the context file for the `pm-*` analysis commands and stays supported. `PRODUCT.md` is its superset: when both exist, `PRODUCT.md` wins and `PM-CONTEXT.md` is treated as legacy. `/bos-init` offers to migrate an existing `PM-CONTEXT.md` rather than asking the same questions twice.
