# Release — Promemoria

## Rollout
**Strategy:** full — three pilot clinics, too few to slice
**Chosen by:** Mario
| Step | Exposure | Watched | Condition to proceed |
|------|----------|---------|----------------------|
| 1 | three clinics | errors | none above zero for a day |

## Rollback
**Mechanism:** turn the sender off
**Owner:** Mario, phone
**Tested:** 2026-10-24, sender off, no message went out
**Data written while live:** confirmations stay
**Actually reversible:** yes

## Pre-launch instrumentation
| Event | Arrives from production path | Evidence |
|-------|------------------------------|----------|
| slot_outcome | yes | [data:first-use] |

## Baseline (captured 2026-10-24T16:10:00Z, before rollout 2026-10-24T16:20:00Z)
| Metric | Value | Window | Method | Tag |
|--------|-------|--------|--------|-----|
| share attended or cancelled | 0 | first week | first measurement | [doc:baseline] |

## Measurement
**Success metric measured by:** saved query slot-outcomes

## Release notes
Your patients now get a WhatsApp reminder and confirm with one tap.
**What changes for you:** nothing, this is new
**Help:** nothing to change, no help page yet

## Launch
**Who hears first:** the three pilot clinics
**Message:** your patients now confirm with one tap
**Channels:** association groups [doc:channel-post]
**When:** 2026-10-25
**Measured by:** signup source property

## Exposure verification
**Authorized by:** Mario, in chat
**Status:** verified
**Exposed at:** 2026-10-24T16:20:00Z
**Environment:** production
**Version:** 1
**Verification:** live for the pilot clinics [doc:exposure]

## Production readiness
**Errors seen by:** error tracker emails Mario
**Backup restored:** 2026-10-24, restored the database once

## First real use
Clinic Rossi confirmed 12 slots on day one. [data:first-use]

## Outcome review
**Owner:** Mario · **Date:** 2027-02-01
**Will evaluate:** below 70% stop, above 90% keep

## Promoted
nothing to promote
