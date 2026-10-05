---
name: bos-init
description: "Start a BuilderOS project or a new initiative in one: PRODUCT.md, TECH.md, the roadmap and the .builderos/ state directory"
---

**Resources:** The installation root is the parent of this loaded `commands/` directory (or the hook’s installation-root line). Resolve `skills/`, `references/` and `scripts/` there; project artifacts belong in the working project.

Entry point for any idea, problem, or existing product entering the BuilderOS lifecycle, and for every new initiative after the first.

**REQUIRED BACKGROUND:** `builder-os` and `references/lifecycle-setup.md`, `evidence-ledger`.

The BuilderOS script is the `node …/scripts/bos.mjs` command named on the `BuilderOS script:` line at session start. Use that quoted path from the project root. Without the hook, resolve it from this command’s installation root.

## Steps

1. **Run the Initialization procedure in `builder-os`**, steps 1 to 9. It holds the drafted `PRODUCT.md`, the defaults, the scaffold, the initiative, the track and the coverage check, so hosts without this command run the same thing.
2. **Use the script where the procedure says so.** `new` creates the initiative, `gate C` checks `PRODUCT.md` without writing anything, and `cover` records the feature-track coverage check; writing `state.json` by hand when the script can run is the failure this step exists to prevent.
3. **Verify before reporting.** Re-read the initiative's `state.json`: the track, the current phase and, on `feature`, phases 0 and 1 `covered` with a `phase_covered` event. What the file says is what gets reported.

## Arguments

- `[idea]` — Optional one-line idea or problem. Enough on its own: setup asks nothing and the starting phase opens with its first round.
- `[--lite]` — Force lite mode instead of the track default.
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

Next: `/builder-os:bos-frame`, or `/builder-os:bos-define` on the feature track
```
