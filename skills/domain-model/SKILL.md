---
name: domain-model
description: "Models the domain with the person: entities, states and transitions with who triggers them, invariants, awkward scenarios, a logic prototype, a data sketch. Use when things change state, who-can-do-what is unclear, a schema is due, or terms clash."
---

# Domain Model

`ux-architecture` designs what the screen shows when something is empty, loading or broken. This skill designs the things the product is about: what they are, what states they move through, who moves them, what must always be true, and how they are stored. A ticket reopened after it is closed, an invoice edited after it is sent: these are product decisions, and left to the build an agent makes them silently, one `if` at a time.

**Mode.** Standalone models the supplied domain and returns the entities, the rules and the prototype. In the lifecycle it runs in phase 4 after the flows and before the visual direction and the stack (the store depends on the shape of the data), writes `DESIGN.md` → `## Domain model`, and gate 4.10 checks it. Both per [operating modes](../../references/operating-modes.md). Read the [domain method](references/domain-method.md) for the tables, the scenario technique, the logic prototype and a worked example.

## Procedure

0. **Start from what is settled.** Read the project's `DOMAIN.md`, and the schema, migrations and status enums where `repo.read` resolved. On a product that exists, model the delta: the entities this work adds, the states and transitions it adds or changes, the invariants it touches. Every existing rule it changes is named as a change, with the initiative that set it, and asked as a round question. Where an invariant tightens, count the existing rows that already break it (`db.query`) and hand the number to the spec's Impact on what exists. Done when you can list what exists, what this work changes, and the rows affected.
1. **Name the things.** From the flows, the spec scope and `PRODUCT.md`: the entities the person acts on, each with a one-line definition in the product's words, checked against `PRODUCT.md` → Language. A term used two ways, or two terms for one thing, is a question for the person ("is a *project* the same as a *workspace*?"), settled first and written into Language. Done when every term has one meaning.
2. **Give each entity its states and transitions.** Per transition: who can trigger it, the **guard** (what must be true first), and the **effect** (notifications, other entities that change, what becomes irreversible). An entity with no lifecycle gets a line saying so. Done when every transition has who, guard and effect.
3. **Write the invariants**: the rules that hold whatever happens ("a ticket has exactly one assignee or none", "a paid invoice changes only by credit note"). Each is a candidate test and, where the store allows, a constraint. Done when every rule the flows imply is written as an invariant.
4. **Stress it with scenarios.** Walk concrete, awkward stories through the model: two people move the same ticket at once; the assignee leaves the team; a payment arrives for a cancelled order; the person undoes. Done when every scenario has an answer from the model or is listed as an undecided rule.
5. **Put the rules to the person, in their words.** Every undecided rule becomes a `pressure-testing` round question: options with what each means for the people using the product, a recommendation and why ("Can a closed ticket be reopened? A. Yes, by anyone… B. Only by its author… C. A new one is opened and linked…"). Hard-to-reverse ones (deletion, money, permissions) become ADRs. Done when every undecided rule has the person's answer.
6. **Build a logic prototype** when an entity has more than two states, a guarded transition, or a rule the person hesitated on: one HTML file at `.builderos/initiatives/{initiative}/design/domain-prototype.html`, a button per action, guided scenarios from step 4, the full state shown after every click, in the product's language. The logic sits in one pure, in-memory script module the build can lift. Done when the person has played it, before accepting the model.
7. **Sketch the data.** Per entity: the fields that matter, the relationships, and what is deleted with what. The shape, short of a migration: enough for `stack-decisions` to choose a store and for the build to write the schema with every rule already decided. Done when each entity has fields, relationships and deletion behavior.
8. **Record and explain.** Write `## Domain model` in `DESIGN.md` per the [design template](../ux-architecture/references/design-template.md); at ship, phase 6 promotes it into `DOMAIN.md` (gate 6.9), and standalone work on a product with a `DOMAIN.md` proposes the edit there. Add a plain-language paragraph to the spec's `## What we chose`: the main objects and the two or three rules that will surprise someone. New terms go into `PRODUCT.md` → Language. Done when gate 4.10 passes on the file.

## Watch for

| Do | Instead of |
|---|---|
| States, transitions, who, guard, effect | A `status` string whose rules get decided inside handlers |
| Ask "can it be reopened?" as a round question | A product rule made by whoever wrote the endpoint |
| One word per thing, written in Language | Two tables for one concept |
| An in-memory prototype with buttons | A prototype wired to the real database, testing plumbing |
| The entities this work touches | Weeks modeling the whole product |
| "Not applicable" only when nothing changes state or shape | Skipping the riskiest rules on a status change |

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `repo.read` | Existing entities, schemas, migrations, enums, status fields | Ask what exists; mark the model unverified against the code |
| `db.query` | The real distribution of states and the rows that break the rules today | Model from the rules; mark counts unknown |
| `ui.render` | Showing the logic prototype | A self-contained HTML file the person opens |
| `files.read` / `files.write` | `PRODUCT.md` → Language, `DESIGN.md`, the prototype | Inline answers need no write; lifecycle writes require it |

## Output Contract

`## DOMAIN MODELED` with the entities, the transitions with who and guard, the invariants, the rules the person decided, the prototype path when built, and the data sketch.
