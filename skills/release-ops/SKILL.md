---
name: release-ops
description: "Use when built work is about to reach users — choosing a rollout strategy, designing the rollback, capturing the baseline before exposure, and writing release notes for the people who will read them"
---

# Release Ops

Phase 6 puts the work in front of users in a way that can be undone, and captures the number that makes phase 7 possible.

Read [operating modes](../../references/operating-modes.md) first. Load `pm-artifacts` for requested release-note formatting, `tracking-standards` for instrumentation checks, and `evidence-ledger` for lifecycle evidence. Read [analytics shapes](../../references/analytics-contract.md) only when measuring a baseline, and [capabilities](../../references/capability-map.md) when resolving a source. Read [the release method](references/release-method.md) when choosing a strategy, designing a rollback, sizing a baseline window, checking what evidence a release claim needs, or when you need a step's reasoning.

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `analytics.query` | Success-metric and guardrail baselines | A sourced observation with window/method; otherwise mark unavailable and name the measurement gap |
| `analytics.events` | Production events arriving before exposure | The production emission path in code, tagged as weaker evidence |
| `db.query` | Baselines in the application database | Same floor: ask |
| `repo.read` | Flag system, migration, deploy configuration | Ask how the release mechanism works; a rollback you cannot describe is not documented |
| `docs.write` | Publishing release notes where users read them | Deliver to the requested destination within existing authorization; report unresolved access |
| `files.read` / `files.write` | Artifacts, state | Required |

Gate 6.2 may use a sourced manual measurement. Unknown history is a blocking gap; source-code inspection cannot establish a measured baseline or actual user exposure.

## Standalone Procedure

For a release plan, checklist, rollback design or notes, use supplied context and deliver that artifact. State missing readiness evidence. Do not require lifecycle filenames, initialize an initiative or deploy. Planning authorizes a plan; use existing explicit deployment authorization for execution.

## Lifecycle Procedure

Run in order; delegate where the host allows, inline where it does not.

**1. Read `05-build-plan.md`, `04-spec.md`, `03-solution-bet.md`, `02-definition.md`:** the verified build, tracking plan, kill criteria, and success metric with its phase 2 definition. No `05-build-plan.md` means stop.

**2. Choose one rollout strategy** (flag, internal, canary, percentage, full) and say why. Full release is legitimate where the change is reversible, the blast radius low, or volume too low to slice; say which applies. State the exposure at each step, what is watched between steps, and a numeric condition for proceeding.

**3. Design the rollback** (gate 6.1): a specific reversing mechanism, a named owner with how to reach them, and a test. Answer what happens to data written while the feature was live, even when the answer is "nothing is written". With a migration, the rollback is not the inverse migration by default: state whether the change is actually reversible.

**4. Test the rollback once**, before exposure, and record what was done and observed. An untested rollback fails gate 6.1.

**5. Verify production instrumentation:** events arriving from the production path, with the production configuration, before the first user.

**6. Capture the baseline** (gate 6.2) before actual exposure in step 11: the phase 2 success metric by its phase 2 definition, over a window covering the product's natural rhythm, with the exact query shape and parameters so phase 7 runs the identical one, timestamped earlier than exposure. A tagged user-provided observation may substitute for a query when its date, window and method are stated. Zero requires an observed zero or a documented first-ever measurement for a genuinely new metric or population; an existing product with missing history has an unavailable baseline, which blocks this gate until measured or explicitly overridden. No capability fallback invents zero. Capture the guardrail baselines from the phase 4 tracking plan too. Where the spec declares model output, score the production sample against the eval rubric and add every failing output to the eval dataset as a production case, `must_pass` when it concerns safety or compliance.

**7. Confirm the measurement exists** (gate 6.3): a saved query or dashboard for the success metric, named and findable by someone else.

**8. Write release notes** (gate 6.4) per `pm-artifacts`, for the person who will use the thing: lead with what they can now do, without component names, ticket numbers or internal vocabulary.

**9. Schedule the outcome review** (gate 6.5): an owner and a date, from the phase 3 kill criteria, anchored to the actual verified exposure (the plan may show a provisional date). Where they disagree, the kill criteria win; note the discrepancy.

**10. Prepare and report readiness.** Write `.builderos/initiatives/{initiative}/06-release.md` per [the release template](references/release-template.md), headings, bold labels and tables exact. A completed plan is `## RELEASE READY` and remains at phase 6. Do not record a successful ship gate from a future rollout date.

**11. Execute within authorization and verify exposure.** The agent prepares; a person authorizes crossing into user exposure, and planning a release never authorizes the deploy. Record `**Authorized by:**` in Exposure verification with who and how (the message, the ticket, the approval) (gate 6.8). If deployment is authorized, perform the rollout, observe the exposed version in the intended environment and capture a resolving data or document source. Otherwise report the concrete readiness result and the remaining authorization or access. Record an actual, non-future timestamp, environment, version and verification. Installed-app behavior requires observing the installed app; publication alone proves publication. A release rule that must hold every time (no production deploy without approval) goes in `TECH.md` → Technical constraints with its deterministic check (host hook or protected CI step) when one exists.

**12. Gate the verified release.** Run gate 6, including 6.6 exposure structure, 6.7 evidence-to-exposure judgment and 6.8 authorization, then record with the outcome date and the person who authorized (`scripts/bos.mjs record 6 --review-due YYYY-MM-DD --accepted-by "who"` and required judgments). Only a successful verified release advances to phase 7. Update project context and roadmap within the selected initiative.

Completion marker: `## RELEASE READY` for preparation; `## SHIPPED` only for observed exposure backed by its evidence and passing gate. Report partial rollout accurately.

## Common Mistakes

| Mistake | Correct |
|---------|---------|
| Baseline captured after exposure | Capture and timestamp before the first user |
| Missing history filled as zero | Measure it or mark unavailable |
| A rollout plan labeled SHIPPED | RELEASE READY until exposure is observed |
| Deploying because the plan was approved | Ask for exposure authorization and record who gave it (6.8) |
| Instrumentation checked in development only | Verify from the production path |
| A percentage rollout on a product with 40 users | Full release with a working rollback, and say why |
