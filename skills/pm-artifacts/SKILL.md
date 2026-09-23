---
name: pm-artifacts
description: "Use when generating PRDs, release notes, stakeholder updates, or executive summaries — provides templates and format guidelines for each artifact type"
---

# PM Artifacts

Templates and guidelines for standard PM documents. Each template specifies structure, audience, tone, and expected length.

**REQUIRED BACKGROUND:** `evidence-ledger` for tagging. `references/capability-map.md` before reaching for context or writing anywhere but the local filesystem.

## Capabilities

| Capability | Used for | Floor when absent |
|-----------|----------|-------------------|
| `files.read` / `files.write` | Reading context, writing the artifact | Always present. The artifact is a file first |
| `repo.read` | README, changelog, git history, the feature's own code | Ask the user for the context instead |
| `docs.search` / `docs.read` | Prior artifacts, project context, decision records | Ask |
| `docs.write` | Publishing the artifact where the team reads it | Skip. The file is the deliverable; publishing is a convenience |
| `analytics.query` / `db.query` | Baselines for the success metrics section | Write the metric with its baseline marked unavailable and the shape that would fill it |

**Publishing is never the deliverable.** The artifact is written to disk first, every time. Where `docs.write` resolved and the user asked, it is also published, and the artifact says where it went. An artifact that exists only inside somebody's knowledge base is one the pipeline cannot read back.

## Procedure

### 1. Determine the artifact type

| Type | Trigger |
|------|---------|
| PRD | "write a PRD", "spec this feature" |
| Release notes | "write release notes", a version shipping |
| Stakeholder update | "status update", "stakeholder update" |
| Executive summary | "exec summary", "board update" |

### 2. Gather context

The feature or period in question, plus whatever prior phase output exists: a diagnosis, a growth analysis, a discovery synthesis, a spec. Incorporate their numbers with their tags rather than restating them loosely. Where a prior artifact says a metric is unavailable, this artifact says so too, rather than quietly filling it in.

### 3. Write to the template

Templates below. Every template is a floor, not a ceiling: sections that do not apply are removed with a line saying why, not left as empty headings.

### 4. Check against the type's rules

Each artifact type has one failure mode it falls into by default, listed in Common Mistakes. Check for that one explicitly before finishing.

### 5. Write the file, then offer to publish

Save to the project (`docs/` for a codebase, the project folder for a vault). Then, only if the user asked and `docs.write` resolved, publish and record the destination.

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

## Templates

### PRD

```markdown
# PRD: {feature}

**Author:** {name} · **Date:** {today} · **Status:** Draft · **Target:** {release}

## Problem Statement

**Who** has this problem: {specific persona}
**What** the problem is: {observable behavior or pain}
**Evidence:** {numbers with their tags, or the note that it is unvalidated}
**Cost of not solving:** {what continues to happen}

## Proposed Solution

### Overview
{1-2 paragraphs}

### User Stories
| # | As a… | I want to… | So that… | Priority |

### Detailed Requirements

**Requirement:** {what it must do}
**Acceptance criteria:**
- [ ] {specific, testable}

**Edge cases:**
- {case}: {expected behavior}

### Out of Scope
{explicit. Ambiguity here becomes scope creep later}

## Success Metrics
| Metric | Baseline (tag) | Target | How it will be measured |
| {output} | | | |
| {input} | | | |
| {guardrail} | | Must not degrade | |

## Technical Considerations
Dependencies · risks · data requirements (new events, schema changes)

## Timeline
| Phase | Scope | Duration | Owner |

## Open Questions
{questions that need answering before or during the build}
```

A PRD with no baseline in its success metrics cannot be evaluated after launch. Where the baseline is unavailable, write it as unavailable with the shape that would establish it, and treat establishing it as part of the work.

### Release Notes

```markdown
# Release Notes — {version or date}

## Highlights

### {feature}
{1-2 sentences on what it does and why it matters to the reader. Benefit, not implementation.}

## Improvements
- **{area}:** {what changed and why it is better}

## Bug Fixes
- Fixed {issue} that affected {who}

## Coming Soon
- {preview}
```

Tone: writing to a colleague, not filing a changelog. No jargon, no internal component names, no ticket numbers.

### Stakeholder Update

```markdown
# {product} Update — {date}

## TL;DR
{what happened, what is next, any blocker. Two sentences.}

## Progress
| Area | Status | Detail |
| {area} | On track / At risk / Blocked | {detail, and the mitigation or the ask} |

## Key Metrics
| Metric | Last period | This period | Trend |

## Decisions Needed
1. **{decision}:** {context, options, your recommendation}

## Next Period
1. {priority}
```

An update with no ask is a broadcast. If something is needed, it goes in Decisions Needed with a recommendation attached.

### Executive Summary

```markdown
# {product} Executive Summary — {period}

## One-Liner
{where we are, one sentence}

## Key Numbers
| Metric | Value | vs. target | vs. last period |

## What's Working
{2-3 points, each with a number}

## What Needs Attention
{2-3 points, each with a number and a proposed action}

## Strategic Ask
{what is needed from leadership, or "none this period"}

## 90-Day Outlook
{where this lands if the current trajectory holds}
```

Half a page. An executive summary that runs to two pages was not summarized.

## Output Contract

```markdown
## ARTIFACT WRITTEN

**Type:** {PRD / release notes / stakeholder update / executive summary}
**Written to:** {path} {and published to {destination}, where applicable}
**Unavailable inputs:** {any metric or baseline left unfilled, with the question that would fill it}

---

{the artifact}
```

## Common Mistakes

| Artifact | Default failure | Check |
|----------|----------------|-------|
| PRD | Success metrics with no baseline | Every metric has a baseline or an explicit unavailable |
| PRD | Requirements that cannot be tested | "Intuitive" and "fast" are not acceptance criteria |
| PRD | No out-of-scope section | Write it, even when it feels obvious |
| Release notes | Written for the engineer who built it | Benefit first, no internal names |
| Stakeholder update | No ask | If something is needed, say so explicitly |
| Executive summary | Longer than a page | Cut to the numbers and the decision |
| Any | Publishing instead of writing a file | The file always exists first |
