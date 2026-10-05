---
name: competitive-intel
description: "Use when analyzing competitors, building feature matrices, mapping market positioning, or preparing competitive briefs"
---

# Competitive Intelligence

## Mode and resources

Follow [operating modes and resource paths](../../references/operating-modes.md). **Standalone:** Analyze the requested competitors or positioning question using supplied material and current relevant sources. Return only the requested comparison, brief or recommendation. **Lifecycle:** The prerequisites, artifact paths and gate recording below apply only when the user requests a phase or initiative; a missing prerequisite blocks that transition, not a standalone artifact.

Load `evidence-ledger` for lifecycle evidence storage, and `references/capability-map.md` when resolving a source. Retrieve facts before asking; ask what remains per the `pressure-testing` rounds: every question lists the options, recommends one and says why, and a factual question offers ways to close the gap, never guessed values.

Read [templates and source fitness](references/competitive-templates.md) when weighing sources for a claim, or for the feature matrix, positioning axes, brief structure, citation format and mistakes with reasons.

## Capabilities

| Capability | Used for | Floor when absent |
|-----------|----------|-------------------|
| `docs.search` | Competitive notes and market research the team already wrote | Skip, and start from the public web |
| `research.search` | Saved reading on the category and its players | Skip; substitute `web.search` |
| `web.search` | The live landscape: pricing, positioning, reviews, comparisons | Use supplied dated material; mark specific claims unverified/stale and limit conclusions where current sources are unavailable |
| `web.fetch` | Competitor pricing and feature pages, read directly | Use snippets only as leads or explicitly unverified evidence; do not claim current terms were checked |
| `repo.read` | Dependencies and docs that reveal who the incumbents are | Skip when there is no codebase |
| `files.read` / `files.write` | The artifact itself | Always present |

## Procedure

1. **Fix the frame.** Resolve capabilities, then name the category and the competitor set before searching, saying why each is in it: direct substitute, adjacent, or the status quo (a spreadsheet, an intern, doing nothing). The status quo is the competitor most often left out.
2. **Gather evidence fitted to each claim.** Per competitor: positioning claim in their own words, pricing with its date, the features that matter to this comparison, and who they say they are for. Choose evidence by the question, directness, date, population and limitations; no source class always outranks another, and saved notes are leads, not authority. Keep conflicting claims visible. Tag every fact with its source and the date it was read; mark unverified claims `[unverified]`.
3. **Build the feature matrix** with only the rows that would change a buying decision.
4. **Map positioning** on two axes that actually separate the players. If everyone clusters, the axes are wrong, not the market.
5. **Find the differentiation**: what this product does that the others structurally cannot, not what it does better.
6. **Report** per the output contract, every claim cited with its source and date. Where the landscape could not be read live, say so once at the top rather than hedging every line.

## Output Contract

Standalone output follows the requested format and destination; adapt the template only where useful and omit lifecycle gate claims. The paths below apply to lifecycle artifacts.

```markdown
## COMPETITIVE ANALYSIS COMPLETE

**Category:** {name} · **Competitors:** {set, with why each is in it}
**Read on:** {date} · **Capabilities resolved:** {capability → concrete source}

### Executive Summary
### Feature Matrix
### Positioning Map
### Differentiation
{what this product can do that the others structurally cannot}

### Strategic Recommendations
### Sources
{every claim, its source, its date}
```

## Common Mistakes

| Mistake | Correct |
|---------|---------|
| Old internal note overriding a current official price | Compare plan/region/date and retain the change in provenance |
| Treating a search snippet as verified current terms | Read the pertinent source or mark the claim unverified |
| Filling missing data with zero | Preserve unknown and state the measurement needed |
