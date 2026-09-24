---
name: orchestrator
description: "Use when the user does not know which skill or phase fits, asks what to do next or where to start, or brings a request that could go several ways"
---

# Orchestrator

BuilderOS has 26 skills. Nobody remembers them, and nobody should have to. This skill finds out what the user is trying to walk away with, then picks the skills and their order. It routes; it does not do the work of the skills it picks.

**REQUIRED BACKGROUND:** `pressure-testing`, section Rounds, for how the questions are asked. `references/builderos-state-schema.md` for where the project memory lives.

## Facts First, Then Questions

Every question costs the user a turn, so ask only what changes the route, and never ask what can be read.

Before asking anything, read what exists: `.builderos/state.json`, `.builderos/ROADMAP.md`, `PRODUCT.md`, `TECH.md`, and the request itself. A project mid-pipeline has already answered most routing questions: the active initiative, its phase and its last gate often settle the route with no question at all. Say what you read, then ask only what is still open.

## The Routing Questions

At most three, asked as one round, numbered, each with your recommended answer drawn from what you read. Drop any question the memory or the request already answers. Zero questions is the best outcome.

**Q1 — What do you want to walk away with?**
- An answer about a product that already exists (a number, a diagnosis, a comparison)
- A decision on whether something is worth doing, without building it
- A change built and put in front of users
- A verdict on something already shipped
- A document for other people (PRD, release notes, stakeholder update, OKRs)

**Q2 — What exists already?** Nothing but the idea · a product with users · a product with users and data this session can reach.

**Q3 — Where does the work stand?** An idea or a complaint · evidence from users · a chosen solution · a written spec · code in progress · live in production.

Q3 only matters when Q1 is "a change built". Q2 only matters when the answer to Q1 depends on data.

## Route Table

| Walk away with | Situation | Route | Writes |
|----------------|-----------|-------|--------|
| A decision, not a build | Any | `builder-os` on the `spike` track: `problem-framing`, then `research-methods` | `00-frame.md`, `01-discovery.md`, a verdict |
| A change built | Idea, no evidence | `builder-os`, `product` track, from phase 0 | The initiative folder, phase by phase |
| A change built | Existing product, evidence already in `PRODUCT.md` | `builder-os`, `feature` track, coverage check, then phase 2 | Same, from `02-definition.md` |
| A change built | Mid-pipeline | `builder-os`, current phase of the active initiative | The next phase artifact |
| A change built | Something unrelated to the active initiative | A new initiative through initialization | A new initiative folder |
| A verdict on something shipped | Shipped through BuilderOS | `outcome-review` | `07-outcome.md` |
| A verdict on something shipped | Shipped outside BuilderOS | `saas-metrics-reference` for the metric, `experiment-methodology` if it was a test | An answer, no pipeline state |
| An answer | Health, KPIs, what is wrong | `saas-metrics-reference`, then `growth-frameworks` if the problem is a funnel or retention | An answer |
| An answer | Competitors, positioning | `competitive-intel`, then `strategy-frameworks` if it becomes a positioning question | An answer |
| An answer | PMF, north star, strategic coherence | `strategy-frameworks` | An answer |
| An answer | Revenue, unit economics, scenarios | `financial-models` | An answer |
| An answer | What is tracked, what should be | `tracking-standards` | A tracking plan or audit |
| An answer | Did this A/B test work, how big a sample | `experiment-methodology` | An answer |
| An answer | Research already done, needs synthesis | `discovery-methods` | A synthesis |
| A document | PRD, release notes, update, summary | `pm-artifacts` | The document |
| A document | OKRs | `okr-frameworks` | The OKRs |

`evidence-ledger`, `gate-checks` and `pressure-testing` are never a route on their own. The routed skills call them.

When the answer to a question turns into "so we should build something", the analysis route ends and the lifecycle route begins: offer a new initiative instead of continuing in the analysis skill.

## Procedure

1. **Read the memory.** State, roadmap, `PRODUCT.md`, `TECH.md`, the request. Note which routing questions they already answer.
2. **Ask the round.** Only the open questions, at most three, each with a recommended answer and the reason. If nothing is open, skip to step 3 and say why no question was needed.
3. **Propose the route.** One to four steps, in order. Each step names the skill, why it comes at that point, and the file it writes, if any. Where the route passes through the lifecycle, name the track and the starting phase.
4. **Confirm once.** The user accepts, edits or picks another route. A correction is information: if it contradicts the memory, say so before re-routing.
5. **Hand off.** Load the first skill and run its procedure. The route stays visible: after each step, check whether its result changes the remaining steps, and say so when it does.

## Route Hygiene

- **A route that skips a gate is not a route.** Writing a PRD with `pm-artifacts` to avoid phase 4, or computing a baseline with `saas-metrics-reference` to avoid phase 2, is an override by another name. Name the phase being skipped and offer the real choice: run it, or override it with the reason logged.
- **One active initiative at a time.** A route that would change an initiative other than the active one says so and switches explicitly.
- **Prefer the shorter route.** The best route has the fewest steps that still produce what the user wants to walk away with.

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `files.read` | Project memory, to answer routing questions without asking | Ask all three questions |

Nothing else. Routing needs no data capability; the routed skills resolve their own.

## Output Contract

```markdown
**Read:** {what the memory already answered, one line, or "no project memory"}

**Route**
1. `{skill}` — {why here}. Writes {file, or "nothing"}.
2. …

{Track and starting phase, if the route enters the lifecycle.}
```

Completion marker: `## ROUTE CHOSEN`, emitted after the user confirms and before the first skill runs.

## Common Mistakes

| Mistake | Consequence | Fix |
|---------|-------------|-----|
| Asking what the state file already says | The user repeats themselves and trusts the system less | Read the memory first; say what it answered |
| Asking more than three questions | Routing turns into an interview before any work starts | Only what changes the route |
| Routing by keyword ("PRD" → `pm-artifacts`) | A spec request lands outside the lifecycle and skips gates | Route by what the user wants to walk away with |
| Running the first skill before the user confirms | The user's correction arrives after the work | Propose, confirm once, then hand off |
| Doing the routed skill's work inside this one | Procedure duplicated, and it drifts | Hand off; the skill holds the procedure |
| Continuing an analysis once it turns into a build | Work that needs gates runs without them | End the analysis route; offer a new initiative |
