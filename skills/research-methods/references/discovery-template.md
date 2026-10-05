# Discovery Template

The lifecycle output contract for `research-methods`. Standalone output follows the requested format and destination; adapt the template only where useful and omit lifecycle gate claims.

`.builderos/initiatives/{initiative}/01-discovery.md`:

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
{Unexpected findings, or none observed; state sampling and question-design limitations without assuming that no surprises proves bias.}

## Verdict
**{VALIDATED | KILLED | RESHAPED}** — {reasoning, citing tags}
```
