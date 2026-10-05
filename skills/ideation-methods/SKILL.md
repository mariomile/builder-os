---
name: ideation-methods
description: "Use when a chosen opportunity needs solution options, when a team has one idea and needs alternatives, or when a bet needs kill criteria and the cheapest test of its riskiest assumption"
---

# Ideation Methods

Phase 2 chose what to attack. Phase 3 chooses how, and commits in advance to what would prove the choice wrong.

## Mode and resources

Follow [operating modes and resource paths](../../references/operating-modes.md). **Standalone:** generate alternatives from the supplied opportunity, problem or requirements. An options-only request ends with the alternatives; do not force a selection, kill criteria or execution of an experiment.

**Lifecycle:** the phase prerequisites, artifact paths and gate recording below apply only when the user requests that phase or initiative. Missing prerequisites block that lifecycle transition, not a standalone artifact. Completion markers with gate verdicts claim lifecycle completion only after the gate passes.

Load `pressure-testing` for an unresolved material bet decision, `experiment-methodology` when a test design is requested, and `evidence-ledger`/`gate-checks` for lifecycle traceability and completion. Ask what remains per the `pressure-testing` rounds: every question lists the options, recommends one and says why, and a factual question offers ways to close the gap, never guessed values.

Read [ideation reference](references/ideation-reference.md) when you need the worked examples, scoring and kill-criteria tables, test catalogue with cost bands, or the output template.

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `analytics.query` | Sizing an option's reachable population; the leading indicator behind a kill threshold | Use supplied sizing with uncertainty; a missing baseline stays unknown and needs measurement |
| `repo.read` | What already exists, which changes the effort score materially | Ask the user what exists; score effort as a range |
| `docs.search` | Prior attempts at this problem, and why they were dropped | Ask. A previously failed attempt is the highest-value input to this phase |
| `web.search` | How others solved this shape of problem | Skip; the option set comes from the four prompts |
| `files.read` / `files.write` | Supplied inputs and requested artifact; lifecycle state | No file write for inline alternatives; required for lifecycle writes |

**Option generation needs no connected data.** In lifecycle mode an unknown upstream baseline blocks the relevant gate until measured or explicitly overridden. A provisional test threshold may be a design choice, labeled as such, rather than a claimed observed value.

## Procedure

Apply only the steps needed for the requested artifact. Delegate when available and authorized; otherwise run inline.

1. **Read the requested inputs.** Standalone ideation uses the supplied problem/opportunity and constraints. For lifecycle IDEATE, read `02-definition.md` and `00-frame.md`: the selected opportunity, the success metric with its baseline and target, and the riskiest assumption. No `02-definition.md` on disk means stop: options generated without a chosen opportunity are a brainstorm, not a phase.

2. **Generate mechanically distinct options.** Gate 3.1 is deterministic: each option has a different primary user action, written as "the user {verb}s {object}". Two options producing the same sentence are one option with two skins; merge them. Work four prompts in order until at least three distinct options exist: shift who acts (user, system, teammate, your team by hand); shift when it happens (prevention, intervention, recovery); remove rather than add; take the constraint away, then name the crude version that fits this quarter. The set includes a manual or human-powered option and a removal option. If merging drops the set below three, keep generating: gate 3.1 counts distinct mechanisms, not entries.

3. **Score.** Impact, Confidence, Effort, Reversibility, each 1 to 5, shown separately; no composite score. Confidence is scored from tags in `01-discovery.md`, not enthusiasm: an option resting on `[assumption:unvalidated]` scores 1 or 2 however obvious it feels, and the score line says so.

4. **Pressure-test a proposed bet when selection is requested.** Compare the separate axes and strategic constraints; there is no composite highest scorer. For material unresolved decisions ask what would make it wrong, which evidence would change it, and the cheapest way to find out. Record unresolved uncertainty with the test that addresses it; do not force another approval for decisions already delegated.

5. **Select the bet if requested.** An options-only request stops after comparison. For selection, choose one within delegated authority or ask about a material unresolved preference. Write the rejections, each with a reason and a revisit condition, as phase 2 does. **Reversibility breaks ties, not impact.**

6. **Write kill criteria (gate 3.2, not negotiable).** Before the build: metric (the phase 2 success metric or a named leading indicator), threshold (a number separating continue from stop) and date, all mandatory, plus the action on failure, in a form someone not in the room can apply: "on {date}, if {metric} is below {threshold}, we {stop / revert / rebuild differently}." A criterion that cannot be failed is decoration.

7. **Design the cheapest test.** Name the riskiest assumption the bet rests on (inherited from phase 0, sharpened by phases 1 and 2) and test the one that collapses the bet, not the easiest one. Pick the test shape from the catalogue, estimate its cost in days for this team and say what the estimate rests on, estimate the build cost in days, compute the ratio and state what happens first. **Gate 3.4:** under 20% of the build, the test runs first; building anyway is an override with a reason, logged, which phase 7 reads when judging the outcome. Over 20%, say so and proceed to build.

8. **Deliver.** Return standalone alternatives, a proposed bet or test design as requested without lifecycle gate claims. In lifecycle mode: write `.builderos/initiatives/{initiative}/03-solution-bet.md`, run gate 3 and record it (`scripts/bos.mjs record 3` where commands run), which advances to phase 4 on pass.

Completion marker: `## BET SELECTED` with the option set, the selection, the kill criteria, the test design and the gate result.

## Output Contract

Standalone output follows the requested format and destination, adapting the template only where useful. Lifecycle output is `.builderos/initiatives/{initiative}/03-solution-bet.md`, following the [template](references/ideation-reference.md#output-template) exactly; gate 3 parses its headings and bold labels.

## Common Mistakes

| Mistake | Correct |
|---------|---------|
| No manual or removal option in the set | Work prompts 1 and 3 before scoring |
| Confidence scored on enthusiasm | Score from tags; unvalidated means 1 or 2 |
| Kill criteria with no date, or a threshold that cannot be failed | Metric, threshold, date; write the number that would embarrass you |
| Skipping a test that costs under 20% of the build | Run it, or override with a logged reason |
