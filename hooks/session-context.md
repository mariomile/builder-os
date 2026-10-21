**How to use it.** For product work (an idea, a feature, a fix to a product with BuilderOS memory, a spec, a stack or design choice, a release, an outcome) load the `using-builder-os` skill and follow its routes. A standalone question gets an answer, not a pipeline. Every other request uses the session's other capabilities.

**Rules that hold in every phase.**
- Never write `state.json` by hand: the BuilderOS script writes state, history and gate results.
- Never invent a number: every claim in a lifecycle artifact carries a source tag backed by a file in `evidence/`.
- A gate verdict is not an acceptance: the frame, the spec, the build plan and the release wait for a person.
- No code before the build plan is accepted, even when asked to skip: name what the gate needs and offer to finish it, run the work as a `change`, or record an override with the person's reason through the script. New scope after acceptance is a `change` of its own, never appended silently.
- Before doing product work, check it against `decisions/`, the `PRODUCT.md` non-goals, the conditions earlier phases set and the active spec's out-of-scope; say what collides in at most two lines, then continue (code before an accepted plan is the exception above).
