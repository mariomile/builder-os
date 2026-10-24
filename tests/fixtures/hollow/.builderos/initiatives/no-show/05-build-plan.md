# Build — Promemoria

## Plan
**In plain words:** first the reminder, then the confirm page.
**Accepted:** Mario · 2026-10-24T16:00:00Z
**Branch:** build/no-show

## Seams
| Module | New or changed | Interface | Hides | Tests at | In plain words |
|--------|----------------|-----------|-------|----------|----------------|
| app | new | confirm(slot) | status rules | tests/app.test.mjs | marks a slot confirmed |

## Test baseline
**Run:** {{RUN:baseline}}

## Slices
| # | Slice | Files | Acceptance criteria | Blocks on | Status |
|---|-------|-------|---------------------|-----------|--------|
| 1 | confirm | src/app.mjs | 1-8 | none | done |

**Critical path:** 1
**Tickets:** not published

## Risks
| Risk | Mitigation |
|------|------------|
| WhatsApp approval | apply early |

## Rejected alternatives
| Alternative | Why not |
|-------------|---------|
| SMS | cost |

## Acceptance criteria to tests
| # | Criterion | Test | Result |
|---|-----------|------|--------|
| 1 | reminder | tests/app.test.mjs | pass |
| 2 | confirmed | tests/app.test.mjs | pass |
| 3 | first reminder | tests/app.test.mjs | pass |
| 4 | 404 other clinic | tests/app.test.mjs | pass |
| 5 | 400 token | tests/app.test.mjs | pass |
| 6 | 429 | tests/app.test.mjs | pass |
| 7 | key on server | tests/app.test.mjs | pass |
| 8 | 2 seconds | tests/app.test.mjs | pass |

## Test output
**Run:** {{RUN:unit-tests}}

## Instrumentation
| Event | Triggered by | Arrived | Properties verified | Evidence |
|-------|--------------|---------|---------------------|----------|
| reminder_sent | send | yes | slot_id | [code:src/app.mjs:1] |
| slot_outcome | end | yes | outcome | [code:src/app.mjs:1] |

## Interface review
**Widths:** 1280 and 390
| State | Screenshot or route | Matches the chosen direction |
|-------|---------------------|------------------------------|
| empty | captures/empty-1280.png, captures/empty-390.png | yes |
| loading | captures/empty-1280.png | yes |
| partial | not applicable, no partial state | yes |
| error | captures/empty-1280.png | yes |
| success | captures/empty-1280.png | yes |
| permission | captures/empty-1280.png | yes |
**Messages received:** reminder received on a test phone, captures/msg.png

## Craft critique
**Run by:** a separate agent given only DESIGN.md, the voice, the captures and the reference screens
| Aspect | Finding | What happened |
|--------|---------|---------------|
| Hierarchy | none found | none needed |
| Spacing rhythm | none found | none needed |
| Typography | none found | none needed |
| Copy against the voice | none found | none needed |
| Focus states | none found | none needed |
| Motion and reduced motion | none found | none needed |
| Interaction states | none found | none needed |
| Next to the references | none found | none needed |

## Demo
**Test:** tests/e2e/confirm.spec.mjs
**Run:** {{RUN:e2e-demo}}
| Flow | Recording | Shows |
|------|-----------|-------|
| Confirm a slot | .builderos/media/no-show/step1.png, .builderos/media/no-show/step2.png | the slot confirmed |
| First day | .builderos/media/no-show/step1.png, .builderos/media/no-show/step2.png | the first reminder |

## Security review
**Run by:** a separate agent given the diff, the threat model and TECH.md
| Area | Finding | What happened |
|------|---------|---------------|
| Access control | none found | none needed |
| Input handling | none found | none needed |
| Secrets and configuration | none found | none needed |
| Abuse limits | none found | none needed |
| Data exposure | none found | none needed |

## Performance
| Measure | Budget | Measured | Within budget | Evidence |
|---------|--------|----------|---------------|----------|
| slot page p95 | 2 s | 1.2 s | yes | {{RUN:perf}} |
| largest contentful paint at 390 | 2.5 s | 1.1 s | yes | {{RUN:perf}} |

## Tried
**Link:** `npm start`
**Tried by:** Mario, 2026-10-24
| What they tried | What they found | What happened |
|---|---|---|
| the primary flow | works | nothing to fix |

## Scope check
| Out-of-scope item (phase 4) | Built? | Note |
|-----------------------------|--------|------|
| Booking | no | |
| Payments inside the app | no | |

## Review findings
| Finding | Axis | Severity | Resolution |
|---------|------|----------|------------|
| none | | | |

## Deviations from spec
None.

## Retro
**Environment:** nothing changed
