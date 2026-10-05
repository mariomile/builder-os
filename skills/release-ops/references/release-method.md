# Release Method

The reasoning and detail behind the phase 6 procedure in [the skill](../SKILL.md). Read the section you need.

## Why This Phase Exists

The two failures this phase prevents are both quiet. A release with no tested rollback turns a small regression into an incident. A release with no baseline captured beforehand makes the entire pipeline unfalsifiable: nobody can say afterwards whether it worked, so everybody says it did.

## Prerequisite

A missing `05-build-plan.md` stops the phase: shipping unverified work is what gate 5 exists to prevent.

## Rollout Strategies

The choice is about how fast a mistake becomes visible against how much it costs when it does.

| Strategy | Exposure | Best when | Cost |
|----------|----------|-----------|------|
| **Flag, off by default** | Nobody, until switched | The change is risky or the audience is specific | A flag to remove later, and a code path that can rot |
| **Internal first** | The team | The failure mode is obvious once seen | Slow, and your team is not your user |
| **Canary** | One named cohort or account | You have a friendly account and the change is visible | Coordination, and n=1 for the metric |
| **Percentage** | A share, increasing | The metric needs volume to read | Needs enough traffic for the slice to mean anything |
| **Full** | Everyone | Reversible, low blast radius, or the volume is too low to slice | No early warning |

Pretending a 40-user product can run a 5% rollout is worse than shipping to everyone with a working rollback. "Then we increase it" is not a condition to proceed; "error rate below baseline plus 0.5pp for 24 hours" is.

## Rollback Design

| Element | Requirement | Not acceptable |
|---------|-------------|---------------|
| **Mechanism** | The specific action that reverses this release | "We can revert the commit" without saying what that does to data written since |
| **Owner** | A person who can do it, and how to reach them | "The team" |
| **Tested** | Exercised at least once, before exposure | "It should work" |

The question everyone skips is what happens to data created while the feature was live. A flag flip that leaves orphaned rows or half-migrated records is a rollback that requires a second rollback.

Forward-compatible changes (add a column, write to both, read from the new one later) are reversible by flipping a read path. Destructive changes are not reversible at all, which is a fact to state before shipping rather than discover during an incident.

## Baseline Before Exposure

The single most important thing this phase does. Without it, phase 7 compares a post-launch number against a remembered one, and memory is generous. Every "it clearly helped" in product history is this failure.

| | |
|---|---|
| **What** | The phase 2 success metric, by its phase 2 definition, not a similar one |
| **Window** | Long enough to cover the product's natural rhythm: a weekly-rhythm product needs multiple weeks, not the last three days |
| **Timestamp** | Recorded, and earlier than the rollout timestamp. The gate checks the order |
| **Method** | The exact query shape and parameters, written down so phase 7 runs the identical one |

A release that moved the target and broke something else is the outcome that only guardrail baselines can detect. The eval dataset grows from production; it is never left as it was at phase 4.

## Pre-Launch Instrumentation

Phase 5 verified the events fire. This is the narrower question: do they fire in the environment users will hit, with the production configuration? The classic failure is an analytics key that exists in development and is empty in production, which produces a launch with no data and a phase 7 with nothing to read. "We can query it" is not a measurement; a saved thing with a name is.

## Authorization

Exposure to users is the one step in the lifecycle nobody can undo by the time they read about it. Autonomy can differ by environment: free in development, prepared but authorized in production, with staging in between. The skill makes skipping a release rule unlikely; only a deterministic check makes it impossible.

## Release Notes and Outcome Review

A changelog is a legitimate artifact and a different one from release notes. Both can exist; only one satisfies gate 6.4.

A review with no owner does not happen. A review with no date happens when someone remembers, which is after the result has become obvious enough that there is nothing left to learn.

## Claims and Their Evidence

Release claims are the ones most often made from memory, under time pressure. Each needs its own evidence, captured in this phase.

| Claim | Requires | Not enough |
|-------|----------|------------|
| Rollback works | The rollback executed once, with its result | A written procedure |
| Baseline captured | The value, its source tag and a timestamp earlier than exposure | A dashboard link |
| Events are flowing in production | Events observed from the production environment after deploy | Events seen in staging |
| Outcome review scheduled | An owner and a date recorded in the artifact | "We'll check in a few weeks" |

## Common Mistakes, Full List

| Mistake | Why it fails | Correct |
|---------|-------------|---------|
| Baseline captured after exposure | Phase 7 has nothing honest to compare against | Capture and timestamp before the first user |
| Missing history filled as zero | The comparison becomes fabricated | Measure it or mark unavailable |
| A rollout plan labeled SHIPPED | Nobody has verified user exposure | RELEASE READY until exposure is observed |
| Untested rollback | Gate 6.1 fails; the first test happens during an incident | Exercise it once, before exposure |
| No answer for data written while live | The rollback needs a second rollback | Write the answer, even when it is "nothing is written" |
| Assuming a migration is reversible | Destructive changes are not | State reversibility as a fact before shipping |
| Release notes that are a commit list | Gate 6.4 fails; the audience is users | Lead with what they can now do |
| Instrumentation checked in development only | The production key is empty and the launch produces no data | Verify from the production path |
| "We can query it" instead of a saved measurement | Nobody finds it in phase 7 | A named dashboard or saved query |
| A review date with no owner | It does not happen | Owner and date, from the kill criteria |
| A percentage rollout on a product with 40 users | The slice cannot move a metric readably | Full release with a working rollback, and say why |
| Deploying because the plan was approved | A plan authorizes a plan | Ask for exposure authorization and record who gave it (6.8) |
| Failed production outputs left out of the eval set | The next prompt change can reintroduce them unseen | Add each as a production case, must-pass when it is a safety case |
