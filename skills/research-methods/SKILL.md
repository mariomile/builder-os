---
name: research-methods
description: "Use when planning user research, writing interview guides, deciding how many people to talk to, mining existing sources for evidence, or judging whether research is finished"
---

# Research Methods

Phase 1 exists to find out whether the frame survives contact with reality. Its output is a verdict, not a summary.

**REQUIRED BACKGROUND:** `evidence-ledger` for tagging and counting. `discovery-methods` for synthesis, opportunity scoring and insight cards once transcripts exist.

## The Only Question

Phase 1 answers one thing: **is the riskiest assumption from phase 0 true?**

Everything else discovered along the way is a bonus and belongs in the artifact, but research that does not target the riskiest assumption is tourism. Write the assumption at the top of the research plan and check every question against it.

## Sampling

Qualitative sampling is about saturation, not significance. You are not estimating a proportion, you are finding the shape of a problem.

| Situation | Interviews | Stop when |
|-----------|-----------|-----------|
| One homogeneous segment | 5–8 | Two consecutive interviews produce no new failure mode |
| Two or three sub-segments | 5–6 per segment | Saturation within each, separately |
| Highly variable context (enterprise, regulated) | 8–12 | Saturation, which arrives late here |

**Saturation is the stop condition, not the count.** Five interviews that all surprise you means keep going. Twelve that repeat means you stopped learning at six and wasted six.

Sample against the frame, not for convenience: the people easiest to reach are usually the people most like you.

### Who to talk to, in priority order

1. **People who have the problem and are paying to solve it badly.** The strongest signal available.
2. **People who have the problem and do nothing.** They tell you why the problem is tolerable, which is the real competition.
3. **People who tried a solution and abandoned it.** The most informative and the hardest to find. Chase them.
4. **People who look like the ICP but do not have the problem.** They define the boundary of the segment.

Skipping class 3 is the most common sampling failure. Class 4 is what prevents a segment from silently expanding to "everyone".

## Question Design

**Ask about the past, never the future.** "Would you use this?" produces politeness. "Walk me through the last time this happened" produces evidence.

| Instead of | Ask |
|-----------|-----|
| "Would you pay for this?" | "What have you paid for to deal with this? What did that cost?" |
| "Is logging calls painful?" | "Walk me through your last call. What happened after you hung up?" |
| "Do you need better reporting?" | "When did you last need a number you couldn't get? What did you do?" |
| "How often does this happen?" | "When was the last time? And before that?" |
| "What features would help?" | "What did you try? Why did you stop?" |

Leading questions are the dominant failure mode, and they are hard to see in your own guide. The check: could this question be answered "yes" by someone being polite? If yes, rewrite it as a request for a story.

### Guide structure

1. **Context** (5 min) — their role, their week, no mention of the problem
2. **The last time** (15 min) — a specific recent instance, walked through in order
3. **The workaround** (10 min) — what they do, what it costs, what they tried before
4. **The boundary** (5 min) — when it is not a problem, who on the team does not care
5. **Open** (5 min) — "what should I have asked?"

The problem is never named before minute 20. Naming it early turns the interview into a pitch and the interviewee into an accomplice.

## Source Mining

Interviews are not the only primary source, and in an existing product they are not the fastest one.

| Source | MCP | What it answers | Class |
|--------|-----|-----------------|-------|
| Support tickets | Notion, or export | What breaks, in the user's words, dated | Primary |
| Sales call notes | Notion, Granola, Slack | What buyers object to and compare against | Primary |
| Churn / cancellation reasons | Supabase, Notion | Why people leave, the most undervalued source in most companies | Primary |
| Session replays | PostHog | Where people stall, unprompted | Primary |
| Analytics funnels | Mixpanel, PostHog | Where behavior diverges from the story | Primary |
| Saved research, highlights | Readwise, Raindrop | Prior art and framing | Secondary |
| Public reviews, forums | Web | Competitor failure modes in the wild | Secondary |

Mine before interviewing where the sources exist. Ten cancellation reasons cost an hour and sharpen every interview that follows.

Mined sources are `[doc:*]` and count as primary only when they record primary contact: a ticket is the user's words, a summary of tickets is not.

## Verdict

Phase 1 ends in one of three states. Writing "we learned a lot" instead of a verdict is the failure this gate exists to prevent.

| Verdict | Meaning | Next |
|---------|---------|------|
| `VALIDATED` | The riskiest assumption held. Evidence supports the frame | Phase 2 |
| `KILLED` | The assumption failed, or the problem is real but not worth solving for this ICP | Pipeline stops. This is a win |
| `RESHAPED` | The problem is real but different from the frame: different person, different cost, different trigger | Amend `PRODUCT.md`, re-run phase 0 briefly, then phase 2 |

`RESHAPED` is the most common honest outcome of good research and the one people avoid because it feels like failure. It is the mechanism working.

## Disconfirming Evidence

Gate 1.5 requires that you looked for the thing that would kill the frame. State it before you start:

> This frame dies if reps who already have a fast logging tool still do not log calls. If logging time is not the binding constraint, the problem is compliance or incentives, not tooling.

Then go find those reps. Research that only samples believers cannot return `KILLED`, and research that cannot return `KILLED` is not research.

## Output Contract

`.builderos/01-discovery.md`:

```markdown
# Discovery — {product}

## Assumption under test
{From 00-frame.md} `[assumption:unvalidated]`
**Would be falsified by:** {observation}

## Method
{N} interviews across {segments} · {sources mined} · {dates}
**Saturation reached:** {yes at n=N | no, and what is still unknown}

## Participants
| Code | Role | Segment | Class |
|------|------|---------|-------|
| P1 | | | paying-badly / tolerating / abandoned / boundary |

## Evidence
{Each finding, one paragraph, every claim tagged. Group by theme, not by participant.}

## Disconfirming evidence
**Sought:** {what would have killed it}
**Found:** {what came back} `[tag]`

## JTBD
When {situation}, I want to {motivation}, so I can {outcome}. `[tag]`

## Surprises
{What you did not expect. If empty, the questions were leading.}

## Verdict
**{VALIDATED | KILLED | RESHAPED}** — {reasoning, citing tags}
```

## Common Mistakes

| Mistake | Why it fails | Correct |
|---------|-------------|---------|
| Asking "would you use this?" | Measures politeness | Ask for the last time it happened |
| Interviewing only reachable believers | Cannot return KILLED | Sample classes 2, 3 and 4 deliberately |
| Stopping at a fixed count | Saturation is the stop condition | Stop when two interviews add nothing new |
| Counting five quotes from one person as five units | Inflates the evidence base | One source, one unit |
| Naming the problem in minute two | Turns the interview into a pitch | Problem enters at minute 20 |
| Summarizing instead of deciding | The gate requires a verdict | VALIDATED, KILLED or RESHAPED |
| Treating RESHAPED as failure | It is the most valuable common outcome | Amend the frame and continue |
| Skipping churned and abandoned users | The most informative class, always | Chase them even when it is slow |
| Mining a summary and calling it primary | A summary is someone's interpretation | Primary means the user's own words |
