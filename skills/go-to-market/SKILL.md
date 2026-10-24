---
name: go-to-market
description: "Plans how a product reaches buyers before the build and reads it after: trigger, price that sets the motion, positioning, a channel tested first, the launch, results per channel. Use when planning GTM, a launch, pricing motion or channels."
---

# Go-to-Market

Most products that fail were built for nobody who could be reached. Go-to-market is therefore part of deciding what to build, and of judging it after: before the build, who has the problem right now, what they pay, how they arrive and which one channel will be tried first, with a test that answers before the code; after the release, who hears of it, through what, and what each channel actually brought. The chain runs **trigger → price → positioning → message → motion → channel**, and the price comes before the positioning because it decides the motion.

**Mode.** Standalone returns a GTM plan, a launch plan or a channel readout for the supplied product or feature, in the requested format. In the lifecycle it runs three times: in phase 3 it writes `03-solution-bet.md` → `## Go-to-market` (gate 3.13) beside the business case; before the build the channel test's result goes into `04-spec.md` → `**Channel result:**` (gate 4.22, product track); in phase 6 it writes `06-release.md` → `## Launch` (gate 6.14); in phase 7 `07-outcome.md` → `## Go-to-market read` (gate 7.8). The product review reads the GTM stage. A feature reaches users the product already has, so its plan is the audience, the message and where they meet it. Both per [operating modes](../../references/operating-modes.md). Read the [GTM method](references/gtm-method.md) for the price-to-motion table, the stages with their exit conditions and kill signals, the channel test card, the templates and a worked example.

## Procedure

1. **Read the inputs.** `PRODUCT.md` (ICP, revenue model, growth engine, constraints on distribution, `**GTM stage:**`), the bet and its business case, the phase 1 evidence on where the ICP looks for solutions today, and past releases with their channel results. Done when you can name who pays, what they pay, and which channels have already been tried, with their results.
2. **Name the trigger.** The moment that makes someone look for this now, written as a situation: "an ops lead who just missed the Monday report for the board", with the capability they lack, who is pressing them and by when, and three to five anti-ICP exclusions. A feature names its **audience** inside the existing users the same way: who meets the problem, how many, tagged. Done when the trigger is one sentence a stranger could use to find ten such people.
3. **Let the price choose the motion.** From the price in the business case, the yearly value per account sets the motion: under €1k self-serve, €1k to €5k self-serve with sales assist, €5k to €25k inside sales, above that field and enterprise sales. A motion the price is too low to pay for (demos for a €500 a year product) is broken by design; change the price or the motion, and say which. Done when `**Motion:**` names the motion and the price that justifies it.
4. **Write the positioning and the message.** Positioning: why this and not the alternative the ICP uses today, in one sentence read in under five seconds. Message: the trigger's words, from the interviews and tickets, not the team's. For a feature, the message is the one line that tells an existing user what changed for them. Done when both are written and the message quotes or paraphrases a tagged source.
5. **Choose one channel and test it before the build** (product track). Start from where the ICP already gathers and where few serve this niche: a marketplace or directory, a community, search intent, a partner's customers, the founder's outbound. Pick one, with the reason the others wait. Write a channel test with the card of `business-case` (what runs, the event, `stop below`, `build above`, the window) that costs days: a listing, a landing page with a price, twenty personal messages, a post where the ICP reads. Done when `**Channel:**` and `**Channel test:**` are written; before the build, `**Channel result:**` in the spec carries the tagged result against the thresholds.
6. **Plan the launch** (phase 6). Who hears first (the testers, the people who asked, the waitlist, the accounts the feature was for), the message, the channels in order, the date tied to the rollout, and how each channel's arrivals are counted (a source on the signup or the first use). The launch messages are drafted in full for the person, who sends them or authorizes the send, as with exposure. Done when `## Launch` has the five fields and each channel has an event that counts it.
7. **Read it after** (phase 7, and every product review). Per channel: reached, converted, the tagged source, and what happens next (double down, fix, stop). For a product, judge the GTM stage against the exit conditions in the method (Signal, Resonance, Orbit) and name the kill signal when one fires: a wrong ICP is changed, not optimized. Feed the top three objections and unexpected uses back into the roadmap. Done when every channel has a result or "unavailable" with its question, and the product has its stage.

## Watch for

| Do | Instead of |
|---|---|
| The trigger as a moment someone is in | A demographic: "SMBs, 10 to 50 employees" |
| The price first, then the motion it can pay for | Outbound demos for a product worth €500 a year |
| One channel, tested in days before the build | "Social, SEO, ads and partners" with no number |
| The ICP's words in the message | The team's category name |
| Ten strangers at full price before calling it fit | Five friendly customers who came through warm intros |
| A source on every arrival, read per channel | One total signup number after launch |
| Change the ICP when the channel stays silent | Tuning the cadence of an outreach nobody answers |

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `web.search` | Where the ICP gathers, competitors' channels and prices, marketplace density | Ask the person where their buyers look today; mark the channel choice as unverified |
| `analytics.query` | Arrivals and conversion per channel, activation by source | Ask for the counts; add a source property to signup in the tracking plan |
| `tickets.read` / `meetings.read` | The ICP's own words and objections | Ask the person to paste them; save with `evidence add` |
| `files.read` / `files.write` | The bet, spec, release and outcome sections | Inline answers need no write; lifecycle writes require it |

A GTM plan needs nothing connected; the channel test needs a person or a channel to run it.

## Output Contract

`## GTM PLANNED` (phase 3: trigger or audience, motion and price, positioning, message, channel and its test), `## LAUNCH PLANNED` (phase 6: who hears first, message, channels, date, how each is counted) or `## GTM READ` (phase 7: per channel reached, converted, source, next; the product's GTM stage). Lifecycle output follows the [templates](references/gtm-method.md#templates); gates 3.13, 4.22, 6.14 and 7.8 parse their headings and bold labels.
