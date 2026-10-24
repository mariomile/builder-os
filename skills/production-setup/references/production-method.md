# Production Method

The checklist, the record and an example behind `production-setup`. Read the section the current step needs.

## Why Day One

A product that first meets production at launch meets every unknown at once: DNS that takes a day, an email provider that needs domain verification, payment keys that behave differently live, a cookie banner nobody designed. Deploying the first slice behind a door spreads those over the build, where each costs an hour instead of the launch. Phase 6 then decides who walks through the door (the rollout) rather than whether the product can run at all.

## The Production Checklist

| Line | What it holds | Not applicable when |
|---|---|---|
| **Domain** | The domain, who registered it, HTTPS on (the host's certificate) | An internal tool on the host's address, with the reason |
| **Secrets** | Where production secrets live (the host's settings, a secrets manager), who can read them, that development uses other values | Never: every product has at least its database credentials |
| **Email sender** | The sending domain with SPF, DKIM and DMARC verified and the date; the provider | The product sends no email |
| **Live keys** | Payment and provider keys in live mode, set in production only; the webhook endpoint registered | Nothing is paid and no provider distinguishes test from live |
| **Legal pages** | Terms, privacy notice and cookie consent (before analytics or any non-essential cookie loads), their URLs, in every language the product speaks; the privacy notice is the one `TECH.md` → Operations points to | No personal data and no cookies, with the reason |

Errors and backups are part of release readiness (gate 6.10); name the error tracker here so the first slice already reports to it.

## The Record

```markdown
## Environments
| Environment | URL | Deploys from | Who can see it |
|---|---|---|---|
| production | https://app.example.com | main, by the CI deploy job | the team, behind a password, until the rollout |
| preview | https://pr-{n}.example.dev | each pull request | the team |

**Domain:** example.com, registered by Mario, HTTPS by the host
**Secrets:** the host's environment settings; development reads `.env.local`, which is git-ignored
**Email sender:** mail.example.com, SPF, DKIM and DMARC verified 2026-10-24, sent through the transactional provider
**Live keys:** payments live in production only; webhook registered at /api/payments/webhook
**Legal pages:** /terms, /privacy, cookie consent before analytics, in Italian and English
**Production check:** **Run:** .builderos/initiatives/{slug}/evidence/runs/production-check-{timestamp}.json
```

The production check is a `run-check` of a request to the production URL, for example `curl -fsS -o /dev/null -w "%{http_code}" https://app.example.com/login`. Gate 5.16 reads it: a passing capture whose command names the production host, or the person's observation saved with `scripts/bos.mjs evidence add --class doc`.

On the feature and change tracks the product already runs: the first time BuilderOS meets it, `## Environments` is written from the repository and the host; gate 5.16 warns until it is there.

## Trying the Build

The video from the end-to-end run shows the flow works. A person using it shows whether it is right: the wording that reads wrong, the step that feels slow, the empty screen that looks broken. That person is whoever accepts the work, at the end of each slice that changes what they see and once more before phase 6.

```markdown
## Tried
**Link:** https://pr-42.example.dev
**Tried by:** Mario, 2026-10-24
| What they tried | What they found | What happened |
|---|---|---|
| the first day with a new account | the import step asks for a file before saying which | fixed: the step shows a sample file |
| an export of 2,000 rows | took 6 seconds with no progress | recorded in DESIGN.md: progress bar in slice 3 |
```

## Example

A new booking tool for physiotherapists. Slice zero: the person creates the hosting and domain accounts (named, with their monthly cost); the agent adds `Run`, the deploy job, a password on production, the error tracker, the email domain records; the person pastes back the verification. The production check passes on the login page behind the password. Every pull request after that has a preview link; the person tries the first day on the phone at the end of slice two and finds the time picker too small. At phase 6 the rollout removes the password for the first ten clinics.
