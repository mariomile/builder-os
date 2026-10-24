# Release Template

The output contract for phase 6. Copy the headings, bold field labels and tables exactly; the gate script parses them.

`.builderos/initiatives/{initiative}/06-release.md`:

```markdown
# Release — {feature}

## Rollout
**Strategy:** {flag / internal / canary / percentage / full} — {why}
**Chosen by:** {person, from their answer to the decision card}
| Step | Exposure | Watched | Condition to proceed |

## Rollback
**Mechanism:** {the specific reversing action}
**Owner:** {person, and how to reach them}
**Tested:** {date, what was done, what was observed}
**Data written while live:** {what happens to it}
**Actually reversible:** {yes / no, with the reason}

## Pre-launch instrumentation
| Event | Arrives from production path | Evidence |

## Baseline (captured {timestamp}, before rollout {timestamp})
| Metric | Value | Window | Method | Tag |
| {phase 2 success metric} | | | | |
| {guardrail} | | | | |
| {model output quality, when the spec declares model output: the production sample's pass rate on the eval rubric} | | | | |

## Measurement
**Success metric measured by:** {named saved query or dashboard}

## Release notes
{the notes, written for users: what they can now do}
**Demo:** {the recording from 05-build-plan.md → Demo, as a link the reader can open; omit when the build has none}
**What changes for you:** {for people already using the product: what moved, what behaves differently, what was removed, what they need to do; "nothing" when the change only adds}

## Exposure verification
**Authorized by:** {who authorized exposure, and how: the message, the ticket, the approval}
**Status:** {planned | verified}
**Exposed at:** {actual ISO timestamp; omit while planned}
**Environment:** {observed target}
**Version:** {observed version or revision}
**Verification:** {observed result with resolving [data:*] or [doc:*] source}

## Production readiness
**Errors seen by:** {how an error reaches the team before a user reports it: the error tracker, the alert, who receives it}
**Backup restored:** {date and what was restored, once; or "not applicable, {why}" when nothing is stored}
**Agent traces:** {model output only: where every turn with its tool calls is kept, and who reads a sample how often}
{Privacy, AI disclosure and, after PMF, SLO, incident response, cost per active user, load tested and model degradation live in TECH.md → Operations (gate 6.10), not here.}

## First real use
{product track: the first person outside the team who did the primary action, when, with its `[data:...]` or `[doc:...]` tag. Online is not in use: phase 7 starts here. Other tracks: omit.}

## First payment
{product track, for sale: the first customer outside the team who paid, when, how much, with its `[data:...]` or `[doc:...]` tag. Not for sale or other tracks: omit.}

## Outcome review
**Owner:** {person} · **Date:** {date, from the phase 3 kill criteria}
**Will evaluate:** {the kill criteria, restated}

{Change track with nothing to measure: omit Baseline, Measurement and Outcome review; the initiative closes at phase 6.}

## Promoted
{what this initiative settled that now lives in project memory: entities and rules added to DOMAIN.md, kit and token location in TECH.md → Design system; or "nothing to promote"}
```
