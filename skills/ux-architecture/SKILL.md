---
name: ux-architecture
description: "Designs how a feature works before it is built: information architecture, user flows, every state of each step, components, the accessibility floor. Use when a feature needs its flows, screens or states defined, or a spec needs DESIGN.md."
---

# UX Architecture

The structural half of phase 4: placement, flows, states, components and the accessibility floor, decided before a pixel is chosen. The look comes next, chosen by the person from several rendered versions in `design-direction`.

**Mode.** Standalone designs the supplied feature or flow from the available product context and the existing design system. In the lifecycle it runs inside phase 4 for `spec-writing` and writes the initiative's `DESIGN.md`. Both per [operating modes](../../references/operating-modes.md). Read the section of [UX methods](references/ux-methods.md) behind steps 3 to 7.

## Procedure

1. **Read the feature inputs.** Standalone uses the supplied feature, goal and constraints. The lifecycle reads `03-solution-bet.md`: its primary user action is the flow this skill designs. Done when the primary action is stated in one line.
2. **Map the current structure:** navigation, the area this touches, existing components; without `repo.read`, ask and mark the inventory unverified. Done when the touched area and its components are listed.
3. **Place the feature** where the user expects it, or name the cost of the easy spot, with current and proposed structure side by side. Done when what moves is named.
4. **Design the flows.** Every entry point, the steps (user action, system response), decision points, both exits, reversibility; a multi-step flow states its abandonment exit (discard, draft or resume). Done when every flow has its entries, steps and exits.
5. **Cover the states:** empty (with the action that fills it), loading, partial, error, success, permission. The permission state follows the existing auth, tenancy and permission contract, inspected first; where it cannot be read, the assumption is labeled unverified. Error copy names what failed and the next action, where disclosure is permitted. Done when every step of every flow has its six states.
6. **Inventory the components:** exists, extend (naming what else it affects), new (with its justification). Done when every component in the flows has one of the three.
7. **State the accessibility floor:** the keyboard path with tab order for the primary flow, the contrast target as a ratio, focus behavior on open, close, error and completion. Done when all three are written.
8. **Deliver the design** to the requested destination. In the lifecycle write `DESIGN.md` per the [design template](references/design-template.md), headings and labels exact, then hand the primary flow to `design-direction` and the flow list to the spec; gate 4.9 also needs the visual direction. Done when `DESIGN.md` holds the flows, states, inventory and floor.

## Watch for

| Do | Instead of |
|---|---|
| Keep the actual auth contract, including a deliberate concealed-resource 404 | Replacing it with an access message that reveals the resource |
| The existing pattern first | Four new components for one feature |
| Supplied context and the requested destination for a standalone request | Creating initiative state for it |

More in [UX methods](references/ux-methods.md).

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `repo.read` | Existing components, navigation and flows | Ask the person to describe them; mark the inventory as unverified |
| `docs.search` | Design system documentation, prior flow decisions | Ask |
| `analytics.replay` | Where users actually stall in the current flow | Design from structure rather than observation, and say so |
| `files.read` / `files.write` | Supplied context, requested design and lifecycle artifacts | Inline design needs no file write; lifecycle writes require it |

**No data capability is required.** The visual layer is always covered: `design-direction` renders versions as files on any host, and uses a design toolchain where one resolved.

## Output Contract

`## DESIGN COMPLETE` with the flow list, the state matrix, the component inventory and the accessibility floor. Lifecycle output is the initiative's `DESIGN.md` per the [design template](references/design-template.md).
