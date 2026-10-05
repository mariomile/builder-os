# Spec Template

The output contract for `.builderos/initiatives/{initiative}/04-spec.md`. Gate 4 parses its section headings, bold labels and tables; keep them exactly. Standalone specs follow the requested format instead.

```markdown
# Spec — {feature}

## The bet
{from 03-solution-bet.md: the primary user action, the kill criteria}

## Today
{current behavior in the area this changes, with file references where code was read}

## In scope
{what this release does}

## Out of scope
| Item | Kind | Reason |
| {item} | not now / not ever / not until X | {reason, or the trigger} |

## Not yet specified
| Open question | Decides | Blocks |
| {in-scope question still open} | {person} | {AC numbers that wait on it, or "none"} |

## Conflicts
| Constraint A | Constraint B | Why both cannot hold | Decides | Blocks |
| {source and rule} | {source and rule} | {collision} | {person} | {AC numbers, or "none"} |
{or: "Checked {constraints}; none collide."}

## Flows
{reference to DESIGN.md, with the flow list and where each is specified}

## Acceptance criteria
| # | Criterion | Flow |
| 1 | {subject + verifiable verb + condition} | {flow} |

## States
| Flow / step | Empty | Loading | Partial | Error | Success | Permission |

## Edge cases
| Case | Category | Expected behavior |

**Model output:** {yes | no}

## Eval set
**Dataset:** {project-relative existing eval file}
**Threshold:** {percentage}
**Judge:** {case or dataset scoring rubric}
{only when model output is yes; actual cases carry must_pass flags; production sampling when relevant}

## Tracking plan
| Event | Trigger | Properties | Measures | New or existing |

**Computes the phase 2 metric:** {how the named events produce that number}

## Open questions
{decisions deferred, each with who decides and by when}
```
