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
   .builderos/state.json      schema 1, current_phase 0, cycle 1, all phases pending
   .builderos/decisions/
   ```

6. **Detect the starting phase.** An idea with nothing built starts at 0. An existing product with a validated problem may legitimately start at 2 or 3 — ask, and record the skipped phases in `history` as `skipped_at_init` so phase 7 knows what was never checked.

7. **Report and route.** One screen: what was created, the starting phase, and the next command.

## Arguments

- `[idea]` — Optional one-line idea or problem. Seeds the interview.
- `[--lite]` — Skip the mode question, set lite.
- `[--from-pm-context]` — Force migration from `PM-CONTEXT.md` without prompting.

## Output

```markdown
## PIPELINE INITIALIZED

**Product:** {name}
**Stage:** {stage}
**Mode:** {full | lite}
**Starting phase:** {N} — {phase name}

Created: PRODUCT.md, .builderos/state.json

{One line on what phase N will do.}

Next: `/bos-frame`
```
