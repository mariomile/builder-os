---
name: discovery-methods
description: "Use when synthesizing user research, analyzing interview transcripts, scoring opportunities, or mapping insight patterns"
---

# Discovery Methods

Reference for qualitative research synthesis: affinity mapping, opportunity scoring, and insight generation.

**REQUIRED BACKGROUND:** `evidence-ledger` for tagging. `references/capability-map.md` before reaching for any source.

## Capabilities

| Capability | Used for | Floor when absent |
|-----------|----------|-------------------|
| `docs.search` / `docs.read` | Interview notes, feedback collections, research already written down | Work from what the user pastes in |
| `tickets.read` | Support tickets and bug reports as unsolicited feedback | Skip, and note the gap |
| `meetings.read` | Call transcripts | Skip, and note the gap |
| `research.search` | Saved highlights and reading on the problem space | Skip; it is enrichment, never evidence about *these* users |
| `files.read` / `files.write` | Transcripts on disk and the artifact itself | Always present |

**Text the user provides is the primary input in every configuration.** Connected sources are enrichment. A synthesis of eight pasted transcripts with nothing connected is the normal case, not the degraded one.

## Procedure

### 1. Resolve capabilities and ingest

Run the resolution protocol from `references/capability-map.md`. Collect every available input: pasted text first, then whatever `docs.search`, `tickets.read` and `meetings.read` reach.

Per entry, extract: participant (role, company size, plan, anonymized as needed), context (what they were doing, what triggered the feedback), exact quotes marked as quotes, and researcher observations marked as observations. The distinction between a quote and an observation is load-bearing: one is evidence, the other is interpretation, and a synthesis that blurs them cannot be audited.

### 2. Code the observations

One code per distinct observation, phrased in the participant's language rather than yours. Resist naming the solution in the code: "could not find where to invite a teammate" is a code, "needs better invite UX" is a conclusion wearing a code's clothes.

### 3. Group into themes

Affinity-map the codes. A theme needs a name, the codes under it, and the count of distinct participants (not mentions) who produced it. Three mentions from one person is one participant.

### 4. Quantify

Per theme: participants affected, share of the sample, segments over-represented in it, and severity as the participants described it rather than as you rank it. State the sample size next to every percentage. "60% of users" from a sample of five is a number that will be quoted back without its denominator, so write it as "3 of 5 participants".

### 5. Score opportunities

Apply the ODT scoring below. Every opportunity cites the themes and therefore the participants behind it.

### 6. Write insight cards and report

One card per insight that survived scoring. Then emit the output contract, including the gaps: the questions this research did not answer and the sample it would take to answer them.

## Output Contract

```markdown
## DISCOVERY SYNTHESIS COMPLETE

**Sample:** {n participants, how recruited, over what period}
**Sources:** {each, with what it contributed}
**Capabilities resolved:** {capability → concrete source, or "none: user-provided text only"}

### Themes
{name, participants affected of n, segments, representative quote}

### Opportunity Map
{scored, each citing its themes}

### Insight Cards
{one per surviving insight}

### Confidence
{per theme, with the reason}

### Research Gaps
{what this sample cannot answer, and what would}
```

## Synthesis Process

```
Raw Data → Codes → Themes → Patterns → Opportunities → Insights → Recommendations
```

1. **Code**: Label each observation with a short descriptive tag
2. **Group**: Cluster similar codes into themes
3. **Count**: Quantify prevalence (% of participants) and intensity (mentions per participant)
4. **Score**: Apply opportunity scoring framework
5. **Generate**: Create structured insight cards

## Coding Guide

| Raw Observation | Code |
|----------------|------|
| "I couldn't find the export button" | `[Feature Discovery: Export]` |
| "Setup took us 3 days" | `[Setup Friction: Duration]` |
| "The moment I saw the report I was sold" | `[Aha Moment: Report]` |
| "I wish I could share this with my team" | `[Unmet Need: Collaboration]` |
| "We ended up building a workaround in Sheets" | `[Workaround: Manual Process]` |

## Opportunity Scoring (ODT)

Teresa Torres' Opportunity Solution Tree framework:

```
Opportunity Score = Importance + (Importance - Satisfaction)
```

| Score Range | Priority | Action |
|------------|----------|--------|
| 8-10 | Critical | Build now — high importance, low satisfaction |
| 5-7 | High | Plan for next cycle |
| 3-4 | Medium | Consider if low effort |
| 1-2 | Low | Defer or ignore |

**Importance scale (1-5):** Based on research prevalence
- 5: >80% of participants, described as critical
- 4: >60%, significant pain
- 3: 30-60%, moderate pain
- 2: <30%, minor convenience
- 1: Edge case, rarely mentioned

**Satisfaction scale (1-5):** How well current solution works
- 5: Delighted, no complaints
- 4: Mostly satisfied, minor friction
- 3: Neutral, some workarounds
- 2: Frustrated, significant workarounds
- 1: Broken, active complaints

## Insight Card Template

```markdown
### Insight: {Descriptive Title}

**Pattern:** {What we observed, stated as a pattern not an anecdote}
**Evidence:** {N} participants ({%}), {M} total mentions
**Confidence:** {High (>60%) / Medium (30-60%) / Low (<30%)}

**Key quotes:**
> "{exact quote}" — P{n}, {role at company_size}
> "{exact quote}" — P{n}, {role}

**Implication:** {What this means for the product}
**Opportunity:** {Specific thing to build or change}
**Opportunity Score:** {value}
```

## Confidence Levels

| Level | Prevalence | Intensity | Recommendation |
|-------|-----------|-----------|----------------|
| High | >60% | >1 mention/person | Act on this — strong signal |
| Medium | 30-60% | ~1 mention/person | Validate further before committing |
| Low | <30% | <1 mention/person | Note but don't prioritize |

## Research Gap Identification

After synthesis, check for:
- **Segments not represented**: Which user types were not interviewed?
- **Questions not asked**: What do we still not know?
- **Contradictions**: Where do participants disagree? Why?
- **Behavioral vs. stated**: Did observed behavior match stated preferences?

For each gap, recommend the research method to fill it:
- **Interview more**: If need qualitative depth on a specific theme
- **Survey**: If need quantitative validation of a pattern
- **Usability test**: If need to observe specific interaction
- **Data analysis**: If behavioral data could answer the question
