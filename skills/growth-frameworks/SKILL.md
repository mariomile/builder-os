---
name: growth-frameworks
description: "Use when designing growth strategies, analyzing activation funnels, interpreting retention curves, or mapping growth loops"
---

# Growth Frameworks

Activation and retention diagnosis, and the interventions that follow from it. Holds both the method and the frameworks it applies.

## Scope and resources

Follow `../../references/operating-modes.md`, resolved from this `SKILL.md`: Standalone funnel, retention or loop requests preserve supplied context and output destination, without initiative state. A single loop question does not require every analytics shape or a full growth report. Use only the relevant numbered steps below.

Load [growth method details](references/growth-methods.md) only for the relevant loop, activation, retention or prioritization question. Load `evidence-ledger` for sourced claims, the applicable query shape from `references/analytics-contract.md`, and `references/capability-map.md` before a data provider. Read only the relevant definition from `saas-metrics-reference` when needed. Local resources resolve relative to this `SKILL.md`; shared resources resolve from the supplied installation root.

## Capabilities

| Capability | Used for | Floor when absent |
|-----------|----------|-------------------|
| `analytics.query` | The activation funnel and the retention curve, segmented | Map the funnel from the onboarding code, then ask the user for the rates |
| `analytics.events` | Whether each funnel step is emitted at all | Search the repository for the analytics SDK's call sites |
| `analytics.replay` | Watching where users actually stall in the drop-off step | Skip; the drop-off is still located, just not explained |
| `docs.search` | Previously recorded funnel and retention numbers | Skip, and mark the step unavailable |
| `repo.read` | Onboarding flow, tracking coverage, missing instrumentation | Skip when there is no codebase |
| `files.read` / `files.write` | The artifact itself | Always present |

A growth diagnosis with no data is still worth running: mapping the funnel from the code and naming which steps are untracked is a finding, and often the finding that matters most.

## Procedure

### 1. Resolve capabilities and establish the funnel

Run the resolution protocol from `references/capability-map.md`.

Define the funnel steps before pulling anything: signup, first login, the setup step that gates value, the activation event, the repeated core action. Use supplied context first; read `PRODUCT.md` for lifecycle work or a requested product-wide diagnosis. A funnel invented at query time measures nothing.

### 2. Pull the funnel

Funnel shape, over the ordered steps, with the conversion window stated (7 to 14 days is typical for B2B, but state the one you used). Use the same eligible linked cohort and collect only segment/timing breakdowns relevant to the question; report right-censoring for users who have not had the full conversion window.

Without `analytics.query`: read the onboarding flow in the repo, map the journey step by step, then compare the steps against the emitted events. Every step with no event is a blind spot and goes in the report as one. Present the mapped funnel and ask for the rates.

### 3. Pull retention

Retention shape, cohorts by signup, returning on the core action, weekly, definition stated. When relevant, compare segments and activation status using a fixed pre-outcome activation window, and compare mature cohorts at equal age. State sample sizes, mix/seasonality changes and bounded/unbounded definition; incomplete cohorts do not supply a low retention measurement.

### 4. Analyze activation

Compare absolute losses and expected recoverable downstream value, not only relative drop rates:

```
drop_rate = 1 - actors_next / actors_current
absolute_loss = actors_current - actors_next
expected_incremental_value = absolute_loss × plausible_recoverable_share
                             × downstream_value_conversion × value_per_outcome
```

Tag estimates as assumptions/scenarios with a source or rationale. Consider implementation cost, risk and confidence. The largest percentage drop is a diagnostic clue, not automatically the highest-value intervention. Without measured linked cohorts or credible recovery assumptions, keep ranking provisional.

Segment relevant steps and examine time-to-value, replays or interviews. Median activation above a day can reflect permissions, data availability or a natural usage cycle; under thirty minutes does not prove onboarding works or that acquisition is the constraint. Timing suggests a question, not a cause.

### 5. Analyze retention

Classify the curve under the stated definition and mature window. If requested, compute the activation-retention association with denominators, uncertainty and a pre-outcome activation window; it is not causal proof. Compare segments at equal age and sample/eligibility, treating a best-retention segment as an ICP hypothesis rather than validation. Read the smile-curve definition in the conditional reference: Within-cohort return differs from newer cohorts improving.

### 6. Design interventions

For a full intervention request, propose one per material bottleneck in the format below, with a provisional ICE comparison where inputs are known. Present the requested number (top three by default); missing impact/confidence inputs remain unknown. A score does not authorize execution or release.

### 7. Report

For a full growth diagnosis, emit applicable sections of the output contract; narrow requests use the requested format. Every number tagged. Every step whose data was unavailable named as unavailable, with the shape that would fill it.

## Intervention Format

```markdown
### Intervention: {name}

**Bottleneck:** {step or retention week, with the number and its tag}
**Hypothesis:** If we {change}, then {metric} improves by {explicit assumed effect, pp or relative %, source/rationale} because {testable reasoning}
**Type:** {onboarding / re-engagement / feature discovery / value delivery}
**Loop:** {viral / content / product / paid / sales-assisted}

**Implementation:** {steps}

**Metrics:** output {…} · input {…} · guardrail {…}
**ICE:** impact {1-10} × confidence {1-10} × ease {1-10} ÷ 10 = {score}
```

## Output Contract

```markdown
## GROWTH ANALYSIS COMPLETE

**Product:** {name} · **Period:** {range}
**Capabilities resolved:** {capability → concrete source, or "none: files only"}

### Activation Funnel
{step, actors, conversion from previous, tag; conversion window stated}

### Retention
{curve definition, mature age, sample sizes, shape, activation association and segment comparisons}

### Bottlenecks
{absolute losses and expected recoverable value; assumptions, risk and uncertainty explicit}

### Interventions
{top 3 by ICE}

### Tracking Gaps
{steps with no event, properties missing for the segments that matter}
```

## Common Mistakes

| Mistake | Correction |
|---------|------------|
| Largest percentage drop is always the first lever | Compare absolute eligible losses, recoverability, downstream value, cost and uncertainty |
| Timing alone proves missing re-engagement | Treat timing as a hypothesis; investigate process, sampling and natural usage cycle |
| Activation above 40% plus flat retention proves PMF | Interpret definitions, mature cohorts and broader PMF signals; no universal cutoff |
| Activation-retention ratio proves activation causes retention | Use a pre-outcome window, adjust comparable populations, then test causally |
| Better newer cohorts called a smile curve | Smile is increasing bounded return within the same cohort as it ages |
| All query shapes for a loop question | Use supplied mechanics and only relevant evidence; preserve requested scope |

**Loss example:** Step A loses 200/1,000 accounts (20%); step B loses 10/20 (50%). B has the larger percentage, A the larger absolute loss. If A can recover 20% of losses with 10% downstream conversion, it yields four additional outcomes; B at 50% recovery and 100% downstream conversion yields five. Estimates, cost and confidence decide the priority, not either percentage alone.

**Curve example:** One January cohort at W4 12%, W8 9%, W12 14% shows a possible bounded-return smile. March W4 16% versus January W4 12% is a cross-cohort comparison; investigate mix, sample and changes before attributing improvement to the product.
