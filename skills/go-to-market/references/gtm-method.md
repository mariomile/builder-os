# GTM Method

Read when running `go-to-market`. Sources: the GTM Gravity framework (a synthesis of Alexander Estner's stage playbook, Elena Verna's product-led sales and growth loops, Kyle Poyar on pricing, Rob Fitzpatrick's Mom Test, Sean Ellis's 40% test, Brian Balfour's loops), Geoffrey Moore's beachhead, Colin Matthews's "distribution before the customer", Gabriel Weinberg's Bullseye.

## The chain

```
Trigger → Price → Positioning → Message → Motion → Channel
   ↑                                                  |
   └──────────── what the market answers ─────────────┘
```

Each link follows from the previous one; skipping one produces noise. The price comes before the positioning: it says who the product is for before any word does, and it decides the motion.

## The trigger, not the demographic

A demographic ("B2B SaaS, 50 to 200 people, Series A") finds nobody. A trigger describes a moment:

| Part | Captures | Example |
|------|----------|---------|
| Trigger event | What creates the urgency | Just lost a third deal for lack of a pipeline view |
| Capability gap | What they cannot do today | No way to see the conversations with prospects |
| Pressure | Who is pushing | The board wants pipeline numbers at the next update |
| Timeline | By when | Before the next quarter |
| Anti-ICP | Three to five exclusions | Procurement longer than 60 days at our stage |

## Price decides the motion

| Yearly value per account | Primary motion | Why |
|---|---|---|
| Under €1k | Self-serve (product-led) | A sales call costs more than the deal |
| €1k to €5k | Self-serve with sales assist | Self-serve to acquire, people to expand |
| €5k to €25k | Inside sales | Human guidance, a cycle under 30 days |
| €25k to €100k | Inside or field sales | Buying committee, procurement, security review |
| Over €100k | Enterprise sales | Long cycles, relationships, custom deployment |

At €1M ARR from 1,000 customers the average is €83 a month, so a product aiming at millions with a small team is self-serve whether it planned to be or not.

## Choosing the first channel

Distribution before the customer: a channel where buyers already are narrows who you serve and how you speak to them, and some of them find you. Good first channels are marketplaces and directories with few products in your niche and many in adjacent ones (an app store, a template gallery, a plugin directory, a course platform), communities where the ICP asks for help, search intent with volume, a partner's customer base, and the founder's own outbound. Social media is a marketing channel, not a distribution channel.

List the candidates, rank them by how cheaply each can be tested and how large it could become, pick one, and say why the others wait. Concentrate before spreading: one or two channels per stage.

## The channel test

The same card as an experiment (`business-case`), written before it runs:

| Field | Example |
|---|---|
| Channel | A listing in the template gallery ops leads already browse |
| What runs | The listing with the price and a waitlist, two weeks |
| Event | Signups with a work email, from the listing's source tag |
| Stop below | 20 signups: the channel does not carry this ICP |
| Build above | 60 signups: build, and plan the launch here |
| Cost | 2 days |

Cheap shapes: a landing page with the price and a pre-order; twenty personal messages to people matching the trigger, counting replies and calls booked; a post where the ICP reads, counting qualified replies; a directory listing; a partner's newsletter mention. The result goes into evidence with its numbers and into the spec as `**Channel result:**`.

## The stages of a market

Read signals, not revenue: a company at €500k ARR whose customers all came through warm introductions is earlier than one at €200k with word of mouth. These are the go-to-market names of the one stage model in `PRODUCT.md` → `**Stage:**`: Signal is `idea` and `pre-PMF`, Resonance is `emerging-PMF`, Orbit is `scaling`. Their exits below are candidates for `**Stage exit:**`, which the person chooses.

**Signal** (who really has this problem and would pay?). You are here if the ICP cannot be said in one situational sentence, every deal looks different, the price is negotiated case by case, and under 20% of customers came without a personal relationship. Exit when all four hold: the ICP fits one situational sentence; five paying customers you did not know before; the last five bought for the same reason; a price that worked five times without heavy negotiation.

**Resonance** (turn the pattern into a repeatable process). Same words and objections from different prospects, some deals close with surprisingly little friction, one or two channels produce results. Exit when all five hold: predictable pipeline (how many enter and convert); deals follow the same path; the message converts without the founder in the room; reliable CAC, LTV, cycle length and churn; the playbook can be taught to someone else.

**Orbit** (scale what works). Money into a channel returns a known pipeline, the process runs without the founder, customers arrive unprompted. Scale the proven channels to capacity before adding new ones.

**Kill signals.** Eight weeks of outbound, 200 personalized touches, replies under 3%: the ICP hypothesis is wrong, change the target. Free trial with 500 signups and activation under 8%: the value arrives too slowly for self-serve; onboarding tooltips will not fix it. 40% of the pipeline stuck on "we need feature X" with no feature unblocking more than 30%: a positioning problem, the wrong buyers are coming.

**Friendly customer syndrome.** The first five customers came from warm intros, give great scores, never expanded, never referred anyone: relationship revenue, not fit. Test: offer it to ten strangers at full price; under 5% conversion means the evidence of fit is contaminated.

**The loop back to the product.** Monthly: the top three objections this month; the change that would remove the first; usage patterns where customers found value nobody planned. These go to the product review as candidate initiatives.

## The launch

Who hears first is the people closest to the problem: those who asked for it, the testers, the waitlist, the accounts the feature was built for. Then the channels in order of how well they carry this ICP. The message is the release note's first line in the user's words. The date follows the rollout: the launch goes to the share of users the flag exposes. Every arrival carries its source (a UTM, a referral code, an in-app placement id) so phase 7 can read channels apart.

A feature's launch is adoption: where existing users meet it (an in-app card, the email they already open, a changelog, the account manager), and the share of the audience that tries it in the first two weeks.

## Worked example

A weekly report tool for ops leads, €12 per seat per month (about €430 a year for a three-seat team).

- **Trigger:** an ops lead who just missed a Monday report for the board, with no BI team, pressed by the founder, before the next board meeting. Anti-ICP: teams with a data analyst; companies on a BI contract.
- **Motion:** self-serve; €430 a year cannot pay for a demo.
- **Positioning:** the weekly report your board reads, without a BI team.
- **Message:** "Monday's report, ready before you are", from interview `[interview:P4]`.
- **Channel:** the template gallery of the spreadsheet tool these teams already use; the ICP searches it for "weekly report". Communities and outbound wait: outbound cannot pay at this price.
- **Channel test:** a listing for two weeks; stop below 20 signups, build above 60.
- **Launch:** the 40 waitlist teams first, then the gallery listing, then one post in the ops community; signup carries the source.
- **Read:** gallery 900 visits, 70 signups, 9 paying `[data:...]`: double down. Community post 120 visits, 3 signups: stop. Stage: Signal, 9 paying customers, 6 of them unknown before; the price has not yet held five times without negotiation.

## Templates

```markdown
## Go-to-market
{phase 3, gate 3.13}
**Trigger:** {product: the moment, the gap, who presses, by when; anti-ICP}
**Positioning:** {product: why this and not today's alternative, one sentence}
**Motion:** {product: the motion the `PRODUCT.md` price can pay for (the price itself lives there)}
**Channel:** {product: the one channel first, and why the others wait}
**Channel test:** {product: what runs, the event, stop below, build above, the window, the cost; its result goes to `04-spec.md` → Channel result (gate 4.22)}
**Audience:** {feature: who among existing users meets the problem, how many, tagged}
**Message:** {the one line, in their words, with its source}
**Where:** {feature: where they will meet it: placement, email, changelog, account manager}
```

```markdown
**Channel result:** {product track, in 04-spec.md, gate 4.22: what the channel test returned against its thresholds, tagged}
```

```markdown
## Launch
{phase 6, gate 6.14}
**Who hears first:** {the people closest to the problem}
**Message:** {the first line, in the user's words}
**Channels:** {in order, each with its source tag}
**When:** {the date, tied to the rollout share}
**Measured by:** {the event and the source property that tells channels apart}
```

```markdown
## Go-to-market read
{phase 7, gate 7.8}
| Channel | Reached | Converted | Source | Next |
|---|---|---|---|---|
| {channel} | {n} | {n} | `[tag]` or "unavailable: {question}" | double down / fix / stop |

**Stage:** {product: the `PRODUCT.md` stage, with the Stage exit met or missed}
**Objections:** {the top three, and the change that would remove the first}
```
