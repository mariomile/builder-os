---
name: strategy-frameworks
description: "Use when assessing product-market fit, auditing positioning, selecting a North Star metric, or evaluating strategic coherence"
---

# Strategy Frameworks

Operational frameworks for product strategy work. Reference when the Product Strategist or North Star Analyst agent needs to assess PMF, evaluate positioning, or select a North Star metric.

## Scope and resources

Follow `../../references/operating-modes.md`, resolved from this `SKILL.md`: Standalone requests preserve supplied context and output destination, without initiative state. Run only the relevant audit/selection steps. Read `PRODUCT.md` and initiative state only for lifecycle work or when the user asked for product-wide context.

Load `evidence-ledger` for claims, `references/capability-map.md` before accessing a provider, and only the needed analytics shape. Load `growth-frameworks` for retention interpretation and the relevant metric definition in `saas-metrics-reference` when unclear. [Strategy method details](references/strategy-methods.md) contains PMF, positioning and North Star rubrics; read only the requested section. Skill-local paths resolve relative to this `SKILL.md`.

## Capabilities

| Capability | Used for | Floor when absent |
|-----------|----------|-------------------|
| `analytics.query` | The retention curve behind the PMF read, and the retention correlation behind a north star candidate | Ask for the curve; without it the retention signal is recorded unavailable, not guessed |
| `analytics.events` | Whether a candidate north star can be measured today at all | Search the repository for the call sites |
| `db.query` | Organic pull and account-level signals that live in the application database | Ask |
| `docs.search` | Survey results, interview notes, prior strategy and positioning work | Ask the user for them |
| `files.read` / `files.write` | The artifact itself | Always present |

A PMF assessment with two of four signals measured and two recorded unavailable is a useful artifact. One with four signals invented is the most expensive document a team can produce, because everything after it is planned against a fiction.

## Procedure: PMF and Positioning Audit

### 1. Resolve capabilities and ingest context

Use supplied product context, positioning and requested question first. Seek only missing context needed for that question. Do not infer company stage from a score.

### 2. Read the four signals

Work the PMF Signal Framework below. Per signal, one of three outcomes: measured with its tag, stated by the user with a `[doc:user-{date}-{topic}]` tag, or **unavailable** with the question that would resolve it. Never a fourth.

- **Survey score.** Search documents for an existing "how disappointed" survey. If none exists, the signal is unavailable and running the survey is the recommendation.
- **Retention curve shape.** The Retention shape, with its definition stated. Treat week 6–8 and retention-floor cutoffs as local heuristics, not universal PMF thresholds; verify mature cohorts, unit, return event and retention definition first.
- **Organic pull.** Share of signups arriving without paid acquisition, or inbound mentions. Often lives in the application database rather than analytics.
- **Desperate users.** Qualitative, from interviews and support: people who would be genuinely stuck without this. Search the research rather than inferring it from usage.

### 3. Score

Keep the score on a **fixed 0–8 scale**: Four signals, each known reading 0–2. Missing signals are unknown, not score zero. Report observed points, known signals/4 coverage, source status for each, and a possible-score interval `[observed points, observed points + 2 × unknown signals]`. Never rescale to a shorter denominator, fill missing data, or guess stage. When coverage is incomplete, state that PMF band is unresolved (or describe the compatible bands); do not assign a definitive stage from the partial total. A reading of zero means evidence supports signal absence, not no data.

### 4. Audit positioning

Against the framework below: category, for whom, against what alternative, on what proof. Flag every claim with no evidence behind it, because positioning is where unsupported claims are most expensive.

### 5. Gap analysis and report

State which evidence would narrow uncertainty and what strategic choices depend on it; score thresholds are heuristics rather than permission to scale. Emit the output contract.

## Procedure: North Star Selection

### 1. Generate candidates

Three to five when a full selection is requested, from the optional candidates reference, appropriate to the product type and stage. Per candidate: a precise definition of what counts and what does not, the query shape that would measure it, and the share of active users who could contribute to it.

The definition is the work. "Reports shared" means nothing until it says whether a report shared with a teammate counts, whether re-sharing counts, and whether the sender has to be active.

### 2. Score on breadth, depth, frequency

One to three on each axis, per the relevant section of `references/strategy-methods.md`.

### 3. Check measurability today

Pull the catalogue. Per candidate: measurable now, or measurable only after new instrumentation. Where `analytics.events` did not resolve, read the emitted events from the code instead.

Then, where a retention curve is available, test each measurable candidate against retention: do users who hit this metric retain materially better? Without retention evidence, treat its relationship to durable customer value as unverified; state a plausible mechanism and the validation needed rather than inventing a correlation.

### 4. Choose

Use the score as a comparison aid, alongside value validity, manipulability, evidence quality and measurability. Unknown dimensions stay unknown; do not fabricate a total. Prefer a measurable candidate when value/evidence are comparable, and label selection provisional if its retention relationship is untested.

### 5. Build the metric tree

Three levels: the north star, its breadth, depth and frequency drivers, and the inputs under each. Every node names the shape that measures it. Connect it to the existing diagnostic metric tree rather than creating a parallel framework, and say which nodes need instrumentation that does not exist yet.

## Output Contracts

```markdown
## STRATEGY AUDIT COMPLETE

**Product:** {name} · **Stage:** {supplied/evidenced context, or unknown}
**Capabilities resolved:** {capability → concrete source, or "none: files only"}

### PMF Signals
| Signal | Reading | Score 0–2 or unknown | Source | Status |
{measured / user-provided / unavailable, per signal}

**PMF score (fixed 0–8):** {observed points}, possible interval {low–high}
**Coverage:** {known}/4 signals · **Interpretation:** {compatible bands; unresolved when incomplete}

### Positioning
{category, for whom, against what, on what proof; unsupported claims flagged}

### Gap Analysis
{what must be true for the next stage, and what is missing}

### Recommended Next Step
```

```markdown
## NORTH STAR COMPLETE

**Chosen:** {metric, with its precise definition}
**Capabilities resolved:** {capability → concrete source}

### Candidates Evaluated
| Candidate | Breadth | Depth | Frequency | Measurable today | Retention relationship | Total |

### Why this one
### Metric Tree
{3 levels, every node naming the shape that measures it}

### Instrumentation Required
{nodes that cannot be measured today}
```

## Examples and Common Mistakes

**Incomplete PMF:** Survey score 2, retention score 1, organic pull and qualitative users unavailable → observed points 3, coverage 2/4, possible score 3–7 of 8. Report compatible Searching/Emerging/Strong bands and the missing evidence; do not call it 3/4 or conclude Pre-PMF.

**Narrow positioning request:** Review the supplied positioning sentence against customer/alternative/proof; do not require retention queries or a full PMF assessment.

| Mistake | Correction |
|---------|------------|
| Unknown signal scored zero | Keep unknown status and a 0–2 possible contribution |
| Partial score divided by known signals | Fixed 0–8 scale, known/4 coverage and possible interval |
| Stage guessed from heuristic thresholds | Preserve supplied stage/context; report uncertainty and evidence limits |
| North Star chosen mechanically by score | Compare customer value, evidence, gaming risk and measurability |
| Background skill loads another full analysis | Read only the relevant resource section |
