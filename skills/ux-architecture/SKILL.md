---
name: ux-architecture
description: "Use when a feature needs its information architecture, user flows, state coverage, component inventory or accessibility floor defined before anyone builds it"
---

# UX Architecture

The structural half of phase 4: placement, flows, states, components and the accessibility floor, decided before a pixel is chosen. Visual craft is separate.

## Mode and resources

Follow [operating modes and resource paths](../../references/operating-modes.md). **Standalone:** design the supplied feature or flow using available product context and the existing design system, without a solution-bet file or spec-writing handoff. **Lifecycle:** phase prerequisites, artifact paths and gate recording below apply only when the user requests that phase or initiative; missing prerequisites block that transition, not a standalone artifact, and a completion marker with a gate verdict claims lifecycle completion only after the gate passes.

Load `evidence-ledger` when lifecycle user-behavior claims need tagging and [capability mapping](../../references/capability-map.md) when resolving an external capability. Do not load `spec-writing` to perform this design task. Ask what remains per the `pressure-testing` rounds: options, a recommendation and why; for a factual gap, ways to close it, never guessed values.

Read the relevant section of [UX methods](references/ux-methods.md) for the tables behind steps 3 to 7.

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `repo.read` | Existing components, navigation and flows | Ask the user to describe them; mark the inventory as unverified |
| `docs.search` | Design system documentation, prior flow decisions | Ask |
| `analytics.replay` | Where users actually stall in the current flow | Skip; design from structure rather than observation, and say so |
| `files.read` / `files.write` | Supplied context, requested design and lifecycle artifacts | Inline design needs no file write; lifecycle writes require it |

**No data capability is required.** Where a design-quality toolchain is present, hand it the visual layer and keep the structure here; where none is, say visual polish is not covered.

## Procedure

Apply only the steps needed for the requested artifact. Delegate when available and authorized; otherwise run inline.

1. **Read the feature inputs.** Standalone design uses the supplied feature, goal and constraints. Lifecycle SHAPE reads `03-solution-bet.md`: the primary user action is the flow this skill designs.
2. **Map the current structure:** navigation, the area this touches, existing components. Without `repo.read`, ask and mark the inventory unverified.
3. **Place the feature** where the user expects it, or name the cost of the easy spot. Current and proposed structure side by side; name what moves.
4. **Design the flows.** Every entry point, steps (user action, system response), decision points, both exits, reversibility. Any multi-step flow states its abandonment exit: discard, draft or resume.
5. **Cover the relevant states:** empty (with the action that fills it), loading, partial, error, success, permission. Inspect existing auth, tenancy and permission behavior before defining the permission state, and preserve that contract; if unavailable, label the assumption unverified rather than choosing a disclosure policy. Error copy names what failed and the next action, where disclosure is permitted.
6. **Inventory the components:** exists, extend (name what else it affects), new (justify it).
7. **State the accessibility floor.** Keyboard path with tab order for the primary flow, contrast target as a ratio, focus behavior on open, close, error and completion.
8. **Deliver the design** to the requested destination. In lifecycle SHAPE write the initiative's `DESIGN.md` and hand its flow list to the spec phase when requested. A complete design alone does not pass gate 4.

Completion marker: `## DESIGN COMPLETE` with the flow list, the state matrix, the component inventory and the accessibility floor.

## Output Contract

Lifecycle output is `DESIGN.md` in `.builderos/initiatives/{initiative}/`, written to the [design template](references/design-template.md) with its headings and labels kept exactly.

## Common Mistakes

| Mistake | Why it fails | Correct |
|---------|-------------|---------|
| Replacing a deliberate concealed-resource 404 with an access message | Can reveal a protected resource | Preserve the actual auth contract and verify permitted recovery behavior |
| Four new components for one feature | The design system was ignored | Look for the existing pattern first |
| Requiring initiative state for a standalone request | Expands the user's scope | Use supplied context and the requested destination; do not initialize or override a gate |

More rows close UX methods.
