# System Method

The templates, defaults and catalogue behind `system-design`. Product and vendor names are examples of a kind of option, never defaults.

## Components

A component is something that runs or stores on its own: a web server, a worker, a scheduled job, a database, a cache, a queue, a third-party service. A module inside one process is a seam (`delivery-discipline`), not a component.

- **One owner per entity.** The component that owns an entity is the only one that writes it. Another component that needs it asks the owner or reads a copy it is told about; two writers to one table is a race waiting for traffic.
- **The mechanism on every arrow.** A synchronous call (the caller waits, so it shares the caller's latency budget and its failures), an event or a queue (the caller moves on, so the work needs a status and a retry), or a shared table (the cheapest and the most coupled; acceptable inside one service).
- **No state in a server's memory.** Sessions, carts, progress and caches live in the database or a shared cache, so a second server, a restart or a deploy loses nothing.
- **Slow work off the request.** Anything that can exceed the latency budget runs as a job: the request records it and returns, the user sees its status, a failure is retried by the job runner and lands somewhere a person sees after the last retry.

## Contracts

- **Errors.** One shape across the product (`{ "error": { "code": "report_not_found", "message": "…" } }`), a code the client can branch on, a status that matches, and no stack trace, query or internal identifier in the body.
- **Lists.** Every list endpoint takes a page size with a ceiling and returns a cursor. An unpaginated list works with ten rows and times out with ten thousand.
- **Validation.** Input is checked against a schema at the boundary; unknown fields are rejected or dropped by rule, not by accident.
- **Versions.** Once a customer, a mobile app or another team consumes a contract, a breaking change ships as a new version beside the old one, with the date the old one goes away (gate 4.11, contracts).

## External Calls

| Property | Default to start from |
|----------|-----------------------|
| Timeout | Set explicitly on every call: a few seconds for an interactive call, longer for a job; the library default is often unbounded |
| Retry | Only where repeating is safe (reads, idempotent writes), with exponential backoff and jitter, at most 3 attempts in a request, more in a job |
| Idempotency | A key per logical operation (the order id, a client-generated request id) sent to providers that accept one, and stored so a repeated request returns the first result |
| Failure | What the user sees and what is kept: an error with a retry, a queued job with its status, or the product working without that part |
| Circuit | After repeated failures, stop calling for a while and serve the degraded behavior, so a provider outage does not become yours |

## Scale Defaults

Each is cheap on day one and expensive to retrofit. They are what keeps a product able to grow; building for load nobody has (sharding, a cache layer, a second region, microservices) waits for PMF and a load test that says it is needed.

| Default | How | Why it is cheap now and expensive later |
|---------|-----|-----------------------------------------|
| Owner key on every row | Every row carries the tenant, workspace or user it belongs to, and every query filters on it from the session, never from the request body | Adding it later means backfilling every table and auditing every query; missing it once is a data leak |
| Paginated lists | Cursor and page size on every list, in the API and the interface | Clients built on a full list break when the list is paginated |
| Indexed queries | An index for every filter and sort the flows run, checked against the query plan on realistic data | A missing index is invisible at 100 rows and an outage at 1 million |
| Idempotent writes | An idempotency key on every write a client, a job or a webhook can repeat | Duplicate charges, emails and records are expensive to clean up and to explain |
| Slow work off the request | A job runner for anything that can exceed the budget | Moving work to a job later changes the contract and the interface |
| Reversible migrations | Expand (add the new shape), migrate (backfill, dual write), contract (remove the old) as separate releases; each step can be rolled back | A destructive migration in one step leaves no way back when it goes wrong |

**Capacity.** Expected load at the current stage, from `PRODUCT.md` → `## Business` or the logs: users, peak requests per minute on the primary action, rows in the largest table after a year. The design target is ten times that. A choice that only breaks above ten times is fine for now and recorded as such; a choice that breaks below it is redesigned. After PMF, gate 6.10 asks for `**Load tested:**` at that target.

## Threat Catalogue

Per trust boundary, the threats that usually apply. The first four rows are always written; the rest where the product has the surface.

| Threat | Mitigation | Criterion that tests it |
|--------|------------|-------------------------|
| **Another user's or customer's data** (broken access control, the most common serious web flaw) | Authorization on the server for every read and write, from the session, scoped by the owner key; identifiers that cannot be enumerated where exposure matters | A request for a record of another workspace returns not-found, for every endpoint that takes an id |
| **Untrusted input** (injection, cross-site scripting, oversized or malformed payloads) | Schema validation at the boundary, parameterized queries, output encoding by the framework, upload type and size limits, a content security policy | A payload with markup or a query fragment is stored and shown as text; an upload over the limit is refused with a message |
| **Abuse** (credential stuffing, sign-up spam, scraping, running up paid calls) | Rate limits per account and per address on sign-in, sign-up, password reset and every endpoint that costs money; a spending cap on paid providers | The sixth failed sign-in in a minute is refused and logged |
| **Secrets** (keys in the client, in the repository, in logs) | The host's secret store, read on the server only; the secret scan in the guardrail (gate 5.10); rotation written down | The client bundle contains no provider key; the secret scan runs on every change |
| Session theft | Secure, http-only, same-site cookies; short sessions with refresh; re-authentication for sensitive changes | Changing the email asks for the password |
| Forged requests from another site | Same-site cookies plus a token on state-changing requests where cookies authenticate | A state-changing request from another origin is refused |
| Webhooks and callbacks | Signature verification, timestamp window, idempotent handling | An unsigned or replayed webhook is refused |
| Server-side requests to user-supplied URLs | An allow-list of hosts, no internal addresses | A URL pointing at an internal address is refused |
| Data exposure in errors and logs | Personal data and secrets redacted from logs and error bodies | The error for a failed payment shows no card data |
| Admin and support tools | Separate roles, every action logged with who | A support agent's view of a customer is recorded |
| Model inputs | The injection surfaces of `agent-design` (gate 4.16) | Their must-pass eval cases |

Mitigations that a machine can check go into the guardrail: the dependency audit, the secret scan and static analysis (gate 5.10). What a machine cannot check is a criterion with a test, and the security review in phase 5 (gate 5.13) reads the diff against this table.

## Templates

```markdown
## Architecture
### Components
| Component | Responsibility | Owns | Talks to |
|-----------|----------------|------|----------|
| {name} | {one line} | {entities} | {component: call / event / shared table} |

### Contracts
| Contract | Shapes | Errors | Lists |
|----------|--------|--------|-------|
| {endpoint, webhook, event, export} | {input → output} | {codes} | {page size and cursor, or "not a list"} |

### External calls
| Call | Timeout | Retry | Idempotency | When it fails |
|------|---------|-------|-------------|---------------|
| {provider: operation} | {seconds} | {attempts with backoff, or "none: not safe to repeat"} | {the key, or "read only"} | {what the user sees} |
{or one line: "none: nothing leaves the process"}

### Scale defaults
| Default | How | Not applicable because |
|---------|-----|------------------------|
| Owner key on every row | {} | {} |
| Paginated lists | {} | {} |
| Indexed queries | {} | {} |
| Idempotent writes | {} | {} |
| Slow work off the request | {} | {} |
| Reversible migrations | {} | {} |

**Capacity:** {expected load at this stage, tagged} · designed for {ten times that}

## Threat model
**Boundaries:** {each trust boundary, in one line}
| Boundary | Threat | Mitigation | Criterion |
|----------|--------|------------|-----------|
| {boundary} | {threat} | {mitigation} | {acceptance criterion number, or "not applicable, {reason}"} |
```

Gate 4.18 checks the four subsections, a timeout with a number on every external call, all six defaults and a capacity with numbers. Gate 4.19 checks the boundaries, a row for each of the four standing threats, a mitigation on every row and a criterion that exists. Either section can be `**Architecture:** not applicable, {reason}` or `**Threat model:** not applicable, {reason}` when there is no server, no stored data and no input written by other people.

## Worked Example

A B2B reporting tool: workspaces import ad-spend CSVs and share weekly reports. Stage pre-PMF, 40 workspaces expected this quarter.

```markdown
## Architecture
### Components
| Component | Responsibility | Owns | Talks to |
|-----------|----------------|------|----------|
| Web app | Pages, sign-in, the report editor | — | API: call |
| API | Every read and write, authorization | Workspace, Report, Import | Postgres: shared table; Job runner: event |
| Job runner | Parses imports, renders PDFs, sends the weekly email | ImportRow | Postgres: shared table; Email provider: call |
| Postgres (managed) | All data, EU region | — | — |

### Contracts
| Contract | Shapes | Errors | Lists |
|----------|--------|--------|-------|
| GET /reports | workspace from session → reports | 401 unauthenticated | 50 per page, cursor |
| POST /imports | CSV up to 20 MB → import id and status | 413 too_large, 422 bad_columns | not a list |

### External calls
| Call | Timeout | Retry | Idempotency | When it fails |
|------|---------|-------|-------------|---------------|
| Email provider: send weekly report | 10 s | 5 attempts with backoff, in the job | report id + week | the report shows "email not sent, retry" |

### Scale defaults
| Default | How | Not applicable because |
|---------|-----|------------------------|
| Owner key on every row | workspace_id on every table, set from the session; a query helper adds the filter | |
| Paginated lists | cursor on /reports and /imports | |
| Indexed queries | (workspace_id, created_at) on reports and imports | |
| Idempotent writes | import keyed by file hash per workspace; email keyed by report and week | |
| Slow work off the request | parsing, PDF and email in the job runner; the import shows its progress | |
| Reversible migrations | expand and contract in separate releases | |

**Capacity:** 40 workspaces, 2 imports a week each, 300k rows a year `[doc:business-plan]` · designed for 400 workspaces and 3M rows

## Threat model
**Boundaries:** browser → API; CSV upload → job runner; API → Postgres; job runner → email provider
| Boundary | Threat | Mitigation | Criterion |
|----------|--------|------------|-----------|
| browser → API | another workspace's report requested by id | workspace_id from the session on every query; 404 for other workspaces | 14 |
| CSV upload → job runner | malformed or hostile input: formulas, markup, 2 GB files | 20 MB limit, cells stored as text, formulas neutralized on export | 15, 16 |
| browser → API | abuse: credential stuffing, mass sign-ups | 5 sign-ins a minute per account and address; sign-up rate limit | 17 |
| API → email provider | secrets: the provider key | host secret store, server only; secret scan in CI; rotated yearly | 18 |
```
