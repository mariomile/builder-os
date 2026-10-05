---
name: using-builder-os
description: "Use when a product request needs routing among BuilderOS methods or lifecycle phases, or when the user asks where an active initiative stands or what to do next"
---

# Using BuilderOS

Route by the requested result. Preserve the user's scope, supplied inputs, output destination and existing authorization. Requests unrelated to product work use the session's other capabilities.

## Procedure

1. **Read relevant context.** For a lifecycle or status request, read the active initiative and brief from project memory. For a standalone question, read only context that affects the answer; a project-wide briefing is unnecessary. The installation's `scripts/bos.mjs brief` can compute the lifecycle briefing.
2. **Choose the mode.** A guide, diagnosis, recommendation, PRD, spec edit, plan or review is standalone unless lifecycle execution was requested. It does not require phase files or a logged override. Read [operating modes](../../references/operating-modes.md) when the boundary is uncertain.
3. **Select the smallest useful route** below. If clear, state it briefly when useful and start. Ask only when a material ambiguity remains after reading inputs; an authorized task needs no repeated confirmation.
4. **Run the selected skill.** Pass the request and relevant inputs verbatim. Load additional methods only when they answer part of that request. A recommendation to build does not start an initiative.

## Watch While Working

In a project with BuilderOS memory, check every product request against it before doing the work, and say what you find in at most two lines, then continue:

- **Contradiction.** The request goes against an accepted decision in `decisions/`, a `PRODUCT.md` non-goal or the active spec's out-of-scope. Name the file, then ask one round question per `pressure-testing` (Rounds): keep the decision, supersede it, or treat the request as an exception.
- **Shaky ground.** The request builds on an `[assumption:unvalidated]` or a deferred branch whose test never ran. Name it and the cheapest test.
- **Unread result.** A shipped change whose outcome metric nobody has read since release, when the request is more work on the same area. Say the review comes first, or why it can wait.

The briefing's Attention line covers what the files decide mechanically; these three need judgment. Never block the request on them and never repeat one the user has already answered in this session.

## Routes

| Requested result | Skill / mode |
|------------------|--------------|
| An idea or problem in one sentence ("I want to build X") | Lifecycle requested or project initialized: `builder-os`, starting with no setup questions per [lifecycle setup](../../references/lifecycle-setup.md). Otherwise `problem-framing`'s first round inline, then offer to keep it as an initiative |
| Run or continue an initiative; explicitly request a spike | `builder-os`, lifecycle |
| Frame a problem | `problem-framing`, standalone unless phase 0 requested |
| Research plan or interview guide | `research-methods`, standalone unless DISCOVER requested |
| Synthesize supplied research | `discovery-methods` |
| Compare opportunities or solution alternatives | `opportunity-mapping` or `ideation-methods`, standalone |
| Draft or revise a specification from requirements | `spec-writing`, standalone; UX/tracking as needed |
| Plan, implement or review supplied build work | `delivery-discipline`, within the authorized mode |
| Prepare a release; verify an authorized release | `release-ops`, distinguish readiness from shipping |
| Review an initiative's shipped outcome | `outcome-review`, lifecycle; otherwise standalone diagnosis |
| Health or metric definition | `saas-metrics-reference`; growth for a related diagnosis |
| Activation, retention or growth loops | `growth-frameworks` |
| Revenue or unit economics | `financial-models` |
| Competitors or positioning | `competitive-intel`; strategy as needed |
| PMF, North Star or strategic fit | `strategy-frameworks` |
| OKRs | `okr-frameworks` |
| Tracking plan or instrumentation audit | `tracking-standards` |
| Experiment design or result | `experiment-methodology` |
| Release notes, stakeholder update or other document | `pm-artifacts` |

Evidence and gate skills support the selected work; they do not force a standalone answer into a pipeline. Load `pressure-testing` for a requested critique or a material unresolved assumption.

## Capabilities and Resources

`files.read` supplies context; when unavailable, use supplied material and name the gap. `shell.exec` can run the briefing; otherwise read relevant memory. Shared resources and scripts resolve from the real installation, per [resource paths](../../references/operating-modes.md#path-resolution).

Read [state and session briefing](../../references/builderos-state-schema.md) for lifecycle routing or status. Standalone answers do not load all initiatives or this schema.

## Output Contract

For an ambiguous request, state the route and reason, then resolve the blocking choice. An obvious route goes directly to its result. `## ROUTE CHOSEN` is an optional routing marker, not phase completion evidence.

## Common Mistakes

| Mistake | Correct |
|---------|---------|
| A standalone PRD treated as an overridden SHAPE phase | Use requirements and label assumptions; create no initiative |
| Asking again after an explicit phase request | Carry forward authorization and start |
| A calculation becoming a full product audit | Load only the needed method |
| Missing context becoming a fabricated baseline | State the gap and ask if it blocks the result |
| A release plan reported as shipped | Report readiness until observed exposure is verified |
