---
name: opportunity-mapping
description: "Turns validated research into a set of opportunities, picks the one to attack and ties it to a success metric with a real baseline. Use when research is done and the team must choose what to work on, or when a choice needs a metric to be judged by."
---

# Opportunity Mapping

Research produces findings; a decision needs one chosen opportunity with a number attached. Phase 2 builds the **opportunity tree** from evidence, has the person choose what to attack, and ties it to a success metric with a real baseline.

**Mode.** Standalone maps and compares opportunities from the supplied research or product context and delivers a provisional tree or metric recommendation, unknown sizing and baselines kept unknown. The lifecycle runs every step, writes `02-definition.md` and gate 2. Both per [operating modes](../../references/operating-modes.md). Load `product-analysis` (strategy) for a PMF or North Star assessment and (metrics) for an unclear metric definition. Read the [opportunity reference](references/opportunity-reference.md) for the tree diagram and examples, the sizing table, the PMF signal bands, the success-metric part rules and the output template.

## Procedure

1. **Read the evidence.** Standalone uses the supplied research and names its limitations. Lifecycle reads discovery and the frame and checks the verdict: `VALIDATED` proceeds; `RESHAPED` first confirms `PRODUCT.md` was amended, so the tree maps against the current ICP; `KILLED` refuses, because the pipeline stopped. Without `01-discovery.md` the phase stops, unless `state.json` records phase 1 as `covered` on the feature track, where the tagged claims in `PRODUCT.md` are the evidence. The tree is built from files on disk, never from conversation memory. Done when the verdict is known and the evidence files are open.
2. **Build the tree.** One desired outcome at the root, which becomes the success metric. Three to seven mutually exclusive opportunities at the first level, sub-opportunities only where the evidence splits. **An opportunity is an unmet need, pain or desire**: a verb like add, build, integrate or redesign means a solution was written. **Every opportunity cites its evidence tag** (gate 2.1): `01-discovery.md`, or when phase 1 is `covered`, `PRODUCT.md`, `00-request.md` and the initiative's own `evidence/` (an opportunity specific to the feature cites those, not a generic product tag). Untagged candidates are dropped, and the drop is stated with its reason; on the feature track, no traceable opportunity upgrades the track to `product`. Done when every opportunity on the tree has a tag.
3. **Size.** Reach, severity and frequency per opportunity, from real population counts where `analytics.query` or `db.query` resolved, otherwise bottom-up with the method named in the tag; a range tagged `[estimate:*]` with its method beats a bare number. The ranking sorts and the person decides: opportunities within noise are a tie, broken by strategy. Done when every opportunity has reach, severity and frequency with their tags.
4. **Check PMF coherence** where relevant (gate 2.5): four known readings scored 0–2 on a fixed 0–8 scale. Report observed points, known signals of 4, the unavailable ones, and the interval [observed, observed + 2 × unknown]. The signal bands apply with all four signals known; with fewer, state which evidence constrains the choice. An acquisition bet before PMF is refused. Done when the score, the interval and the coherence judgement are written.
5. **Put the choice to the person.** Rank the candidates by evidence strength (distinct sources and their class; one enthusiastic interview is a hypothesis), then strategic fit, PMF-stage coherence and reversibility (between comparable options take the cheaper to undo). Pressure-test your recommendation first: which opportunity would a competitor pick, and why are they wrong? Then one `pressure-testing` round: each opportunity with its evidence, what attacking it means, and your recommendation; the target from step 6 goes in the same round or the next, as options reasoned from the baseline and a comparable. Record `**Chosen by:**` under `## Selected` with the person's answer (gate 2.8). Done when the choice is recorded and every other opportunity is rejected in writing with a reason and a revisit condition.
6. **Define the success metric:** metric, baseline, target, measurement, all four. One metric; a second is labeled guardrail. It measures the user's response to what was built, so shipping alone leaves it unmoved (gate 2.6); system counts go to the tracking plan. Pull the baseline with a real query where a data capability resolved, tagged with the provider and window, or from supplied dated measurement. **Gate 2.4 takes an observed baseline.** With none, record unknown with the measurement method, owner and capture date, and gate 2.4 holds until it is measured or explicitly overridden. A zero needs evidence specific to this metric: a product that does not exist yet may have an undefined baseline, and missing access leaves it unknown. Reason the target options from the baseline and a comparable; the person picks one in step 5's round. State how the metric feeds the North Star. Done when all four parts are filled, each with its source or its stated gap.
7. **Deliver.** Standalone returns the requested tree, selection or metric with its uncertainties. Lifecycle writes `.builderos/initiatives/{initiative}/02-definition.md` per the [template](references/opportunity-reference.md#output-template), runs gate 2 and records it (`scripts/bos.mjs record 2` where commands run). Done when the artifact exists and, in the lifecycle, gate 2 is recorded.

## Watch for

| Do | Instead of |
|---|---|
| Unmet needs, with no add or build verbs | Opportunities that are features |
| Trace each opportunity to evidence, or drop it | An untagged opportunity on the tree |
| A sourced baseline, a justified zero, or unknown with a plan | An estimated baseline |
| Measure the user's response to what was built | A metric the build satisfies by existing |

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `analytics.query` | Opportunity reach and frequency; the success metric baseline | Bottom-up estimate with the method named; baseline stays unknown with a measurement plan unless sourced evidence supports a value |
| `db.query` | Account counts by segment, revenue baselines | Same |
| `docs.search` | Existing strategy docs, prior PMF assessments | Ask the user |
| `repo.read` | Which events are tracked, and therefore what is measurable today | Treat nothing as measurable yet and make instrumentation a phase 4 requirement |
| `files.write` | Requested file or lifecycle artifact/state | Inline mapping needs no write; lifecycle writes require it |

## Output Contract

`## DEFINITION COMPLETE` with the selection and who chose it, the rejections, the metric with baseline and target, the PMF coherence verdict and the gate result. Standalone output follows the requested format and destination; lifecycle output follows the [template](references/opportunity-reference.md#output-template) exactly, since gate 2 parses its headings, tables and bold labels.
