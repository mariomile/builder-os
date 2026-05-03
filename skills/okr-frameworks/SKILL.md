---
name: okr-frameworks
description: "Use when writing OKRs, setting quarterly goals, defining key result baselines and targets, or reviewing goal alignment"
---

# OKR Frameworks

Operational reference for writing and managing OKRs. Reference when the OKR Architect agent needs to write objectives, define key results, or set baselines and targets.

**REQUIRED BACKGROUND:** For metric definitions and MCP query patterns when setting baselines, load `saas-metrics-reference`.

## OKR Methodology

**Objectives** — qualitative, inspirational, time-bound. Answer: "Where are we going?"
- No metrics in objectives — those belong in Key Results
- Must be achievable in the period (typically 90 days)
- Should feel slightly uncomfortable — easy objectives are not OKRs
- Max 3 per team per quarter (fewer is better)

**Key Results** — quantitative, binary-scorable. Answer: "How do we know we got there?"
- Formula: `[Verb] [metric] from [baseline] to [target] by [date]`
- Scored 0.0–1.0 at period end (0.7 = success; 1.0 = bar was set too low)
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

0.7 = **ambitious success**. If you consistently score 1.0, targets are too easy. If you consistently score below 0.4, targets are unrealistic or blockers are unaddressed.

| Score | Meaning | Action |
|-------|---------|--------|
| 0.9–1.0 | Set bar higher next quarter | Celebrate, but question ambition |
| 0.7–0.89 | Success | Target zone |
| 0.4–0.69 | Partial — needs attention | Investigate blockers |
| 0.0–0.39 | Miss | Root cause analysis required |

## OKR Alignment

OKRs cascade: Company → Product → Team. BuilderOS focuses on the **Product-level OKR tree**.

**Alignment rule:** Every Product KR must be traceable to a Company Objective. If a KR can't be linked up, it shouldn't be in the plan.

## Baseline Discovery Protocol

For each KR, find a real baseline — never estimate:

1. **MCP-connected**: `mcp__claude_ai_DeepAgent_Mixpanel__Run-Query` or `mcp__plugin_supabase-toolkit_supabase__execute_sql`
2. **Vault-based**: Grep for metric name + product name in vault; check periodic notes
3. **User-provided**: Ask directly: "What's the current value of [metric]?"
4. **Unknown**: Mark as `TBD — tracking ticket required` and add to Tracking Requirements section

**Never write a KR with a made-up baseline.** A KR reading "from ??? to 30%" is not actionable.

## Common Anti-Patterns

| Anti-pattern | Example | Fix |
|-------------|---------|-----|
| Task disguised as KR | "Launch new onboarding flow by Q2" | "Increase activation rate from 22% to 35% by Q2" |
| Objective that's a KR | "Grow revenue by 50%" | "Become the go-to analytics tool for Series A PMs" |
| Too many KRs | 7 KRs per Objective | Max 4 — cut the weakest |
| Sandbagged targets | Increase MAU from 500 to 510 | Target difficulty: 70% chance of hitting at full effort |
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
