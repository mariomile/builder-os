---
name: bos-init
description: "Start a BuilderOS project or a new initiative in one: PRODUCT.md, TECH.md, the roadmap and the .builderos/ state directory"
---

Entry point for any idea, problem, or existing product entering the BuilderOS lifecycle, and for every new initiative after the first. The first run creates the project memory (product truth, technical context, roadmap, and the pointer that makes every future session read them). Later runs add an initiative to it.

**REQUIRED BACKGROUND:** `builder-os`, `evidence-ledger`. Template at `references/product-md-template.md`, schema at `references/builderos-state-schema.md`.

## Steps

1. **Check for existing state.** If `.builderos/ROADMAP.md` exists, the project is already initialized: skip to step 6 and add a new initiative. If a `schema: 1` file sits at `.builderos/state.json`, migrate it first per the schema's Rules and say what moved.

2. **Migrate, do not re-ask.** If `PM-CONTEXT.md` exists, read it and pre-fill every field it covers. Ask only for what is missing.

3. **Interview for `PRODUCT.md`.** In rounds per `pressure-testing` (Rounds): the fields below are mostly independent, so ask them together, numbered, each with a recommended answer drawn from whatever the session can already read (a README, existing docs, `PM-CONTEXT.md`). A field whose answer depends on another (non-goals depend on the purpose) waits for the next round. The fields:
   - Product name and one-sentence purpose
   - The problem, stated without solution language
   - Primary ICP, and how they solve it today
   - Non-goals — push until there are at least three
   - Constraints: technical, regulatory, resource, distribution
   - Voice: two or three adjectives, each with a counter-example
   - Existing data sources

   Tag every answer. A new product's `PRODUCT.md` is mostly `[assumption:unvalidated]` and that is the correct starting state — say so rather than dressing guesses as facts.

4. **Ask two setup questions:**
   - Mode: `full` or `lite` (lite relaxes elaboration conditions on gates 2, 3, 4 and 6; it never relaxes evidence, kill criteria, test mapping, rollback or baseline)
   - Commit `.builderos/` to version control, or gitignore it. Default: commit.

5. **Scaffold the project** (first run only):
   ```
   PRODUCT.md
   TECH.md                    from the repository when readable, otherwise from the user; "no code yet" is a valid answer
   .builderos/ROADMAP.md      Direction from PRODUCT.md, empty tables, Verified today
   .builderos/decisions/
   .builderos/evidence/       the sources behind every tag in PRODUCT.md and TECH.md, one file each
   ```
   Then add the BuilderOS block from the schema's Session Start section to the project's `AGENTS.md` (create it if absent), and to `CLAUDE.md` if one exists and does not import `AGENTS.md`. This is what makes a new session on any host, plugin or no plugin, read the memory before it answers. Show the user the block you added. Add `.builderos/local.json` to `.gitignore`: which initiative is active belongs to one person's checkout.

   Every tag written in step 3 gets its evidence file per the schema (Evidence Files). An answer the user gave in this interview is `[doc:user-{date}-{topic}]` with their words copied into the file.

6. **Name the initiative.** Every piece of work is an initiative: a feature, a bet, a new product. Ask for a short name, derive the slug, create `.builderos/initiatives/{slug}/` with an `evidence/` folder and a `state.json` (schema 2, status `open`, all phases pending, cycle 1), and write the slug to `.builderos/local.json`. An existing active initiative stays as it is; set its status to `paused` and say it is paused, not closed.

7. **Classify the track** per `builder-os`, section Tracks, and say it out loud with the reason before anything else runs. `spike` when the user wants an answer, not a product. `feature` when a product already exists and the request changes it. `product` otherwise, and whenever two tracks both fit.
   - `feature`: run the coverage check in `gate-checks` against the `PRODUCT.md` just written. Pass: record phases 0 and 1 as `covered`, start at phase 2. Fail: say which condition failed, set the track to `product`, start at phase 0.
   - `spike` and `product`: start at phase 0.

   Write `track` to the initiative's `state.json` and a `track_set` event with the reason. For `feature`, default the mode question in step 4 to `lite`, and on a later initiative ask that question now.

8. **Update the roadmap.** The initiative goes under Now with its track, starting phase, one-line bet and folder.

9. **Report and route.** One screen: what was created, the initiative, the track and why, the starting phase, and the next command.

## Arguments

- `[idea]` — Optional one-line idea or problem. Seeds the interview.
- `[--lite]` — Skip the mode question, set lite.
- `[--initiative name]` — Name the initiative up front.
- `[--from-pm-context]` — Force migration from `PM-CONTEXT.md` without prompting.
- `[--track spike|feature|product]` — Propose a track. Still announced, and `feature` still has to pass the coverage check.

## Output

```markdown
## PIPELINE INITIALIZED

**Product:** {name}
**Stage:** {stage}
**Initiative:** {title} — `.builderos/initiatives/{slug}/`
**Mode:** {full | lite}
**Track:** {spike | feature | product} — {one-line reason}
**Starting phase:** {N} — {phase name}{, phases 0–1 covered by PRODUCT.md, if feature}

Created: {PRODUCT.md, TECH.md, ROADMAP.md, the AGENTS.md block, on the first run} .builderos/initiatives/{slug}/

{One line on what phase N will do.}

Next: `/bos-frame`, or `/bos-define` on the feature track
```
