---
name: pm-artifacts
description: "Use when generating PRDs, release notes, stakeholder updates, or executive summaries — provides templates and format guidelines for each artifact type"
---

# PM Artifacts

Templates and guidelines for standard PM documents. Each template specifies structure, audience, tone, and expected length.

Load `evidence-ledger` when an artifact needs lifecycle tags, and [capability mapping](../../references/capability-map.md) when retrieving context or writing to a connected destination.

Read [operating modes](../../references/operating-modes.md) first. For a standalone request, use supplied requirements and sources; keep the requested format and destination. Lifecycle artifact paths, gates and state writes below apply only to an explicitly selected initiative.

## Capabilities

| Capability | Used for | Floor when absent |
|-----------|----------|-------------------|
| `files.read` / `files.write` | Reading context, writing the artifact | Use only when the requested destination is a local file |
| `repo.read` | README, changelog, git history, the feature's own code | Ask the user for the context instead |
| `docs.search` / `docs.read` | Prior artifacts, project context, decision records | Ask |
| `docs.write` | Publishing the artifact where the team reads it | Use for a requested connected document; if unavailable, report the destination blocker and provide a draft |
| `analytics.query` / `db.query` | Baselines for the success metrics section | Write the metric with its baseline marked unavailable and the shape that would fill it |

**The requested destination defines delivery.** An inline PRD is delivered in chat; a Google Doc request is delivered to that document when the capability resolves; a requested file is saved at that path. Do not create a local copy or publish elsewhere by default. For lifecycle artifacts, keep the canonical artifact available to the initiative, using a resolving pointer or a copy only within the agreed contract.

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

Load only the relevant [template](references/templates.md). User structure and length constraints take precedence; omit inapplicable sections and explain material omissions.

### 4. Check against the type's rules

Each artifact type has one failure mode it falls into by default, listed in Common Mistakes. Check for that one explicitly before finishing.

### 5. Deliver to the requested destination

Return inline text or write the requested file or connected document. Verify the saved document when applicable. If a long-form file destination is ambiguous, clarify it before writing; continue drafting meanwhile.

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

## Output Contract

```markdown
## ARTIFACT WRITTEN

**Type:** {PRD / release notes / stakeholder update / executive summary}
**Delivered via:** {inline / verified path / connected document link}
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
| Any | Creating a file despite an inline-only request | Deliver the requested format; no unsolicited copy |
| PRD | Missing lifecycle files treated as a blocker | Supplied requirements are sufficient for a standalone draft; mark unknowns |
