---
name: design-direction
description: "Lets the person choose a product's look by seeing it: rendered versions that differ in structure, iterated in rounds, then a design kit and tokens. Use when an interface needs its look decided, options to compare, or a component kit picked."
---

# Design Direction

`ux-architecture` decides what the interface is: placement, flows, states. This skill decides what it looks like, and has the person choose it by seeing it. A look chosen by whoever writes the first component is a decision nobody made; a look chosen from one mock-up had nothing to compare against. So: several real **versions** side by side, a choice, then the system the build applies.

**Mode.** Standalone produces the versions and the comparison for the supplied screen or product, in the requested destination. In the lifecycle it runs inside phase 4 after `ux-architecture` has written the flows, writes `DESIGN.md` → `## Visual direction`, and gate 4.9 checks it; the kit is chosen after `stack-decisions` has settled the interface layer. Both per [operating modes](../../references/operating-modes.md). Read the [direction method](references/direction-method.md) for the axes of difference, the version file rules, the kit card and the token list.

## Procedure

1. **Read the inputs.** `PRODUCT.md` voice adjectives and their counter-examples, the ICP and where they work, the primary flow in `DESIGN.md`, and the existing design system: `TECH.md` → Design system first, then the tokens and kit in the code. Done when you can say whether a design system exists and which screen the person will see most.
2. **Decide what is open.** No interface (an API, a job, a CLI with no new output): write `**Visual direction:** not applicable, {reason}` and stop. An existing design system: the style is inherited and the composition of the new screens is open, so at least two **layout versions** inside the system. A new product, or a restyle the person asked for: the style is open, so at least three **visual directions**. Lite mode takes two either way. Change track: one version, or `**Visual direction:** inherited, {reason}` when no screen changes its composition. Done when the number and kind of versions is set.
3. **Diverge on structure.** Each version takes one named axis (layout model, information hierarchy, primary affordance or density), stated in one line and traced to the voice adjectives: "calm, for operators who keep it open all day" is a direction; "blue version" is a palette. On a new product each direction pairs its structure with a tone. Render the same screen in every version, the primary-flow step the person sees most, with realistic domain content labelled as sample content, so density problems show. Done when no two versions share an axis.
4. **Show them where they will live.** When the product exists and runs, mount the versions inside the real page (its header, navigation, data and density) behind a `?variant=` switch on a throwaway branch, and record the route per version. Otherwise write `.builderos/initiatives/{initiative}/design/{letter}-v{n}.html`, self-contained (inline styles, system fonts), one per version, with the surrounding chrome sketched in. Use `ui.render` where it resolved. Present each with what it optimizes, what it gives up and which user it fits. Done when the person can open every version.
5. **Converge in rounds.** Ask which version per `pressure-testing`, recommending one tied to the voice and the ICP. The person picks one or combines named parts ("A's layout with C's palette"), which becomes a new file `{letter}-v{n+1}.html`, so every round stays comparable. After three rounds with no choice, recommend fixing the strongest and listing what is still unsettled as later polish. Done when the person named the version, recorded as `**Chosen by:**`.
6. **Choose the design kit** once `stack-decisions` has decided the interface layer. An inherited system is named and the step ends. Otherwise a kit card per the method: two to four options (the existing kit, a headless component library, a full opinionated kit, platform-native components, custom), each with fit to the frontend, built-in accessibility, theming against the chosen direction, licence, and the cost of leaving it later. A new product's kit is an ADR. Done when the person chose the kit.
7. **Extract the system.** The version files are a reference; the build implements with the kit's components. From the chosen version write the tokens (colour roles with contrast ratios, type scale, spacing scale, radius, elevation, motion) and the composition rules (grid, density, where primary actions sit). Done when every value the chosen version uses is a named token.
8. **Record** in `DESIGN.md` → `## Visual direction` per the [design template](../ux-architecture/references/design-template.md), and add the choice to the spec's `## What we chose` summary. A new look reaches `TECH.md` → Design system at ship (gate 6.9), so the next feature inherits it. Done when gate 4.9 passes on the file.

## Watch for

| Do | Instead of |
|---|---|
| Versions that differ in structure, same screen, same content | Three palettes of one layout |
| Mount them in the real page when the product exists | Judging each on a blank page, where every version looks fine |
| A new numbered file per round | Overwriting what the person was comparing |
| Tokens and rules, built with the kit | Shipping the chosen HTML as the first component |
| Inherit the system and vary the layout, for a feature | Restyling an existing product by accident |

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `ui.render` | Showing each version where the person already is: a host preview, an artifact, a design-tool frame, a screenshot | Self-contained HTML files and their paths; always available with `files.write` |
| `repo.read` | The existing design system: tokens, components, the installed kit | Ask; mark the inheritance unverified |
| `web.search` | The candidate kits' licence, maintenance and accessibility claims | State them as unverified with the page to check |
| `files.read` / `files.write` | `PRODUCT.md` voice, `DESIGN.md`, the version files | Text wireframes, only for a standalone answer kept in chat |

## Output Contract

`## DIRECTION CHOSEN` with the versions shown and their files or routes, the choice and who made it, the kit and its alternatives, and the tokens.
