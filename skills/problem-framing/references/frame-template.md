# Frame Template

The lifecycle output contract for `problem-framing`. Standalone output follows the requested format and destination; adapt the template only where useful and omit lifecycle gate claims.

`.builderos/initiatives/{initiative}/BRIEF.md`, which this phase creates: the thread on top (gate E.4), then the Frame part. Later phases add their parts below it.

```markdown
# Brief — {title}

**Building:** {one sentence: what this initiative builds, in the words of the person who asked}
**Why:** {one sentence: the problem it removes or the result it moves, with its tag}

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
**Chosen by:** {person, from their answer to the round that compared the candidates}

## Prior art
{Solved well / badly / not adopted} — {one line each on the two closest} `[tag]`

## Beliefs this frame requires
| Belief | Confidence | Collapse if wrong |
|--------|-----------|-------------------|

## Open questions
| Question | Who can answer | Inherited by |
|----------|----------------|--------------|
```
