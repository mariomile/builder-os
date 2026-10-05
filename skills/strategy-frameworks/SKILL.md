---
name: strategy-frameworks
description: "Use when assessing product-market fit, auditing positioning, selecting a North Star metric, or evaluating strategic coherence"
---

# Strategy Frameworks

## Scope and resources

Follow `../../references/operating-modes.md`, resolved from this `SKILL.md`. Run only the relevant audit/selection steps. Read `PRODUCT.md` and initiative state only for lifecycle work or when the user asked for product-wide context.

Load `evidence-ledger` for claims, `references/capability-map.md` before accessing a provider, only the needed analytics shape, `growth-frameworks` for retention interpretation, and the relevant `saas-metrics-reference` definition when unclear. [Strategy method details](references/strategy-methods.md) holds the PMF, positioning and North Star rubrics, signal-reading notes, examples and both output contracts; read only the section the request needs.

## Capabilities

| Capability | Used for | Floor when absent |
|-----------|----------|-------------------|
| `analytics.query` | The retention curve behind the PMF read, and the retention correlation behind a north star candidate | Ask for the curve; without it the retention signal is recorded unavailable, not guessed |
| `analytics.events` | Whether a candidate north star can be measured today at all | Search the repository for the call sites |
| `db.query` | Organic pull and account-level signals that live in the application database | Ask |
| `docs.search` | Survey results, interview notes, prior strategy and positioning work | Ask the user for them |
| `files.read` / `files.write` | The artifact itself | Always present |

Two signals measured and two recorded unavailable is a useful assessment; four invented signals plan everything after against a fiction.

## Procedure: PMF and Positioning Audit

1. **Ingest context.** Use supplied product context, positioning and question first; seek only missing context that question needs. Do not infer company stage from a score.
2. **Read the four signals** (survey score, retention curve shape, organic pull, desperate users) per the PMF Signal Framework and signal-reading notes. Per signal, exactly one of three outcomes: measured with its tag, stated by the user with a `[doc:user-{date}-{topic}]` tag, or **unavailable** with the question that would resolve it.
3. **Score on a fixed 0–8 scale.** Each known reading 0–2; missing signals are unknown, not zero. Report observed points, known/4 coverage, source status for each, and the possible-score interval `[observed points, observed points + 2 × unknown signals]`. Never rescale to a shorter denominator, fill missing data, or guess stage. With incomplete coverage, state that the PMF band is unresolved (or describe the compatible bands). A reading of zero means evidence supports signal absence, not no data.
4. **Audit positioning** against the framework: category, for whom, against what alternative, on what proof. Flag every claim with no evidence behind it.
5. **Gap analysis and report.** State which evidence would narrow uncertainty and which strategic choices depend on it; score thresholds are heuristics, not permission to scale. Emit `## STRATEGY AUDIT COMPLETE` per the output contract.

## Procedure: North Star Selection

1. **Generate candidates:** three to five for a full selection, appropriate to product type and stage (optional candidates in the reference). Per candidate: a precise definition of what counts and what does not, the query shape that would measure it, and the share of active users who could contribute.
2. **Score** breadth, depth and frequency, 1 to 3 each, per the reference.
3. **Check measurability today.** Per candidate: measurable now, or only after new instrumentation; where `analytics.events` did not resolve, read the emitted events from the code. Where a retention curve is available, test whether users who hit each measurable candidate retain materially better. Without retention evidence, its link to durable customer value is unverified: state a plausible mechanism and the validation needed, never an invented correlation.
4. **Choose.** The score is a comparison aid alongside value validity, manipulability, evidence quality and measurability. Unknown dimensions stay unknown; no fabricated total. Prefer a measurable candidate when value and evidence are comparable; label the selection provisional if its retention relationship is untested.
5. **Build the metric tree:** the north star, its breadth, depth and frequency drivers, and the inputs under each. Every node names the shape that measures it. Connect it to the existing diagnostic metric tree, not a parallel framework; name nodes needing instrumentation that does not exist yet. Emit `## NORTH STAR COMPLETE` per the output contract.

## Common Mistakes

| Mistake | Correction |
|---------|------------|
| Stage guessed from heuristic thresholds | Preserve supplied stage/context; report uncertainty and evidence limits |
| North Star chosen mechanically by score | Compare customer value, evidence, gaming risk and measurability |
