# Opportunity Mapping Reference

Supporting detail for `opportunity-mapping`. Links resolve relative to this file.

## Opportunity solution tree

Adapted from Teresa Torres's continuous discovery structure, with one addition that makes it gateable: every opportunity cites the evidence tag it came from.

```
                    Desired outcome
                  (the success metric)
                           │
        ┌──────────────────┼──────────────────┐
   Opportunity A      Opportunity B      Opportunity C
   [interview:P1,P4]  [data:funnel_q3]    [doc:churn-aug]
```

| Not an opportunity | Opportunity |
|--------------------|-------------|
| "Add bulk import" | "New users cannot bring their existing data, so the product starts empty" |
| "Improve onboarding" | "Users reach the first useful output only after configuring three unrelated things" |
| "Add SSO" | "IT blocks the purchase because provisioning is manual" |

Why the structure rules hold: multiple root outcomes mean the strategy is unchosen; fewer than three first-level opportunities means the research was thin, more than seven means they are not yet grouped; overlapping siblings double-count impact; decomposing for symmetry invents structure.

## Sizing

| Dimension | Question | Source requirement |
|-----------|----------|-------------------|
| **Reach** | How many of the ICP hit this, per period? | A count or a share of a real population. `[data:*]`, `[doc:*]` or a bottom-up `[estimate:*]` with the method named |
| **Severity** | What does it cost them when it happens? | From the evidence, in their words plus a magnitude |
| **Frequency** | How often? | Per user, per period |

## PMF signal bands

| PMF signal score (per `strategy-frameworks`) | Stage | Legitimate opportunity type |
|---------------------------------------------|-------|----------------------------|
| 0–2 | Pre-PMF | Only opportunities that deepen value for the existing narrow segment |
| 3–4 | Searching | Narrow the segment, or deepen retention. Not acquisition |
| 5–6 | Emerging PMF | Tighten the retention loop, then widen carefully |
| 7–8 | Strong PMF | Scale, expand, monetize |

Apply these local signal bands only with complete four-signal coverage; incomplete coverage leaves the band unresolved. Report observed points and the possible interval before considering coherence. The bands guide judgement, not a universal classifier or an automatic decision.

## Success metric parts

| Part | Rule |
|------|------|
| **Metric** | One. Named precisely enough to be queried: "share of new accounts reaching first sent report within 7 days", not "activation". An outcome, not an output: if shipping the change is enough to hit the target ("alerts delivered within 24 hours"), it measures the build, not the bet (gate 2.6) |
| **Baseline** | An observed value with definition, population, window, capture date and resolvable data/doc provenance; code defines measurement but alone does not prove the value |
| **Target** | A number and a date. Reasoned from the baseline and a comparable, not from ambition |
| **Measurement** | The query, event or dashboard that will produce the number in phase 6 |

## Output template

Lifecycle path: `.builderos/initiatives/{initiative}/02-definition.md`. Standalone output adapts it only where useful and omits lifecycle gate claims.

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
**Observed points:** {N} on fixed 0–8 scale · **Coverage:** {known}/4 · **Possible interval:** {N to N+2×unknown} `[tag]`
**Stage:** {evidenced context or unresolved} · **Opportunity type:** {} · **Coherent:** {yes/no/unresolved, why}

## Success metric
**Metric:** {precise definition}
**Baseline:** {observed value with definition, population, window, capture date and source; or unknown with capture plan, gate 2.4 blocked}
**Target:** {value} by {date} — {reasoning}
**Measured by:** {query, event, or dashboard}
**Connects to North Star:** {how, or 'North Star not yet selected'}
```
