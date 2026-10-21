# The Product Review

Read when the person asks how the product is doing, what to build next, or for the weekly or monthly review, and when the briefing says the review is due.

An initiative answers whether one bet worked. The product review answers which bet comes next. It reads the levers of the metric tree, decides whether the product has changed stage, and proposes at most three initiatives, each on a lever. Without it every initiative is chosen by whoever asked last, and `PRODUCT.md` stays at the stage it was written in.

## The two loops

```
product review ──(1-3 proposals, a person picks)──> initiative 0 → 7
      ▲                                                    │
      └──────────── lever moved or not, watch, KILL ───────┘
```

The metric tree in `PRODUCT.md` → `## Business` connects them: every initiative names the lever it moves (gate 2.7), and every review reads every lever.

## Cadence

Weekly at `idea` and `pre-PMF`, where the job is learning fast; monthly at `emerging-PMF` and `scaling`. The briefing flags it as due. Where `schedule.run` resolves, the review can run on it and leave its proposals for the person; otherwise the briefing date is the mechanism. A review takes ten minutes of the person's time: one round, not a meeting.

## Procedure

1. **Read.** `PRODUCT.md` → `## Business`, the latest review in `.builderos/reviews/`, `ROADMAP.md`, open initiatives and their phases, watches and outcome reviews due, overrides in force.
2. **Set up the business section if it is missing** (first review). Draft it from what is known and ask for the rest in one round per `pressure-testing`: stage, stage exit thresholds, North Star, revenue model (or "not for sale" with why), growth engine, and three to six levers. Use `product-analysis` (strategy) for the North Star and the tree; never invent a value. The template is in `references/product-md-template.md`.
3. **Read every lever.** Ask for each in the shapes of `references/analytics-contract.md` (volume, funnel, retention, breakdown). A value carries its tag and its evidence file; a value nobody can read is `unavailable: {the question that would fill it}`, never zero and never an estimate. Compare with the last review.
4. **Judge the stage.** Compare the numbers against `**Stage exit:**`, literally, as phase 7 reads kill criteria. A move between stages is proposed to the person with the numbers that justify it; a retention break after PMF is a move back. When the stage changes, amend `PRODUCT.md` (`**Stage:**` and the Amendment Log) in the same step.
5. **Propose one to three initiatives.** Each on the lever that most limits the North Star now, with why now, the track it would run on, and what it would replace in `ROADMAP.md`. Before PMF, proposals test whether there is a product; scale, optimization and hardening wait. Include overdue watches and outcome reviews before new work: an unread result outranks a new bet.
6. **The person decides.** Present the proposals as one round per `pressure-testing`, with a recommendation. Record the answer under `**Decided by:**`, in their words. The agent never fills the roadmap on its own.
7. **Write and check.** Write `.builderos/reviews/{YYYY-MM-DD}.md` per the template below, run `scripts/bos.mjs review`, fix what fails, judge R.5, then update `ROADMAP.md` → Next and regenerate it with `scripts/bos.mjs roadmap`. Starting a chosen initiative is a separate step through `builder-os`.

Open the report with a plain recap of at most five lines: where the product is, what moved, what is next and why.

## Template

```markdown
# Product review {YYYY-MM-DD}

**Stage:** {stage}, {stays | moves to X | moves back to X}, because {the exit thresholds against the numbers}

## Levers
| Lever | Last | Now | Source |
|-------|------|-----|--------|
| {each lever of the tree} | {value at the last review} | {value, or unavailable: question} | {tag} |

## Due
{watches, outcome reviews, overrides older than a cycle; or "nothing due"}

## Proposed initiatives
| Initiative | Lever it moves | Why now | Track |
|------------|----------------|---------|-------|

## Decision
**Decided by:** {person, their words}
**Roadmap:** {what entered Next, what left}
```

## Conditions (`scripts/bos.mjs review`)

| # | Condition |
|---|-----------|
| E.1 | Every tag resolves to its evidence file |
| R.1 | `PRODUCT.md` → `## Business` is complete: a valid stage, stage exit thresholds before PMF, North Star, revenue model, growth engine, at least three levers each with a tagged value or "unavailable" and its question |
| R.2 | The review reads every lever, each with a tag or "unavailable" and the question |
| R.3 | One to three proposals, each naming a lever of the tree |
| R.4 | A person decided, by name |
| R.5 | Model-judged: the stage verdict follows the exit thresholds and the numbers, not the mood |

Where commands cannot run, apply the same conditions by reading and say they were model-checked.

## Rules that change with the stage

| | Before PMF (`idea`, `pre-PMF`) | After PMF (`emerging-PMF`, `scaling`) |
|---|---|---|
| Evidence | Five real conversations beat any dashboard; data where it exists | Behavioral data required where it exists |
| Experiments | Thresholds written before, small samples accepted and declared, judged qualitatively | Full statistics of `experiment-methodology`, power computed |
| What gets built | Only what tells whether there is a product; scale work is rejected (gates 2.5, 3.8, 4.15). Concierge and wizard-of-oz tests are welcome | Optimization, scale, efficiency |
| Operations (gate 6.10) | Errors seen, backup restored, privacy, AI disclosure | Plus SLO, incident response, cost per active user |
| Review | Weekly | Monthly |

## Common Mistakes

| Mistake | Correct |
|---------|---------|
| Filling the roadmap from the review without the person | Propose, recommend, record their answer |
| A lever left blank because the data is hard to get | `unavailable: {question}`; the gap is a finding |
| Moving to `emerging-PMF` because signups grew | Read the exit thresholds: retention and the survey, not volume |
| Five proposals "to be safe" | Three at most; the rest is the backlog |
| A new bet while a watch is overdue | Read the result first |
