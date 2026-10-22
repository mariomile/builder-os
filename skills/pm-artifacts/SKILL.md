---
name: pm-artifacts
description: "Writes product communication in a fitting format: release notes, stakeholder updates, executive summaries, decision memos. Use when someone asks for release notes, a status update, an exec summary or a memo for a product decision."
---

# PM Artifacts

Product communication for a named reader: each type has a reader, a length and one **default failure** it falls into unless checked. Release notes, stakeholder updates, executive summaries, decision memos and PRDs.

**Mode.** Standalone by default, from supplied requirements and sources; inside an initiative the numbers carry their lifecycle tags. Both per [operating modes](../../references/operating-modes.md). Load the section of [templates and guidelines](references/templates.md) for the requested type: audience, tone, length, structure and template.

## Procedure

1. **Determine the artifact type.** PRD ("write a PRD", "spec this feature"); release notes ("write release notes", a version shipping); stakeholder update ("status update"); executive summary ("exec summary", "board update"); decision memo. Done when the type and its reader are named.
2. **Gather context.** The feature or period, plus any prior output: a diagnosis, a growth analysis, a discovery synthesis, a spec. Carry their numbers with their tags; a metric a prior artifact marks unavailable stays unavailable here. Done when every number you will use has its source.
3. **Write to the template.** The person's structure and length constraints come first; inapplicable sections are left out, and material omissions are explained. Done when every section of the template is written or its omission is stated.
4. **Check the type's default failure** in the table below. Done when the check for this type passes.
5. **Deliver to the requested destination:** inline text, the requested file, or the connected document, verified once saved. A long-form file with an ambiguous destination is clarified before writing, while drafting continues. Done when the artifact is at its destination.

## Default failures

| Artifact | Default failure | Check |
|----------|----------------|-------|
| PRD | Success metrics with no baseline | Every metric has a baseline or an explicit unavailable |
| PRD | Requirements no one can test | Each requirement names an observable result; "intuitive" and "fast" become numbers |
| PRD | Scope with no boundary | An out-of-scope section, even when it feels obvious |
| Release notes | Written for the engineer who built it | Benefit first, in the user's words |
| Stakeholder update | No ask | What is needed, from whom, by when |
| Executive summary | Longer than a page | The numbers and the decision, on one page |

## Capabilities

| Capability | Used for | Floor when absent |
|-----------|----------|-------------------|
| `files.read` / `files.write` | Reading context, writing the artifact | Use only when the requested destination is a local file |
| `repo.read` | README, changelog, git history, the feature's own code | Ask the person for the context |
| `docs.search` / `docs.read` | Prior artifacts, project context, decision records | Ask |
| `docs.write` | Publishing the artifact where the team reads it | Use for a requested connected document; if unavailable, report the destination blocker and provide a draft |
| `analytics.query` / `db.query` | Baselines for the success metrics section | Write the metric with its baseline marked unavailable and the shape that would fill it |

**The requested destination defines delivery.** An inline PRD is delivered in chat; a Google Doc request is delivered to that document when the capability resolves; a requested file is saved at that path. Deliver there and only there. For lifecycle artifacts, keep the canonical artifact available to the initiative, using a resolving pointer or a copy only within the agreed contract.

## Output Contract

Ends with `## ARTIFACT WRITTEN`, in this shape:

```markdown
## ARTIFACT WRITTEN

**Type:** {PRD / release notes / stakeholder update / executive summary}
**Delivered via:** {inline / verified path / connected document link}
**Unavailable inputs:** {any metric or baseline left unfilled, with the question that would fill it}

---

{the artifact}
```

