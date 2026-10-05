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
| **Threshold** | A number that separates continue from stop | "if adoption is low" | "below 15%" |
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

## Options
| # | Option | Primary user action | Impact | Confidence | Effort | Reversibility |
|---|--------|--------------------|--------|-----------|--------|---------------|
| 1 | | the user … | | `[tag]` | | |

{Confidence scores cite tags. An option resting on assumption says so.}

## Selected: {n}
**Why:** {impact and confidence, with the reversibility tie-break where it applied}

## Rejected
| Option | Why not now | Revisit when |

## Kill criteria
On {date}, if {metric} is below {threshold}, we {stop / revert / rebuild differently}.
**Measured by:** {query, event or dashboard}

## Riskiest assumption
{falsifiable sentence, inherited from phase 0 and sharpened here}

## Cheapest test
**Shape:** {smoke / fake door / concierge / Wizard of Oz / prototype / instrumented slice}
**Design:** {what runs, with whom, measuring what}
**Test cost:** {n} days · **Build cost:** {n} days · **Ratio:** {n}%
**Order:** {test first / build first, with the reason or the logged override}
**Falsified if:** {the observation that would kill the assumption}
```
