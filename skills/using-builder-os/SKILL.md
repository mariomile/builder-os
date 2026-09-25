---
name: using-builder-os
description: "Use at the start of any session where BuilderOS is installed, when unsure which skill or phase a product request belongs to, or when the user asks what to do next or where to start"
---

# Using BuilderOS

The entry point. It reads the project memory, decides whether a request walks the lifecycle or gets a standalone answer, and picks the skills and their order. It routes; the skills it picks do the work.

**REQUIRED BACKGROUND:** `references/builderos-state-schema.md` for where the memory lives. `pressure-testing`, section Rounds, for how questions are asked.

## Two Kinds of Work

- **Lifecycle** (`builder-os`): an idea, a problem or a change to a product, walked toward production through gated phases. Stateful: it lives in `.builderos/`, `PRODUCT.md` and `TECH.md`.
- **Answer**: a standalone question about a product that exists (a number, a diagnosis, a document). One specialist skill, no pipeline state. It reads `PRODUCT.md` when there is one.

A request with no product question in it goes to whatever else this session offers.

## First Move

1. **If `.builderos/` exists, brief before anything else.** Run the Session Start protocol in the schema: read the roadmap and every initiative's `state.json`, `PRODUCT.md`, and `TECH.md` when the request touches code, then brief in at most five lines, plus one attention line when something is stale or overdue. Where commands can be executed, `node scripts/bos.mjs brief` from the plugin produces the same briefing from the files.
2. **Route by what the user wants to walk away with**, using the table below. A request that belongs to another phase or another initiative is named as such before anything runs.
3. **When the route is not obvious, ask one round**: at most three questions, numbered, each with a recommended answer drawn from what you read. Drop every question the memory or the request already answers. Zero questions is the best outcome.
   - What do you want to walk away with? An answer · a decision on whether to build · a change built and shipped · a verdict on something shipped · a document for others.
   - What exists? Only the idea · a product with users · a product with data this session can reach.
   - Where does the work stand? An idea · evidence from users · a chosen solution · a spec · code in progress · live.
4. **Propose the route, confirm once, hand off.** One to four steps, each naming the skill, why it comes there and the file it writes. Then load the first skill and run its procedure. When the user already said what to do ("initialize X", "run the define phase", "check the gate"), that is the confirmation: state the route in one line and start. Asking again costs a turn and, where nobody is there to answer, the whole run.

## Route Table

| Walk away with | Situation | Route |
|----------------|-----------|-------|
| A decision, not a build | Any | `builder-os`, `spike` track |
| A change built | Idea, or a problem never evidenced | `builder-os`, `product` track, phase 0 |
| A change built | Live product, problem evidenced in `PRODUCT.md` | `builder-os`, `feature` track: coverage check, then phase 2 |
| A change built | Mid-pipeline | `builder-os`, current phase of the active initiative |
| A verdict on something shipped | Shipped through BuilderOS | `outcome-review` |
| A verdict on something shipped | Shipped outside it | `saas-metrics-reference`, plus `experiment-methodology` if it was a test |
| An answer | Health, KPIs, what is wrong | `saas-metrics-reference`, then `growth-frameworks` for a funnel or retention problem |
| An answer | A full product audit | `saas-metrics-reference`, `growth-frameworks`, `financial-models`; delegated in parallel where the host can, else in sequence; one synthesis |
| An answer | Competitors, positioning | `competitive-intel`, then `strategy-frameworks` |
| An answer | PMF, north star, strategic gaps | `strategy-frameworks`, then `okr-frameworks` for a full strategy session |
| An answer | Revenue, unit economics | `financial-models` |
| An answer | What is tracked, what should be | `tracking-standards` |
| An answer | A/B test design or result | `experiment-methodology` |
| An answer | Research already done, needs synthesis | `discovery-methods` |
| A document | Release notes, stakeholder update, summary | `pm-artifacts` |
| A document | OKRs | `okr-frameworks` |

`evidence-ledger`, `gate-checks` and `pressure-testing` are never a route on their own; the routed skills call them.

## Route Hygiene

- **A route that skips a gate is not a route.** A PRD for an unbuilt feature written with `pm-artifacts` is phase 4 without phases 0 to 3. Name what is skipped and offer the real choice: the lifecycle, or the skip logged as an override.
- **An answer that turns into "so we should build it"** ends there. Offer a new initiative.
- **Prefer the shorter route.** The fewest steps that still produce what the user wants.

## Output Contract

```markdown
**Read:** {what the memory already answered, one line, or "no project memory"}

**Route**
1. `{skill}`: {why here}. Writes {file, or "nothing"}.

{Track and starting phase, if the route enters the lifecycle.}
```

Completion marker: `## ROUTE CHOSEN`, after the user confirms and before the first skill runs. A request whose route is obvious skips the block and goes straight to the skill.

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `files.read` | The memory, to answer routing questions without asking | Ask the three questions |
| `shell.exec` | The scripted briefing | Read the files and brief by hand |

## Red Flags

| Thought | Reality |
|---------|---------|
| "The user already knows the solution, so framing is pointless" | The `feature` track exists for this. The coverage check decides, not the user's confidence |
| "This number is plausible enough to write down" | Tag it or mark it unavailable, per `evidence-ledger` |
| "The completion marker appeared, so the phase is done" | A marker is a claim. The gate run on the file is the evidence |
| "It's a quick question, no need to read state" | A quick answer can contradict a recorded decision. Read first |
| "I remember this project" | A new session remembers nothing. The files are the memory |
| "This technical choice is obvious, no need to write it down" | The next session will make the opposite obvious choice. `TECH.md`, or an ADR if it passes the test |
| "This spike turned into a build, I'll keep going" | A spike ends at its verdict. Building is a new classification, stated out loud |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Skipping the briefing | Five lines before the first answer, every session |
| Routing by keyword ("PRD" → `pm-artifacts`) | Route by what the user wants to walk away with |
| Asking what the files already say | Say what you read; ask only what is open |
| Running the first skill before the user confirms a non-obvious route | Propose, confirm once, hand off |
| Doing the routed skill's work here | Hand off; the skill holds the procedure |
