---
name: tracking-standards
description: "Designs and audits product analytics: event taxonomy, naming, properties, tracking plans tied to the metric they compute, audits of existing instrumentation. Use when designing events or a tracking plan, naming events, or checking what is tracked."
---

# Tracking Standards

A tracking plan starts from the question a number answers and works back to the events that compute it. Every event has a **question** it answers; shipped names are preserved, because funnels and dashboards already depend on them.

**Mode.** Standalone designs or reviews the requested taxonomy or metric from supplied flows and existing instrumentation; a plan authorizes no implementation, analytics configuration or publishing. Inside phases 4 to 7 the plan feeds the gate that calls it. Both per [operating modes](../../references/operating-modes.md). Read the requested query shape in [the analytics contract](../../references/analytics-contract.md) for measurement design, and the section of [tracking conventions](references/conventions.md) for names, properties, identity fields or tracking location in a new schema, plus its QA checklist before shipping any tracking.

## Procedure

1. **Understand the feature** from the spec where one exists, else from the code: entry points, states, success and failure paths, decision points. A description skips the error and abandonment states. Done when every state and path of the flow is listed.
2. **Read what already exists.** For each event already emitted in this area, its name, properties and volume:
   - **Exists and used:** extend it with a property rather than adding a sibling event.
   - **No observed volume:** confirm collection health, environment, eligibility and measurement window before calling it unused, since missing access or an empty export leaves volume unknown. Propose removal with evidence and within the requested scope.
   - **Nothing exists:** design from scratch against the convention.

   Without a catalogue, search the instrumentation: source records what is emitted, the catalogue what is received, and where both exist their difference is a finding. Done when every event in the area has one of the three verdicts.
3. **Design the taxonomy.** Keep the existing names, casing, separators, identity keys and property schemas; a rename or a sibling convention happens on an explicit migration request. The default conventions apply to new schema choices. Properties and identifiers come from what the identity model, consent rules and call site provide. Every event gets a name, a trigger, typed properties and the question it answers. Done when every event has all four.
4. **Design the funnels.** Order the events into the conversion paths that matter, each with its conversion window. Done when every funnel assembles from planned events alone.
5. **Specify the dashboard** in the artifact: analytics-contract shapes, events, breakdown properties; build it in a tool when the person asks and a provider resolved. Done when each metric the plan serves has its shape and events named.
6. **Write the implementation checklist.** Per event: where in the code it fires, which properties are available at that call site, how it will be verified. Done when every event has its call site and verification.

## Watch for

| Do | Instead of |
|---|---|
| Keep `report_exported` as shipped | Renaming it to `Report Exported` with no migration request, splitting funnels |
| The SDK's anonymous identity, or attribution documented as unavailable | A fake `account_id` for an anonymous visitor |
| Unknown kept unknown, with the measurement needed | Missing data filled with zero |

## Capabilities

| Capability | Used for | Floor when absent |
|-----------|----------|-------------------|
| `analytics.events` | The existing event catalogue and properties, so shipped events are extended | Search the repository for the analytics SDK's call sites and collect the literal event names |
| `analytics.query` | Volume per existing event, to find the dead ones | Skip; design proceeds without it |
| `repo.read` | The feature's actual states and transitions | Ask the person to walk through the flow |
| `files.read` / `files.write` | The tracking plan itself | Always present |

A tracking plan needs no connected analytics, only an accurate picture of the feature and a naming convention held consistently.

## Output Contract

`## TRACKING PLAN COMPLETE`, heading a report in the [tracking plan template](references/plan-template.md). Standalone output follows the requested format and destination, with no gate claims.
