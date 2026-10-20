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

## Impact on what exists
| Area | Today | What changes | Handling |
|------|-------|--------------|----------|
| Existing data | {rows and fields already there, with counts where measured} | {new field, new rule, new state} | {backfill, default, migration; or "nothing to do: {why}"} |
| Contracts | {APIs, webhooks, exports, integrations consumed by others} | {} | {versioning, notice, unchanged} |
| Tracking events | {events in this area today} | {added, renamed, redefined} | {who reads them; dashboards and baselines affected} |
| Permissions | {roles, plans, tenants that see this area} | {} | {} |
| Current users | {what they do today} | {what moves, appears or disappears for them} | {default on/off, how they are told} |

{Or, when nothing exists yet: **Impact on what exists:** not applicable, {reason}}

## Not yet specified
| Open question | Decides | Blocks |
| {in-scope question still open} | {person} | {AC numbers that wait on it, or "none"} |

## Conflicts
| Constraint A | Constraint B | Why both cannot hold | Decides | Blocks |
| {source and rule} | {source and rule} | {collision} | {person} | {AC numbers, or "none"} |
{or: "Checked {constraints}; none collide."}

## Flows
{reference to DESIGN.md, with the flow list and where each is specified}

## Stack
**Drivers:** {three to five, each with its source}
| Layer | Choice | Status | Decided by | ADR |
| {layer} | {choice} | inherited / decided / not needed | {person, or "—"} | {decisions/ADR-NNN-slug.md, or "—"} |

## What we chose
| Choice | What | Why | Set aside | Cost | We'd change it if |
| {stack layer, visual direction or design kit} | {choice} | {one line} | {main alternative} | {money, time or upkeep} | {condition} |

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
