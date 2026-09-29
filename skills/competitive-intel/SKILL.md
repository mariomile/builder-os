---
name: competitive-intel
description: "Use when analyzing competitors, building feature matrices, mapping market positioning, or preparing competitive briefs"
---

# Competitive Intelligence

## Mode and resources

Follow [operating modes and resource paths](../../references/operating-modes.md). **Standalone:** Analyze the requested competitors or positioning question using supplied material and current relevant sources. Return only the requested comparison, brief or recommendation. No phase files, initiative state, initialization or gate override are required. Preserve the requested format and destination.

**Lifecycle:** Apply the named phase prerequisites, artifact paths and gate recording below only when the user requests that phase or initiative. Missing prerequisites block that lifecycle transition, not a standalone artifact. Completion markers with gate verdicts claim lifecycle completion only after the gate passes.

Load `evidence-ledger` for lifecycle evidence storage, and `references/capability-map.md` when resolving a source. Standalone citations can point directly to the supplied material or source URLs. Retrieve facts before asking; suggest recommended options for decisions, not answers to factual observations.


Method for competitive analysis, question-specific source evaluation and output templates.

## Capabilities

| Capability | Used for | Floor when absent |
|-----------|----------|-------------------|
| `docs.search` | Competitive notes and market research the team already wrote | Skip, and start from the public web |
| `research.search` | Saved reading on the category and its players | Skip; substitute `web.search` |
| `web.search` | The live landscape: pricing, positioning, reviews, comparisons | Use supplied dated material; mark specific claims unverified/stale and limit conclusions where current sources are unavailable |
| `web.fetch` | Competitor pricing and feature pages, read directly | Use snippets only as leads or explicitly unverified evidence; do not claim current terms were checked |
| `repo.read` | Dependencies and docs that reveal who the incumbents are | Skip when there is no codebase |
| `files.read` / `files.write` | The artifact itself | Always present |

## Source Fitness

Choose evidence by the question, directness, date, population and limitations; no source class always outranks another.

| Question | Most pertinent evidence | Limitation to preserve |
|----------|-------------------------|------------------------|
| Current pricing or published feature terms | Current official page read directly, with region/plan/date | Marketing terms are claims about availability, not proof of practical quality |
| Workflow quality or buyer friction | Relevant recent user observations, trials and sales/support records | Sampling, segment and recency may limit generalization |
| Category positioning | Current competitor messaging and relevant buyer language | Separate what the vendor claims from independent buyer perception |
| Integration context | Current code/dependency and integration documentation | Being installed does not prove customer preference |

Saved research and team notes are leads, not automatic authority. Keep conflicting claims visible, record source/access dates and explain which evidence fits the specific claim. A newer source may supersede an older price; a relevant direct user observation may be better for a behavior question.

## Procedure

### 1. Resolve capabilities and fix the frame

Name the category and the set of competitors before searching, and say why each is in the set: direct substitute, adjacent, or the status quo (a spreadsheet, an intern, doing nothing). The status quo is the most common competitor and the one most often left out of the matrix.

### 2. Gather evidence fitted to each claim

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

## Common Mistakes

| Mistake | Why it fails | Correct |
|---------|-------------|---------|
| Old internal note overriding a current official price | Source class does not establish freshness | Compare plan/region/date and retain the change in provenance |
| Treating a search snippet as verified current terms | It may be stale or omit conditions | Read the pertinent source or mark the claim unverified |
| Requiring pipeline state for a scoped artifact | Expands the request | Use supplied inputs and the requested output destination |
| Filling missing data with zero | Creates false certainty | Preserve unknown and state the measurement needed |
