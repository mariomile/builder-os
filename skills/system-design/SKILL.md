---
name: system-design
description: "Designs the backend before the code: components, contracts, timeouts and retries, the defaults that keep it scalable, a threat model with tested mitigations. Use when a product needs a backend, an API or a data store, or a security or scale review."
---

# System Design

`stack-decisions` chooses what the product is built with. This skill decides how it fits together, how it fails, how it grows and who could break it. Left to the build, the architecture is whatever the first slice needed, every external call waits as long as its library's default, and another customer's data is one missing filter away. A tier-1 engineer writes this down before the code, on a page the next engineer reads in five minutes.

**Mode.** Standalone returns the architecture, the failure plan, the scale defaults and the threat model for the supplied product or feature, in the requested format. In the lifecycle it runs in phase 4 after `domain-model` and `stack-decisions` (the entities and the chosen layers are its inputs) and before the acceptance criteria are final; it writes `04-spec.md` → `## Architecture` and `## Threat model` and the criteria they cite, gates 4.18 and 4.19 check them, and phase 5 reviews the diff against the threat model (5.13) and measures the performance budget (5.14). Both per [operating modes](../../references/operating-modes.md). Read the [system method](references/system-method.md) for the templates, the failure defaults, the scale defaults with their reasons, the threat catalogue and a worked example.

## Procedure

1. **Read the inputs.** The domain model and data sketch in `DESIGN.md`, the spec's `## Stack` and flows, `TECH.md` (Stack, Map, Technical constraints, Operations), `PRODUCT.md` → `## Business` for the stage and the expected users, and the code where `repo.read` resolved: routes, schema, indexes, middleware, how secrets are read. Done when you can say what exists, what this work adds, and how many users and records the stage expects.
2. **Set the scope of the design.** Work with no server, no stored data and no input written by other people (copy, a static page, a style change) writes `**Architecture:** not applicable, {reason}` and `**Threat model:** not applicable, {reason}` and stops here. A feature on an existing system designs what it adds or strains and names the rest as inherited. Done when what is designed and what is inherited are both named.
3. **Draw the components.** Each component this work creates or changes (a service, a worker, a scheduled job, a database, a queue, a third-party service): its responsibility, the entities it owns, what it talks to and by which mechanism (a call, an event, a shared table). Each entity has one owning component. State lives in the database or a cache, so any server can answer any request. Work slower than the latency budget (an export, a batch of emails, a third-party call per row) runs as a background job whose status the user can see. Done when every entity in the domain model has one owner and every arrow names its mechanism.
4. **Write the contracts.** Every interface this work exposes or another party calls (an endpoint, a webhook, an event, an export): input and output shapes, errors in one format with a code the client can act on and no internal detail, a page size and cursor on every list, and a version once a customer or another team consumes it. Done when each contract has shapes, errors and, for a list, its paging.
5. **Plan every external call for failure.** Every call that leaves the process (a third-party API, the model provider, email, payments, another service): a timeout in seconds; retries with backoff only where repeating is safe; an idempotency key on every write that can be retried (a charge, an order, a message); what the user sees when it fails. Done when every external call has its timeout, retry rule, idempotency and failure behavior.
6. **Apply the scale defaults.** Six choices that cost little now and a rewrite later, each written as how this design does it or why it does not apply: an **owner key** on every row and in every query; **paginated lists**; an **index** behind every query the flows run; **idempotent writes** wherever a retry can happen; **slow work off the request**; **reversible migrations** (expand, migrate, contract). They hold at every stage and are not scale work: gate 4.15 rejects building for load nobody has, and these keep the door open without building it. Then `**Capacity:**`: the expected load at this stage from `## Business` (users, peak requests per minute, rows after a year), tagged, and the design target at ten times that. Done when all six defaults have a how or a reason and the capacity has numbers.
7. **Model the threats.** Name the trust boundaries (browser to server, webhooks and uploads coming in, server to database, admin tools, the model's inputs). Per boundary, the threats from the method's catalogue that apply, each with a mitigation and the acceptance criterion that tests it. Four always get a row: **another user's or customer's data**, tested by a request for a record the caller may not see, which fails; **untrusted input**, validated at the boundary with parameterized queries and encoded output; **abuse**, with rate limits on sign-in, sign-up and every expensive or paid endpoint; **secrets**, kept in the host's secret store, read on the server, with how they rotate. With model output, the injection surfaces from `agent-design` are this table's model boundary, referenced by name. Done when every row has a mitigation and a criterion that exists, or the reason it does not apply.
8. **Put the trade-offs to the person.** A choice with a real cost on both sides (synchronous or background, one database or two, a rate limit that could block a real customer, where the data lives) is a `pressure-testing` round question with a recommendation in plain words: what it costs, what it protects, what undoing it takes. A choice with one sound answer is written, not asked. Done when every trade-off has the person's answer.
9. **Record.** Write `## Architecture` and `## Threat model` in `04-spec.md` per the method's template; add the criteria they cite to `## Acceptance criteria`, where phase 5 maps a test to each; make sure the performance row of `## Quality bar` carries a budget with a number for the primary action, which gate 5.14 measures; add one line per decided trade-off to `## What we chose`. At ship, components and contracts that outlive the initiative go into `TECH.md` → Map. Done when gates 4.18 and 4.19 pass on the file.

## Watch for

| Do | Instead of |
|---|---|
| One owner per entity, a mechanism on every arrow | Boxes joined by unlabeled lines |
| A timeout and a failure behavior on every external call | The library default, which may wait for minutes |
| An idempotency key on every retried write | A double charge on the first network blip |
| The scale defaults now, the load test after PMF | Sharding for ten users, or a table with no owner key |
| Every access rule tested by a request that has to fail | "Users only see their own data" with no test behind it |
| Rate limits on sign-in, sign-up and every paid call | Learning about abuse from the invoice |
| Secrets in the host's secret store, read on the server | A key in the client bundle or the repository |

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `repo.read` | Current components, routes, schema, indexes, middleware, secrets handling | Ask the person; mark the architecture as designed without code access |
| `db.query` | Real table sizes, slow queries, missing indexes, rows with no owner key | Estimate from `## Business`, tagged as an estimate |
| `logs.query` | Current latency, error rates and traffic peaks | Set the budget and capacity from the stage, marked unmeasured |
| `web.search` | Provider limits, default timeouts, security advisories | State them as unverified with the page to check |
| `files.read` / `files.write` | The spec, `DESIGN.md`, `TECH.md` | Inline answers need no write; lifecycle writes require it |

## Output Contract

`## SYSTEM DESIGNED` with the components and what each owns, the contracts, every external call with its timeout, retry, idempotency and failure behavior, the six scale defaults, the capacity, the trust boundaries with every threat's mitigation and criterion, and the trade-offs the person decided. The lifecycle artifact is `04-spec.md` → `## Architecture` and `## Threat model`; gates 4.18 and 4.19 parse their subsections, tables and bold labels.
