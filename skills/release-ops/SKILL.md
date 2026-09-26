---
name: release-ops
description: "Use when built work is about to reach users — choosing a rollout strategy, designing the rollback, capturing the baseline before exposure, and writing release notes for the people who will read them"
---

# Release Ops

Phase 6 puts the work in front of users in a way that can be undone, and captures the number that makes phase 7 possible.

The two failures this phase prevents are both quiet. A release with no tested rollback turns a small regression into an incident. A release with no baseline captured beforehand makes the entire pipeline unfalsifiable: nobody can say afterwards whether it worked, so everybody says it did.

**REQUIRED BACKGROUND:** `evidence-ledger` for tagging. `pm-artifacts` for the release-notes template. `tracking-standards` for the pre-launch instrumentation check. `references/analytics-contract.md` for the baseline query shapes. `references/capability-map.md` before touching any data source.

## Rollout Strategies

Pick one and say why. The choice is about how fast a mistake becomes visible against how much it costs when it does.

| Strategy | Exposure | Best when | Cost |
|----------|----------|-----------|------|
| **Flag, off by default** | Nobody, until switched | The change is risky or the audience is specific | A flag to remove later, and a code path that can rot |
| **Internal first** | The team | The failure mode is obvious once seen | Slow, and your team is not your user |
| **Canary** | One named cohort or account | You have a friendly account and the change is visible | Coordination, and n=1 for the metric |
| **Percentage** | A share, increasing | The metric needs volume to read | Needs enough traffic for the slice to mean anything |
| **Full** | Everyone | Reversible, low blast radius, or the volume is too low to slice | No early warning |

**Full release is a legitimate choice**, and pretending a 40-user product can run a 5% rollout is worse than shipping to everyone with a working rollback. Say which applies and why.

The rollout plan states exposure at each step, what is watched between steps, and the condition for proceeding. "Then we increase it" is not a condition; "error rate below baseline plus 0.5pp for 24 hours" is.

## Rollback Design

Gate 6.1: a named mechanism, a named owner, tested once. All three.

| Element | Requirement | Not acceptable |
|---------|-------------|---------------|
| **Mechanism** | The specific action that reverses this release | "We can revert the commit" without saying what that does to data written since |
| **Owner** | A person who can do it, and how to reach them | "The team" |
| **Tested** | Exercised at least once, before exposure | "It should work" |

The question everyone skips: **what happens to data created while the feature was live?** A flag flip that leaves orphaned rows or half-migrated records is a rollback that requires a second rollback. Write the answer even when the answer is "nothing is written".

Where a migration is involved, the rollback is not the inverse migration by default. Forward-compatible changes (add a column, write to both, read from the new one later) are reversible by flipping a read path. Destructive changes are not reversible at all, which is a fact to state before shipping rather than discover during an incident.

## Baseline Before Exposure

Gate 6.2, and the single most important thing this phase does. The success metric from phase 2, measured and timestamped, **before** the first user sees the change.

Without it, phase 7 compares a post-launch number against a remembered one, and memory is generous. Every "it clearly helped" in product history is this failure.

| | |
|---|---|
| **What** | The phase 2 success metric, by its phase 2 definition, not a similar one |
| **Window** | Long enough to cover the product's natural rhythm: a weekly-rhythm product needs multiple weeks, not the last three days |
| **Timestamp** | Recorded, and earlier than the rollout timestamp. The gate checks the order |
| **Method** | The exact query shape and parameters, written down so phase 7 runs the identical one |

Where no analytics capability resolved, the baseline is whatever the floor gives: a number the user provides, tagged, or an explicit zero with the date of first measurement. Both satisfy the gate. A remembered number presented as measured does not.

Capture the guardrail metrics too, from the phase 4 tracking plan. A release that moved the target and broke something else is the outcome that only guardrail baselines can detect.

## Pre-Launch Instrumentation Check

Phase 5 verified the events fire. This is the narrower question: do they fire **in the environment users will hit**, with the production configuration?

The classic failure is an analytics key that exists in development and is empty in production, which produces a launch with no data and a phase 7 with nothing to read. Check the destination receives events from the production path before exposure, not after.

Then confirm the measurement exists (gate 6.3): a saved query or a dashboard for the success metric, findable by someone who is not you. "We can query it" is not a measurement; a saved thing with a name is.

## Release Notes

Gate 6.4: written for the audience, not for the repository.

The template lives in `pm-artifacts`. The rule that matters here: the reader is the person who will use the thing, and they do not know your component names, your ticket numbers or your internal vocabulary. Lead with what they can now do that they could not do before.

A changelog is a legitimate artifact and a different one. Both can exist; only one satisfies the gate.

## Outcome Review

Gate 6.5: an owner and a date, set now, while the intent is fresh.

The date comes from the phase 3 kill criteria, which already named one. If phase 3 said "28 days after 50% rollout", the review date is computable the moment the rollout schedule exists. Where they disagree, the kill criteria win and the discrepancy is worth a line.

A review with no owner does not happen. A review with no date happens when someone remembers, which is after the result has become obvious enough that there is nothing left to learn.

## Claims and Their Evidence

Release claims are the ones most often made from memory, under time pressure. Each needs its own evidence, captured in this phase.

| Claim | Requires | Not enough |
|-------|----------|------------|
| Rollback works | The rollback executed once, with its result | A written procedure |
| Baseline captured | The value, its source tag and a timestamp earlier than exposure | A dashboard link |
| Events are flowing in production | Events observed from the production environment after deploy | Events seen in staging |
| Outcome review scheduled | An owner and a date recorded in the artifact | "We'll check in a few weeks" |

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `analytics.query` | The baseline for the success metric and the guardrails | Ask the user for the number and tag it, or record an explicit zero with a first-measurement date |
| `analytics.events` | Confirming production events arrive before exposure | Verify from the production emission path in code, tagged as weaker evidence |
| `db.query` | Baselines that live in the application database | Same floor: ask |
| `repo.read` | The flag system, the migration, the deploy configuration | Ask how the release mechanism works; a rollback you cannot describe is not documented |
| `docs.write` | Publishing release notes where users read them | Write the file; publishing is the user's step |
| `files.read` / `files.write` | Previous artifacts, this artifact, state | Required |

Gate 6.2 is satisfiable with no data capability. What it refuses is an *absent* or *remembered* baseline, not an honestly floored one.

## Procedure

Run in order. Delegate where the host allows it, run inline where it does not.

1. **Read `05-build-plan.md`, `04-spec.md`, `03-solution-bet.md` and `02-definition.md`.** The verified build, the tracking plan, the kill criteria and the success metric with its phase 2 definition. No `05-build-plan.md` means stop: shipping unverified work is what gate 5 exists to prevent.

2. **Choose the rollout strategy.** One, with the reason, the exposure steps, what is watched between them and the numeric condition for proceeding.

3. **Design the rollback.** Mechanism, owner, and the test. Answer the data question explicitly. Where a migration is involved, state whether the change is actually reversible.

4. **Test the rollback once**, before exposure. Record what was done and what was observed. An untested rollback fails gate 6.1 regardless of how obvious it looks.

5. **Verify production instrumentation.** Events arriving from the production path, with the production configuration, before the first user.

6. **Capture the baseline.** The phase 2 metric by its phase 2 definition, plus the guardrails, with the window, the method and the timestamp. This happens before step 8, and the gate checks the order.

7. **Confirm the measurement exists.** A saved query or dashboard for the success metric, named and findable.

8. **Write release notes** for the audience, per `pm-artifacts`.

9. **Schedule the outcome review.** Owner and date, taken from the phase 3 kill criteria.

10. **Write and gate.** Write `.builderos/initiatives/{initiative}/06-release.md`, run gate 6, update `state.json` with `review_due` set to the outcome review date, advance to phase 7 on pass. Before reporting, add to `TECH.md` anything the release taught (a migration that needed care, a flag that must stay on) and update the initiative's line in `ROADMAP.md`.

Completion marker: `## SHIPPED` with the rollout plan, the tested rollback, the timestamped baseline, the measurement, the release notes and the scheduled review.

## Output Contract

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

## Outcome review
**Owner:** {person} · **Date:** {date, from the phase 3 kill criteria}
**Will evaluate:** {the kill criteria, restated}
```

## Common Mistakes

| Mistake | Why it fails | Correct |
|---------|-------------|---------|
| Baseline captured after exposure | Phase 7 has nothing honest to compare against | Capture and timestamp before the first user |
| A remembered baseline | Memory is generous, and always in one direction | Measure it, or floor it honestly and tag it |
| Untested rollback | Gate 6.1 fails; the first test happens during an incident | Exercise it once, before exposure |
| No answer for data written while live | The rollback needs a second rollback | Write the answer, even when it is "nothing is written" |
| Assuming a migration is reversible | Destructive changes are not | State reversibility as a fact before shipping |
| Release notes that are a commit list | Gate 6.4 fails; the audience is users | Lead with what they can now do |
| Instrumentation checked in development only | The production key is empty and the launch produces no data | Verify from the production path |
| "We can query it" instead of a saved measurement | Nobody finds it in phase 7 | A named dashboard or saved query |
| A review date with no owner | It does not happen | Owner and date, from the kill criteria |
| A percentage rollout on a product with 40 users | The slice cannot move a metric readably | Full release with a working rollback, and say why |
