---
name: domain-model
description: "Use when a product or feature has things that change state (a ticket, an order, a booking, a subscription), when the business rules about who can do what and when are unclear, when the data model or schema has to be decided, or when the product's terms mean different things to different people"
---

# Domain Model

`ux-architecture` designs what the screen shows when something is empty, loading or broken. This skill designs the things the product is about: what they are, what states they move through, who moves them, what must always be true, and how they are stored. A ticket that can be reopened after it is closed, an invoice that can be edited after it is sent: these are product decisions. Left to the build, an agent makes them silently, one `if` at a time.

## Mode and resources

Follow [operating modes and resource paths](../../references/operating-modes.md). **Standalone:** model the supplied domain and return the entities, the rules and the prototype; write no lifecycle state. **Lifecycle:** runs in phase 4 SHAPE after the flows, before the visual direction and the stack (the data store depends on the shape of the data). Writes `DESIGN.md` → `## Domain model`; gate 4.10 checks it.

Ask through the `pressure-testing` rounds. Read the [domain method](references/domain-method.md) for the tables, the scenario technique, the logic prototype and a worked example.

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `repo.read` | Existing entities, schemas, migrations, enums, status fields | Ask what exists; mark the model unverified against the code |
| `db.query` | The real distribution of states and the rows that break the rules today | Model from the rules; mark counts unknown |
| `ui.render` | Showing the logic prototype | A self-contained HTML file the user opens |
| `files.read` / `files.write` | `PRODUCT.md` → Language, `DESIGN.md`, the prototype file | Inline answers need no write; lifecycle writes require it |

## Procedure

1. **Name the things.** From the flows, the spec scope and `PRODUCT.md`: the entities the user acts on, each with a one-line definition in the product's words. Check every term against `PRODUCT.md` → Language. A term used two ways, or two terms for one thing, is a question for the user ("is a *project* the same as a *workspace*?"), settled before anything else, then written into Language.

2. **Give each entity its states and transitions.** For every entity with a lifecycle: the states, and per transition who can trigger it, what must be true first (the guard), and what happens as a result (the effect: notifications, other entities that change, what becomes irreversible). An entity with no lifecycle gets a line saying so.

3. **Write the invariants.** The rules that must hold whatever happens: "a ticket has exactly one assignee or none", "a paid invoice is never edited, only credited". Each is a candidate test and, where code allows it, a constraint in the database.

4. **Stress it with scenarios.** Walk concrete, awkward stories through the model: two people move the same ticket at once; the assignee leaves the team; a payment arrives for a cancelled order; the user undoes. Each scenario the model cannot answer is a business rule nobody has decided.

5. **Put the rules to the user, in their words.** Every undecided rule from step 4 becomes a question in the round format: options with what each means for the people using the product, a recommendation and why. "Can a closed ticket be reopened? A. Yes, by anyone… B. Only by its author… C. No, a new one is opened and linked…". These are product decisions; the user makes them. Hard-to-reverse ones (deletion, money, permissions) become ADRs.

6. **Build a logic prototype** when an entity has more than two states, a transition with a guard, or a rule the user hesitated on: one HTML file with a button per action, guided scenarios from step 4, and the full state shown after every click, in the product's language. The logic sits in one pure script module that the build can lift. The user plays it before accepting the model. Store it at `.builderos/initiatives/{initiative}/design/domain-prototype.html`.

7. **Sketch the data.** Per entity: the fields that matter, the relationships (one-to-many, many-to-many) and what is deleted with what. Not a migration, the shape: enough for `stack-decisions` to choose a store and for the build to write the schema without inventing a rule.

8. **Record and explain.** Write `## Domain model` in `DESIGN.md` per the [design template](../ux-architecture/references/design-template.md). Then a short plain-language paragraph for the spec's `## What we chose`: what the product's main objects are and the two or three rules that will surprise someone. New terms go into `PRODUCT.md` → Language.

Completion marker: `## DOMAIN MODELED` with the entities, the transitions with who and guard, the invariants, the rules the user decided, the prototype path when built, and the data sketch.

## Common Mistakes

| Mistake | Why it fails | Correct |
|---------|-------------|---------|
| A `status` string with no transitions written | Every rule about it gets decided inside a handler | States, transitions, who, guard, effect |
| Deciding "can it be reopened?" in code | A product rule made by whoever wrote the endpoint | Ask it as a round question, record the answer |
| Two words for one thing in the spec | The code gets two tables, the users get confused | Settle the term, write it in Language |
| A logic prototype wired to the real database | It tests the plumbing, not the rules | In-memory, pure module, buttons |
| Modeling every entity in the product | Weeks of modeling before a slice | Only the entities this work touches |
| "Not applicable" on a feature that changes a status | The riskiest rules go unwritten | Not applicable only when nothing changes state or shape |
