---
name: discovery-methods
description: "Turns raw research into findings: synthesis of interviews and notes, themes with counts, opportunity scoring, each claim traced to its source. Use when synthesizing research or transcripts, clustering feedback or tickets, or scoring opportunities."
---

# Discovery Methods

**Synthesis** turns raw research into findings a decision can rest on: every claim traced to a participant, every share written with its denominator, prevalence kept apart from confidence. Text the person pastes is the primary input in every configuration; eight pasted transcripts with nothing connected is the normal case.

**Mode.** Standalone synthesis uses the supplied research and the requested destination, and runs only the steps the request needs (a theme summary stops at step 4). In the lifecycle it runs inside phase 1 for `research-methods`. Both per [operating modes](../../references/operating-modes.md). Load `evidence-ledger` when recording claims, and the [synthesis method details](references/synthesis-methods.md) for the coding, scoring, card, confidence or research-gap section a step needs.

## Procedure

1. **Ingest.** Start with the supplied inputs; reach for connected sources to close a named gap or when broader research was requested. Per entry, extract the participant (role, company size, plan, anonymized as needed), the context (what they were doing, what triggered the feedback), exact quotes marked as quotes, and researcher observations marked as observations: a quote is evidence, an observation is interpretation. Done when every entry has its participant, context, quotes and observations separated.
2. **Code the observations.** One code per distinct observation, in the participant's language, naming the problem rather than a solution: "could not find where to invite a teammate" is a code, "needs better invite UX" is a conclusion. Done when every observation carries a code.
3. **Group into themes.** Affinity-map the codes. A theme has a name, its codes, and the count of distinct participants (not mentions) behind it. Done when every code sits in a theme or is listed as an outlier.
4. **Quantify.** Per theme: participants affected, share of the sample, over-represented segments, and severity as participants described it. Write every share with its denominator ("3 of 5 participants"). Prevalence is a sample count; report evidence strength (recruitment, segment coverage, behavior, triangulation, contradictions) separately, since convenience-interview percentages say nothing about the population. Done when every theme has its count, denominator and strength.
5. **Score opportunities** only when prioritization is requested and paired respondent importance and satisfaction ratings exist, with the adapted ODI score in the method details (`I + max(I - S, 0)` on 1–5 inputs, range 1–9, per respondent then summarized within segment; a local adaptation of ODI). Without ratings, report the opportunities unscored with the ratings that are missing. Every opportunity cites its themes and participants; a score informs the choice and leaves it to the person. Done when each opportunity is scored from real ratings or marked unscored with the reason.
6. **Write insight cards and report.** One card per relevant insight, qualitative findings included when ratings are missing, then the output contract with the questions this research left open and the sample it would take to answer them. Done when every theme appears in a card, the opportunity map or the gaps.

## Capabilities

| Capability | Used for | Floor when absent |
|-----------|----------|-------------------|
| `docs.search` / `docs.read` | Interview notes, feedback collections, research already written | Work from what the person pastes |
| `tickets.read` | Support tickets and bug reports as unsolicited feedback | Skip, and note the gap |
| `meetings.read` | Call transcripts | Skip, and note the gap |
| `research.search` | Saved highlights and reading on the problem space | Skip; it enriches, and says nothing about *these* users |
| `files.read` / `files.write` | Transcripts on disk and the artifact | Always present |

## Output Contract

Ends with `## DISCOVERY SYNTHESIS COMPLETE`, in this shape:

```markdown
## DISCOVERY SYNTHESIS COMPLETE

**Sample:** {n distinct participants, segments, recruitment and exclusions, period, source limitations}
**Sources:** {each, with what it contributed}
**Capabilities resolved:** {capability → concrete source, or "none: user-provided text only"}

### Themes
{name, participants affected of n, segments, representative quote}

### Opportunity Map
{scored only with valid ratings; otherwise unscored, each citing its themes}

### Insight Cards
{one per surviving insight}

### Confidence
{per theme: evidence strength, sampling limits, contradictions; prevalence shown separately}

### Research Gaps
{what this sample cannot answer, and what would}
```
