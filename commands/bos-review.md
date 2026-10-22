---
name: bos-review
description: "Product review: read every lever of the metric tree, judge the stage, propose at most three initiatives for the person to pick, and update the roadmap"
---

**Resources:** The installation root is the parent of this loaded `commands/` directory (or the hook’s installation-root line). Resolve `skills/`, `references/` and `scripts/` there; project artifacts belong in the working project.

**Inline:** the review is one round with the person, run in this conversation. Load `builder-os` and read its `references/product-review.md`; load `product-analysis` only for the area a lever needs.

## Steps

1. **Check project state.** `PRODUCT.md` must exist; without it, offer `/builder-os:bos-init`. Run `scripts/bos.mjs brief` and note what is due.
2. **Read the latest review** in `.builderos/reviews/`, `PRODUCT.md` → `## Business`, `ROADMAP.md`, open initiatives, watches and outcome reviews due.
3. **Resolve capabilities** per `references/capability-map.md`: analytics in the shapes of `references/analytics-contract.md`; with nothing connected, ask for the numbers or write `unavailable` with the question.
4. **Run the procedure** in `product-review.md`: set up `## Business` on the first review, read every lever, judge the stage against its exit thresholds, propose one to three initiatives, ask the person in one round.
5. **Write `.builderos/reviews/{YYYY-MM-DD}.md`** and run `scripts/bos.mjs review`. A failed condition is fixed, not reported as done. Judge R.5.
6. **Update memory.** Amend `PRODUCT.md` if the stage moved, update `ROADMAP.md` → Next with what the person picked, run `scripts/bos.mjs roadmap`.

## Arguments

- `[--read-only]` — Read the levers and the stage, propose nothing, write no review.

## Notes

The review never starts an initiative: a picked proposal starts through `/builder-os:bos-init` or `/builder-os:bos`. An overdue watch or outcome review is proposed before new work.
