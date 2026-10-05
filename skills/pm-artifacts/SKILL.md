---
name: pm-artifacts
description: "Use when generating PRDs, release notes, stakeholder updates, or executive summaries — provides templates and format guidelines for each artifact type"
---

# PM Artifacts

Read [operating modes](../../references/operating-modes.md) first. For a standalone request, use supplied requirements and sources. Lifecycle artifact paths, gates and state writes apply only to an explicitly selected initiative.

Load `evidence-ledger` when an artifact needs lifecycle tags, and [capability mapping](../../references/capability-map.md) when retrieving context or writing to a connected destination. Load only the relevant section of [templates and guidelines](references/templates.md) for the requested type: audience, tone, length, structure rules and the template.

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

1. **Determine the artifact type.** PRD ("write a PRD", "spec this feature"); release notes ("write release notes", a version shipping); stakeholder update ("status update", "stakeholder update"); executive summary ("exec summary", "board update").
2. **Gather context.** The feature or period in question, plus whatever prior phase output exists: a diagnosis, a growth analysis, a discovery synthesis, a spec. Carry their numbers with their tags rather than restating them loosely. Where a prior artifact says a metric is unavailable, this artifact says so too.
3. **Write to the template.** User structure and length constraints take precedence; omit inapplicable sections and explain material omissions.
4. **Check the type's default failure** in Common Mistakes explicitly before finishing.
5. **Deliver to the requested destination.** Return inline text or write the requested file or connected document; verify the saved document when applicable. If a long-form file destination is ambiguous, clarify it before writing and continue drafting meanwhile.

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
