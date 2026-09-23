---
name: bos-adr
description: "Write an architecture decision record for a decision that is irreversible or expensive to unwind"
---

Write an ADR into `.builderos/decisions/`.

Usually called at phase 7, and callable at any phase the moment a decision becomes hard to unwind. A decision recorded while the reasoning is fresh is worth more than the same decision reconstructed a quarter later from memory and a pull request.

## Steps

1. **Establish the decision.** From the user, or from the current phase artifact. If it is reversible and cheap, say so and offer to skip: an ADR for every choice makes the directory unreadable and the important ones invisible.
2. **Find the next number.** Read `.builderos/decisions/`; the next ADR is the highest existing number plus one, zero-padded to three digits.
3. **Gather the context with its tags.** What forced the decision, with evidence tags per `evidence-ledger`. An ADR whose context is untagged records an opinion.
4. **Write the file** to `.builderos/decisions/ADR-{NNN}-{slug}.md`, in the format from `references/builderos-state-schema.md`:

```markdown
# ADR-{NNN}: {Decision}

**Date:** {YYYY-MM-DD}
**Phase:** {N}
**Status:** accepted

## Context
{What forced a decision. Evidence tags required.}

## Decision
{What was decided, in one paragraph, active voice.}

## Alternatives rejected
{Each with the reason it lost.}

## Consequences
{What this makes easy, what it makes hard, what it forecloses.}

## Revisit when
{The observation that would reopen this.}
```

5. **Supersede rather than edit** where this replaces an earlier ADR: write the new one, and set the old one's status to `superseded by ADR-{NNN}`. The history is the value; overwriting it destroys the record of how the thinking changed.
6. **Report** the path and the "Revisit when" condition.

## Arguments

- `[--supersedes NNN]` — Mark an earlier ADR superseded by this one.
- `[--phase N]` — Record the phase this decision was made in. Defaults to `current_phase` from `state.json`.

## Notes

"Revisit when" is mandatory. A decision with no reopening condition becomes dogma, and dogma is what a team argues with three years later without knowing why the rule exists.

"Alternatives rejected" is where the value is concentrated. The reader a year from now does not need to be told what was decided, which the code already shows; they need to know what else was considered and why it lost, because they are about to propose one of those alternatives.
