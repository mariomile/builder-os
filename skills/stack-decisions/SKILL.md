---
name: stack-decisions
description: "Use when a product or feature needs technology choices made (frontend, backend, data, auth, hosting, background work, model provider, integrations), when TECH.md has a layer the work needs that nobody decided, or when the user asks which stack to use and why"
---

# Stack Decisions

The stack is a product decision with technical consequences: it sets what the product costs to run, how fast it ships, who can maintain it and how expensive it is to change course. An agent that picks it silently while building has made the user's most durable decision without them. This skill turns every open layer into a choice the user makes knowingly, as an informed owner rather than a tech lead: what we pick, why, what it costs, what the alternatives were and what would make us switch.

## Mode and resources

Follow [operating modes and resource paths](../../references/operating-modes.md). **Standalone:** answer the stack question for the supplied product or feature with the same decision cards, and write nothing to lifecycle state. **Lifecycle:** runs inside phase 4 SHAPE, after the flows exist and before the acceptance criteria are written; it writes `TECH.md` → Stack, the `## Stack` section of `04-spec.md` and an ADR per hard-to-reverse choice. Gate 4.8 checks the result.

Ask through the `pressure-testing` rounds: two to four options per question, one line of consequence each, a recommendation with its reason, at most four questions per round, answers by code. Read the [stack method](references/stack-method.md) for the layer catalogue, the decision card, the plain-language rules and worked examples.

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `repo.read` | What already exists: manifests, lockfiles, config, deploy files | Ask the user what exists; mark every inherited layer unverified |
| `web.search` / `web.fetch` | Current pricing, free-tier limits, licensing, regional hosting, maintenance status of each option | State each such fact as `[assumption:unvalidated]` with the page that would settle it and the date to check by; never quote a price from memory as current |
| `docs.search` | Earlier ADRs, team conventions, the user's past stack choices | Ask |
| `subagent.dispatch` | A timeboxed technical spike on a load-bearing unknown | Run the spike inline, or defer it as a named test |
| `files.read` / `files.write` | `TECH.md`, `PRODUCT.md`, the spec, ADRs | Inline answers need no write; lifecycle writes require it |

**No capability beyond files is required.** Without search the cards still compare options on structure (lock-in, operational load, fit to the drivers); only the volatile facts become stated gaps.

## Procedure

Apply only the steps the request needs. Delegate when available and authorized; otherwise run inline.

1. **Read the inputs.** `PRODUCT.md` constraints (budget, team, regulation, distribution), `TECH.md`, the bet's primary action and the flows in `DESIGN.md`. Read the repository where `repo.read` resolved: a manifest is a fact, a memory of the stack is not.

2. **List the layers this work touches**, from the catalogue in the method: only those it actually needs. Mark each **inherited** (exists and nothing in this work strains it), **open** (does not exist yet, or this work strains it) or **not needed** (with the reason). An inherited layer is kept unless a driver below breaks it; reopening one is itself an open question.

3. **Name the decision drivers** before any option: three to five properties of this product that decide between technologies, each in plain words and traced to `PRODUCT.md`, `TECH.md`, the spec or the user ("one person maintains it", "data stays in the EU", "under €50 a month until 100 customers", "the pilot ships in two weeks"). A driver nothing supports is asked in the first round. Options are judged against drivers, never against taste or popularity.

4. **Write a decision card per open layer.** Two to four real options, including the boring default and, where credible, the managed service, the do-it-later and the reuse-what-we-have. Per option: what it is in one plain sentence; what it gives this product; what it costs (money, tagged or flagged unverified; time; operational load); lock-in, meaning what leaving it later would take; and what would make us switch. Then the recommendation with the driver that decides it. Volatile facts (prices, limits, licences, deprecations) come from `web.search` with a tag, or stay flagged.

5. **Speak to the owner, not to a tech lead.** Every technical term gets a one-line gloss the first time ("a managed Postgres: a database someone else runs and backs up"). Every option's consequence is stated in product terms: money, speed, who can maintain it, what breaks if it was the wrong call, how hard it is to undo. The user should be able to defend the choice to someone else afterwards.

6. **Decide in rounds.** Layers that constrain others go first: usually backend and data, then hosting and auth, then the rest; a question that depends on an open one waits for the next round. The design kit depends on the frontend layer and is asked by `design-direction` once the frontend is settled. "Go with the recommendations" decides every recommended option in the round as the user's decision. A load-bearing unknown (can this provider meet the latency, does this library support the auth flow) becomes a timeboxed spike before the choice, with its cost in hours, or a recorded risk.

7. **Record.** Each decided layer goes into `TECH.md` → Stack (Layer, Choice, Why, Decision). A choice that is hard to reverse, surprising without context and the result of a real trade-off (data store, backend runtime, hosting, auth, model provider, usually) gets an ADR in `decisions/` with the options considered, the drivers and a `Revisit when`. In lifecycle SHAPE write the `## Stack` section of `04-spec.md`: one row per layer with its status, choice, who decided and the ADR. Move `TECH.md` → Verified only when it was checked against the repository.

8. **Hand off.** The build plan reads the decided stack and adds nothing at the level of a layer: a new framework, database, hosted service, paid API or runtime discovered mid-build sends the work back to this skill, never into the code.

Completion marker: `## STACK DECIDED` with the layer table (inherited, decided, not needed), the drivers, who decided each open layer, the ADRs written and any spike or deferred risk.

## Output Contract

Lifecycle: `TECH.md` → Stack updated, ADRs in `.builderos/decisions/`, and in `04-spec.md`:

```markdown
## Stack
**Drivers:** {three to five, each with its source}
| Layer | Choice | Status | Decided by | ADR |
|-------|--------|--------|------------|-----|
| {layer} | {choice} | inherited / decided / not needed | {person, or "—" when inherited or not needed} | {decisions/ADR-NNN-slug.md, or "—"} |
```

Gate 4.8 parses this table: every row has a status, every `decided` row names who decided it, and every ADR it links exists. Standalone output is the decision cards and the recommendation, in the requested format.

## Common Mistakes

| Mistake | Why it fails | Correct |
|---------|-------------|---------|
| Picking the stack while scaffolding the first slice | The most durable decision is made by whoever types `init` first | Open layers are decided here, before the plan |
| One option with a paragraph of praise | No choice was offered, so none was made | Two to four options, the boring default always among them |
| Comparing options on features and popularity | Nothing ties the pick to this product | Judge against the named drivers |
| A price or free-tier limit from memory | Prices change; the cost line becomes fiction | Search it with a tag, or flag it unverified with the page to check |
| Jargon the owner cannot repeat | They approve a choice they cannot defend or revisit | Gloss every term; state consequences in money, speed, maintenance and undo cost |
| Reopening every inherited layer | Turns a feature into a rewrite | Inherited stays unless a driver breaks it |
| A new paid service added during the build | A layer changed with nobody deciding | Stop the slice; decide it here, then update the plan |
