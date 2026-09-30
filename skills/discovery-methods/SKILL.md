---
name: discovery-methods
description: "Use when synthesizing user research, analyzing interview transcripts, scoring opportunities, or mapping insight patterns"
---

# Discovery Methods

Reference for qualitative research synthesis: affinity mapping, opportunity scoring, and insight generation.

## Scope and resources

Follow `../../references/operating-modes.md`, resolved from this `SKILL.md`: Standalone synthesis uses supplied research and the requested output destination, without initiative state. Run only the steps relevant to the request; a theme summary does not require opportunity scoring or a solution recommendation. Load `evidence-ledger` when recording claims and `references/capability-map.md` only before reaching for a connected source.

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

Run the resolution protocol from `references/capability-map.md`. Start with the supplied inputs. Search connected sources only to close a relevant gap or when broader research was requested; availability alone does not widen the corpus.

Per entry, extract: participant (role, company size, plan, anonymized as needed), context (what they were doing, what triggered the feedback), exact quotes marked as quotes, and researcher observations marked as observations. The distinction between a quote and an observation is load-bearing: one is evidence, the other is interpretation, and a synthesis that blurs them cannot be audited.

### 2. Code the observations

One code per distinct observation, phrased in the participant's language rather than yours. Resist naming the solution in the code: "could not find where to invite a teammate" is a code, "needs better invite UX" is a conclusion wearing a code's clothes.

### 3. Group into themes

Affinity-map the codes. A theme needs a name, the codes under it, and the count of distinct participants (not mentions) who produced it. Three mentions from one person is one participant.

### 4. Quantify

Per theme: participants affected, share of the sample, segments over-represented in it, and severity as the participants described it rather than as you rank it. State the sample size next to every percentage. "60% of users" from a sample of five is a number that will be quoted back without its denominator, so write it as "3 of 5 participants".

### 5. Score opportunities

When prioritization is requested and importance/satisfaction ratings exist, apply the explicitly adapted ODI score and paired-rating contract in `references/synthesis-methods.md`. Otherwise report unscored opportunities with the missing ratings. Every opportunity cites the themes and participants behind it; scoring does not select a solution or authorize building.

### 6. Write insight cards and report

One card per relevant insight; do not discard qualitative findings merely because ratings are missing. Then emit the output contract, including the gaps: the questions this research did not answer and the sample it would take to answer them.

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

## Scoring and confidence invariants

For requested prioritization with paired respondent importance/satisfaction ratings, use the explicitly adapted ODI method: `I + max(I - S, 0)` on 1–5 inputs, range 1–9. Calculate per respondent then summarize within segment; missing ratings are unavailable. Do not infer importance from mention prevalence or treat a high score as build authorization. It is a local adaptation, not the original ODI aggregate survey method.

Prevalence is a sample count; evidence strength considers recruitment, segment coverage, behavior, triangulation and contradictions. Convenience-interview percentages are not population confidence. Load [synthesis method details](references/synthesis-methods.md) only for the relevant coding, scoring, card, confidence or research-gap section; the file resolves relative to this `SKILL.md`.

## Common Mistakes

| Mistake | Correction |
|---------|------------|
| Labeling interview prevalence “confidence” | Separate counts from evidence strength and sampling limits |
| Counting several quotes from one person as several users | Deduplicate participants, preserving repeated-mention context |
| ODT attributed an ODI formula with incompatible range | Name the adapted ODI method, paired ratings, 1–9 range and local heuristic |
| Deriving importance from mention share | Require direct outcome ratings or report score unavailable |
| Opportunity interpreted as feature commitment | State unmet outcome and separate solution testing |

**Narrow example:** “Summarize these five transcripts into three themes” produces three themes with participant counts, quotes and sampling limits in the requested format; no initiative, full scoring exercise or mandatory opportunity selection.
