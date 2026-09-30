---
name: tracking-standards
description: "Use when designing event taxonomies, naming conventions, tracking plans, or auditing existing analytics instrumentation"
---

# Tracking Standards

## Mode and resources

Follow [operating modes and resource paths](../../references/operating-modes.md). **Standalone:** Design or review the requested taxonomy or metric using supplied flows and existing instrumentation. A tracking plan does not authorize implementation, analytics configuration or publishing. No phase files, initiative state, initialization or gate override are required. Preserve the requested format and destination.

**Lifecycle:** Apply the named phase prerequisites, artifact paths and gate recording below only when the user requests that phase or initiative. Missing prerequisites block that lifecycle transition, not a standalone artifact. Completion markers with gate verdicts claim lifecycle completion only after the gate passes.

Read only the requested query shape in `references/analytics-contract.md` for measurement design, and `references/capability-map.md` when resolving a provider. Retrieve facts before asking; suggest recommended options for decisions, not answers to factual observations.


Event naming, property schemas, quality assurance, and the procedure for turning a feature into a tracking plan.

## Capabilities

| Capability | Used for | Floor when absent |
|-----------|----------|-------------------|
| `analytics.events` | The existing event catalogue and its properties, so you do not redesign what already ships | Search the repository for the analytics SDK's call sites and collect the literal event names |
| `analytics.query` | Volume per existing event, to find the dead ones | Skip; design proceeds without it |
| `repo.read` | The feature's actual states and transitions, which is what the taxonomy has to cover | Ask the user to walk through the flow |
| `files.read` / `files.write` | The tracking plan itself | Always present |

A tracking plan is a design artifact. It needs no connected analytics to be correct, only an accurate picture of the feature and a naming convention held consistently.

## Procedure

### 1. Understand the feature

Read the flow: entry points, states, success and failure paths, the decision points a user passes through. From the spec where one exists, from the code where it does not. A taxonomy designed from a feature description rather than the feature misses exactly the states that matter, which are the error and abandonment ones.

### 2. Read what already exists

Pull the catalogue. For each event already emitted in this area: its name, its properties, its volume. Three outcomes, and each changes the plan:

- **The event exists and is used.** Extend it with a property rather than adding a sibling event. Two events for one action is how a taxonomy rots.
- **The event has no observed volume.** Confirm collection health, environment, eligibility and measurement window before calling it unused. Missing access or an empty export is not proof of zero. Propose removal only with evidence and within the requested scope.
- **Nothing exists.** Design from scratch against the convention.

Without a catalogue, search the instrumentation. Source is the more reliable record of what is emitted; the catalogue is the more reliable record of what is received. The difference between them, where both are available, is a finding.

### 3. Design the taxonomy

Apply the existing naming and identity contract, then the relevant default examples below only for new schema choices. Every event: name, trigger, properties with types, and the question it answers. An event nobody can name a question for does not get designed.

### 4. Design the funnels

Order the events into the conversion paths that matter, each with its conversion window. This is what makes the plan verifiable later: a funnel that cannot be assembled from the planned events means the plan is incomplete.

### 5. Design the dashboard specification

As a specification, in the artifact: which shapes from `references/analytics-contract.md`, over which events, broken down by which properties. Creating it in a specific tool is optional and happens only when the user asks and a provider has resolved. The spec is the deliverable and it is portable; a dashboard built in one product is not.

### 6. Implementation checklist and report

Per event: where in the code it fires, which properties are available at that call site, and how it will be verified. Then emit the output contract.

## Output Contract

Standalone output follows the requested format and destination; adapt the template only where useful and omit lifecycle gate claims. The paths below apply to lifecycle artifacts.

```markdown
## TRACKING PLAN COMPLETE

**Feature:** {name}
**Capabilities resolved:** {capability → concrete source, or "none: files only"}

### Event Taxonomy
| Event | Trigger | Properties | Question it answers | New or existing |

### Funnels
{ordered steps per path, with conversion windows}

### Dashboard Spec
{shape, events, breakdowns, per tile}

### Implementation Checklist
{per event: call site, available properties, verification}

### Findings
{dead events, duplicate events, missing properties for the segments that matter}
```

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

## Common Mistakes

| Mistake | Why it fails | Correct |
|---------|-------------|---------|
| Renaming `report_exported` to `Report Exported` without a migration request | Splits existing funnels and dashboards | Preserve the shipped name and property schema |
| Assigning an anonymous visitor a fake account_id | Corrupts group attribution | Use the permitted SDK anonymous identity or document unavailable attribution |
| Requiring pipeline state for a scoped artifact | Expands the request | Use supplied inputs and the requested output destination |
| Filling missing data with zero | Creates false certainty | Preserve unknown and state the measurement needed |
