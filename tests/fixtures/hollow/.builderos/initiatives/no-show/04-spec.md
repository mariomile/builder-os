# Spec — Promemoria

## The bet
Automatic reminders with confirm.

## Today
Receptionists phone patients.

## In scope
Reminders and confirmations.

## Out of scope
| Item | Kind | Reason |
|------|------|--------|
| Booking | not ever | non-goal |
| Payments inside the app | not now | later |

## Impact on what exists
**Impact on what exists:** not applicable, nothing exists yet

## Not yet specified
| Decision | Who decides |
|----------|-------------|

## Conflicts
None found.

## Flows
Confirm a slot, First day, in DESIGN.md.
**Activation:** AC 3, event reminder_sent

## Stack
**Drivers:** one founder [doc:user-2026-10-24-idea]
| Layer | Choice | Status | Decided by | ADR |
|-------|--------|--------|------------|-----|
| Hosting | Vercel | decided | Mario | decisions/ADR-001-stack.md |
| Data | Postgres | decided | Mario | — |
| Messaging | WhatsApp API | decided | Mario | — |
| Payments | Stripe | decided | Mario | — |

## Architecture
### Components
| Component | Responsibility | Owns | Talks to |
|-----------|----------------|------|----------|
| Web app | slots and confirmations | Slot | database: call |
| Sender | sends reminders | none | WhatsApp: call |

### Contracts
| Contract | Shapes | Errors | Lists |
|----------|--------|--------|-------|
| POST /confirm | token → status | 404 | not a list |

### External calls
| Call | Timeout | Retry | Idempotency | When it fails |
|------|---------|-------|-------------|---------------|
| WhatsApp: send | 10 | 3 with backoff | slot id | the owner sees failed |

### Scale defaults
| Default | How | Not applicable because |
|---------|-----|------------------------|
| Owner key on every row | clinic_id | |
| Paginated lists | cursor | |
| Indexed queries | slot time | |
| Idempotent writes | slot id | |
| Slow work off the request | queue | |
| Reversible migrations | expand and contract | |

**Capacity:** 50 clinics [estimate:stage] · designed for 500

## Threat model
**Boundaries:** browser to server; server to database
| Boundary | Threat | Mitigation | Criterion |
|----------|--------|------------|-----------|
| browser to server | another user's or customer's data | clinic_id on every query | 4 |
| browser to server | untrusted input | schema validation | 5 |
| browser to server | abuse | rate limit | 6 |
| server to database | secrets | host secret store | 7 |

## What we chose
| Choice | What | Why | Set aside | Cost | We'd change it if |
|--------|------|-----|-----------|------|-------------------|
| Hosting | Vercel | simple | Fly | 0 | traffic |

## User stories
1. As a patient, I want a reminder, so that I come or cancel.

## Acceptance criteria
| # | Criterion | Flow |
|---|-----------|------|
| 1 | The patient receives a reminder 24 hours before the slot | Confirm a slot |
| 2 | The slot shows confirmed after the patient confirms | Confirm a slot |
| 3 | The owner sees the first reminder sent after import | First day |
| 4 | A request for another clinic's slot returns 404 | Confirm a slot |
| 5 | A malformed token returns 400 | Confirm a slot |
| 6 | More than 10 confirms a minute from one address return 429 | Confirm a slot |
| 7 | The WhatsApp key is read only on the server | Confirm a slot |
| 8 | The slot page loads in under 2 seconds at p95 | Confirm a slot |

## Test seams
| Seam | What is tested there | Exists today |
|------|---------------------|--------------|
| API | 1-8 | new |

## Quality bar
| Area | Criteria | Not applicable because |
|------|----------|------------------------|
| Permissions | 4 | |
| Personal data | 7 | |
| Performance | 8 | |

## Real users
We plan to show it to two owners next week.
**Willingness to pay:** two owners said they would pay [doc:wtp-notes]
**Channel result:** 0 demo requests, below the stop line of 2 [doc:channel-post]

## States
| Flow / step | Empty | Loading | Partial | Error | Success | Permission |
|-------------|-------|---------|---------|-------|---------|------------|
| Confirm a slot | no slot | spinner | n/a | gone | confirmed | wrong link |

## Edge cases
| Case | Category | Expected behavior |
|------|----------|-------------------|
| Slot moved | change | new reminder |

**Model output:** no

## Tracking plan
| Event | Trigger | Properties | Measures | New or existing |
|-------|---------|------------|----------|-----------------|
| reminder_sent | send | slot_id | activation | new |
| slot_outcome | slot ends | outcome | success metric | new |

**Computes the phase 2 metric:** slot_outcome attended or cancelled 24h ahead over all slots

## Open questions
None.
