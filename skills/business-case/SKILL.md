---
name: business-case
description: "Sizes a bet in money: a quick estimate per option, every number tagged data, analogy, estimate or decision, three scenarios, the load-bearing assumption, the stake. Use when choosing what to build, valuing an idea, or deciding how much to bet."
---

# Business Case

An AI will give a number for anything, and when it lacks one it writes a plausible one in the tone of the question. A business case built that way is a confident guess. This skill turns it into a list of assumptions, each with where it comes from, ranked by how much it moves the result, so the one that carries the decision is the one tested before the build. It ends with how much to bet.

Making product is science and art. The science is the table: sources, scenarios, sensitivity. The art is the judgment where a number is the wrong instrument for the value, declared as such. The stage, the door and the data decide how much of each a bet needs.

**Mode.** Standalone returns the value of the supplied idea or options, the load-bearing assumption and the recommended stake, in the requested format. In the lifecycle it runs inside phase 3 between scoring and the bet round (`ideation-methods`, steps 4 to 8) and writes `03-solution-bet.md` → `## Value` and `## Bet size`, checked by gates 3.9 to 3.11, 3.14 and 3.15; the test it points to is designed per gates 3.4 and 3.12. Both per [operating modes](../../references/operating-modes.md). Read the [method](references/business-case-method.md) for the worked example, the templates, the five traps, the evidence bar by stage and door, and the experiment card.

## Procedure

1. **Read the inputs.** The options with their scores, the opportunity and its success metric with the baseline (`02-definition.md`), `PRODUCT.md` → `## Business` (stage, revenue model, metric tree) and the evidence already tagged. Standalone: the supplied idea and whatever numbers come with it. Done when you can say what the product earns from, per what unit, and which current numbers are measured.
2. **Estimate every option quickly.** One line per option still standing after the scoring, at most four: the formula in words and numbers, the one assumption it rests on, the two-year value at the median, rounded ("about €0.4M"). Build each from what people already do (the use of a similar feature, searches, saved stores), rather than from what they say they would do. The rough values go into the bet round next to the scores. Done when every option has a formula, its assumption and a value.
3. **Build the table for the leading option.** The option the round will recommend, and the person's pick if it differs. Every number in its formula gets a row: the value, the population it applies to (the denominator), its kind (**data** measured on this product, **analogy** measured on a similar product, **estimate** still to measure, **decision** ours to take), its tag, and three scenarios: P14 (86 cases in 100 do better), P50 (the number you would bet on) and P86. Data and decisions hold one value across the three. Compute the two-year value in each scenario, as profit: model the costs (build, upkeep, model and infrastructure per use) when they exceed 10% of revenue, and count only revenue the product does not already earn elsewhere. Round to the precision the estimates carry. Done when every row has a kind, a source and three values, and the result has three numbers.
4. **Find the load-bearing assumption.** Hold every assumption at P50, swing one at a time from P14 to P86, record the result at both ends, and rank by the swing. The top row is load-bearing: when it is an estimate or an analogy, it becomes the riskiest assumption and the cheapest test measures it; when it is data, check what it counts (visits or people, all users or a part), because a dirty data point is the last one anyone tests. Done when the sensitivity table is ranked and `**Load-bearing:**` names the top row.
5. **Ask the five questions.** In writing, under the table: where does each number come from; is it new revenue or moved from another line; what is the denominator; if the result were five times smaller, would the decision change; what did we kill, and with which number. Then ask a fresh context, where the host allows one, for the three most fragile assumptions and how each could be wrong by five times, giving it the table and no hint of the hoped-for answer. Done when all five have answers and every fragility raised is either answered or added as a row.
6. **Adapt where the method bends.** Value that resists a number (trust, defensibility, brand) is written as `**Judgment:**`: the reasoning in full, what would prove it wrong, a revisit date. A small, reversible decision is cheaper to make and measure than to estimate: say so and keep the table to its formula. A doubt about quality ("will it be good enough?") is answered by an experiment, not a scenario. Done when the case is a table, a declared judgment, or a stated reason to decide now.
7. **Decide whether the test is worth running.** A test is worth its cost when its result can change the decision: the probability it flips the bet, times what flipping is worth, beats the cost of the test plus the cost of the delay. Skip it, with the reason written, when building is cheap and reversible, when even P14 says build, when strong precedents exist, or when the measure would be unreliable. When it runs, write the card before any data: the question as a number, the exact event and window, the sample, `**Stop below:**` and `**Build above:**`, with the build threshold set where the second idea in the list becomes the better bet. Test the most extreme version. Done when `## Cheapest test` holds either the skip reason or the full card.
8. **Size the bet.** In `## Bet size`: the **door** (two-way: undone in days; one-way: a price promised, data deleted, a public commitment, a migration), the **confidence** in percent with what it rests on, the **appetite** (the most days this bet is worth, set from the P50 value and the confidence), and **if wrong** (what is lost and how it is undone). The build must fit the appetite or the scope shrinks. Then check the evidence against the bar for this stage and door in the method; a bet below the bar is a judgment call the person makes knowingly, with a revisit date. Done when the four fields are written and the evidence bar is met or the judgment call declared.
9. **Deliver.** Standalone returns the quick estimates, the table, the sensitivity, the answers and the stake. Lifecycle writes `## Value`, the card in `## Cheapest test` and `## Bet size` per the [template](references/business-case-method.md#template); the bet round per `pressure-testing` shows each option's value beside its scores, and the person chooses. Done when the sections exist and gates 3.9 to 3.14 pass on the file.

## Watch for

| Do | Instead of |
|---|---|
| A kind and a source beside every number | Five numbers written with the same certainty |
| Estimates from what people already do | "16 of 20 said they would use it" |
| P14, P50, P86 and "about €1.1M" | €1,123,200 built on a guessed percentage |
| The population next to every percentage | 8% of notified users applied to everyone |
| Only the revenue that is new | Budget moved from another line counted as growth |
| A causal effect much smaller than the observed gap | Correlation sold as the effect of the feature |
| The test aimed at the load-bearing estimate | Testing the number that was easiest to measure |
| Thresholds written before the data, set against the second idea | A threshold chosen after seeing the result |
| Building straight away when no result could change the decision | A fake door for a feature you will build anyway |

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `analytics.query` | Active users, visits, conversion, retention: the data rows | Ask for each value; an unavailable one is an estimate, tagged and ranged |
| `db.query` | Revenue per unit, counts of people versus events | Ask; say whether the number counts people or events |
| `web.search` | Analogies: usage of a similar feature, market search volumes, competitor reach | Ask for an analogy; without one, the row is an estimate with a wider range |
| `subagent.dispatch` | The fresh-context fragility review in step 5 | Run it inline, rereading the table as a sceptic would |
| `files.read` / `files.write` | The bet artifact and the evidence files | Inline answers need no write; lifecycle writes require it |

Nothing has to be connected: every row can be an estimate with a range, and the sensitivity still shows which one to test first.

## Output Contract

`## BUSINESS CASE COMPLETE` with the quick estimate of each option, the table of the leading option (kind, source, P14, P50, P86 per number), the two-year value in three scenarios, the load-bearing assumption, the five answers, whether the test runs (the card) or why it is skipped, and the stake (door, confidence, appetite, if wrong). Lifecycle output follows the [template](references/business-case-method.md#template); gates 3.9 to 3.14 parse its headings, tables and bold labels.
