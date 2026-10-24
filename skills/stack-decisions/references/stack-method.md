# Stack Method

The catalogue, the card and the example behind `stack-decisions`. Read the section the current step needs. Every product name below is an example of a kind of option, never a default or a requirement.

## Layer Catalogue

List only the layers this work touches. A small feature on an existing product usually touches one or two; a new product touches most of the first six.

| Layer | The question it answers | What usually drives it | Typical option kinds (examples only) |
|-------|------------------------|------------------------|-------------------------------------|
| **Interface** | Where the user meets the product: web app, mobile, desktop, chat channel, API only | Where the ICP already works; offline needs; distribution | Server-rendered web (Next.js, Rails views), single-page app, native or cross-platform mobile, a messaging channel, no UI |
| **Backend / API** | Where the logic runs and in what language | Who maintains it; existing team skills; latency; long-running work | Full-stack framework in one repo, a separate API service, backend-as-a-service (Supabase, Firebase), serverless functions |
| **Data** | Where state lives and how it is queried | Shape of the data (relational, documents, files, vectors); consistency; residency | Managed relational database, document store, object storage, vector index, a spreadsheet for a concierge pilot |
| **Auth** | Who the user is and what they may see | B2B vs B2C; SSO demands; tenancy; compliance | Built into the backend service, a dedicated identity provider, magic links, none for an internal pilot |
| **Hosting / runtime** | Where it runs and who keeps it up; whether it gives every change a preview link | Operational load the team can carry; region; cost curve; previews per pull request (`production-setup` uses them for gate 5.17) | Platform-as-a-service (Vercel, Render, Fly), a cloud provider directly, the user's own servers |
| **Background work** | Jobs, schedules, queues, retries | Anything slower than a request, anything scheduled | Cron on the host, a managed queue, a workflow engine, a database-backed job table |
| **Model / AI** | Which model provider and how it is called | Quality on the eval set; latency; cost per call; data handling terms | A hosted model API, an open model on managed inference, no model (rules first) |
| **Integrations** | Email, payments, messaging, the ICP's existing tools | What the flows send or receive (`DESIGN.md` → Messages); business messaging channels need approved templates | Transactional email service, payment processor, the tool's own API, a manual export for the pilot |
| **Payments and tax** | How the product takes money, and who issues invoices and handles VAT | Product for sale (`PRODUCT.md` → Revenue model); where customers are; who does the admin. Gate 4.14 wants this row on a product for sale | A merchant of record (sells on your behalf, handles VAT and invoices in every country, higher fee per sale); a payment processor plus your own invoicing (lower fee; in Italy, e-invoices through SdI for Italian customers, and VAT where an EU consumer lives through OSS, usually with an accountant); manual invoices for the first ten customers. Tax facts are verified with an accountant, never decided from the card |
| **Analytics** | How the phase 2 metric gets measured | The tracking plan; `references/analytics-contract.md` | An existing provider, events in the product database, none until the pilot |
| **Design kit** | The component library and tokens | Decided by `design-direction`, after the interface and frontend are settled | — |

**Not needed is an answer.** A pilot that a person runs by hand needs no queue. Write the reason, so nobody adds one "for later".

## Decision Drivers

A driver is a property of this product that would make one option right and another wrong. Good drivers are specific and checkable; "scalable" and "modern" are not drivers.

| Weak | Driver |
|------|--------|
| Scalable | 200 customers in year one `[doc:…]`; nothing here needs more than one database |
| Cheap | Under €50 a month until revenue, from the budget in `PRODUCT.md` |
| Fast to build | The pilot ships by {date}; one person builds it |
| Secure | Customer call recordings: EU residency and deletion on request `[doc:…]` |
| Easy to maintain | Mario maintains it alone, in TypeScript, with an agent |

Three to five drivers. If two options tie on every driver, the more reversible one wins, and the card says so.

## The Decision Card

One card per open layer, written for the owner:

```markdown
**Q{n} — {Layer}: {the question in plain words}.**
Drivers that decide it: {the two or three that matter here}.

- **A. {option}** ({one-line gloss}): gives {what it gives this product}. Costs {money with tag or "unverified, check {page} by {date}"}, {time}, {operational load}. Leaving it later: {what that would take}. We'd switch if {condition}.
- **B. {option}** (…): …
- **C. {option}** (…): …
→ Recommended: **{X}**, because {the deciding driver, with its source}.
```

Rules for the card:

- **The boring default is always an option.** The most common, best-documented choice for this kind of product is the baseline every other option has to beat.
- **Consequences in product terms.** Money per month at the expected scale, days to the first slice, who can fix it at 2 a.m., what it takes to undo.
- **Gloss every term once.** "Serverless functions: code that runs only when called, so you pay per request and there is no server to keep up." If the gloss takes more than a line, the option is probably wrong for an owner who is not an engineer.
- **Lock-in is a number or a sentence, not a feeling.** "Leaving means rewriting the 12 database queries and the auth flow, about a week" beats "some lock-in".
- **Volatile facts carry a tag or a flag.** Prices, free-tier limits, rate limits, licences and maintenance status change; search them, or say they are unverified.

## Worked Example

A solo builder, a B2B tool for agencies, phase 4 of a new product; the pilot is five agencies for four weeks; `PRODUCT.md` says EU customers and a budget of a few hundred euros a month until revenue.

**Drivers:** one person maintains it in TypeScript `[doc:user-2026-10-20-team]`; EU data residency `[doc:user-2026-10-20-customers]`; pilot live in three weeks `[doc:…]`.

**Round 1** (backend and data constrain everything else, so they go first):

```markdown
**Q1 — Backend and data: where does the logic run and where does the data live?**
Drivers that decide it: one maintainer, EU residency, three weeks.

- **A. Full-stack web framework + managed Postgres** (one codebase for pages and API; a database someone else runs and backs up): one repo, one language, the most documented path. Costs a small monthly fee for the database, unverified, check the provider's EU pricing page before acceptance. Leaving later: move the database with a dump; the framework stays. We'd switch if background jobs grow past what the host allows.
- **B. Backend-as-a-service** (database, auth and storage as one hosted product): the fastest first slice; auth comes included. Costs a free tier then a monthly plan, unverified. Leaving later: auth and storage are its own, so about a week to rewrite them. We'd switch if pricing or residency change.
- **C. Separate API service + database** (the backend as its own program): clean separation, more to run. Costs a second deployment and twice the setup. Leaving later: easy. Only worth it if another client (mobile, partners) will call the API this year, which nothing in PRODUCT.md says.
→ Recommended: **B**, because it covers data and auth in one EU-hosted service and the three-week driver dominates; A is the fallback if its residency option is not confirmed.
```

Round 2 then asks hosting, background work and the model provider, which depend on the answer; the design kit goes to `design-direction` once the interface layer is settled.

**Recorded:** `TECH.md` → Stack gains the rows; `decisions/ADR-004-backend-and-data.md` holds the card, the drivers, "chosen by Mario, 2026-10-20" and `Revisit when: the pilot ends, or monthly cost passes €200`; `04-spec.md` → Stack lists every layer with its status.

## Spikes

A spike is a timeboxed proof that answers one load-bearing unknown before a layer is chosen: "can the voice provider return a first token under 500 ms from the EU", "does the backend service support SAML for the two enterprise pilots". It has a question, a timebox in hours, a pass condition and a throwaway location. Its result goes into the card as a tagged fact. A spike that grows past its timebox becomes the answer "unknown", recorded as a risk with an owner.

## Feature Track

On an existing product almost every layer is inherited. Read them from the repository, write them as inherited, and ask only about what this feature adds: a new integration, a queue, a model provider. A feature that strains an inherited layer (the database cannot hold the new volume, the host has no scheduled jobs) reopens that layer with a card, and the reason is a driver, not a preference.
