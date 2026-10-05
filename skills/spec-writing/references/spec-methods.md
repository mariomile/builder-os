# Spec Methods

The forms, examples and tables behind each lifecycle step of `spec-writing`. Read only the section the current step needs.

## Scope Boundaries

Gate 4.2 fails an empty out-of-scope list, because an empty one means the scope was never bounded, only described.

Three kinds of boundary, all worth writing:

| Boundary | Form | Why it matters |
|----------|------|---------------|
| **Not now** | "Bulk editing is out of scope for this release" | The common case. Protects the timeline |
| **Not ever, by design** | "We will not support offline editing; the conflict model would cost more than the feature is worth" | Prevents the same argument every quarter |
| **Not until X** | "Multi-workspace support waits until a second workspace exists in production" | Names the trigger rather than the date |

Write the boundary that someone will argue with. An out-of-scope list containing only things nobody wanted is not a boundary, it is padding.

**Out of scope is not the same as not yet specified.** Out of scope lies beyond what this release is for: it never comes back unless the bet changes. Not yet specified lies inside the scope and is simply not decided yet: how a limit is enforced, which of two error behaviors applies. Filing an open question under out of scope quietly drops it; leaving it unfiled hands the decision to whoever implements it. Each open question goes under **Not yet specified** with who decides it and which acceptance criteria wait on it, so phase 5 can build the slices that do not.

## Constraint Conflicts

The constraints in `PRODUCT.md` (regulatory, distribution, resource) and in `TECH.md` (technical constraints, conventions) apply while the spec is written, not when someone notices them in review. Most of the time the spec can satisfy all of them. Sometimes two cannot hold at once: "every export of personal data is audited" against "no new table without an ADR", when the audit log needs a table.

A conflict found here costs a conversation with whoever owns the constraint. The same conflict found in phase 5 is resolved silently, in code, by whoever hit it. So the spec names it:

| Constraint A | Constraint B | Why both cannot hold | Decides | Blocks |
|--------------|--------------|----------------------|---------|--------|
| {source and rule} | {source and rule} | {the specific collision} | {the person who owns the call} | {AC numbers waiting, or "none"} |

Gate 4.7 requires the `## Conflicts` section, and a name under Decides for every row. When none exist, the section says which constraints were checked and that none collide; an absent section means nobody looked. Close conflicts with their owner before asking for the spec's acceptance, or carry them as blocking edges into phase 5 exactly like the Not yet specified table.

## Acceptance Criteria

Gate 4.1: **every criterion is a testable assertion.** The mechanical check is a subject plus a verifiable verb, with no adjective doing the work.

| Not testable | Testable |
|--------------|----------|
| "The import should be fast" | "A 10,000-row file finishes importing within 30 seconds on the standard plan" |
| "Errors are handled gracefully" | "A malformed row is skipped, counted, and reported in the summary; the remaining rows still import" |
| "The UX should be intuitive" | "A user who has never imported completes the flow without opening help, in usability testing with 5 participants" |
| "Data is secure" | "A user cannot read a record belonging to another workspace through any documented endpoint" |

The adjective test: strike every adjective from the criterion. If nothing verifiable remains, it was not a criterion.

Each criterion needs a subject that exists in the product, a verb that produces an observable outcome, and a condition under which it is checked. Anything else is a hope, and phase 5 will map a test to it and discover there is nothing to assert.

## State and Edge-Case Enumeration

Gate 4.3 requires an error state and an empty state for every flow. Those two are the enumerated minimum, not the complete set. The full set per screen or step:

| State | The question it answers |
|-------|------------------------|
| **Empty** | What does a new user see before anything exists? |
| **Loading** | What is shown while waiting, and for how long before that changes? |
| **Partial** | What if some of it worked? Half-imported, some permissions, stale cache |
| **Error** | What broke, whose fault, what do they do now? |
| **Success** | What confirms it worked, and what is the next action? |
| **Permission** | What does someone without access see? Not a blank screen |

Partial is the state teams skip and the one that generates support tickets. Any operation over a collection has a partial state by construction.

### Edge cases worth enumerating

Work these four categories against each flow; they cover most of what ships broken:

1. **Zero, one, many, too many.** Empty collection, single item, normal, and the volume that breaks the page.
2. **Concurrency.** Two people acting at once, the same person in two tabs, an action arriving after a state change.
3. **Interrupted.** The user closes the tab mid-flow, the connection drops, the token expires halfway.
4. **Hostile or malformed input.** Not only security: a spreadsheet with merged cells, an emoji in a name field, a 50MB file.

Each enumerated case gets an expected behavior in the spec. "Undefined" is an acceptable answer only when written down as a deliberate choice.

## Tracking Before Build

Gate 4.4: the tracking plan names the events that will measure the phase 2 success metric. Designed now, not after launch, because instrumentation added afterwards cannot measure the launch.

Per the phase 2 metric, work backwards: which events, with which properties, would compute this number? Then check each against what already exists via `tracking-standards`. The output is a table the implementer can build from, and the input to gate 5.3 and gate 6.3.

A spec whose tracking plan cannot compute the phase 2 metric has failed to connect the build to the reason for building it, and phase 7 will have nothing to evaluate.

## Model Output: Eval Set

When any acceptance criterion depends on what a model generates (a summary, a classification, a reply, a voice agent's turn), a single exact-output assertion may be insufficient. Deterministic properties and rubric-scored pass/fail cases still apply, with repeated trials when variability matters. Such a spec declares `**Model output:** yes` and carries an eval set, which gate 4.6 checks.

| Part | Rule |
|------|------|
| **Cases** | At least 20 inputs (10 in lite mode), drawn from real inputs where any exist (`[doc:*]` or `[data:*]` tagged), else written to cover the edge-case categories above. At least a quarter are failure-prone: ambiguous, adversarial, out of domain |
| **Expected** | Per case, what a correct output must contain or must not contain. Not a reference answer to match word for word |
| **Judge** | How each case is scored: a deterministic check (contains, parses, classifies as), a rubric a person applies, or a grader model with its rubric written out. Name which, per case or for the set |
| **Threshold** | The pass rate the build must reach, and any case that must pass on its own (a safety or compliance case never averages out) |
| **Guardrail in production** | Which share of live outputs is sampled and scored after release, by whom, how often. Phase 6 measures it next to the success metric |

The eval set is an actual file, not a prose case count. The spec names `**Dataset:** {project-relative path}` and `**Threshold:** {percentage}`. Use JSON or JSONL with unique `id`, `input`, `expected`, optional `judge`, and boolean `must_pass`, or the Markdown table supported by gate 4.6. Synthetic cases are labeled; unavailable real inputs are never invented as observations. A compatible JSON case is:

```json
{"id":"ambiguous-01","input":"Cancel the old booking","expected":"Ask which booking; do not cancel yet","judge":"rubric: clarification before irreversible action","must_pass":true}
```

The dataset lives in the initiative's `evals/` directory or the repository's existing location; the spec points at it. It is the acceptance criterion for the model's behavior, so it is written before the prompt, not tuned after it.

## More Common Mistakes

| Mistake | Why it fails | Correct |
|---------|-------------|---------|
| Empty out-of-scope list | Gate 4.2 fails; scope was described, not bounded | Write the boundary someone will argue with |
| Unnumbered acceptance criteria | Phase 5 maps tests by number | Number them |
| Tracking designed after the build | Cannot measure the launch it was meant to measure | Work backwards from the phase 2 metric, before building |
| Open questions with no owner | They resolve themselves badly, at implementation time | Who decides, by when |
| Specifying a flow the bet did not choose | Scope creep before a line is written | Every flow traces to the phase 3 primary action |
| Two constraints that cannot both hold, left for the build | The implementer picks one silently | Write the conflict with who decides; gate 4.7 |
| A tracking plan that cannot compute the success metric | Gate 4.4 fails; phase 7 has nothing to evaluate | State explicitly how the events produce the number |
