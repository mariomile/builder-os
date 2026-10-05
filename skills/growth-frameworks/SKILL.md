---
name: growth-frameworks
description: "Use when designing growth strategies, analyzing activation funnels, interpreting retention curves, or mapping growth loops"
---

# Growth Frameworks

## Scope and resources

Follow `../../references/operating-modes.md`, resolved from this `SKILL.md`. A single loop question does not require every analytics shape or a full growth report; use only the relevant steps below.

Load [growth method details](references/growth-methods.md) only for the relevant section: loops, activation, retention, ICE, bottleneck value, the intervention format or the output contract. Load `evidence-ledger` for sourced claims, the applicable query shape from `references/analytics-contract.md`, `references/capability-map.md` before a data provider, and only the relevant definition from `saas-metrics-reference`.

## Capabilities

| Capability | Used for | Floor when absent |
|-----------|----------|-------------------|
| `analytics.query` | The activation funnel and the retention curve, segmented | Map the funnel from the onboarding code, then ask the user for the rates |
| `analytics.events` | Whether each funnel step is emitted at all | Search the repository for the analytics SDK's call sites |
| `analytics.replay` | Watching where users actually stall in the drop-off step | Skip; the drop-off is still located, just not explained |
| `docs.search` | Previously recorded funnel and retention numbers | Skip, and mark the step unavailable |
| `repo.read` | Onboarding flow, tracking coverage, missing instrumentation | Skip when there is no codebase |
| `files.read` / `files.write` | The artifact itself | Always present |

With no data, the diagnosis still runs: the funnel mapped from code, with its untracked steps named, is a finding.

## Procedure

1. **Establish the funnel.** Define the steps before pulling anything: signup, first login, the setup step that gates value, the activation event, the repeated core action. Use supplied context first; read `PRODUCT.md` for lifecycle work or a requested product-wide diagnosis.

2. **Pull the funnel.** Funnel shape over the ordered steps, conversion window stated (7 to 14 days is typical for B2B). Use the same eligible linked cohort, collect only segment/timing breakdowns relevant to the question, and report right-censoring for users without the full window. Without `analytics.query`: map the journey from the onboarding code, compare steps against emitted events, report every step with no event as a blind spot, and ask for the rates.

3. **Pull retention.** Retention shape: cohorts by signup, returning on the core action, weekly, definition stated. Compare segments and activation status, when relevant, with a fixed pre-outcome activation window and mature cohorts at equal age. State sample sizes, mix/seasonality changes and bounded/unbounded definition; incomplete cohorts do not supply a low retention measurement.

4. **Analyze activation.** Rank bottlenecks by absolute loss and expected recoverable downstream value (formula in the reference), estimates tagged as assumptions with a source or rationale, weighing cost, risk and confidence. The largest percentage drop is a clue, not automatically the highest-value intervention. Without measured linked cohorts or credible recovery assumptions, keep the ranking provisional. Segment relevant steps and examine time-to-value, replays or interviews. Timing suggests a question, not a cause (see the reference).

5. **Analyze retention.** Classify the curve under the stated definition and mature window. If requested, compute the activation-retention association with denominators, uncertainty and a pre-outcome window; it is not causal proof. Compare segments at equal age and sample/eligibility; a best-retention segment is an ICP hypothesis, not validation. A smile is rising bounded return within the same cohort as it ages; newer cohorts doing better at the same age is a cross-cohort comparison (see the reference). No activation or retention cutoff proves PMF.

6. **Design interventions.** For a full intervention request, propose one per material bottleneck in the intervention format, with a provisional ICE comparison where inputs are known. Present the requested number (top three by default); missing impact/confidence inputs remain unknown. A score does not authorize execution or release.

7. **Report.** A full diagnosis emits the applicable sections of the output contract in the reference (`## GROWTH ANALYSIS COMPLETE`); narrow requests use the requested format. Every number tagged; every step without data named unavailable, with the shape that would fill it.

## Common Mistakes

| Mistake | Correction |
|---------|------------|
| Activation-retention ratio proves activation causes retention | Use a pre-outcome window, adjust comparable populations, then test causally |
| All query shapes for a loop question | Use supplied mechanics and only relevant evidence; preserve requested scope |
