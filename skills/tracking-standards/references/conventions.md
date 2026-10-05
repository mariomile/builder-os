# Tracking Conventions

Default naming, property, identity and placement conventions, and the QA checklist, for `tracking-standards`. Read only the section the current step needs. Every default here yields to an existing taxonomy.

## Event Naming Convention

**First preserve the existing taxonomy.** Use its names, casing, separators, identity keys and property schemas for new events. Do not rename live events or introduce a sibling convention without an explicit migration request.

**Default for a new taxonomy only:** `[Object] [Action]`, title-cased object and past-tense action, separated by a space. The table is an example convention, not a rule that replaces an established schema.

| Component | Rule | Good | Bad |
|-----------|------|------|-----|
| Object | Noun, singular | `Report` | `Reports`, `report`, `rpt` |
| Action | Past tense verb | `Created` | `Create`, `creation`, `new` |
| Separator | Single space | `Report Created` | `report_created`, `ReportCreated` |

### Standard Actions

| Action | When to Use |
|--------|------------|
| `Created` | New entity instantiated |
| `Viewed` | Entity rendered on screen |
| `Updated` | Entity modified |
| `Deleted` | Entity removed |
| `Started` | Process initiated |
| `Completed` | Process finished successfully |
| `Failed` | Process ended in error |
| `Shared` | Entity sent to another user |
| `Exported` | Entity downloaded or sent externally |
| `Clicked` | UI element interacted with (avoid if possible — prefer semantic events) |

## Context Properties

Use the existing identity model, consent rules and properties available at the call site. The B2B authenticated examples below are conditional, not mandatory on every event. Anonymous flows may have only the SDK’s permitted anonymous/session identifier; never fabricate a `user_id`, `account_id`, plan or account age to fill a row. Omit unavailable identifiers or use documented null semantics, and describe how identified/anonymous events join when consent and the existing provider support it.

| Property | Type | Source | Purpose |
|----------|------|--------|---------|
| `account_id` | string | Backend | B2B group analytics |
| `user_id` | string | Backend | Individual behavior |
| `plan` | string | Backend | Plan segmentation |
| `account_age_days` | integer | Calculated | Maturity analysis |
| `session_id` | string | SDK | Session grouping |

## Property Standards

Preserve existing property naming and types. The examples below are defaults for a new schema only.

| Rule | Good | Bad |
|------|------|-----|
| Use snake_case | `company_size` | `companySize`, `Company Size` |
| Use enum values, not free text | `plan: "pro"` | `plan: "Professional Plan"` |
| Boolean = `is_` prefix | `is_admin` | `admin`, `isAdmin` |
| Count = `_count` suffix | `item_count` | `items`, `num_items` |
| Duration = `_seconds` or `_ms` suffix | `load_time_ms` | `load_time` |

## Backend vs. Frontend Events

| Category | Tracking Location | Reason |
|----------|-------------------|--------|
| Revenue events | Backend ONLY | Reliability, no client manipulation |
| Lifecycle events | Backend ONLY | Account creation, plan changes |
| Core actions | Backend preferred | Data integrity |
| UI interactions | Frontend | Only accessible client-side |
| Feature discovery | Frontend | Page/component visibility |

## QA Checklist

Before shipping any tracking:

- [ ] Event names follow the existing taxonomy, or the explicitly selected convention for a new taxonomy
- [ ] Properties match the identity/consent contract; no fabricated IDs and no authenticated-only fields required on anonymous flows
- [ ] Property types match specification (string/number/boolean)
- [ ] No PII in event properties (no emails, names, IPs)
- [ ] Enum values use lowercase, consistent format
- [ ] Events tested in staging environment
- [ ] Funnel definitions verified against the resolved analytics provider
- [ ] B2B group attribution uses the existing permitted group key where available; anonymous events do not invent an account

## More Common Mistakes

| Mistake | Why it fails | Correct |
|---------|-------------|---------|
| Requiring pipeline state for a scoped artifact | Expands the request | Use supplied inputs and the requested output destination |
