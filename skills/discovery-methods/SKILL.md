---
name: discovery-methods
description: "Use when synthesizing user research, analyzing interview transcripts, scoring opportunities, or mapping insight patterns"
---

# Discovery Methods

## Scope and resources

Follow `../../references/operating-modes.md`, resolved from this `SKILL.md`: Standalone synthesis uses supplied research and the requested output destination, without initiative state. Run only the steps relevant to the request; a theme summary does not require opportunity scoring or a solution recommendation. Load `evidence-ledger` when recording claims, and `references/capability-map.md` (its resolution protocol) only before reaching for a connected source. Load [synthesis method details](references/synthesis-methods.md) only for the relevant coding, scoring, card, confidence, research-gap or common-mistakes section; the file resolves relative to this `SKILL.md`.

## Capabilities

| Capability | Used for | Floor when absent |
|-----------|----------|-------------------|
| `docs.search` / `docs.read` | Interview notes, feedback collections, research already written down | Work from what the user pastes in |
| `tickets.read` | Support tickets and bug reports as unsolicited feedback | Skip, and note the gap |
| `meetings.read` | Call transcripts | Skip, and note the gap |
| `research.search` | Saved highlights and reading on the problem space | Skip; it is enrichment, never evidence about *these* users |
| `files.read` / `files.write` | Transcripts on disk and the artifact itself | Always present |

**Text the user provides is the primary input in every configuration.** Connected sources are enrichment; eight pasted transcripts with nothing connected is the normal case.

## Procedure

1. **Ingest.** Start with the supplied inputs; search connected sources only to close a relevant gap or when broader research was requested; availability alone does not widen the corpus. Per entry, extract the participant (role, company size, plan, anonymized as needed), the context (what they were doing, what triggered the feedback), exact quotes marked as quotes, and researcher observations marked as observations. Keep them apart: a quote is evidence, an observation is interpretation.
2. **Code the observations.** One code per distinct observation, in the participant's language rather than yours, naming no solution: "could not find where to invite a teammate" is a code, "needs better invite UX" is a conclusion.
3. **Group into themes.** Affinity-map the codes. A theme needs a name, its codes, and the count of distinct participants (not mentions) who produced it.
4. **Quantify.** Per theme: participants affected, share of the sample, segments over-represented, and severity as the participants described it. Write every share with its denominator: "3 of 5 participants", not "60% of users". Prevalence is a sample count; report evidence strength (recruitment, segment coverage, behavior, triangulation, contradictions) separately. Convenience-interview percentages are not population confidence.
5. **Score opportunities** only when prioritization is requested and paired respondent importance/satisfaction ratings exist, using the explicitly adapted ODI score in the method details (`I + max(I - S, 0)` on 1–5 inputs, range 1–9, per respondent then summarized within segment; a local adaptation, not the original ODI aggregate survey method). Otherwise report unscored opportunities with the missing ratings; missing ratings are unavailable, never inferred from mention prevalence. Every opportunity cites the themes and participants behind it; a high score does not select a solution or authorize building.
6. **Write insight cards and report.** One card per relevant insight; keep qualitative findings even when ratings are missing. Emit the output contract, including the questions this research did not answer and the sample it would take to answer them.

## Output Contract

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
