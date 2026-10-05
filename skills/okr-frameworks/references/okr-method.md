# OKR Method Reference

Read when writing or reviewing objectives and key results (the KR quality check), scoring, checking alignment, finding a baseline, or setting the review cadence. The procedure is in [the skill](../SKILL.md).

## OKR Methodology

**Objectives** — qualitative, inspirational, time-bound. Answer: "Where are we going?"
- No metrics in objectives — those belong in Key Results
- Must be achievable in the period (typically 90 days)
- Should feel slightly uncomfortable — easy objectives are not OKRs
- Max 3 per team per quarter (fewer is better)
- An objective that survives unchanged for four quarters is a mission statement

**Key Results** — quantitative, binary-scorable. Answer: "How do we know we got there?"
- Formula: `[Verb] [metric] from [baseline] to [target] by [date]`
- Scored using the team’s committed/stretch convention; missing measurements remain unscored, not zero
- 2–4 KRs per Objective (3 is optimal)
- Every KR must be measurable — if you can't score it, rewrite it

### KR Formula Examples

| Good KR | Bad KR | Problem with bad |
|---------|--------|-----------------|
| Increase W4 retention from 18% to 28% by June 30 | Improve retention | No baseline, no target, no date |
| Grow MRR from $42K to $65K by end of Q2 | Revenue growth | Not specific |
| Reduce activation time from 4 days to 1 day by Q2 | Faster activation | No baseline |
| Increase report-sharing rate from 12% to 35% by Q2 | More sharing | No baseline |

### 0.7 Scoring Philosophy

For a team that explicitly uses stretch OKRs, 0.7 can be the agreed ambition target. Preserve the team’s convention: committed goals can require 1.0, and achieving them is not evidence of an easy target. The example bands below apply only to the selected stretch convention.

| Score | Meaning | Action |
|-------|---------|--------|
| 0.9–1.0 | Set bar higher next quarter | Celebrate, but question ambition |
| 0.7–0.89 | Success | Target zone |
| 0.4–0.69 | Partial — needs attention | Investigate blockers |
| 0.0–0.39 | Miss | Root cause analysis required |

## OKR Alignment

OKRs cascade: Company → Product → Team. BuilderOS focuses on the **Product-level OKR tree**.

**Alignment check:** Map to supplied company objectives where available. A standalone draft can state alignment unverified when the level above is missing; do not invent an objective or require a broader strategy exercise.

## Baseline Discovery Protocol

For each KR, find a real baseline — never estimate:

1. **Live data**: the relevant query shape or database reading; preserve definition, population, window, capture date and source
2. **Vault-based**: Search the vault for metric name + product name; check periodic notes
3. **User-provided**: Ask directly: "What's the current value of [metric]?"
4. **Unknown**: Record unknown plus the measurement method, owner and proposed capture date. Do not replace it with zero or a fabricated improvement target; propose "establish the baseline for X by {date}" when that is the useful result.

**Never write a KR with a made-up baseline.** A KR reading "from ??? to 30%" is not actionable.

A key result written as "improve activation to 40%" with no current number is unscoreable, and the team discovers this at review, not now. "Establish the baseline for X by {date}" is a legitimate key result and a far better one than a target invented to look decisive.

## Common Mistakes

A scoped OKR request uses supplied context and output destination; it does not require initiative state or gate overrides.

| Anti-pattern | Example | Fix |
|-------------|---------|-----|
| Task disguised as KR | "Launch new onboarding flow by Q2" | "Increase activation rate from 22% to 35% by Q2" |
| Objective that's a KR | "Grow revenue by 50%" | "Become the go-to analytics tool for Series A PMs" |
| Too many KRs | 7 KRs per Objective | Max 4 — cut the weakest |
| Sandbagged targets | Increase MAU from 500 to 510 | Target difficulty: 70% chance of hitting at full effort |
| Unknown baseline replaced by zero | "Increase activation from 0 to 40%" without data | Record unknown; establish a sourced baseline before setting the target |
| KR without measurement | "Improve NPS" | "Increase NPS from 32 to 48 by Q2 (quarterly survey)" |
| KRs all measuring same thing | 3 KRs about revenue | Use Metrics Triad: output + input + guardrail |

## Metrics Triad for OKRs

Every Objective should have KRs covering 3 types:

1. **Output KR** — the result you want (e.g., activation rate, MRR)
2. **Input KR** — the leading indicator you control (e.g., % users reaching step 3)
3. **Guardrail KR** — what must NOT degrade (e.g., churn rate, support volume)

## Review Cadence

| Review | When | What to Check |
|--------|------|---------------|
| Weekly check-in | Weekly | On track? Blockers emerging? |
| Mid-quarter pivot | Week 6 | KRs below 30% → adjust scope or address blockers |
| End-of-quarter scoring | Final week | Score all KRs 0.0–1.0 |
| OKR retrospective | After scoring | What to write differently next quarter? |
