---
name: release-ops
description: "Takes built work to users safely: a rollout the person picks, a tested rollback, the baseline before exposure, production readiness, release notes, first real use. Use when planning or executing a release, or a rollback or baseline is missing."
---

# Release Ops

Phase 6 puts the work in front of users in a way that can be undone, and captures the number that makes phase 7 possible. **RELEASE READY** means the preparation exists; **SHIPPED** means exposure was observed.

**Mode.** Standalone delivers the requested release plan, checklist, rollback design or notes from supplied context, states missing readiness evidence, and deploys only on existing explicit authorization. The lifecycle runs every step and gate 6. Both per [operating modes](../../references/operating-modes.md). Load `pm-artifacts` for release-note formatting and `tracking-standards` for instrumentation checks; read the [analytics shapes](../../references/analytics-contract.md) when measuring a baseline. Read [the release method](references/release-method.md) when choosing a strategy, designing a rollback, sizing a baseline window, checking what evidence a release claim needs, or when a step's reasoning is needed.

## Procedure

1. **Read `05-build-plan.md`, `04-spec.md`, `03-solution-bet.md`, `02-definition.md`**: the verified build, the tracking plan, the kill criteria, the success metric with its phase 2 definition. Done when the build plan exists with gate 5 passed.
2. **Put the rollout to the person as a decision card** (flag, internal, canary, percentage, full): the two or three that fit, each with its exposure per step, what is watched between steps, the numeric condition for proceeding, its cost, and a recommendation. Full release fits a reversible change, a low blast radius, or volume too low to slice; say which applies. Done when `**Chosen by:**` under `## Rollout` records the person's answer (gate 6.13).
3. **Design the rollback** (gate 6.1): a specific reversing mechanism, a named owner with how to reach them, and a test. Say what happens to data written while the feature was live, even when nothing is written. With a migration, state whether the change is actually reversible; the inverse migration is a candidate, checked against the data. Done when mechanism, owner, data answer and test are written.
4. **Test the rollback once**, before exposure, and record what was done and observed. Done when the observation is recorded.
5. **Verify production instrumentation:** events arriving from the production path, with the production configuration, before the first user. Done when each tracking-plan event is observed from production.
6. **Capture the baseline** (gate 6.2) before exposure: the phase 2 success metric by its phase 2 definition, over a window covering the product's natural rhythm, with the exact query shape and parameters so phase 7 runs the identical one, timestamped before exposure. A tagged observation the person provides may stand in for a query when its date, window and method are stated. A zero needs an observed zero or a documented first-ever measurement of a genuinely new metric; an existing product with missing history has an unavailable baseline, and the gate holds until it is measured or explicitly overridden. Capture the guardrail baselines from the phase 4 tracking plan too. Where the spec declares model output, score the production sample against the eval rubric and add every failing output to the eval dataset, `must_pass` for safety or compliance. Done when every baseline has a value, window, query and timestamp, or a stated gap.
7. **Confirm the measurement exists** (gate 6.3): a saved query or dashboard for the success metric, named and findable by someone else. Done when its name and location are written.
8. **Write release notes** (gate 6.4) per `pm-artifacts`, for the person who will use the thing: what they can now do, in their words, free of component names, ticket numbers and internal vocabulary, the phase 5 demo linked under `**Demo:**`. Then **What changes for you**, for people already using the product: what moved, behaves differently or was removed, from the spec's Impact on what exists. Done when both parts are written.
9. **Schedule the outcome review** (gate 6.5): an owner and a date from the phase 3 kill criteria, anchored to the actual verified exposure (the plan may carry a provisional date); where they disagree, the kill criteria win and the discrepancy is noted. **Change track:** a change with no outcome to measure omits Baseline, Measurement and Outcome review and closes at phase 6 (steps 6, 7 and 9 skipped); one that sets a review runs them and goes to phase 7. Done when owner and date are written, or the change track's omission is stated.
9b. **Promote what the initiative settled** (gate 6.9). Entities, states, invariants and business rules from `DESIGN.md` → Domain model go into the project's `DOMAIN.md`, each marked with this initiative; a visual direction chosen here goes into `TECH.md` → Design system (kit, where the tokens live, composition rules). Where a promoted file is new (the first `DOMAIN.md`, a design system section), add its pointer to `AGENTS.md` per `agents-md`. Done when `## Promoted` lists each promotion and its destination.
9c. **Get ready for the first incident** (gate 6.10). Under `## Production readiness`: `**Errors seen by:**` how an error reaches the team before a user reports it (an error tracker with an alert, a log query someone watches); `**Backup restored:**` a restore of the stored data tested once, with its date, or "not applicable" with why; with model output, `**Agent traces:**` where every turn and tool call is kept and who reads a sample how often (`agent-design`). Then fill what `TECH.md` → `## Operations` is missing for the product's stage: **Privacy** always (notice, sub-processors with their data processing agreements, deletion on request, data region); **AI disclosure** when the spec declares model output (people are told they are dealing with an AI system; in the EU, Article 50 of the AI Act); after PMF **SLO**, **Incident response** (who is alerted, how users are told, the postmortem that becomes an anomaly initiative) **Cost per active user** with its budget alert and **Load tested** at ten times the spec's capacity, plus **Model degradation** with model output (must-pass cases rerun on sampled production turns, and the alert threshold). Written once per product and kept true. Privacy and AI disclosure are product checklists: name what a professional should confirm. Done when the readiness lines are filled and Operations has every line its stage requires.
10. **Prepare and report readiness.** Write `.builderos/initiatives/{initiative}/06-release.md` per [the release template](references/release-template.md), headings, bold labels and tables exact. A completed plan is `## RELEASE READY` and stays at phase 6; a future rollout date is a plan. Done when the artifact exists and its readiness is reported.
11. **Execute within authorization and verify exposure.** The agent prepares; a person authorizes crossing into user exposure, separately from approving the plan, after seeing the demo. Record `**Authorized by:**` in Exposure verification with who and how (the message, the ticket, the approval) (gate 6.8). With deployment authorized, perform the rollout, observe the exposed version in the intended environment and capture a resolving data or document source; otherwise report readiness and the remaining authorization or access. Record an actual timestamp, the environment, version and verification; installed-app behavior is observed in the installed app. A release rule that must hold every time (production deploys wait for approval) goes in `TECH.md` → Technical constraints with its deterministic check. A problem during rollout or after exposure runs `bug-diagnosis` first, with the rollback from step 3 as the first answer when users are affected. Done when exposure is observed and recorded, or the missing authorization is reported.
11b. **Wait for the first real use** (product track, gate 6.11): online is not in use. Record under `## First real use` the first person outside the team who did the primary action, with its `data` or `doc` tag; until then the initiative stays at phase 6, and the person is told who to invite and what to watch. Done when that use is recorded.
11c. **Wait for the first payment** (product track, for sale, gate 6.12). Record under `## First payment` the first payment by someone outside the team, with its `data` or `doc` tag (the payment record, the invoice); trials and pilots are use, not payment. Done when that payment is recorded.
12. **Gate the verified release.** Run gate 6, including 6.6 exposure structure, 6.7 evidence-to-exposure judgment and 6.8 authorization, and record it with the outcome date and the person who authorized (`scripts/bos.mjs record 6 --review-due YYYY-MM-DD --accepted-by "who"` and the required judgments; a change closing at phase 6 records without `--review-due`). Update project context and the roadmap. Done when gate 6 is recorded and the initiative is at phase 7 or closed.

## Watch for

| Do | Instead of |
|---|---|
| Capture and timestamp the baseline before the first user | A baseline captured after exposure |
| Measure missing history or mark it unavailable | Filling it as zero |
| RELEASE READY until exposure is observed | A rollout plan labeled SHIPPED |
| Ask for exposure authorization and record who gave it (6.8) | Deploying because the plan was approved |
| Verify from the production path | Instrumentation checked in development only |
| Full release with a working rollback for 40 users, saying why | A percentage rollout on a tiny product |

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `analytics.query` | Success-metric and guardrail baselines | A sourced observation with window/method; otherwise mark unavailable and name the measurement gap |
| `analytics.events` | Production events arriving before exposure | The production emission path in code, tagged as weaker evidence |
| `db.query` | Baselines in the application database | Same floor: ask |
| `repo.read` | Flag system, migration, deploy configuration | Ask how the release mechanism works; the rollback is documented once you can describe it |
| `logs.query` | Where production errors surface (step 9c) | Ask how errors reach the team today; "nobody sees them" is the finding |
| `docs.write` | Publishing release notes where users read them | Deliver to the requested destination within existing authorization; report unresolved access |
| `files.read` / `files.write` | Artifacts, state | Required |

Gate 6.2 accepts a sourced manual measurement. Unknown history is a blocking gap; a measured baseline and actual exposure come from observation, and source-code inspection supplies neither.

## Output Contract

`## RELEASE READY` for preparation; `## SHIPPED` only for observed exposure backed by its evidence and a passing gate. A partial rollout is reported as partial.
