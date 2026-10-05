---
name: tracking-standards
description: "Use when designing event taxonomies, naming conventions, tracking plans, or auditing existing analytics instrumentation"
---

# Tracking Standards

## Mode and resources

Follow [operating modes and resource paths](../../references/operating-modes.md). **Standalone:** design or review the requested taxonomy or metric using supplied flows and existing instrumentation. A tracking plan does not authorize implementation, analytics configuration or publishing. **Lifecycle:** phase prerequisites, artifact paths and gate recording below apply only when the user requests that phase or initiative; missing prerequisites block that transition, not a standalone artifact, and a completion marker with a gate verdict claims lifecycle completion only after the gate passes.

Read only the requested query shape in [the analytics contract](../../references/analytics-contract.md) for measurement design, and [capability mapping](../../references/capability-map.md) when resolving a provider. Ask what remains per the `pressure-testing` rounds: options, a recommendation and why; for a factual gap, ways to close it, never guessed values.

Read the relevant section of [tracking conventions](references/conventions.md) when choosing names, properties, identity fields or tracking location for a new schema, and its QA checklist before shipping any tracking.

## Capabilities

| Capability | Used for | Floor when absent |
|-----------|----------|-------------------|
| `analytics.events` | The existing event catalogue and properties, so what ships is not redesigned | Search the repository for the analytics SDK's call sites and collect the literal event names |
| `analytics.query` | Volume per existing event, to find the dead ones | Skip; design proceeds without it |
| `repo.read` | The feature's actual states and transitions | Ask the user to walk through the flow |
| `files.read` / `files.write` | The tracking plan itself | Always present |

A tracking plan needs no connected analytics, only an accurate picture of the feature and a naming convention held consistently.

## Procedure

1. **Understand the feature.** Read the flow (entry points, states, success and failure paths, decision points) from the spec where one exists, else from the code, not from a description: it misses the error and abandonment states.
2. **Read what already exists.** For each event already emitted in this area, its name, properties and volume:
   - **Exists and used:** extend it with a property rather than adding a sibling event.
   - **No observed volume:** confirm collection health, environment, eligibility and measurement window before calling it unused. Missing access or an empty export is not proof of zero. Propose removal only with evidence and within the requested scope.
   - **Nothing exists:** design from scratch against the convention.

   Without a catalogue, search the instrumentation. Source records what is emitted, the catalogue what is received; where both exist, their difference is a finding.
3. **Design the taxonomy.** Preserve the existing names, casing, separators, identity keys and property schemas; rename live events or introduce a sibling convention only on an explicit migration request. Apply the default conventions only to new schema choices. Use only the identifiers and properties the identity model, consent rules and call site provide; never fabricate an ID, plan or account age. Every event gets a name, trigger, typed properties and the question it answers; an event nobody can name a question for is not designed.
4. **Design the funnels.** Order the events into the conversion paths that matter, each with its conversion window. A funnel that cannot be assembled from the planned events means the plan is incomplete.
5. **Specify the dashboard** in the artifact: analytics-contract shapes, events, breakdown properties. Build it in a tool only when the user asks and a provider has resolved.
6. **Implementation checklist and report.** Per event: where in the code it fires, which properties are available at that call site, and how it will be verified.

## Output Contract

Report with the [tracking plan template](references/plan-template.md), headed by the completion marker `## TRACKING PLAN COMPLETE`. Standalone output follows the requested format and destination; adapt the template only where useful and omit lifecycle gate claims.

## Common Mistakes

| Mistake | Why it fails | Correct |
|---------|-------------|---------|
| Renaming `report_exported` to `Report Exported` without a migration request | Splits existing funnels and dashboards | Preserve the shipped name and property schema |
| Assigning an anonymous visitor a fake account_id | Corrupts group attribution | Use the permitted SDK anonymous identity or document unavailable attribution |
| Filling missing data with zero | Creates false certainty | Preserve unknown and state the measurement needed |
