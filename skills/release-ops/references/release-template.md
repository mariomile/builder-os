# Release Template

The output contract for phase 6. Copy the headings, bold field labels and tables exactly; the gate script parses them.

`.builderos/initiatives/{initiative}/06-release.md`:

```markdown
# Release — {feature}

## Rollout
**Strategy:** {flag / internal / canary / percentage / full} — {why}
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
{the notes, written for users}

## Exposure verification
**Authorized by:** {who authorized exposure, and how: the message, the ticket, the approval}
**Status:** {planned | verified}
**Exposed at:** {actual ISO timestamp; omit while planned}
**Environment:** {observed target}
**Version:** {observed version or revision}
**Verification:** {observed result with resolving [data:*] or [doc:*] source}

## Outcome review
**Owner:** {person} · **Date:** {date, from the phase 3 kill criteria}
**Will evaluate:** {the kill criteria, restated}
```
