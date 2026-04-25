---
name: discovery-methods
description: "Use when synthesizing user research, analyzing interview transcripts, scoring opportunities, or mapping insight patterns"
---

# Discovery Methods

Reference for qualitative research synthesis: affinity mapping, opportunity scoring, and insight generation.

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
