# Ideation Reference

Supporting detail for `ideation-methods`. Links resolve relative to this file.

## Mechanical distinctness, worked

Most ideation produces one idea wearing three costumes. The discipline is options that differ in what the user actually does, not in how the screen looks.

| Options | Primary action | Verdict |
|---------|---------------|---------|
| Bulk CSV import / drag-and-drop import / import wizard | the user uploads a file | One option |
| Bulk CSV import / connect the source system / we import it for them during onboarding | uploads a file / authorizes a connection / does nothing | Three options |

The second row is the useful set, and the third member ("we do it for them") is the one teams skip. Manual, unscalable and human-powered options are usually the cheapest test of whether the value is real, and occasionally they are the product.

## The four prompts, expanded

1. **Shift who acts.** The user, the system automatically, a teammate, or your own team by hand. Each shift changes the primary action.
2. **Shift when it happens.** Before the problem appears (prevention), at the moment (intervention), or after (recovery). Prevention is usually cheaper and less popular.
3. **Remove rather than add.** What could be deleted, defaulted or decided for the user so the problem stops existing? A removal option is almost never proposed.
4. **Take the constraint away.** If effort were free, what would you build? Now name the crude version of that which fits this quarter. The crude version is often a real option.

## Scoring axes

Each 1 to 5. No composite score, because a single number hides the axis that should decide.

| Axis | Question | 1 | 5 |
|------|----------|---|---|
| **Impact** | How much of the phase 2 metric does this move, if it works? | A sliver | Most of the gap |
| **Confidence** | What evidence says it will work? | A hunch | Direct evidence from phase 1, tagged |
| **Effort** | What does it cost to get to a real user? | Quarters | Days |
| **Reversibility** | If it is wrong, what does undoing it cost? | Migration, contracts, public commitments | Delete a flag |

An option whose confidence rests only on an unvalidated assumption is precisely the option whose test matters most. Between two options of similar impact the reversible one wins, because being wrong cheaply is worth more than being right slowly.

## Kill criteria parts

| Part | Requirement | Bad | Good |
|------|-------------|-----|------|
| **Metric** | The phase 2 success metric, or a named leading indicator of it | "engagement" | "share of new workspaces with ≥1 imported record" |
| **Thresholds** | A stop line and a keep line; between them, iterate. The keep line sits where the second option would have been the better bet | "if adoption is low" | "below 15% we stop, above 25% we keep" |
| **Date** | When it gets checked | "after a while" | "28 days after 50% rollout" |

The threshold is the hard part, because a number written before launch can embarrass someone afterwards. That embarrassment is the mechanism. A kill criterion that cannot be failed is decoration, and phase 7 will have nothing to evaluate.

## Test catalogue

| Test | What it tests | Typical cost | Watch for |
|------|--------------|--------------|-----------|
| **Smoke test** | Whether anyone wants it, before it exists | Hours to 2 days | Measures interest in a claim, not use of a product |
| **Fake door** | Whether users will take the first step | 1 to 3 days | Erodes trust if repeated; needs an honest follow-up |
| **Concierge** | Whether the outcome is valuable, delivered by hand | 3 to 10 days | Tests value, not scalability. That is the point |
| **Wizard of Oz** | Whether the experience works, with humans behind the curtain | 5 to 15 days | Costs staff attention for as long as it runs |
| **Prototype test** | Whether people can complete the flow | 2 to 5 days | Tests comprehension, not motivation |
| **Instrumented slice** | Whether the real thing moves the metric, on a small population | 1 to 3 weeks | The most expensive, and the only one measuring the real thing |

Cost bands are orders of magnitude for planning, not estimates for a specific team. Write the estimate in days for *this* team, on *this* assumption, and say what it is based on.

## Output template

Lifecycle path: `.builderos/initiatives/{initiative}/03-solution-bet.md`. Standalone output adapts it only where useful and omits lifecycle gate claims.

```markdown
# Solution Bet — {product}

## Opportunity
{from 02-definition.md, with its evidence tags}

## Divergence
| # | Raw idea | Prompt | From |
|---|----------|--------|------|
| 1 | {one line} | who acts / when / remove / no constraint / other domain / user | agent / {person} |

{At least eight rows, five in lite mode. Unscored. Clusters become the options below.}

## Options
| # | Option | Primary user action | Impact | Confidence | Effort | Reversibility |
|---|--------|--------------------|--------|-----------|--------|---------------|
| 1 | | the user … | | `[tag]` | | |

{Confidence scores cite tags. An option resting on assumption says so.}

## Selected: {n}
**Chosen by:** {person, with their answer or the dated standing instruction}
**Why:** {impact and confidence, with the reversibility tie-break where it applied}

## Rejected
| Option | Why not now | Revisit when |

## Value
{business-case, gates 3.9 to 3.11: quick estimates, the assumptions table with kind, source and P14 / P50 / P86, the two-year value, costs, the sensitivity, the load-bearing assumption, the five questions; or a declared judgment. Template in skills/business-case/references/business-case-method.md}

## Go-to-market
{go-to-market, gate 3.13: Audience, Message, Where for a feature; Trigger, Positioning, Motion, Channel, Channel test, Message for a product. Template in skills/go-to-market/references/gtm-method.md}

## Business case
{product track, gate 3.7}
**First 100 users:** {the channel, the message in one sentence, who does the work; for self-serve, what a user does that brings the next one}
**Cost per user:** {infrastructure plus model cost per active user per month, and what it rests on}
**Price:** {starting price and price metric; omit when PRODUCT.md says not for sale}
**Willingness to pay test:** {how a person from the ICP will show they would pay before the build: pre-order, letter of intent, a click on a price, the price asked in the real-user session}

## Kill criteria
On {date}, below {stop} we {stop / revert / rebuild differently}; between {stop} and {keep} we iterate; above {keep} we keep.
**Measured by:** {query, event or dashboard}

## Riskiest assumption
{falsifiable sentence, inherited from phase 0, sharpened here, and the load-bearing assumption of ## Value when it is an estimate}

## Cheapest test
**Assumption:** {the load-bearing assumption}
**Shape:** {smoke / fake door / concierge / Wizard of Oz / prototype / instrumented slice}
**Design:** {what runs, with whom, measuring what}
**Test cost:** {n} days · **Build cost:** {n} days
**Order:** {test first / build first}
**Changes the decision:** {test first: which result would flip the bet, and why the decision is not already made}
**Skip because:** {build first: cheap and reversible / the pessimistic case still proceeds / strong precedent / unreliable measure, or the logged override}
**Question:** {the assumption as a number to beat}
**Event:** {the exact event, on whom, over how long}
**Stop below:** {n} · **Build above:** {n}
**Second idea:** {the runner-up and its value}
**Sample:** {people per group, or the declared small sample before PMF}
**Falsified if:** {the observation that would kill the assumption}

## Bet size
{business-case, gates 3.14 and 3.15}
**Door:** {one-way / two-way, and why}
**Confidence:** {n}%, {what it rests on}
**Appetite:** {n} days
**If wrong:** {what we lose and how we undo it}
**Evidence bar:** {met for this stage and door, or a judgment call by {person} with the reasoning and a revisit date}
```
