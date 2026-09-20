---
name: opportunity-mapping
description: "Use when turning validated research into a structured set of opportunities, choosing which one to attack, or connecting that choice to a success metric with a real baseline"
---

# Opportunity Mapping

Research produces findings. Findings are not decisions. Phase 2 converts evidence into one chosen opportunity with a number attached to it.

**REQUIRED BACKGROUND:** `strategy-frameworks` for PMF staging and North Star selection. `evidence-ledger` for traceability. `saas-metrics-reference` for metric definitions and benchmarks.

## Opportunity Solution Tree

Adapted from Teresa Torres's continuous discovery structure, with one addition that makes it gateable: **every opportunity cites the evidence tag it came from.** An opportunity with no tag is an idea, and ideas belong in phase 3.

```
                    Desired outcome
                  (the success metric)
                           │
        ┌──────────────────┼──────────────────┐
   Opportunity A      Opportunity B      Opportunity C
   [interview:P1,P4]  [mcp:funnel_q3]    [doc:churn-aug]
```

**An opportunity is an unmet need, pain or desire.** Not a feature, not a solution. The test is the same as phase 0: if it contains a verb like "add", "build" or "integrate", it is a solution that jumped a phase.

| Not an opportunity | Opportunity |
|--------------------|-------------|
| "Add bulk import" | "New users cannot bring their existing data, so the product starts empty" |
| "Improve onboarding" | "Users reach the first useful output only after configuring three unrelated things" |
| "Add SSO" | "IT blocks the purchase because provisioning is manual" |

### Structure rules

1. **One desired outcome** at the root. Multiple outcomes means multiple trees, which means the strategy is unchosen.
2. **Three to seven opportunities** at the first level. Fewer means the research was thin; more means they are not yet grouped.
3. **Every opportunity traces to a tag** from `01-discovery.md`.
4. **Siblings are mutually exclusive.** Overlapping opportunities produce double-counted impact.
5. **Sub-opportunities only where the evidence actually splits.** Decomposing for symmetry invents structure.

## Sizing

Each opportunity gets three numbers before it can be compared.

| Dimension | Question | Source requirement |
|-----------|----------|-------------------|
| **Reach** | How many of the ICP hit this, per period? | A count or a share of a real population. `[mcp:*]`, `[doc:*]` or a bottom-up `[estimate:*]` with the method named |
| **Severity** | What does it cost them when it happens? | From the evidence, in their words plus a magnitude |
| **Frequency** | How often? | Per user, per period |

Reach × severity × frequency is a ranking aid, not a decision. It sorts; it does not choose. Two opportunities within noise of each other are a tie, and ties are broken by strategy, not by decimals.

Never manufacture precision. A range tagged `[estimate:*]` with a stated method beats a single number with no provenance.

## Selection

One opportunity. The other two to six are rejected in writing, each with a reason, because the rejections are what make the choice reviewable in six months.

Four selection criteria, applied in order:

1. **Evidence strength.** How many distinct sources, of which class? An opportunity resting on one enthusiastic interview is a hypothesis.
2. **Strategic fit.** Does attacking this move the product toward its positioning, or sideways into someone else's market?
3. **PMF-stage coherence.** This is the constraint people break most often, and it is gate 2.5:

| PMF signal score (per `strategy-frameworks`) | Stage | Legitimate opportunity type |
|---------------------------------------------|-------|----------------------------|
| 0–2 | Pre-PMF | Only opportunities that deepen value for the existing narrow segment |
| 3–4 | Searching | Narrow the segment, or deepen retention. Not acquisition |
| 5–6 | Emerging PMF | Tighten the retention loop, then widen carefully |
| 7–8 | Strong PMF | Scale, expand, monetize |

A pre-PMF product choosing an acquisition opportunity is optimizing a leaking bucket. The gate refuses it.

4. **Reversibility.** Between two comparable options, take the one that is cheaper to undo. Reversibility is worth more than expected value when confidence is low.

## Success Metric

The output of phase 2 that everything downstream depends on. Four parts, all required:

| Part | Rule |
|------|------|
| **Metric** | One. Named precisely enough to be queried: "share of new accounts reaching first sent report within 7 days", not "activation" |
| **Baseline** | The current value, today, with a source tag. `[mcp:*]`, `[code:*]` or primary `[doc:*]` |
| **Target** | A number and a date. Reasoned from the baseline and a comparable, not from ambition |
| **Measurement** | The query, event or dashboard that will produce the number in phase 6 |

**Gate 2.4 rejects an estimated baseline.** A target measured against a guess is unfalsifiable, which makes phase 7 decorative. Two legitimate paths when no baseline exists:

- The product exists but is not instrumented: the baseline is unknown, and instrumenting it becomes a phase 4 requirement. Record `[assumption:unvalidated]` plus a named first-measurement date.
- The product does not exist: the baseline is `0`, stated explicitly, with the first-measurement date.

Both are honest. Inventing "roughly 30% today" is not.

### Relationship to the North Star

The success metric is usually an input to the North Star, not the North Star itself. Dispatch `north-star-analyst` when the product has no North Star yet, or when the chosen opportunity implies a different one. Phase 2 does not need to select a North Star to proceed, but it must state how the success metric connects to one.

## Output Contract

`.builderos/02-definition.md`:

```markdown
# Definition — {product}

## Desired outcome
{The success metric, as the tree root}

## Opportunity tree
| Opportunity | Evidence | Reach | Severity | Frequency | Score |
|-------------|----------|-------|----------|-----------|-------|
| A | `[tag]` | | | | |

{Tree diagram if the structure has depth}

## Selected: {A}
**Why:** {evidence strength, strategic fit, PMF coherence, reversibility}

## Rejected
| Opportunity | Why not now | Revisit when |
|-------------|------------|--------------|

## PMF coherence
**Signal score:** {N}/8 `[tag]` · **Stage:** {} · **Opportunity type:** {} · **Coherent:** {yes/no, why}

## Success metric
**Metric:** {precise definition}
**Baseline:** {value} `[tag]` {or: 0, product not built, first measurement {date}}
**Target:** {value} by {date} — {reasoning}
**Measured by:** {query, event, or dashboard}
**Connects to North Star:** {how, or 'North Star not yet selected'}
```

## Common Mistakes

| Mistake | Why it fails | Correct |
|---------|-------------|---------|
| Opportunities that are features | Jumps to phase 3 with the choice already made | Unmet need, no verbs like add or build |
| An opportunity with no evidence tag | Gate 2.1 fails; it is an idea, not a finding | Trace to `01-discovery.md` or drop it |
| Selecting without writing rejections | The choice becomes unreviewable later | One line per rejection, plus a revisit condition |
| An acquisition bet at pre-PMF | Optimizes a leaking bucket | Gate 2.5 refuses it; deepen value first |
| Estimated baseline | Makes the target unfalsifiable and phase 7 decorative | Real query, or explicit 0 with a measurement date |
| Two success metrics | Downstream phases cannot optimize both | One. The second is a guardrail, label it so |
| RICE-style precision on guessed inputs | Decimals imply knowledge that does not exist | Ranges with stated methods; ties broken by strategy |
| Overlapping sibling opportunities | Double-counts impact | Make siblings mutually exclusive |
