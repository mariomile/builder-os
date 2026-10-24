---
name: production-setup
description: "Puts a product online from its first slice: production and preview environments, domain and HTTPS, secrets, a trusted email sender, live keys, legal pages, a link to try every build. Use when deploying, going live, setting up hosting or a domain."
---

# Production Setup

Going live is the step that bites a new product at the end: a domain that will not verify, email landing in spam, test keys in production, no cookie consent. Teams that ship well go to production on day one, behind a password, and every build after that has a link a person can open. This skill does that, and keeps the record in `TECH.md` → `## Environments`.

**Mode.** Standalone sets up or checks the environments of the named product and reports what it did and what still needs a person. In the lifecycle phase 5 runs it as slice zero, before the first feature slice, and gate 5.16 checks the record; each slice then ends with a preview a person tries (gate 5.17); phase 6 opens production to users. Both per [operating modes](../../references/operating-modes.md). The steps, the checklists and an example are in [the production method](references/production-method.md).

## Procedure

1. **Read what was decided.** `04-spec.md` → `## Stack` (hosting, data, email, payments, analytics), `TECH.md` → Verify and Operations, `PRODUCT.md` → Markets. A layer still open goes back to `stack-decisions` as a card. Done when every row the environments need is decided or inherited.
2. **Make the product run with one command.** Add `Run` to `TECH.md` → Verify: the command that starts the product locally and what it prints when ready. Done when the command, run once, prints its ready line.
3. **Create production, closed.** The hosting account and project, the production database, the deploy from the main branch by the guardrail's CI, and a door: a password, an allow-list or a flag, so nobody outside the team sees it yet. Accounts that cost money or need the person's identity (hosting, domain, payments) are the person's to create: name each one, what it costs, and what to paste back. Done when the product answers on its production URL behind its door.
4. **Wire what production needs**, per the [checklist](references/production-method.md#the-production-checklist): the domain with HTTPS; secrets in the host's settings, apart from development and out of git; the email sender's domain authenticated (SPF, DKIM, DMARC) when the product sends email; live keys for payments and providers, set in production only; the error tracker the release will name in 6.10; terms, the privacy notice, and cookie consent before any non-essential cookie or analytics loads, in each language of `PRODUCT.md` → Markets. Done when each line has its value in `TECH.md` → Environments or "not applicable" with the reason.
5. **Give every build a link.** Preview deployments per pull request where the host offers them; otherwise a staging environment, otherwise the `Run` command with the person. Record the preview row. Done when a pull request shows a link that opens the product.
6. **Check production from outside.** Capture a request to the production URL with `run-check` (it must answer, over HTTPS, with the expected page behind the door) and put the `**Run:**` line under `**Production check:**`; where commands cannot run, the person opens the URL and their observation is saved as evidence with its tag. Done when `**Production check:**` resolves to a passing capture or a tagged observation.
7. **Hand the build to a person** at the end of each slice and of phase 5 (gate 5.17): the link, what to try (the primary flow, the first day on a new product, the edge the slice touched), and what they found. Write `## Tried` in `05-build-plan.md` with `**Link:**`, `**Tried by:**` (the person and the date) and a row per finding with what happened to it. Done when the person has tried it and each finding is fixed or recorded.

## Watch for

| Do | Instead of |
|---|---|
| Production on the first slice, behind a door | A first deploy on launch day |
| Name each account the person creates, with its cost | Creating paid accounts in their name |
| A link the person opens and uses | A video as the only proof of what was built |
| Legal pages and consent in every language the product speaks | One English privacy page for an Italian product |

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `deploy.run` | Deploying to an environment and reading back its URL | The person runs the deploy from the steps written for them and pastes the URL |
| `shell.exec` | The Run command, the production check through `run-check` | The person runs them; their observation becomes tagged evidence |
| `repo.read` | Deploy configuration, CI, environment files already there | Ask what exists; mark the record unverified |
| `web.fetch` | Opening the production and preview URLs | The person opens them and says what they saw |
| `files.read` / `files.write` | `TECH.md`, `05-build-plan.md` | Required |

## Output Contract

`## PRODUCTION READY` with the environments table, each line of the production checklist with its value, the production check, the preview link and, in the lifecycle, `## Tried` with who tried the build and what happened to each finding.
