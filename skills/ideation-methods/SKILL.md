---
name: ideation-methods
description: "Generates and narrows solutions: eight raw ideas, distinct options scored on separate axes, a bet the person picks, kill criteria, the cheapest test. Use when a problem needs solution options, one idea needs rivals, or a bet needs kill criteria."
---

# Ideation Methods

Phase 2 chose what to attack. Phase 3 chooses how, by **diverging** wide before judging, **converging** into mechanically distinct options, and committing in advance to what would prove the choice wrong.

**Mode.** Standalone generates alternatives from the supplied opportunity, problem or requirements; an options-only request ends with the alternatives (step 4). The lifecycle runs every step, writes `03-solution-bet.md` and gate 3. Both per [operating modes](../../references/operating-modes.md). Load `pressure-testing` for the bet round, `business-case` for the value and the stake, `go-to-market` for how users arrive, `experiment-methodology` when a test design is requested. Read the [ideation reference](references/ideation-reference.md) for worked examples, the scoring and kill-criteria tables, the test catalogue with cost bands, and the output template.

## Procedure

1. **Read the inputs.** Standalone uses the supplied problem or opportunity and constraints. Lifecycle reads `02-definition.md` and `00-frame.md`: the selected opportunity, the success metric with its baseline and target, the riskiest assumption; options with no chosen opportunity are a brainstorm, so a missing `02-definition.md` stops the phase. Done when you can state the opportunity, the metric and the riskiest assumption in a line each.
2. **Diverge before judging.** Wide first, unscored: at least eight raw ideas (five in lite mode; gate 3.5), each one line in `## Divergence` with the prompt that produced it. Work the prompts in order: shift who acts (user, system, teammate, your team by hand); shift when it happens (prevention, intervention, recovery); remove rather than add; take the constraint away, then name the crude version that fits this quarter; borrow how another domain solves the same shape. In the first round ask the person for the ideas they already have and add them under their name: an idea they arrived with and never saw compared is the one they will quietly build anyway. Done when the count is met and every prompt produced at least one idea.
3. **Converge into distinct options.** Cluster the raw ideas by primary user action, "the user {verb}s {object}"; two ideas with the same sentence are one option with two skins, merged under the stronger skin (gate 3.1). Keep at least three distinct options, a manual or human-powered one and a removal one among them; under three, diverge again. Done when every option has a unique action sentence.
4. **Score on separate axes, then put a rough value on each.** Impact, Confidence, Effort, Reversibility, each 1 to 5, shown side by side with no composite. Confidence comes from the tags in `01-discovery.md`: an option resting on `[assumption:unvalidated]` scores 1 or 2, and the score line says so. Then `business-case` step 2: per option, at most four, the formula, the assumption it rests on and a two-year value at the median, built from what people already do. An options-only request ends here. Done when every option has four scores, each confidence score cites its tags, and each option has a rough value.
5. **Value the leading option.** `business-case` steps 3 to 6 on the option the round will recommend: every number with its kind (data, analogy, estimate, decision), its source and P14, P50, P86; the two-year value as profit; the sensitivity that names the load-bearing assumption; the five questions. When the value resists a number, a declared judgment. Done when `## Value` is written (gates 3.9 to 3.11).
6. **Pressure-test and let the person choose.** For each contender, what would make it wrong, which evidence would change it, the cheapest way to find out. Then a `pressure-testing` round: the options with their scores, their rough value and one line each on what choosing it means, a recommendation and its reason; **reversibility breaks ties, not impact**. Record `**Chosen by:**` with the person and their answer (gate 3.6); a standing instruction that named this scope counts, quoted with its date, and the recap still shows the alternatives so the choice can be reversed in a word. A pick other than the leading option gets its own table. Write the rejections, each with a reason, its value and a revisit condition. Done when the person's choice is recorded and every rejected option has its reason.
7. **Write kill criteria** (gate 3.2), before the build: the metric (the phase 2 success metric or a named leading indicator), two thresholds and a date, in a form someone outside the room can apply: "on {date}, below {stop} we {stop / revert / rebuild differently}; between {stop} and {keep} we iterate; above {keep} we keep". Set the keep line where the second option would have been the better bet. Done when the criterion could fail on a real number by a real date.
8. **Say how users arrive and who pays.** `go-to-market` steps 1 to 5 write `## Go-to-market` (gate 3.13): for a feature the audience, the message and where they meet it; for a product the trigger, the motion the price can pay for, the positioning, one channel and its test. On the product track also `## Business case` (gate 3.7): the first 100 users, the cost per active user, and for a product for sale the price and the willingness-to-pay test. Read `PRODUCT.md` → Revenue model and Growth engine first; "not for sale" drops the money lines. Do the arithmetic aloud: price times the users the target implies, against the cost. Done when the arithmetic is written and says whether the bet can reach the product's ambition.
9. **Decide whether the test runs first.** The test aims at the load-bearing assumption (`business-case` step 7). It runs when its result can change the decision; it is skipped, with the reason written, when building is cheap and reversible, when even the pessimistic case proceeds, when strong precedents exist, or when the measure would be unreliable (gate 3.4). A test that runs carries its card, thresholds written first and set against the second idea (gate 3.12). Before PMF (`PRODUCT.md` → Stage) prefer concierge and Wizard of Oz: doing the outcome by hand tests value, which is the open question, while building it to scale is the work gate 3.8 rejects. Estimate the test and the build in days and what each rests on. Done when the order, its reason, and when the test runs its card, are written.
10. **Size the bet.** `business-case` step 8: the door, the confidence, the appetite in days and what is lost if wrong, the build inside the appetite, the evidence held against the bar for this stage and door, or a judgment call the person makes knowingly (gates 3.14, 3.15). Done when `## Bet size` is written.
11. **Deliver.** Standalone returns the alternatives, the proposed bet or the test design as requested. Lifecycle writes `.builderos/initiatives/{initiative}/03-solution-bet.md` per the [template](references/ideation-reference.md#output-template), runs gate 3 and records it (`scripts/bos.mjs record 3` where commands run). Done when the artifact exists and, in the lifecycle, gate 3 is recorded.

## Watch for

| Do | Instead of |
|---|---|
| Diverge to eight raw ideas; three is the floor of the converged set | Three options and straight to scoring |
| Present the round; the person chooses and is recorded | Picking the bet because it scored best |
| Work the who-acts and removal prompts before scoring | A set with no manual or removal option |
| Score confidence from tags | Scoring it on enthusiasm |
| Metric, threshold, date: the number that would embarrass you | Kill criteria that cannot fail |
| Run the test when it can change the decision; write why when it would change nothing | A test for a bet you will build anyway |
| A rough value in money beside every option's scores | Choosing on a 1 to 5 impact score alone |

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `analytics.query` | Sizing an option's reachable population; the leading indicator behind a kill threshold | Use supplied sizing with uncertainty; a missing baseline stays unknown and needs measurement |
| `repo.read` | What already exists, which changes the effort score materially | Ask the user what exists; score effort as a range |
| `docs.search` | Prior attempts at this problem, and why they were dropped | Ask. A previously failed attempt is the highest-value input to this phase |
| `web.search` | How others solved this shape of problem | Skip; the option set comes from the prompts in step 2 |
| `files.read` / `files.write` | Supplied inputs and requested artifact; lifecycle state | Inline alternatives need no write; lifecycle writes require it |

**Option generation needs no connected data.** In the lifecycle an unknown upstream baseline holds the relevant gate until it is measured or explicitly overridden. A provisional test threshold may be a design choice, labeled as such, rather than a claimed observed value.

## Output Contract

`## BET SELECTED` with the raw ideas count, the option set with each rough value, who chose the bet, its value in three scenarios and the load-bearing assumption, the go-to-market, the kill criteria, the test decision and design, the stake and the gate result. Standalone output follows the requested format and destination; lifecycle output follows the [template](references/ideation-reference.md#output-template) exactly, since gate 3 parses its headings and bold labels.
