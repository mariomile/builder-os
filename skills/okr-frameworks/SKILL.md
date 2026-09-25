---
name: okr-frameworks
description: "Use when writing OKRs, setting quarterly goals, defining key result baselines and targets, or reviewing goal alignment"
---

# OKR Frameworks

Operational reference for writing and managing OKRs. Reference when the OKR Architect agent needs to write objectives, define key results, or set baselines and targets.

**REQUIRED BACKGROUND:** For metric definitions and MCP query patterns when setting baselines, load `saas-metrics-reference`.

**REQUIRED BACKGROUND:** `evidence-ledger` for tagging. `references/analytics-contract.md` for the query shapes behind a baseline. `references/capability-map.md` before touching any data source.

## Capabilities

| Capability | Used for | Floor when absent |
|-----------|----------|-------------------|
| `analytics.query` | The baseline behind every key result | Ask the user; tag `[doc:user-{date}-{topic}]`; a KR whose baseline is user-provided says so |
| `db.query` | Baselines that live in the application database: accounts, revenue, usage | Same floor |
| `docs.search` | Strategy, prior OKRs, the company objectives these ladder up to | Ask for them; without the level above, alignment cannot be checked |
| `docs.write` | Publishing the set where the team reads it | Write the file; the artifact is the deliverable, publishing is optional |
| `files.read` / `files.write` | The artifact itself | Always present |

## Procedure

### 1. Resolve capabilities and read the level above

Company or group objectives, current strategy, the north star metric, and the previous cycle's OKRs with how they actually scored. Without the level above, you are writing goals, not OKRs, and you should say so rather than inventing an alignment.

### 2. Derive objectives

Three at most. Qualitative, time-bound, and written so that someone outside the team can tell whether it happened. An objective that survives unchanged for four quarters is a mission statement.

### 3. Find the baseline for every key result, first

Baseline before target, always. Run the Baseline Discovery Protocol below. A key result written as "improve activation to 40%" with no current number is unscoreable, and the team discovers this at review, not now.

Where no baseline resolves: state the KR as "establish the baseline for X by {date}" for this cycle. That is a legitimate key result and a far better one than a target invented to look decisive.

### 4. Set targets

From the baseline plus the rate the team has actually achieved before, adjusted for what is changing. Then apply the KR quality check below.

### 5. Check alignment

Each objective maps to the level above. Each key result maps to an owner. Anything that maps to nothing gets cut or gets a reason.

### 6. Report

Emit the output contract. Every baseline tagged. Every KR whose baseline is user-provided or absent flagged as such on its face.

## Output Contract

```markdown
## OKR COMPLETE

**Cycle:** {period} · **Ladders up to:** {the objective above, or "none supplied"}
**Capabilities resolved:** {capability → concrete source, or "none: files only"}

### Objective {n}: {title}
| KR | Baseline (tag) | Target | Owner | How it will be measured |

### Alignment Matrix
{objective → level above; KR → owner}

### Measurement Gaps
{KRs with no baseline, and the shape that would establish one}

### Review Cadence
```

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

1. **Live data**: the Volume, Funnel or Retention shape via `analytics.query`, or `db.query` where the number lives in the application database
2. **Vault-based**: Search the vault for metric name + product name; check periodic notes
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
