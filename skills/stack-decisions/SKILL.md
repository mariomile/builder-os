---
name: stack-decisions
description: "Decides technology with the person in plain language: each open layer as a card with what, why, cost, lock-in and alternatives, plus ADRs for the hard-to-reverse ones. Use when a product needs technology choices or someone asks which stack."
---

# Stack Decisions

The stack is a product decision with technical consequences: what the product costs to run, how fast it ships, who can maintain it, what changing course costs. An agent that picks it silently while building has made the person's most durable decision without them. This skill turns every open **layer** into a choice the person makes knowingly, as an informed owner rather than a tech lead: what we pick, why, what it costs, the alternatives, and what would make us switch.

**Mode.** Standalone answers the stack question for the supplied product or feature with the same decision cards. In the lifecycle it runs inside phase 4 after the flows and before the acceptance criteria, writes `TECH.md` → Stack, the spec's `## Stack` and an ADR per hard-to-reverse choice, and gate 4.8 checks the result. Both per [operating modes](../../references/operating-modes.md). Read the [stack method](references/stack-method.md) for the layer catalogue, the decision card, the plain-language rules and worked examples.

## Procedure

1. **Read the inputs.** `PRODUCT.md` constraints (budget, team, regulation, distribution), `TECH.md`, the bet's primary action, the flows and the data sketch in `DESIGN.md` (the shape of the data drives the data layer), and the repository where `repo.read` resolved: a manifest is a fact, a memory of the stack is a guess. Done when you can say what exists and what this work asks of it.
2. **List the layers this work touches** from the catalogue, each **inherited** (exists, and nothing in this work strains it), **open** (missing, or strained by this work) or **not needed** (with the reason); a product for sale always needs payments and tax (gate 4.14). An inherited layer stays unless a driver breaks it, and reopening one is itself an open question. Done when every catalogue layer this work could touch has a status.
3. **Name the decision drivers** before any option: three to five properties of this product that decide between technologies, in plain words, each traced to `PRODUCT.md`, `TECH.md`, the spec or the person ("one person maintains it", "data stays in the EU", "under €50 a month until 100 customers", "the pilot ships in two weeks"). A driver nothing supports goes in the first round. Done when every driver has its source.
4. **Write a decision card per open layer.** Two to four real options, the boring default always among them and, where credible, the managed service, the do-it-later and the reuse-what-we-have. Per option: what it is in one plain sentence; what it gives this product; what it costs (money, tagged or flagged unverified; time; operational load); lock-in, meaning what leaving later would take; what would make us switch. Then the recommendation and the driver that decides it. Volatile facts (prices, limits, licences, deprecations) come from `web.search` with a tag, or stay flagged. Done when every open layer has a card judged against the drivers.
5. **Speak to the owner.** Every technical term gets a one-line gloss the first time ("a managed Postgres: a database someone else runs and backs up"); every consequence is stated in product terms: money, speed, who can maintain it, what breaks if it was the wrong call, how hard it is to undo. Done when the person could defend each option's trade-off to someone else.
6. **Decide in rounds** per `pressure-testing`. Layers that constrain others go first (usually backend and data, then hosting and auth, then the rest); a dependent question waits for the next round. The design kit depends on the frontend and is asked by `design-direction` once that is settled. A load-bearing unknown (can this provider meet the latency, does this library support the auth flow) becomes a timeboxed spike with its cost in hours, or a recorded risk. Done when every open layer has the person's choice.
7. **Record.** Each decided layer goes into `TECH.md` → Stack (Layer, Choice, Why, Decision). A choice that is hard to reverse, surprising without context and a real trade-off (data store, backend runtime, hosting, auth, model provider, usually) gets an ADR in `decisions/` with the options, the drivers and a `Revisit when`. In the lifecycle write the spec's `## Stack` per the Output Contract. `TECH.md` → Verified moves only after a check against the repository. Done when the table, `TECH.md` and every ADR agree.
8. **Summarize for acceptance.** Each decided layer gets a line in the spec's `## What we chose`: what, why, the alternative set aside, the cost, what would make us change it. Done when every decided layer has its line.
9. **Hand off.** The build plan reads the decided stack and adds nothing at the level of a layer. A **structural** addition found mid-build (a framework, a database, a hosted service, a paid API, a runtime) pauses the slice and returns here as a card; plan and `TECH.md` are updated before it resumes. A utility library is the build's call, listed in the review with its reason. Done when the build plan names the stack it uses.

## Watch for

| Do | Instead of |
|---|---|
| Decide open layers here, before the plan | Picking the stack while scaffolding the first slice |
| Two to four options, the boring default among them | One option with a paragraph of praise |
| Judge against the named drivers | Comparing features and popularity |
| Search a price with a tag, or flag it with the page to check | A price or free-tier limit from memory |
| Gloss every term; consequences in money, speed, maintenance and undo cost | Jargon the owner cannot repeat |
| Keep inherited layers unless a driver breaks them | Reopening every layer, turning a feature into a rewrite |

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `repo.read` | What already exists: manifests, lockfiles, config, deploy files | Ask the person what exists; mark every inherited layer unverified |
| `web.search` / `web.fetch` | Current pricing, free-tier limits, licensing, regional hosting, maintenance status of each option | State each such fact as `[assumption:unvalidated]` with the page that would settle it and the date to check by; a price from memory is a guess, labeled so |
| `docs.search` | Earlier ADRs, team conventions, the person's past stack choices | Ask |
| `subagent.dispatch` | A timeboxed technical spike on a load-bearing unknown | Run the spike inline, or defer it as a named test |
| `files.read` / `files.write` | `TECH.md`, `PRODUCT.md`, the spec, ADRs | Inline answers need no write; lifecycle writes require it |

**No capability beyond files is required.** Without search the cards still compare options on structure (lock-in, operational load, fit to the drivers); only the volatile facts become stated gaps.

## Output Contract

`## STACK DECIDED` with the layer table (inherited, decided, not needed), the drivers, who decided each open layer, the ADRs written and any spike or deferred risk.

Lifecycle: `TECH.md` → Stack updated, ADRs in `.builderos/decisions/`, and in `04-spec.md`:

```markdown
## Stack
**Drivers:** {three to five, each with its source}
| Layer | Choice | Status | Decided by | ADR |
|-------|--------|--------|------------|-----|
| {layer} | {choice} | inherited / decided / not needed | {person, or "—" when inherited or not needed} | {decisions/ADR-NNN-slug.md, or "—"} |
```

Gate 4.8 parses this table: every row has a status, every `decided` row names who decided it, every ADR it links exists, and `## What we chose` is present. Standalone output is the decision cards and the recommendation, in the requested format.
