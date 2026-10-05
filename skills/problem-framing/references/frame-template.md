# Frame Template

The lifecycle output contract for `problem-framing`. Standalone output follows the requested format and destination; adapt the template only where useful and omit lifecycle gate claims.

`.builderos/initiatives/{initiative}/00-frame.md`:

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

## Open questions
| Question | Who can answer | Inherited by |
|----------|----------------|--------------|
```
