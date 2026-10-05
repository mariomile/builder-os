---
name: okr-frameworks
description: "Use when writing OKRs, setting quarterly goals, defining key result baselines and targets, or reviewing goal alignment"
---

# OKR Frameworks

## Mode and resources

Follow [operating modes and resource paths](../../references/operating-modes.md). **Standalone:** Draft or review the supplied objectives, key results or metric. Where the baseline is unknown, propose measurement before an improvement target; missing company objectives limit alignment claims but do not block a scoped draft, which may state alignment unverified.

**Lifecycle:** Apply the named phase prerequisites, artifact paths and gate recording only when the user requests that phase or initiative. Missing prerequisites block that lifecycle transition, not a standalone artifact. Completion markers with gate verdicts claim lifecycle completion only after the gate passes.

Use `saas-metrics-reference` only for an unclear metric definition, the needed shape in `references/analytics-contract.md` for baseline measurement, and `evidence-ledger` for lifecycle tagging. Retrieve facts before asking; ask what remains per the `pressure-testing` rounds: every question lists the options, recommends one and says why, and a factual question offers ways to close the gap, never guessed values.

Read [the OKR method reference](references/okr-method.md) for objective and KR rules and examples, scoring, the metrics triad, review cadence and all anti-patterns.

## Capabilities

| Capability | Used for | Floor when absent |
|-----------|----------|-------------------|
| `analytics.query` | The baseline behind every key result | Ask the user; tag `[doc:user-{date}-{topic}]`; a KR whose baseline is user-provided says so |
| `db.query` | Database baselines: accounts, revenue, usage | Same floor |
| `docs.search` | Strategy, prior OKRs, the objectives above | Ask for them; without the level above, alignment cannot be checked |
| `docs.write` | Requested document destination or publishing | Use the requested accessible format; publication/config changes require authorization |
| `files.read` / `files.write` | The artifact itself | Always present |

## Procedure

1. **Resolve capabilities and read the level above:** company or group objectives, current strategy, the north star metric, and the previous cycle's OKRs with how they actually scored. Without the level above you are writing goals, not OKRs: say so rather than inventing an alignment.
2. **Derive objectives.** Three at most. Qualitative, time-bound, and written so someone outside the team can tell whether it happened.
3. **Find the baseline for every key result, first.** Baseline before target, always. For each KR, in order: live data (the relevant query shape or database reading, preserving definition, population, window, capture date and source); the vault (metric name plus product name, periodic notes); the user. Where none resolves, record unknown with the measurement method, owner and proposed capture date, and make this cycle's KR "establish the baseline for X by {date}". Never write a KR with a made-up baseline, and never replace an unknown with zero.
4. **Set targets** from the baseline plus the rate the team has actually achieved, adjusted for what is changing. Then apply the KR quality check: `[Verb] [metric] from [baseline] to [target] by [date]`, 2–4 KRs per objective, each scorable under the team's committed/stretch convention.
5. **Check alignment.** Each objective maps to the level above; each key result maps to an owner. Anything that maps to nothing gets cut or gets a reason.
6. **Report** in [the output contract](references/output-contract.md), ending with `## OKR COMPLETE`. Every baseline tagged; every KR whose baseline is user-provided or absent flagged as such on its face.

## Common Mistakes

| Anti-pattern | Example | Fix |
|-------------|---------|-----|
| Task disguised as KR | "Launch new onboarding flow by Q2" | "Increase activation rate from 22% to 35% by Q2" |
| Objective that's a KR | "Grow revenue by 50%" | "Become the go-to analytics tool for Series A PMs" |
| Unknown baseline replaced by zero | "Increase activation from 0 to 40%" without data | Record unknown; establish a sourced baseline before setting the target |
| KRs all measuring same thing | 3 KRs about revenue | Use Metrics Triad: output + input + guardrail |
