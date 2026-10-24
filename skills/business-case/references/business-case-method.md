# Business Case Method

Read when running `business-case`. It holds the four kinds of number, the scenarios, the sensitivity, a worked example, the traps, the five questions, the experiment card, the evidence bar and the stake.

## Why the table

Ask a model to value the same feature with five framings (neutral; "the team believes in it"; "finance thinks it is useless"; "show me how it reaches €5M"; "users said they would use it daily") and the numbers move with the framing. A model answers in the tone of the question and fills a missing number with a plausible one. So every number from a model is a hypothesis, and the case is only as good as the source written next to each number.

Two kinds of evidence exist: what people say is an opinion about the future ("I would turn it on", 14 of 20 interviews); what people do has already happened (how many accounts send a manual reminder today, how many search for the feature in the help center, how many pay for a similar add-on elsewhere). Estimates are built on the second.

## The four kinds

| Kind | Means | Example | Scenarios |
|------|-------|---------|-----------|
| data | Measured on this product | active accounts, from the database | one value; check what it counts |
| analogy | Measured on a similar product | the attach rate of a comparable add-on | a range |
| estimate | A hypothesis still to measure | the share that will turn the feature on | a range, usually the widest |
| decision | Ours to set | the price, the number of reminders | one value |

Tags follow `evidence-ledger`: data rows cite `data`, `code` or `doc`; an analogy cites the `doc` or `data` file holding the other product's number; an estimate cites `[estimate:{method}]` or `[assumption:unvalidated]`.

## Three scenarios, two years, money

- **P14**, pessimistic: in 86 cases out of 100 it goes better than this.
- **P50**, base: the number you would really bet on.
- **P86**, optimistic: in 86 cases out of 100 it goes worse than this.

Two years is long enough to see the value and close enough to estimate it. The result is profit: revenue minus costs. Costs under 10% of revenue can be left out, said so; above it they are modeled (build, upkeep, model and infrastructure per use).

## Sensitivity

Hold every assumption at P50. Move one from P14 to P86 and record the result at both ends. Repeat for each, and rank by the distance between the two results. The top row decides: if it is an estimate, it is the one to test; if it is data, check what it really measures.

## Worked example

An invoicing tool for freelancers has 400,000 active accounts. It considers a paid add-on, automatic late-payment reminders at €4 a month. Today 35% of accounts have at least one overdue invoice in a month, and many of them chase it by hand.

**Quick estimates** of the four options left after the scoring:

| Option | Assumption it rests on | Two-year value (P50) |
|---|---|---|
| Paid reminders add-on | accounts with overdue invoices pay to stop chasing | about €0.7M |
| Client payment portal | clients pay faster when they can pay by card | about €0.4M |
| Early-payment discount | freelancers accept a discount to be paid sooner | about €0.2M |
| Overdue dashboard | seeing overdue totals makes people chase sooner | about €0.1M |

**The table** for the reminders add-on:

| Assumption | Population | Kind | Source | P14 | P50 | P86 |
|---|---|---|---|---|---|---|
| Active accounts | all accounts | data | the database | 400,000 | 400,000 | 400,000 |
| With an overdue invoice in a month | active accounts | data | the database | 35% | 35% | 35% |
| Turn the add-on on | accounts with an overdue invoice | estimate | never measured | 3% | 8% | 15% |
| Price per month | add-on subscribers | decision | ours | €4 | €4 | €4 |
| Months paid within two years | add-on subscribers | estimate | ramp-up and churn of other add-ons | 10 | 16 | 20 |

400,000 × 35% × 8% × €4 × 16 ≈ €0.7M of revenue in two years. Build and upkeep of about €90K is over 10%, so it enters: expected profit about €0.6M.

**Sensitivity** (revenue over two years): adoption €0.27M to €1.3M; months paid €0.45M to €0.9M; the data and the decision are fixed. Adoption weighs most and is an estimate: it is the assumption to test. When a team asked separately for the adoption gives answers four times apart, that spread is itself the sign of a load-bearing assumption.

## The traps

| Trap | What it looks like | The rule |
|------|--------------------|----------|
| False precision | €716,800 of revenue built on an adoption estimated by eye | Show the precision you have: "about €0.7M", with the source |
| Correlation as cause | Accounts that already chase by email get paid 30% faster, so "reminders make everyone paid 30% faster" | Ask whether you measure the effect or the people; use a causal effect much smaller than the gap, since organized people do both |
| Cannibalization | Add-on revenue from accounts that would have upgraded to the plan that already includes reminders | Count only revenue that is new |
| Wrong denominator | 8% adoption among accounts with an overdue invoice, applied to all 400,000 | Every percentage belongs to a population: write it next to the number |
| Forgotten costs | Text-message reminders treated as free | The case is on profit: three messages per overdue invoice at €0.05 each is a cost line |
| Dirty data | "Overdue invoices: 210,000" read as accounts, when one account has many | Data can be wrong too, and it is the last row anyone tests: check whether it counts people or events |

## The five questions before approving

1. Where does this number come from?
2. Is it new revenue, or taken from another line?
3. What is the denominator?
4. If it were five times smaller, would you change the decision?
5. What did you kill, and with which number?

## When the method bends

- **Value that is hard to measure** (trust, defensibility, brand): decide with explicit reasoning in place of the number, declared as such (`**Judgment:**`).
- **Doing costs less than estimating**: for small, reversible decisions, decide now and measure after. Estimation pays where being wrong is expensive.
- **Quality is the doubt**: "will it be good enough?" is answered by an experiment.

## The experiment card

An experiment has three parts: a **question** written as a number ("does it exceed 4.5%?"), a **measure** (the exact event counted: an activation with a card on file, a payment, a second use within seven days) and a **decision written before the data**, because afterwards it moves to wherever is convenient.

| Field | Reminders example |
|---|---|
| Assumption | Adoption: accounts with an overdue invoice turn the add-on on |
| Question | Do at least 4.5% of accounts with an overdue invoice start the paid add-on within 14 days of seeing it? |
| Event | Add-on started with a card on file, by accounts shown the offer on their overdue invoice, within 14 days |
| Stop below | 1.5% (barely covers build and upkeep) |
| Build above | 4.5% (where it beats the client portal, the second option) |
| Between | A new test: a different placement or price |
| Sample | About 520 accounts per group to tell 4.5% from 1.5% |
| Still to prove | Whether subscribers stay 16 months, whether it moves upgrades to the higher plan |

**Sample size.** People per group ≈ 16 × p × (1 − p) ÷ d², with p the expected conversion and d the difference to detect. The 16 is 2 × (1.96 + 0.84)²: a false alarm at most once in 20, a true difference seen 8 times in 10. Halving the difference quadruples the people. From 1% to 2%: 16 × 0.02 × 0.98 ÷ 0.0001 ≈ 3,100 per group. If the traffic of two weeks cannot reach the number, change the experiment or skip it. `experiment-methodology` has the exact calculation.

**Worth running** when the probability the result changes the decision × the value of the change > the cost of the experiment + the cost of the delay. Run it when building is long, costly or irreversible, the load-bearing assumption is an estimate, and the threshold falls between P14 and P86. Skip it when building is cheap and reversible, even P14 says proceed, strong precedents exist on similar products, or the measure would be unreliable.

**The threshold is set by the second option.** An absolute bar ("we need 8%, the base case") can kill a bet that is still the best one available. The right question: below which number does the second option become the better bet? A measured result far below the plan can still mean build, when the runner-up is worth about the same with less certainty.

**Cheapest first, most extreme version.** A fake button measures curiosity; an offer with a price and a card field measures intent to pay; the real add-on for a share of accounts measures the effect. Put the offer where every candidate sees it (on the overdue invoice itself): if even that does not move the number, a version buried in settings will move it less, and you are done sooner.

**Questions that look right and are not.** "Would users want reminders?" (opinion: everyone says yes). "How many click the new button?" (curiosity of the first days). "How many tried it?" (one use is worth nothing; count who keeps paying). "Do users of the feature churn less?" (correlation: engaged users use everything). Measures with the same flaw: clicks, total sessions, time on a page, signups from the launch campaign, before-and-after without a control, data after three days (novelty).

**Four questions to take any experiment apart.** What does this event really prove, and who would have done it without the need? What would a false positive look like, described before the data (novelty that fades by week four; displacement, where a number rises here because it fell somewhere else)? How many people are needed to tell your number from its half? Can you explain the mechanism, and what does it predict that you can check?

**Experiments not to run.** A fake door for a feature you will build anyway: a delay dressed as an experiment. A test on development data: the result describes nobody. A timid placement chosen to protect another metric: a weak result that leaves you guessing; test the strong placement on fewer users instead.

## The evidence bar

How much evidence a bet needs depends on the stage (`PRODUCT.md` → Stage) and the door. These are BuilderOS starting points; the person may bet below the bar as a declared judgment call with a revisit date (gate 3.15).

| Stage | Two-way door (undone in days) | One-way door (hard to undo) |
|-------|-------------------------------|------------------------------|
| idea, pre-PMF | One real behaviour from people outside the team (a session, a manual run, a click on a price); decide and read within two weeks | The table with the load-bearing assumption tested on real behaviour (a payment, a pre-order, repeated use) before the build |
| emerging-PMF | The table with data for the population and value rows; ship behind a flag and read against the kill thresholds | The table, the sensitivity and a test of the load-bearing assumption with thresholds written first |
| scaling | Ship behind a flag with a powered experiment where traffic allows | All of it, with a powered experiment and a rehearsed rollback |

## The stake

- **Door.** One-way: a price promised to customers, data deleted or migrated without a way back, a public commitment, a contract, a platform choice that others build on. Two-way: behind a flag, removable in days.
- **Confidence.** A percentage the team would bet at, with what it rests on: how many rows are data, whether the load-bearing assumption has been measured.
- **Appetite.** The most days this bet is worth. Start from the P50 value times the confidence; a two-way door before PMF bets days, not months. When the build estimate exceeds it, cut the scope (Shape Up's fixed time, variable scope) or put a bigger stake to the person with the reason.
- **If wrong.** What is lost, in days, money and the slot of the second idea, and how it is undone.

## Template

```markdown
## Value
{business-case; feature and product tracks}

### Quick estimates
| Option | Formula | Assumption it rests on | Two-year value (P50) |
|---|---|---|---|
| {option} | {users × share × frequency × unit value × 24} | {the one assumption} | about €{n} |

### Assumptions
| Assumption | Population | Kind | Source | P14 | P50 | P86 | Load-bearing |
|---|---|---|---|---|---|---|---|
| {what the number is} | {who it applies to} | data / analogy / estimate / decision | `[tag]` | | | | yes / no |

**Formula:** {the product of the rows, in words}
**Two-year value:** P14 about €{n} · P50 about €{n} · P86 about €{n}
**Costs:** {modeled: build, upkeep, model and infrastructure per use; or "under 10% of revenue" with why}

### Sensitivity
| Assumption | Kind | Result at P14 | Result at P86 |
|---|---|---|---|
| {ranked from the largest swing} | | €{n} | €{n} |

**Load-bearing:** {the top row, and its kind}
**What it counts:** {only when the load-bearing row is data: people or events, all users or a part}

### Five questions
1. Where does each number come from? {answer}
2. New revenue, or moved from another line? {answer}
3. The denominator? {answer}
4. Five times smaller, would we decide differently? {answer}
5. What did we kill, and with which number? {answer}

{Or, when the value resists a number: **Judgment:** {the reasoning, what would prove it wrong, the revisit date}}

## Cheapest test
**Assumption:** {the load-bearing assumption}
**Shape:** {smoke / fake door / concierge / Wizard of Oz / prototype / instrumented slice}
**Design:** {what runs, with whom, measuring what}
**Test cost:** {n} days · **Build cost:** {n} days
**Order:** {test first / build first}
**Changes the decision:** {when test first: which result would flip the bet, and why the decision is not already made}
**Skip because:** {when build first: cheap and reversible / the pessimistic case still proceeds / strong precedent / unreliable measure, with the specifics}
**Question:** {the assumption as a number to beat}
**Event:** {the exact event, on whom, over how long}
**Stop below:** {n} · **Build above:** {n}
**Second idea:** {the runner-up and its value}
**Sample:** {people per group, or the declared small sample before PMF}
**Still to prove:** {what this test leaves open}
**Result:** {when it returns: the number against Stop below and Build above, with its tag; below the stop line the build waits for a kill, a new bet or a waiver (gate 4.22)}

## Bet size
**Door:** {one-way / two-way, and why}
**Confidence:** {n}%, {what it rests on}
**Appetite:** {n} days
**If wrong:** {what we lose and how we undo it}
**Evidence bar:** {met for {stage} and this door, or a judgment call by {person} with the reasoning and a revisit date}
```
