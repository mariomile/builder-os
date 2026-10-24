# Solution Bet — Promemoria

## Opportunity
Patients forget the appointment. [interview:P1]

## Divergence
| # | Raw idea | Prompt | From |
|---|----------|--------|------|
| 1 | WhatsApp reminder the day before | who acts | agent |
| 2 | Receptionist sends a template by hand | who acts | agent |
| 3 | Patient confirms with one tap | when | agent |
| 4 | Deposit at booking | when | agent |
| 5 | Remove the day-before call | remove | agent |
| 6 | Waitlist fills cancelled slots | no constraint | agent |
| 7 | Airline-style check-in | other domain | agent |
| 8 | Owner calls repeat no-shows | user | Mario |

## Options
| # | Option | Primary user action | Impact | Confidence | Effort | Reversibility |
|---|--------|--------------------|--------|-----------|--------|---------------|
| 1 | Automatic reminders with confirm | the patient confirms a slot | 4 | 3 [interview:P1] | 3 | 4 |
| 2 | Manual templates for the receptionist | the receptionist sends a template | 2 | 3 [interview:P2] | 1 | 5 |
| 3 | Waitlist refill | the owner refills a slot | 3 | 2 [assumption:unvalidated] | 4 | 3 |

## Selected: 1
**Chosen by:** Mario, "1"
**Why:** highest impact, reversible

## Rejected
| Option | Why not now | Revisit when |
|--------|------------|--------------|
| 2 | low impact | if 1 fails |
| 3 | weak evidence | after 1 |

## Value

### Quick estimates
| Option | Formula | Assumption it rests on | Two-year value (P50) |
|---|---|---|---|
| 1 | clinics × price × 24 | clinics that pay | about €47,000 |
| 2 | clinics × time saved × 24 | time saved | about €10,000 |
| 3 | slots refilled × 45 × 24 | refill rate | about €20,000 |

### Assumptions
| Assumption | Population | Kind | Source | P14 | P50 | P86 | Load-bearing |
|---|---|---|---|---|---|---|---|
| Clinics paying after a year | small Italian clinics reached | estimate | [estimate:founder-reach] | 10 | 50 | 120 | yes |
| Monthly price | paying clinics | decision | [doc:user-2026-10-24-idea] | 29 | 39 | 49 | no |
| Months paid in two years | paying clinics | estimate | [estimate:churn-guess] | 12 | 18 | 22 | no |

**Formula:** clinics × price × months
**Two-year value:** P14 about €3,500 · P50 about €35,100 · P86 about €129,000
**Costs:** WhatsApp messages about 0.05 euro each, under 10% of revenue

### Sensitivity
| Assumption | Kind | Result at P14 | Result at P86 |
|---|---|---|---|
| Clinics paying after a year | estimate | €7,020 | €84,200 |
| Months paid | estimate | €23,400 | €42,900 |

**Load-bearing:** clinics paying after a year, an estimate

### Five questions
1. Where does each number come from? founder estimates and the price decision
2. New revenue, or moved from another line? new revenue
3. The denominator? small Italian clinics the founder reaches
4. Five times smaller, would we decide differently? yes, it would not pay for the evenings
5. What did we kill, and with which number? option 3 at about €20,000

## Go-to-market
**Trigger:** a week with three empty slots; anti-ICP: clinics with a booking system
**Positioning:** fewer empty hours without changing how you book
**Motion:** founder-led sales at 39 euro a month
**Channel:** regional physiotherapy associations
**Channel test:** a post in two association groups; event: demo requests; stop below 2, build above 5; two weeks; one evening
**Message:** stop losing hours to no-shows

## Business case
**First 100 users:** association groups, "stop losing hours to no-shows", the founder writes and calls
**Cost per user:** about 2 euro a month of messages and hosting
**Price:** 39 euro a month per clinic
**Willingness to pay test:** a pre-order at 39 euro asked at the end of each demo

## Kill criteria
On 2027-02-01, below 70% we stop; between 70% and 90% we iterate; above 90% we keep.
**Measured by:** event slot_outcome

## Riskiest assumption
Clinics will pay 39 euro a month for fewer no-shows. [assumption:unvalidated]

## Cheapest test
**Assumption:** clinics paying after a year
**Shape:** concierge
**Design:** the founder sends reminders by hand for three clinics for two weeks
**Test cost:** 10 days · **Build cost:** 15 days
**Order:** test first
**Changes the decision:** fewer than 2 of 3 clinics asking to continue flips the bet to option 2
**Question:** at least 2 of 3 clinics ask to continue after two weeks
**Event:** a clinic asks to continue, over two weeks
**Stop below:** 1 · **Build above:** 2
**Second idea:** option 2 at about €10,000
**Sample:** 3 clinics, declared small sample before PMF
**Falsified if:** no clinic asks to continue

## Bet size
**Door:** two-way, nothing is irreversible
**Confidence:** 40%, five interviews
**Appetite:** 20 days
**If wrong:** 20 evenings, nothing to undo
**Evidence bar:** met for idea and a two-way door
