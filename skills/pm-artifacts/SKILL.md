---
name: pm-artifacts
description: "Use when generating PRDs, release notes, stakeholder updates, or executive summaries — provides templates and format guidelines for each artifact type"
---

# PM Artifacts

Templates and guidelines for standard PM documents. Each template specifies structure, audience, tone, and expected length.

## Artifact Quick Reference

| Artifact | Audience | Tone | Length | Key Principle |
|----------|----------|------|--------|--------------|
| PRD | Engineering + Design | Precise, technical | 2-5 pages | Every requirement is testable |
| Release Notes | Customers | Friendly, benefit-focused | 0.5-1 page | Benefits, not features |
| Stakeholder Update | Internal leadership | Direct, data-driven | 1 page | Status + asks |
| Executive Summary | C-suite / Board | Strategic, concise | 0.5 page | Numbers + narrative |

## PRD Guidelines

**Structure:** Problem → Solution → User Stories → Requirements → Metrics → Timeline
**Every requirement must be:**
- Testable (can write acceptance criteria)
- Scoped (clear boundary of what's included/excluded)
- Prioritized (Must have / Should have / Nice to have)

**Anti-patterns:**
- "Intuitive UX" → What specific behavior? What does the user see?
- "Fast performance" → What latency target? How measured?
- "Similar to {competitor}" → Describe the specific behavior

## Release Notes Guidelines

**Structure:** Highlights → Improvements → Bug Fixes → Coming Soon
**Tone rules:**
- Lead with WHY it matters, not WHAT changed
- "You can now export reports as PDF" not "Added PDF export functionality"
- No internal jargon, no ticket numbers
- Use emojis sparingly for section headers only

## Stakeholder Update Guidelines

**Structure:** TL;DR → Progress Table → Metrics → Decisions Needed → Next Period
**Rules:**
- TL;DR must be readable in 10 seconds
- Use traffic lights (🟢🟡🔴) for status
- If you need a decision, state the options and your recommendation
- Metrics always show trend (vs. last period)

## Executive Summary Guidelines

**Structure:** One-Liner → Key Numbers → Working/Not Working → Ask → Outlook
**Rules:**
- Must fit on one screen (no scrolling)
- Lead with the single most important thing
- Numbers always contextualized (vs. target, vs. last period)
- If there's an ask, be specific about what you need
