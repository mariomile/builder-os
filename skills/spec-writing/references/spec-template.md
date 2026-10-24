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
**Activation:** {product track: the acceptance criterion that marks the first useful outcome of the first day, and the tracking-plan event that measures it (gate 4.17)}

## Stack
**Drivers:** {three to five, each with its source}
| Layer | Choice | Status | Decided by | ADR |
| {layer} | {choice} | inherited / decided / not needed | {person, or "—"} | {decisions/ADR-NNN-slug.md, or "—"} |

## Architecture
{written by system-design, gate 4.18; or **Architecture:** not applicable, {reason} when there is no server, no stored data and no input from other people}
### Components
| Component | Responsibility | Owns | Talks to |
| {name} | {one line} | {entities} | {component: call / event / shared table} |

### Contracts
| Contract | Shapes | Errors | Lists |
| {endpoint, webhook, event, export} | {input → output} | {codes} | {page size and cursor, or "not a list"} |

### External calls
| Call | Timeout | Retry | Idempotency | When it fails |
| {provider: operation} | {seconds} | {attempts with backoff, or "none: not safe to repeat"} | {the key, or "read only"} | {what the user sees} |

### Scale defaults
| Default | How | Not applicable because |
| Owner key on every row | {} | {} |
| Paginated lists | {} | {} |
| Indexed queries | {} | {} |
| Idempotent writes | {} | {} |
| Slow work off the request | {} | {} |
| Reversible migrations | {} | {} |

**Capacity:** {expected load at this stage, tagged} · designed for {ten times that}

## Threat model
{written by system-design, gate 4.19; or **Threat model:** not applicable, {reason}}
**Boundaries:** {each trust boundary in one line}
| Boundary | Threat | Mitigation | Criterion |
| {boundary} | {another user's or customer's data / untrusted input / abuse / secrets, then the rest that apply} | {mitigation} | {acceptance criterion number, or "not applicable, {reason}"} |

## What we chose
| Choice | What | Why | Set aside | Cost | We'd change it if |
| {stack layer, architecture trade-off, visual direction or design kit} | {choice} | {one line} | {main alternative} | {money, time or upkeep} | {condition} |

## User stories
1. As a {actor}, I want {capability}, so that {benefit}
{A long numbered list covering every actor and every flow in scope; each acceptance criterion below traces to at least one story}

## Acceptance criteria
| # | Criterion | Flow |
| 1 | {subject + verifiable verb + condition} | {flow} |

## Test seams
| Seam | What is tested there | Exists today |
| {the highest point the behavior can be tested from: an API, a module interface, the UI} | {criteria by number} | {yes, or new} |
{Prefer existing seams and as few as possible; phase 5 plans its tests at these}

## Quality bar
| Area | Criteria | Not applicable because |
|------|----------|------------------------|
| Permissions | {AC numbers: who can see and do what, and what a user outside the role gets} | {or why it does not apply} |
| Personal data | {AC numbers: what is stored, who reads it, retention, deletion} | {} |
| Performance | {AC numbers: the budget with a number on the primary action (and the page load with an interface), measured at gate 5.14} | {} |
{Accessibility, end-to-end, dependencies, secrets, static analysis and the token check are automatic checks in the guardrail (TECH.md → Quality checks), not criteria here.}

## Real users
{product track: the session where a person from the ICP walked the problem, the concept or the clickable prototype; what they did, where they stuck, what changed; each with its `[interview:Pn]`, `[doc:...]` or `[data:...]` tag. Other tracks: omit.}
**Willingness to pay:** {product for sale: what a person from the ICP did when shown the price, tagged (gate 4.14)}
**Channel result:** {product track: what the phase 3 channel test returned against its thresholds, tagged (gate 4.22, go-to-market)}

## States
| Flow / step | Empty | Loading | Partial | Error | Success | Permission |

## Edge cases
| Case | Category | Expected behavior |

**Model output:** {yes | no}

## Eval set
**Dataset:** {project-relative existing eval file}
**Threshold:** {percentage}
**Judge:** {case or dataset scoring rubric}
{only when model output is yes; actual cases carry must_pass flags, one must-pass case per injection surface; production sampling when relevant}

## Agent behavior
{only when model output is yes; written by agent-design, gate 4.16}
| Action | Autonomy | Why | Criterion |
|--------|----------|-----|-----------|
| {action} | does / proposes / asks / never | {reversibility, blast radius, the person's answer} | {AC number; required for asks} |

**Hand-off:** {trigger, to whom, what context travels, what the user sees meanwhile}
**Degradation:** {slow: …; down: …; wrong: …}
**Latency budget:** {first token and complete answer at p95, per turn}

### Injection surfaces
| Surface | What could arrive | Mitigation | Eval case |
|---------|-------------------|------------|-----------|
| {input someone else can write} | {the attack} | {mitigations} | {must-pass case id in the dataset} |

## Tracking plan
| Event | Trigger | Properties | Measures | New or existing |

**Computes the phase 2 metric:** {how the named events produce that number}

## Open questions
{decisions deferred, each with who decides and by when}
```
