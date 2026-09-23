---
name: competitive-intel
description: "Use when analyzing competitors, building feature matrices, mapping market positioning, or preparing competitive briefs"
---

# Competitive Intelligence

Reference for competitive analysis: methodology, source priority, and output templates.

**REQUIRED BACKGROUND:** `evidence-ledger` for tagging. `references/capability-map.md` before reaching for any source.

## Capabilities

| Capability | Used for | Floor when absent |
|-----------|----------|-------------------|
| `docs.search` | Competitive notes and market research the team already wrote | Skip, and start from the public web |
| `research.search` | Saved reading on the category and its players | Skip; substitute `web.search` |
| `web.search` | The live landscape: pricing, positioning, reviews, comparisons | Work from what the user knows, and mark the whole analysis as undated |
| `web.fetch` | Competitor pricing and feature pages, read directly | Rely on search snippets, which are staler and sometimes wrong |
| `repo.read` | Dependencies and docs that reveal who the incumbents are | Skip when there is no codebase |
| `files.read` / `files.write` | The artifact itself | Always present |

## Source Priority

Highest trust first. Use what resolves, skip what does not, and never let a lower source silently overwrite a higher one.

1. **What the team already knows.** Notes, prior analyses, sales call patterns. Highest trust because it is first-hand and about this market.
2. **Saved reading.** Curated articles on the category.
3. **Live web search.** Comparisons, pricing pages, review sites, "alternatives to X" pages.
4. **Competitor properties, read directly.** Pricing and feature pages fetched rather than summarized.
5. **The codebase.** Dependencies and integrations name the incumbents a product already lives beside.

Vendor marketing describes the product the vendor wishes it sold. Review sites describe the product six months ago. Neither is wrong; both are dated, and the date belongs in the citation.

## Procedure

### 1. Resolve capabilities and fix the frame

Name the category and the set of competitors before searching, and say why each is in the set: direct substitute, adjacent, or the status quo (a spreadsheet, an intern, doing nothing). The status quo is the most common competitor and the one most often left out of the matrix.

### 2. Gather, in source priority order

Per competitor: positioning claim in their own words, pricing with its date, the features that matter to this comparison, and who they say they are for. Tag every fact with its source and the date it was read.

### 3. Build the feature matrix

Only rows that would change a buying decision. A matrix with forty rows is a way of avoiding the three that matter.

### 4. Map positioning

Two axes that actually separate the players. If everyone clusters, the axes are wrong, not the market.

### 5. Find the differentiation

What this product does that the others structurally cannot, not what it does better. Better is a claim; cannot is a position.

### 6. Report

Emit the output contract. Every claim cited with its source and date. Where the landscape could not be read live, say so once at the top rather than hedging every line.

## Output Contract

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

## Feature Matrix Template

```markdown
| Category / Feature | {Product} | {Comp A} | {Comp B} | {Comp C} |
|-------------------|-----------|----------|----------|----------|
| **Core** |
| {feature} | ✅ | ⚠️ | ❌ | ✅ |
| **Pricing** |
| Free tier | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ |
| Starting price | ${n}/mo | ${n}/mo | ${n}/mo | ${n}/mo |
| **Platform** |
| API | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ |
| **Target** |
| Primary ICP | {segment} | {segment} | {segment} | {segment} |
```

Legend: ✅ Full | ⚠️ Partial | ❌ None | — Unknown

## Positioning Map Axes

Choose 2 axes that reveal strategic white space:

| Axis Pair | Best When |
|-----------|-----------|
| Simple ↔ Complex, SMB ↔ Enterprise | B2B with varied market segments |
| Self-serve ↔ Sales-led, Horizontal ↔ Vertical | GTM strategy differences |
| Price: Low ↔ High, Depth: Shallow ↔ Deep | Value proposition differentiation |
| AI-native ↔ Traditional, New ↔ Established | Technology disruption analysis |

## Competitive Brief Structure

1. **Executive Summary** (3-5 sentences)
2. **Feature Matrix** (structured comparison)
3. **Positioning Map** (2×2 visual)
4. **Differentiation Analysis** (strengths/weaknesses table)
5. **Strategic Recommendations** (compete, avoid, position, moat, watch)
6. **Sources** (numbered, with URLs)

## Citation Standard

Every factual claim must cite its source:

```markdown
Competitor X launched feature Y in Q1 2026 [1].
Their pricing starts at $49/mo for teams up to 10 [2].

### Sources
1. {URL or article title, date accessed}
2. {URL or article title, date accessed}
```

No source = speculation, not intelligence. Mark unverified claims as `[unverified]`.
