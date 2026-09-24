---
name: bos-init
description: "Start a BuilderOS pipeline: create PRODUCT.md and the .builderos/ state directory"
---

Entry point for any idea, problem, or existing product entering the BuilderOS lifecycle. Creates the durable product truth and the pipeline state.

**REQUIRED BACKGROUND:** `builder-os`, `evidence-ledger`. Template at `references/product-md-template.md`, schema at `references/builderos-state-schema.md`.

## Steps

1. **Check for existing state.** If `.builderos/state.json` exists, report the current phase and stop — this is not a re-init. Offer `/bos-status` instead.

2. **Migrate, do not re-ask.** If `PM-CONTEXT.md` exists, read it and pre-fill every field it covers. Ask only for what is missing.

3. **Interview for `PRODUCT.md`.** One question at a time. Do not present a form. The fields:
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

5. **Scaffold:**
   ```
   PRODUCT.md
   .builderos/state.json      schema 1, current_phase 0, cycle 1, all phases pending, track per step 6
   .builderos/decisions/
   ```

6. **Classify the track** per `builder-os`, section Tracks, and say it out loud with the reason before anything else runs. `spike` when the user wants an answer, not a product. `feature` when a product already exists and the request changes it. `product` otherwise, and whenever two tracks both fit.
   - `feature`: run the coverage check in `gate-checks` against the `PRODUCT.md` just written. Pass: record phases 0 and 1 as `covered`, start at phase 2. Fail: say which condition failed, set the track to `product`, start at phase 0.
   - `spike` and `product`: start at phase 0.

   Write `track` to `state.json` and a `track_set` event with the reason. For `feature`, default the mode question in step 4 to `lite`.

7. **Report and route.** One screen: what was created, the track and why, the starting phase, and the next command.

## Arguments

- `[idea]` — Optional one-line idea or problem. Seeds the interview.
- `[--lite]` — Skip the mode question, set lite.
- `[--from-pm-context]` — Force migration from `PM-CONTEXT.md` without prompting.
- `[--track spike|feature|product]` — Propose a track. Still announced, and `feature` still has to pass the coverage check.

## Output

```markdown
## PIPELINE INITIALIZED

**Product:** {name}
**Stage:** {stage}
**Mode:** {full | lite}
**Track:** {spike | feature | product} — {one-line reason}
**Starting phase:** {N} — {phase name}{, phases 0–1 covered by PRODUCT.md, if feature}

Created: PRODUCT.md, .builderos/state.json

{One line on what phase N will do.}

Next: `/bos-frame`, or `/bos-define` on the feature track
```
