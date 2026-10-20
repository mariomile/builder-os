# Domain Method

The tables, scenarios, prototype rules and example behind `domain-model`. Read the section the current step needs.

## Tables

```markdown
### Entities
| Entity | Means | Lifecycle |
|--------|-------|-----------|
| Ticket | A piece of work someone is accountable for | yes |
| Comment | A note on a ticket; never edited after 10 minutes | no |

### Transitions: Ticket
| From | To | Who | Only if | Then |
|------|----|-----|---------|------|
| todo | in progress | assignee | it has an assignee | the assignee is notified once |
| in review | done | reviewer, not the assignee | every checklist item is ticked | the reporter is notified; reopening needs a new ticket |

### Invariants
- A ticket has exactly one assignee or none.
- A done ticket's fields are read-only.

### Data
| Entity | Key fields | Relations | Deleted with |
|--------|-----------|-----------|--------------|
| Ticket | title, state, assignee, reporter, team | many comments; one team | its team (soft delete) |
```

## Scenarios

The model is finished when awkward stories stop producing new questions. Run these families against every entity with a lifecycle:

| Family | Ask |
|--------|-----|
| Concurrency | Two people trigger conflicting transitions at the same moment. Who wins, what does the loser see? |
| People change | The owner leaves, loses permission, or is deleted mid-lifecycle |
| Going back | Undo, reopen, revert, cancel after partial completion |
| Money and time | A payment, a deadline or a scheduled job arrives in a state that no longer expects it |
| Volume | Zero, one, many, too many children (comments, items, members) |
| Outside world | An integration sends an update the model has no state for |

Write each scenario as one line with its answer, or as the round question it raised.

## Logic Prototype

One self-contained HTML file the user opens with a double click. It answers "do these rules feel right?", not "does the backend work".

- **The question at the top**, in a visible paragraph: what model is being tested and which rules are new.
- **A pure module** in a single `<script>` block: a reducer `(state, action) => state` or an explicit state machine, no DOM inside it. The page calls it; nothing flows back. This module is the part the build may lift.
- **Free play:** one button per action, disabled when the guard forbids it, with the reason shown on hover.
- **Guided scenarios:** tabs that replay the stories from the Scenarios step, one step per click.
- **State always visible:** after every action, the whole state rendered in the product's words, plus a log of what happened and who was notified.
- **No persistence, no network.** In memory only.

The user plays it before the model is accepted. A rule they change while playing goes back into the Transitions table and, if heavy, into an ADR.

## Worked Example

Rockys-like issue tracker, phase 4, after the flows. The scenarios raise three rules nobody decided; one round:

```markdown
**Q1 — Reopening.** A ticket is done and the bug comes back.
- **A. Reopen it:** history stays in one place; "done" counts in reports can go down.
- **B. Open a new linked ticket:** reports stay stable; the history is split across two tickets.
→ Recommended: **B**, because the phase 2 metric counts tickets closed per week and A would make it move backwards.

**Q2 — Who closes.** …
**Q3 — Assignee leaves the team.** …
```

Then the prototype (`design/domain-prototype.html`) with tabs "bug comes back", "assignee leaves", "two reviewers at once". The user plays it, changes Q3 after the second tab, and the model is recorded.

## Not Applicable

Write `**Domain model:** not applicable, {reason}` only when the work changes no entity's states, fields or relations: a copy change, a new chart over existing data, a style pass. A new status, a new field with rules, or a new relation is never "not applicable".
