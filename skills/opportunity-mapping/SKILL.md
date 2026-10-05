---
name: opportunity-mapping
description: "Use when turning validated research into a structured set of opportunities, choosing which one to attack, or connecting that choice to a success metric with a real baseline"
---

# Opportunity Mapping

Research produces findings. Findings are not decisions. Phase 2 converts evidence into one chosen opportunity with a number attached to it.

## Mode and resources

Follow [operating modes and resource paths](../../references/operating-modes.md). **Standalone:** map and compare opportunities from the supplied research or product context. Preserve unknown sizing and baselines; deliver a provisional tree or metric recommendation without phase files.

**Lifecycle:** the phase prerequisites, artifact paths and gate recording below apply only when the user requests that phase or initiative. Missing prerequisites block that lifecycle transition, not a standalone artifact. Completion markers with gate verdicts claim lifecycle completion only after the gate passes.

Load the PMF or North Star section of `strategy-frameworks` only when that assessment is needed. Use `saas-metrics-reference` for unclear metric definitions, `evidence-ledger` for lifecycle traceability, and `gate-checks` for lifecycle completion. Ask what remains per the `pressure-testing` rounds: every question lists the options, recommends one and says why, and a factual question offers ways to close the gap, never guessed values.

Read [opportunity reference](references/opportunity-reference.md) when you need the tree diagram and examples, the sizing table, the PMF signal bands, the success-metric part rules or the output template.

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `analytics.query` | Opportunity reach and frequency; the success metric baseline | Bottom-up estimate with the method named; baseline stays unknown with a measurement plan unless sourced evidence supports a value |
| `db.query` | Account counts by segment, revenue baselines | Same |
| `docs.search` | Existing strategy docs, prior PMF assessments | Ask the user |
| `repo.read` | Which events are tracked, and therefore what is measurable today | Skip; assume nothing is measurable and make instrumentation a phase 4 requirement |
| `files.write` | Requested file or lifecycle artifact/state | Not needed for inline mapping; required for lifecycle writes |

## Procedure

Apply only the steps needed for the requested artifact. Delegate when available and authorized; otherwise run inline.

1. **Read the evidence.** Standalone mapping uses supplied research and names its limitations. For lifecycle work, read discovery and the frame and check the verdict first: `VALIDATED` proceeds; `RESHAPED` means confirming `PRODUCT.md` was amended before mapping against a stale ICP; `KILLED` means refusing, because the pipeline stopped. No `01-discovery.md` on disk → stop, unless `state.json` records phase 1 as `covered` on the feature track: then the tagged claims in `PRODUCT.md` are the evidence. Never build a tree from conversation memory.

2. **Build the tree.** One desired outcome at the root; it becomes the success metric. Three to seven mutually exclusive opportunities at the first level; sub-opportunities only where the evidence actually splits. **An opportunity is an unmet need, pain or desire,** not a feature: a verb like add, build, integrate or redesign means you wrote a solution. **Every opportunity cites the evidence tag it came from** (gate 2.1): lifecycle tags point to `01-discovery.md`, or `PRODUCT.md` when phase 1 is `covered`. An unevidenced need remains a hypothesis; drop untagged candidates and say which and why. On the feature track, no traceable opportunity means the track upgrades to `product`.

3. **Size.** Reach, severity and frequency per opportunity. Resolve `analytics.query` and `db.query` for real population counts where they exist; otherwise bottom-up with the method named in the tag. A range tagged `[estimate:*]` with a stated method beats a single number with no provenance. Present the ranking, then state explicitly that it sorts rather than decides: opportunities within noise are a tie, broken by strategy, not decimals.

4. **Check PMF coherence when relevant (gate 2.5).** Use four known readings scored 0–2 on a fixed 0–8 scale. Report observed points, known signals/4, unavailable signals and interval [observed, observed + 2 × unknown]. Never rescale or infer a definitive stage from partial coverage; apply the signal bands only with complete four-signal coverage. With incomplete coverage, state which evidence constrains the choice; a band is a heuristic, not automatic permission to scale. An acquisition bet at pre-PMF is refused. Lifecycle coherence remains an explicit gate judgement.

5. **Select one.** Criteria in order: evidence strength (distinct sources and their class; one enthusiastic interview is a hypothesis), strategic fit, PMF-stage coherence, reversibility (between comparable options take the cheaper to undo; worth more than expected value when confidence is low). Reject every other opportunity in writing with a reason and a revisit condition. Pressure-test before committing: which opportunity would a competitor pick, and why are they wrong?

6. **Define the success metric.** Four parts, all required: metric, baseline, target, measurement. One metric; a second is a guardrail, labeled so. It measures the user's response to what was built, not the system's own count (that goes to the tracking plan); if shipping alone hits the target, it fails gate 2.6. Pull the baseline with a real query where a data capability resolved, tagged with the provider and window; otherwise use supplied dated measurement evidence. **Gate 2.4 rejects an estimated baseline.** With no observed baseline, record unknown with measurement method, owner and capture date; lifecycle gate 2.4 stays blocked until measurement or an explicit authorized override. Zero needs evidence specific to this metric, with reason and source: a product not existing does not imply a zero rate or cohort baseline (it may be undefined), and missing access is never a reason for zero. Reason the target from the baseline and a comparable; "double it" is not reasoning. State how the metric connects to the North Star (usually as an input); selecting one is not required.

7. **Deliver.** Standalone work returns the requested tree, selection or metric with uncertainties. Lifecycle work: write `.builderos/initiatives/{initiative}/02-definition.md`, run gate 2 and record it (`scripts/bos.mjs record 2` where commands run), which advances to phase 3 on pass.

Completion marker: `## DEFINITION COMPLETE` with the selection, the rejections, the metric with baseline and target, the PMF coherence verdict and the gate result.

## Output Contract

Standalone output follows the requested format and destination, adapting the template only where useful. Lifecycle output is `.builderos/initiatives/{initiative}/02-definition.md`, following the [template](references/opportunity-reference.md#output-template) exactly; gate 2 parses its headings, tables and bold labels.

## Common Mistakes

| Mistake | Correct |
|---------|---------|
| Opportunities that are features | Unmet need, no verbs like add or build |
| An opportunity with no evidence tag | Trace it to evidence or drop it |
| Estimated baseline | Sourced measurement, including justified zero; unknown stays blocked for lifecycle |
| A metric the build satisfies by existing | Measure the user's response to what was built |
