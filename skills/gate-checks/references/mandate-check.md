# Mandate Check (change track)

Read when initializing work classified as `change`. E.1 and E.2 apply too, against `00-request.md`.

Runs once, at initialization, when the work is classified as `change`: a modification to a product that already exists whose reason and solution were decided before BuilderOS saw it. A bug with an obvious correct behavior, debt the team agreed to pay, a rule the product must now follow, a contract that promised a specific capability, a removal already decided. It stands in for gates 0 to 3: the mandate replaces the problem frame, the discovery, the outcome metric and the bet, because nobody has a choice to make there. It does not replace anything after: the spec, the build and the release run their gates in full.

`00-request.md` in the initiative folder, the same file the feature track uses, plus the mandate:

```markdown
# Request — {title}

## Request
{the request, verbatim, with who made it}

**Evidence:** {tags of the ticket, contract clause, regulation, error report or team decision, each with its file in evidence/}
**Population:** {who is affected: one account, a segment, everyone}

## Mandate
**Kind:** bug | debt | compliance | contract | request | removal
**Why no bet:** {what already fixed the solution, in one or two sentences}
```

| # | Condition | Check |
|---|-----------|-------|
| M.1 | The mandate has a source | **Evidence** has a `data`, `interview` or `doc` tag and **Population** is filled. Only the requester's own words is a warning |
| M.2 | The kind is named | **Kind** is one of bug, debt, compliance, contract, request, removal |
| M.3 | Why there is no bet | **Why no bet** says what already decided the solution |
| M.4 | Nothing is left to choose | The solution is fixed by the mandate: there are not two reasonable ways to solve it, and users will not meet it as a new behavior they would have to be won over to. A `request` passes only when the requester specified the exact behavior and nobody needs to decide whether it is worth building |

Script-decided: M.1, M.2, M.3. Model-judged: M.4. The emitted `checked_by` split is authoritative.

Where commands run: `scripts/bos.mjs gate M` first (it only reads), fix drafting errors, judge M.4, then `scripts/bos.mjs cover --m4 "what fixes the solution"`. Pass: phases 0 to 3 are written `covered`, one `phase_covered` event each with the request's tags, and the pipeline starts at phase 4 in lite mode. If you judge M.4 a fail, do not call `cover`: run `scripts/bos.mjs upgrade --to feature --reason "..."`.

Fail: the work is a `feature`, still at phase 0, and runs the feature coverage check next. Not a penalty: a change that needs a choice between solutions needs phase 2 and 3 to make it.

**What a change still owes.** Phase 4 writes scope, acceptance criteria, states, the impact on what exists (4.11), the quality bar (4.12), the stack only where it is touched and the domain only where something changes state. Phase 4.4 is skipped (no phase 2 metric) and the look may be `inherited` with its reason when no screen changes composition. Phase 5 is unchanged. Phase 6 skips baseline, measurement and outcome review when the release declares none, and the initiative closes there; a change that sets an outcome review goes to phase 7 like any other.

| Mistake | Why it fails | Correct |
|---------|-------------|---------|
| "The CEO wants it" as the mandate for a new feature | The solution is not fixed, only the wish | A `feature`: phase 2 asks what it should move |
| A redesign filed as debt | Users meet it as new behavior | A `feature` with design versions |
| A bug fix with two plausible correct behaviors | Someone has to choose | Ask the round question in phase 4, or upgrade if the choice changes what the product is for |
