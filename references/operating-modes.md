# Operating Modes and Resource Paths

Read this when choosing between a standalone request and a lifecycle phase, or when a resource path is unclear. The user's scope, supplied context, destination and authorization determine the mode.

## Standalone

A request for a guide, diagnosis, recommendation, document, plan, review or calculation is standalone unless the user asks to run an initiative or phase. An existing `.builderos/` directory does not change that intent.

1. Use supplied requirements, transcripts, spec, code or figures. Read relevant context when available; ask only for missing information that materially blocks the requested result.
2. Apply the relevant method, preserving the requested depth and format. State assumptions, unavailable measurements and contradictions without manufacturing a baseline, customer quote or source.
3. Return the answer inline or write to the requested destination. Do not create initiative state, run lifecycle gates, or log a gate override to justify a standalone draft. A local mirror is required only when an authorized lifecycle needs readback.

Examples: An interview guide can use the supplied research goal without `00-frame.md`. A PRD can use requirements without `03-solution-bet.md`. A task breakdown can use the attached spec without building or claiming tests pass. Release planning does not authorize exposure or publishing.

Standalone source citations may link directly to sources or identify supplied material. Save raw evidence only when the requested artifact or reproducible analysis needs it, beside that artifact at a permitted destination. Do not initialize `.builderos/` to store citations. Never copy secrets or unrelated customer rows into outputs.

## Lifecycle

Use the lifecycle procedure when the user requests an initiative, a named phase, or continuation of the pipeline. Read state and prior artifacts, enforce gates, write the phase artifact and record the result through the script where commands run. A failed condition stays failed until corrected or explicitly overridden; a standalone draft is not a gate pass.

Authorization to plan, implement or test does not imply permission to push, publish, deploy, expose users, or contact others. Carry forward authorization already granted. Routine in-scope decisions and checks proceed without repeated confirmation.

Unknown is not zero. Preserve baseline definition, population, window, capture date and provenance. A new product or metric may have a legitimate zero, but its supported reason must be explicit; lack of access is not that reason.

## Questions and Resource Loading

Read only resources relevant to the selected mode. Retrieve facts before asking. Ask for a material unresolved preference or decision outside delegated authority; make routine choices already entrusted to the agent. Ask in rounds per `pressure-testing` (Rounds): every question lists its options, recommends one and says why; a factual question offers ways to close the gap, never guessed values.

## Path Resolution

The **project root** holds user inputs, outputs and `.builderos/`. The **installation root** holds BuilderOS `skills/`, `references/` and `scripts/`; these may differ.

Resolve the real `SKILL.md` path, following a discovery symlink. The installation root is two directories above that file's directory. Shared `references/...` and `scripts/...` paths are relative to that root; a skill-specific reference link is relative to its skill directory. Markdown links resolve relative to their containing file. Never search the user's project for plugin support files because it is the working directory.

For example, `skills/spec-writing/SKILL.md` links to `../../references/operating-modes.md`, while `skills/pm-artifacts/SKILL.md` links to its own `references/templates.md`. Keep the entire installation bundle when exposing skills manually.
