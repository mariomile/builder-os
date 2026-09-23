---
name: problem-framing
description: "Use when someone arrives with an idea, a feature request, or a vague complaint and the problem behind it has not been stated independently of the solution"
---

# Problem Framing

Almost nobody arrives with a problem. They arrive with a solution wearing a problem's clothes: "we need an AI assistant", "the onboarding should be shorter", "we should add SSO". Framing separates the two, because a solution accepted as a problem cannot be tested, only built.

**REQUIRED BACKGROUND:** `evidence-ledger` for tagging. `pressure-testing` when the framing will not hold up.

## Solution Language

The mechanical test for Gate 0.1. A problem statement containing any of these is a solution in disguise:

> build, add, create, app, platform, dashboard, tool, feature, integration, AI, automate, redesign, migrate, rewrite

Extraction is a ladder. Each rung asks "why does that matter?" until the answer names a cost someone actually bears.

| Rung | Statement | Status |
|------|-----------|--------|
| 0 | "We need an AI assistant for call logging" | Solution |
| 1 | "Reps spend too long logging calls" | Activity, not cost |
| 2 | "Reps lose 45 minutes a day to logging, time they would spend selling" | Cost, quantified |
| 3 | "Reps log calls late or not at all, so pipeline data is wrong at forecast time" | Consequence that someone senior feels |

Rung 3 is the frame. Rung 0 is what walked in the door. Stop climbing when the next "why" produces a truism ("because revenue matters").

## The "So What" Test

For each candidate problem statement, ask three questions in order. A no anywhere means keep climbing or drop the problem.

1. **Who bears the cost?** Name a role, not an organization. "Sales teams" fails; "the rep who owns the quota" passes.
2. **What do they do today?** Every real problem already has a workaround: a spreadsheet, an intern, a Slack channel, or deliberate neglect. No workaround usually means no problem, or you have not found the person who has it.
3. **What does the workaround cost?** Time, money, risk, or a foregone opportunity. Unquantified is acceptable at this phase, tagged as `[assumption:unvalidated]`. Unnamed is not.

## ICP Definition

One primary ICP. Not a list. The instinct to name three segments is the instinct to avoid choosing, and every downstream phase inherits the ambiguity.

| Field | Requirement |
|-------|-------------|
| **Segment** | Role plus context: "ops lead at a 20–200 person logistics company", not "SMBs" |
| **Size** | A number with a source tag. Bottom-up counts beat top-down market reports |
| **Trigger** | The event that makes them start looking. If none exists, the problem is chronic and low-urgency, which changes the whole bet |
| **Buying power** | Who signs. Often not who suffers, and that gap is a product constraint |
| **Reachability** | How you would get five of them on a call this week. If you cannot, phase 1 will stall |

Reachability is the field people skip and the one that kills discovery. Name it at phase 0.

## Why Now

A frame needs a change in the world, dated. Three legitimate classes:

- **Behavior shifted.** A practice became normal that was not. Cite when.
- **Cost collapsed.** Something that was expensive is now cheap. Cite the threshold crossed.
- **Constraint lifted.** A regulation, a platform, an integration opened. Cite the date.

"The technology is now good enough" is only a why-now when it names the specific capability and when it crossed the usable line. "AI got better" is not a why-now, it is a mood.

If no dated change exists, the honest frame says so: the problem is durable and unsolved for structural reasons, and those reasons are the real thing to understand.

## Riskiest Assumption

Every frame rests on beliefs. One of them, if false, collapses the rest. Extract it:

1. List every belief the frame requires (usually five to nine).
2. Score each: how confident, and how much collapses if wrong.
3. The riskiest is low confidence with high collapse. Not the scariest, not the most technical: the most load-bearing.
4. Write it as a falsifiable sentence. "Reps would change their logging behavior if it took under a minute" is falsifiable. "Reps want better tools" is not.

The riskiest assumption becomes the target of phase 1 research and, later, of the phase 3 cheap test. Getting it wrong at phase 0 sends the whole pipeline to test the wrong thing.

## Prior Art Check

Before the frame is done, a fast scan: is this already solved? Three outcomes, all useful.

- **Solved well, adopted** → the frame is wrong or the ICP is wrong. Find the segment the incumbent ignores, or stop.
- **Solved badly, adopted anyway** → the strongest starting position. Switching cost is the thing to understand in phase 1.
- **Solved, not adopted** → most interesting and most dangerous. Something about distribution, trust, or workflow blocked it. That blocker is the actual problem.

Dispatch `competitive-analyst` when the mode allows it. Depth here is shallow by design: this is a check against wasting phase 1, not a market study.

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `web.search` | Prior art scan | Ask the user what they and the ICP use today, tag `[doc:user-provided]` |
| `docs.search` | Existing strategy notes, earlier attempts at this problem | Skip; note the gap |
| `repo.read` | What was already tried, from README, changelog, issues | Skip |
| `files.write` | The artifact and pipeline state | Required |

Phase 0 needs no data capability. An idea with no product, no users and no analytics is the normal entry point. Never ask for analytics access here.

## Procedure

Run these in order. Where the host can delegate, this is what the phase agent runs; where it cannot, run it inline. Same steps either way.

1. **Capture the ask verbatim.** Record what the user actually said, word for word, before interpreting it. The original phrasing carries the assumption you are about to extract. Do not improve it.
2. **Climb the ladder.** One "why does that matter" at a time, in conversation, never as a list of questions. Stop when the statement names a cost a specific person bears and the next why would produce a truism. Run the solution-language check on the result.
3. **Name the ICP.** All five fields. Push hardest on size (a number with a source tag, bottom-up beats a borrowed market report) and reachability (five people the user could get on a call this week). If reachability fails, say plainly that phase 1 will stall and that finding reachable users is now the first task. More than one segment named → make them choose the primary.
4. **Find the why-now.** A dated change: behavior shifted, cost collapsed, or constraint lifted. If none exists, write that the problem is durable and unsolved for structural reasons, and name your best guess at those reasons. Never accept "the technology is good enough now" without the capability and the line it crossed.
5. **Scan prior art.** The two closest existing solutions, classified into the three outcomes. Resolve `web.search` if available; otherwise ask. If the classification is "solved well, adopted", say so directly: "do not proceed" is a legitimate phase 0 output and delivering it costs a conversation instead of a quarter.
6. **Extract the riskiest assumption.** List the beliefs the frame requires, score each on confidence against collapse, pick low-confidence and high-collapse. Write it as a falsifiable sentence plus the observation that would falsify it. Pressure-test it; if it turns out unfalsifiable, label it a preference and take the next candidate.
7. **Write and gate.** Write `.builderos/00-frame.md` per the output contract. Run gate 0 per `gate-checks`. On pass, update `state.json` and advance to phase 1. On failure, emit the refusal and do not advance. If `.builderos/` does not exist, say so and stop: initialization is a separate step, not something to scaffold silently.

Completion marker: `## FRAME COMPLETE`, followed by the problem, the ICP, the riskiest assumption, the gate verdict, and the specific research target phase 1 inherits.

## Output Contract

`.builderos/00-frame.md`:

```markdown
# Frame — {product}

## Problem
{Rung-3 statement, no solution language}

## Who
**Primary ICP:** {segment} · {size} `[tag]` · trigger: {} · signs: {} · reachable via: {}

## Today
**Workaround:** {} `[tag]`
**Cost:** {} `[tag]`

## Why now
{Dated change} `[tag]`

## Riskiest assumption
{Falsifiable sentence} `[assumption:unvalidated]`
**Would be falsified by:** {observation}

## Prior art
{Solved well / badly / not adopted} — {one line each on the two closest} `[tag]`

## Beliefs this frame requires
| Belief | Confidence | Collapse if wrong |
|--------|-----------|-------------------|
```

## Common Mistakes

| Mistake | Why it fails | Correct |
|---------|-------------|---------|
| Accepting the user's first statement as the problem | It is almost always a solution | Climb the ladder to a borne cost |
| Naming three ICPs | Avoids the choice, and every later phase inherits the ambiguity | One primary, others explicitly secondary |
| "Why now: AI is better" | Not dated, not specific, true for everything | Name the capability and when it crossed the line |
| Picking the scariest assumption as the riskiest | Fear is not load-bearing | Score confidence against collapse |
| Skipping reachability | Phase 1 stalls with nobody to talk to | Name five reachable people before leaving phase 0 |
| A full competitive study at phase 0 | Expensive, premature, not the question | Three outcomes, shallow scan |
| Quantifying cost with an invented number | Breaks the Iron Law immediately | `[assumption:unvalidated]` is a legitimate answer here |
