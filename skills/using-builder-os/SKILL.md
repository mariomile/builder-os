---
name: using-builder-os
description: "Entry point to BuilderOS: briefs from project memory, checks each request against decisions and earlier conditions, routes to the lifecycle or to a method. Use when product work starts, a request needs routing, or someone asks where things are."
---

# Using BuilderOS

Route by the requested result, keeping the person's scope, supplied inputs, output destination and existing authorization. Requests unrelated to product work use the session's other capabilities.

**Mode.** A guide, diagnosis, recommendation, PRD, spec edit, plan or review is standalone unless lifecycle execution was requested: no phase files, no logged override. The boundary, and where shared resources and scripts resolve from the real installation, are in [operating modes](../../references/operating-modes.md). Read [state and session briefing](../../references/builderos-state-schema.md) for lifecycle routing or status; a standalone answer loads neither the initiatives nor the schema.

## Procedure

1. **Read the context the request needs.** A lifecycle or status request reads the active initiative and briefs from project memory (`scripts/bos.mjs brief` computes it where commands run). A standalone question reads what affects the answer. Done when you know whether BuilderOS memory exists and what the request touches in it.
2. **Run the watch** below against the request. Done when every check that applies is named in at most two lines, or none applies.
3. **Choose the smallest useful route** from the table. State it briefly when useful and start; ask only when a material ambiguity remains after reading the inputs, since an authorized task needs no repeated confirmation. Done when one route is chosen.
4. **Run the selected skill**, passing the request and inputs verbatim and loading extra methods only for parts of the request they answer. A recommendation to build starts nothing by itself. Done when the routed skill is running.

## Watch While Working

In a project with BuilderOS memory, check every product request against it before doing the work, say what you find in at most two lines, then continue. On a real project these checks would have caught scope built against the phase 2 and 3 conditions, a pilot that never started while features kept shipping, and a `PRODUCT.md` still describing the idea stage:

- **Contradiction.** The request goes against an accepted decision in `decisions/`, a `PRODUCT.md` non-goal, a condition a phase artifact set ("no further scope until the pilot passes", a kill criterion) or the active spec's or build plan's out-of-scope. Name the file and line, then ask one `pressure-testing` round question: keep the condition, supersede it on the record, or open a new initiative for the request, as a `change` when its solution is already fixed, so the cheap path stays inside BuilderOS. New scope after the build plan is accepted becomes its own initiative or a recorded amendment.
- **Stale truth.** What the person just decided makes `PRODUCT.md`, `ROADMAP.md`, the spec or an evidence file wrong (a stage, a non-goal, a "Next" item already built, a superseded preference). Update it in the same step, or name it when the update is outside the authorized scope.
- **Shaky ground.** The request builds on an `[assumption:unvalidated]` or a deferred branch whose test never ran. Name it and the cheapest test.
- **Unread result.** A shipped change whose outcome metric nobody has read, or a launch or pilot whose start conditions are still open, when the request is more work in the same area. Say the measurement comes first, or why it can wait.
- **Someone else's initiative.** The briefing shows the active initiative claimed by another person. Say who and since when, and ask whether to work on it anyway: their release, or a take-over with the reason (`claim --take --reason`), keeps two sessions from writing one state. When you start lifecycle work on an unclaimed initiative where commands run, claim it for the person (`claim --by "{person}"`).
- **Code before an accepted plan.** The request asks for product code in an initiative whose build plan is not accepted yet ("skip the rest, just write it"). This one is a gate: write no code. In one message name what the gate still needs and offer the paths, with a recommendation: finish it (often one short round), run the work as a `change` when the solution is already fixed, or record an override with the person's own reason through the script (`record {phase} --override "reason"`), visible in every briefing, then build. The person's decision to skip is a reason to log: code built past an unrecorded gate is how a project ends up with features its own phase 2 said not to build.

The briefing's Attention line covers what the files decide mechanically; the first five need judgment. They inform the request without blocking it, and each is raised once per session.

## Routes

| Requested result | Skill / mode |
|------------------|--------------|
| An idea or problem in one sentence ("I want to build X") | Lifecycle requested or project initialized: `builder-os`, starting with no setup questions per [lifecycle setup](../../references/lifecycle-setup.md). Otherwise `problem-framing`'s first round inline, then offer to keep it as an initiative |
| Run or continue an initiative; explicitly request a spike | `builder-os`, lifecycle |
| An effort too big or too foggy for one session; continue a map in `.builderos/maps/` | `wayfinding` |
| Whether BuilderOS is installed and set up right, what an upgrade left owed | `scripts/bos.mjs doctor` where commands run, relayed; otherwise read the install and memory per [state and session briefing](../../references/builderos-state-schema.md) |
| What to build next, the weekly or monthly product review, whether the product has reached PMF, in a project with BuilderOS memory | `builder-os`, product review |
| A fix, a small modification, debt, a compliance or contract change, or a removal on a product with BuilderOS memory | `builder-os` on the `change` track: mandate check, then spec, build, release |
| Frame a problem | `problem-framing`, standalone unless phase 0 requested |
| Research plan or interview guide | `research-methods`, standalone unless DISCOVER requested |
| Synthesize supplied research | `discovery-methods` |
| Compare opportunities or solution alternatives | `opportunity-mapping` or `ideation-methods`, standalone |
| Which stack, backend, database or hosting to use, and why | `stack-decisions`, standalone |
| How the backend fits together, an API's contracts, timeouts and retries, whether it will scale, a security or threat-model review | `system-design`, standalone |
| See design versions, choose a look or a design kit | `design-direction`, standalone |
| Business rules, states and transitions, data model, what a term means | `domain-model`, standalone |
| Something is broken, regressed, slow or flaky | `bug-diagnosis`, standalone |
| Draft or revise a specification from requirements | `spec-writing`, standalone; UX/tracking as needed |
| Plan, implement or review supplied build work | `delivery-discipline`, within the authorized mode |
| Turn what was discussed into a spec, with no interview | `spec-writing`, synthesis (`to-spec` by name) |
| Break a plan or spec into tickets | `delivery-discipline`, [tickets](../delivery-discipline/references/tickets.md) (`to-tickets` by name) |
| Write, update or prune a repository's `AGENTS.md` or `CLAUDE.md`; the agent keeps getting lost in the code | `agents-md`, standalone |
| A retrospective on an agent session, or what to change so the agent works better here | [retro](../retro/SKILL.md) (`retro` by name) |
| Prepare a release; verify an authorized release | `release-ops`, distinguish readiness from shipping |
| Review an initiative's shipped outcome | `outcome-review`, lifecycle; otherwise standalone diagnosis |
| Product health, a metric, activation or retention, growth loops, revenue or unit economics, PMF, a north star, OKRs, competitors | `product-analysis`, the area that answers it |
| Tracking plan or instrumentation audit | `tracking-standards` |
| Experiment design or result | `experiment-methodology` |
| Release notes, stakeholder update or other document | `pm-artifacts` |

Evidence and gate skills support the selected work; a standalone answer stays standalone. Load `pressure-testing` for a requested critique or a material unresolved assumption.

## Capabilities

`files.read` supplies context; without it, work from supplied material and name the gap. `shell.exec` runs the briefing; without it, read the relevant memory directly.

## Watch for

| Do | Instead of |
|---|---|
| A standalone PRD from requirements, assumptions labeled | Treating it as an overridden SHAPE phase |
| Carry forward authorization and start | Asking again after an explicit phase request |
| Load the method the calculation needs | Turning a calculation into a full product audit |
| State the gap and ask when it blocks the result | A fabricated baseline for missing context |
| Report readiness until exposure is observed | A release plan reported as shipped |

## Output Contract

An ambiguous request gets the route and its reason, then the blocking choice; an obvious one goes straight to its result. `## ROUTE CHOSEN` is an optional routing marker, separate from phase completion evidence.
