---
name: opportunity-mapping
description: "Use when turning validated research into a structured set of opportunities, choosing which one to attack, or connecting that choice to a success metric with a real baseline"
---

# Opportunity Mapping

## Mode and resources

Follow [operating modes and resource paths](../../references/operating-modes.md). **Standalone:** Map and compare opportunities from the supplied research or product context. Preserve unknown sizing and baselines; do not demand phase files to deliver a provisional tree or metric recommendation. No phase files, initiative state, initialization or gate override are required. Preserve the requested format and destination.

**Lifecycle:** Apply the named phase prerequisites, artifact paths and gate recording below only when the user requests that phase or initiative. Missing prerequisites block that lifecycle transition, not a standalone artifact. Completion markers with gate verdicts claim lifecycle completion only after the gate passes.

Load the PMF or North Star section of `strategy-frameworks` only when that assessment is needed. Use `saas-metrics-reference` for unclear metric definitions, `evidence-ledger` for lifecycle traceability, and `gate-checks` for lifecycle completion. Retrieve facts before asking; suggest recommended options for decisions, not answers to factual observations.


Research produces findings. Findings are not decisions. Phase 2 converts evidence into one chosen opportunity with a number attached to it.

## Opportunity Solution Tree

Adapted from Teresa Torres's continuous discovery structure, with one addition that makes it gateable: **every opportunity cites the evidence tag it came from.** An opportunity with no tag is an idea, and ideas belong in phase 3.

```
                    Desired outcome
                  (the success metric)
                           │
        ┌──────────────────┼──────────────────┐
   Opportunity A      Opportunity B      Opportunity C
   [interview:P1,P4]  [data:funnel_q3]    [doc:churn-aug]
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
3. **Every opportunity traces to evidence** in the supplied material. Lifecycle tags point to `01-discovery.md`, or `PRODUCT.md` when phase 1 is `covered`. A proposed but unevidenced need remains a hypothesis.
4. **Siblings are mutually exclusive.** Overlapping opportunities produce double-counted impact.
5. **Sub-opportunities only where the evidence actually splits.** Decomposing for symmetry invents structure.

## Sizing

Each opportunity gets three numbers before it can be compared.

| Dimension | Question | Source requirement |
|-----------|----------|-------------------|
| **Reach** | How many of the ICP hit this, per period? | A count or a share of a real population. `[data:*]`, `[doc:*]` or a bottom-up `[estimate:*]` with the method named |
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

Apply these local signal bands only with complete four-signal coverage; incomplete coverage leaves the band unresolved. Report observed points and the possible interval before considering coherence. The bands guide judgement, not a universal classifier or an automatic decision.

4. **Reversibility.** Between two comparable options, take the one that is cheaper to undo. Reversibility is worth more than expected value when confidence is low.

## Success Metric

The output of phase 2 that everything downstream depends on. Four parts, all required:

| Part | Rule |
|------|------|
| **Metric** | One. Named precisely enough to be queried: "share of new accounts reaching first sent report within 7 days", not "activation". An outcome, not an output: if shipping the change is enough to hit the target ("alerts delivered within 24 hours"), it measures the build, not the bet (gate 2.6) |
| **Baseline** | An observed value with definition, population, window, capture date and resolvable data/doc provenance; code defines measurement but alone does not prove the value |
| **Target** | A number and a date. Reasoned from the baseline and a comparable, not from ambition |
| **Measurement** | The query, event or dashboard that will produce the number in phase 6 |

**Gate 2.4 rejects an estimated baseline.** A target measured against a guess is unfalsifiable, which makes phase 7 decorative. Two legitimate paths when no baseline exists:

- No observed baseline: report unknown, measurement method, owner and capture date. A standalone draft can be useful with that gap; lifecycle gate 2.4 remains blocked until measurement or an explicit authorized override.
- Zero is legitimate only when evidence supports zero for this metric. State the reason and source; a product not existing does not imply a rate or cohort baseline of zero (it may be undefined).

Never use missing access as a reason for zero or invent "roughly 30% today".

### Relationship to the North Star

The success metric is usually an input to the North Star, not the North Star itself. Use the North Star section of `strategy-frameworks` only when that choice is requested or needed for the selected opportunity. Phase 2 does not need to select a North Star to proceed, but it must state how the success metric connects to one.

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `analytics.query` | Opportunity reach and frequency; the success metric baseline | Bottom-up estimate with the method named; baseline stays unknown with a measurement plan unless sourced evidence supports a value |
| `db.query` | Account counts by segment, revenue baselines | Same |
| `docs.search` | Existing strategy docs, prior PMF assessments | Ask the user |
| `repo.read` | Which events are tracked, and therefore what is measurable today | Skip; assume nothing is measurable and make instrumentation a phase 4 requirement |
| `files.write` | Requested file or lifecycle artifact/state | Not needed for inline mapping; required for lifecycle writes |

Connected data is optional: supplied dated measurement evidence can establish the baseline. Without an observed baseline, standalone mapping can continue with uncertainty but lifecycle gate 2.4 cannot pass by replacing missing data with zero.

## Procedure

Apply only the steps needed for the requested artifact. Phase-file prerequisites and gate writes apply in lifecycle mode. Delegate when available and authorized; otherwise run inline.

1. **Read the evidence.** Standalone mapping uses supplied research/context and identifies its limitations. For lifecycle work, read discovery and the frame: Check the verdict first: `VALIDATED` proceeds; `RESHAPED` means confirming `PRODUCT.md` was amended before mapping against a stale ICP; `KILLED` means refusing, because the pipeline stopped. No `01-discovery.md` on disk → stop, unless `state.json` records phase 1 as `covered` on the feature track: then the tagged claims in `PRODUCT.md` are the evidence opportunities trace to. Never build a tree from conversation memory.
2. **Build the tree.** Group the evidence into three to seven mutually exclusive opportunities. Run the verb check on each: add, build, integrate, redesign mean you wrote a solution. Attach every supporting evidence tag. Drop untagged candidates and say which you dropped and why. Set the root: the desired outcome, which becomes the success metric.
3. **Size.** Reach, severity and frequency per opportunity. Resolve `analytics.query` and `db.query` for real population counts where they exist; otherwise bottom-up with the method named in the tag. Present the ranking, then state explicitly that it sorts rather than decides.
4. **Check PMF coherence when relevant.** Use four known readings scored 0–2 on a fixed 0–8 scale. Report observed points, known signals/4, unavailable signals and interval [observed, observed + 2 × unknown]. Never rescale or infer a definitive stage from partial coverage. With incomplete coverage, state which evidence constrains the choice; a score band is a heuristic, not automatic permission to scale. Lifecycle coherence remains an explicit gate judgement.
5. **Select.** Apply evidence strength, strategic fit, PMF coherence and reversibility, in that order. Write the rejections, each with a reason and a revisit condition. Pressure-test the selection before committing: which opportunity would a competitor pick, and why are they wrong?
6. **Define the success metric.** Metric, baseline, target, measurement. Pull the baseline with a real query where a data capability resolved, tagged with the provider and the window. Where none did, use supplied dated measurement evidence or record unknown with a capture plan. Zero needs evidence specific to the metric; lifecycle gate 2.4 remains blocked for an unknown baseline. Never estimate a baseline. Show the reasoning behind the target; "double it" is not reasoning.
7. **Deliver.** Standalone work returns the requested tree, selection or metric with uncertainties. Lifecycle work: Write `.builderos/initiatives/{initiative}/02-definition.md`, run gate 2 and record it (`scripts/bos.mjs record 2` where commands run), which advances to phase 3 on pass.

Completion marker: `## DEFINITION COMPLETE` with the selection, the rejections, the metric with baseline and target, the PMF coherence verdict and the gate result.

## Output Contract

Standalone output follows the requested format and destination; adapt the template only where useful and omit lifecycle gate claims. The paths below apply to lifecycle artifacts.

`.builderos/initiatives/{initiative}/02-definition.md`:

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

## Common Mistakes

| Mistake | Why it fails | Correct |
|---------|-------------|---------|
| Opportunities that are features | Jumps to phase 3 with the choice already made | Unmet need, no verbs like add or build |
| An opportunity with no evidence tag | Gate 2.1 fails; it is an idea, not a finding | Trace to `01-discovery.md` (or `PRODUCT.md` on the feature track) or drop it. On the feature track, no traceable opportunity means the track upgrades to `product` |
| Selecting without writing rejections | The choice becomes unreviewable later | One line per rejection, plus a revisit condition |
| An acquisition bet at pre-PMF | Optimizes a leaking bucket | Gate 2.5 refuses it; deepen value first |
| Estimated baseline | Makes the target unfalsifiable and phase 7 decorative | Sourced measurement, including justified zero; unknown stays blocked for lifecycle |
| Two success metrics | Downstream phases cannot optimize both | One. The second is a guardrail, label it so |
| A metric the build satisfies by existing | Phase 7 confirms the code ran, not that anyone is better off | Measure the user's response to what was built; the system's own count goes to the tracking plan |
| RICE-style precision on guessed inputs | Decimals imply knowledge that does not exist | Ranges with stated methods; ties broken by strategy |
| Overlapping sibling opportunities | Double-counts impact | Make siblings mutually exclusive |

| Requiring initiative state for a standalone request | Expands the user’s scope | Use supplied context and the requested destination; do not initialize or override a gate |
