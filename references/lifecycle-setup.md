# Lifecycle Setup

Read when initializing an authorized initiative, switching initiatives, or changing a track. Resource paths resolve from the installation root per [operating modes](operating-modes.md). A standalone document or analysis uses supplied inputs without initialization.

## Initialization

Runs when `.builderos/` does not exist yet, and again for every new initiative after the first. The first run creates the project memory: product truth, technical context, the roadmap, and the pointer that makes every future session read them. Later runs add an initiative. Template at [PRODUCT.md template](product-md-template.md), schema at [state schema](builderos-state-schema.md), tagging per `evidence-ledger`.

1. **Check for existing state.** If `.builderos/ROADMAP.md` exists, the project is initialized: go to step 6. If a `schema: 1` file sits at `.builderos/state.json`, migrate it first per the schema's Rules and say what moved.
2. **Migrate, do not re-ask.** If `PM-CONTEXT.md` exists, pre-fill every field it covers and ask only for what is missing.
3. **Interview for `PRODUCT.md`** in rounds per `pressure-testing` (Rounds): independent fields together, numbered, with factual fields pre-filled only from cited sources (a README, docs, `PM-CONTEXT.md`); recommendations apply to decisions, not observations; a field that depends on another waits for the next round. Fields: name and one-sentence purpose; the problem without solution language; primary ICP and how they solve it today; at least three non-goals; constraints (technical, regulatory, resource, distribution); voice, two or three adjectives each with a counter-example; existing data sources. Tag every answer. A new product's `PRODUCT.md` is mostly `[assumption:unvalidated]`, which is the correct starting state: say so rather than dressing guesses as facts.
4. **Two setup questions.** Mode `full` or `lite` (lite relaxes elaboration conditions on gates 2, 3, 4 and 6, never evidence, kill criteria, test mapping, rollback or baseline). Commit `.builderos/` or gitignore it; default commit.
5. **Scaffold** (first run only): `PRODUCT.md`; `TECH.md` from the repository when readable, otherwise from the user ("no code yet" is a valid answer), including its Verify commands: one each for build, test and lint, found in the manifests and CI configuration, with their healthy output recorded when running them is authorized; `.builderos/ROADMAP.md` with Direction from `PRODUCT.md`, empty tables and today's Verified date; `.builderos/decisions/`; `.builderos/evidence/` with one file per source behind every tag in `PRODUCT.md` and `TECH.md` (an interview answer is `[doc:user-{date}-{topic}]` with the user's words copied in). Add the BuilderOS block from the schema's Session Start section to the project's `AGENTS.md` (create it if absent), and to `CLAUDE.md` if one exists and does not import `AGENTS.md`; show the user the block. Add `.builderos/local.json` to `.gitignore`.
6. **Name the initiative.** Ask for a short name and derive the slug. Where commands run, `scripts/bos.mjs new {slug} --title "..." --track {track} --reason "..."` creates `.builderos/initiatives/{slug}/` with `evidence/` and a schema-conformant `state.json`, pauses the previously active initiative, writes `local.json` and regenerates the roadmap. Elsewhere, write the same by hand, copying the schema's example field for field. A paused initiative is paused, not closed: say so.
7. **Classify the track** per Tracks below and say it out loud with the reason before anything else runs. On `feature`, run the coverage check in `gate-checks` against `PRODUCT.md`: where commands run, `scripts/bos.mjs gate C` first (it only reads), fix what is a drafting error per `gate-checks`, judge C.4 yourself, then `scripts/bos.mjs cover --c4 "how the request serves the evidenced problem"` decides the rest and writes the result either way. Pass: phases 0 and 1 `covered`, start at phase 2. Fail: name the condition, the track becomes `product`, start at phase 0. For `feature`, default the mode question to `lite`. `spike` and `product` start at phase 0.
8. **Update the roadmap.** The initiative sits under Now with its track, starting phase, one-line bet and folder (the script's `roadmap` regenerates the table).
9. **Report and route** on one screen: what was created, the initiative, the track and why, the starting phase, what that phase will do.

## Initiatives

A project runs several pieces of work over its life, sometimes at once: a new onboarding in discovery while an export feature ships. Each is an **initiative** with its own folder, its own track, its own phase and gates. `PRODUCT.md`, `TECH.md`, `ROADMAP.md` and `decisions/` are shared across all of them.

One initiative is **active** at a time; every command acts on it. Starting a new one (initialization run again on an initialized project) pauses the current one, never closes it. Switching is explicit and named to the user. An initiative closes at phase 7, at a phase 1 kill, or at a spike's answer, and moves to Done and dropped in the roadmap with its learning.

Two initiatives touching the same part of the product is a signal, not an error: say so when the second one reaches phase 4, because their specs will collide.

## Tracks

**Writing the state.** Where commands can run, a new initiative is created with `scripts/bos.mjs new {slug} --title "..." --track {track} --reason "..."`, and the feature track's coverage check is recorded with `scripts/bos.mjs cover --c4 "..."` after you judge C.4. The script writes the state file, its history events and the roadmap exactly as the schema defines them. Write `state.json` by hand only where commands cannot run, and then copy the schema's example field for field.

Not every request needs all eight phases. Before the first phase runs, classify the work into a track and **say the classification out loud**, with its reason, so the user can correct it: "this is a change to a product that already has evidence behind it, so I'm treating it as a feature and starting at phase 2".

| Track | The request | Runs | Ends |
|-------|-------------|------|------|
| `spike` | "Is X worth doing?", "does anyone actually have this problem?" The output is an answer, not a product | Phases 0 and 1 | The phase 1 verdict is the answer. Status `answered`, pipeline stops |
| `feature` | A change to a product that exists, whose `PRODUCT.md` already carries evidence for the problem and the ICP | Coverage check, then phases 2 to 7 | Phase 7, like any pipeline |
| `product` | A new product, a new segment, or anything whose problem has never been evidenced | Phases 0 to 7 | Phase 7 |

Choose the smallest track that answers the authorized request and satisfies its evidence contract. If the distinction changes the scope materially, clarify that choice; do not expand a standalone question into a product lifecycle.

**The coverage check** stands in for phases 0 and 1 on the `feature` track. `gate-checks` holds its conditions. Pass, and phases 0 and 1 are recorded `covered`, each with the `PRODUCT.md` tags that covered it. Fail, and the work is a `product`, starting at phase 0: say which condition failed and why that means the problem has not been evidenced yet.

**The ratchet goes one way.** A track upgrades when the work reveals it was heavier than classified, and never downgrades:

- A completed `spike` stops with status `answered`. Building requires the user to authorize a subsequent feature/product initiative; reuse the evidence while preserving the answered spike history.
- A `feature` upgrades to `product` when a phase 2 or later gate fails because the evidence the covered phases should have supplied is missing: an opportunity that traces to nothing, an ICP that the change does not serve, a problem the phase 2 work contradicts. Re-enter phase 0, keep every artifact written so far, log `track_upgraded` with the observation that forced it.

Stop and say so the moment an upgrade is due. Finishing the current phase on a track already known to be wrong produces an artifact built on the wrong foundation.
