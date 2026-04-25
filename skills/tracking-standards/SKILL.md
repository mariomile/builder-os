---
name: tracking-standards
description: "Use when designing event taxonomies, naming conventions, tracking plans, or auditing existing analytics instrumentation"
---

# Tracking Standards

Reference for analytics instrumentation: event naming, property schemas, and quality assurance.

## Event Naming Convention

**Pattern:** `[Object] [Action]` — always two words, PascalCase.

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

## Mandatory Properties

Every event MUST include these properties:

| Property | Type | Source | Purpose |
|----------|------|--------|---------|
| `account_id` | string | Backend | B2B group analytics |
| `user_id` | string | Backend | Individual behavior |
| `plan` | string | Backend | Plan segmentation |
| `account_age_days` | integer | Calculated | Maturity analysis |
| `session_id` | string | SDK | Session grouping |

## Property Standards

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

- [ ] Event names follow `[Object] [Action]` convention
- [ ] All mandatory properties present on every event
- [ ] Property types match specification (string/number/boolean)
- [ ] No PII in event properties (no emails, names, IPs)
- [ ] Enum values use lowercase, consistent format
- [ ] Events tested in staging environment
- [ ] Funnel definitions verified in Mixpanel/PostHog
- [ ] Group analytics configured for B2B (account_id as group key)
