---
name: design-direction
description: "Use when a product or feature with a user interface needs its look and feel chosen, when the user wants to see several design versions before deciding, or when a design kit or component library has to be picked"
---

# Design Direction

`ux-architecture` decides what the interface is: placement, flows, states. This skill decides what it looks like, and makes the user choose it by seeing it. A look chosen by whoever writes the first component is a decision nobody made; a look chosen from one mock-up is a decision with nothing to compare against. So: several real versions, side by side, then a choice, then the system the build applies.

## Mode and resources

Follow [operating modes and resource paths](../../references/operating-modes.md). **Standalone:** produce the versions and the comparison for the supplied screen or product, in the requested destination; write no lifecycle state. **Lifecycle:** runs inside phase 4 SHAPE after `ux-architecture` has written the flows, and writes the `## Visual direction` section of `DESIGN.md`; gate 4.9 checks it. The design kit is chosen after `stack-decisions` has settled the interface layer.

Ask through the `pressure-testing` rounds. Read the [direction method](references/direction-method.md) for the axes of difference, the version file rules, the kit card and the token list.

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `ui.render` | Showing each version where the user already is: a host preview, an artifact, a design tool frame, a screenshot of a running page | Write each version as a self-contained HTML file and tell the user the paths to open; always available because `files.write` is |
| `repo.read` | The existing design system: tokens, components, the kit already installed | Ask; mark the inheritance unverified |
| `web.search` | The candidate kits' licence, maintenance and accessibility claims | State them as unverified with the page to check |
| `files.read` / `files.write` | `PRODUCT.md` voice, `DESIGN.md`, the version files | Inline sketches need no write; lifecycle writes require it |

**Seeing is the floor, not a bonus.** HTML files need nothing connected. Text-only wireframes are acceptable only for a standalone answer the user asked to keep in chat.

## Procedure

1. **Read the inputs.** `PRODUCT.md` voice adjectives and their counter-examples, the ICP and where they work, the primary flow in `DESIGN.md`, and the existing design system where one exists.

2. **Decide what is open.** No interface (an API, a job, a CLI with no new output): write `**Visual direction:** not applicable, {reason}` and stop. An existing design system (feature track, or any product that has one): the style is inherited; what is open is the composition of the new screens, so produce at least two **layout versions** inside the system. A new product, or a restyle the user asked for: the style is open; produce at least three **visual directions**. Lite mode needs two either way.

3. **Diverge on purpose.** Each version differs from the others on a named axis (density, tone, hierarchy, layout model, colour temperature, type personality), stated in one line, and each traces to the voice adjectives: "calm, for operators who keep it open all day" is a direction; "blue version" is not. Render the same screen in every version: the step of the primary flow the user will see most, with realistic content from the domain, labelled as sample content. No lorem ipsum: it hides the density problem the version exists to show.

4. **Show them.** Through `ui.render` where it resolved, and always as files: `.builderos/initiatives/{initiative}/design/{letter}-v{n}.html`, self-contained (inline styles, no network fonts required), one per version. Present the paths and, per version: what it optimizes, what it gives up, which user it fits.

5. **Converge in rounds.** Ask which version, with a recommendation tied to the voice and the ICP. The user can pick one, or combine named parts ("A's layout with C's palette"): that becomes a new file `{letter}-v{n+1}.html`, never an overwrite, so every round stays comparable. After three rounds without a choice, recommend fixing the strongest version and listing what is still unsettled as a later polish item.

6. **Choose the design kit** once the interface layer is decided in `stack-decisions`. Inherited system: name it and stop. Otherwise a kit card per the method: two to four options (the existing kit, a headless component library, a full opinionated kit, platform-native components, custom), each with fit to the frontend, accessibility built in, theming against the chosen direction, licence, and what leaving it later costs. A new product's kit is an ADR.

7. **Extract the system.** The version files are a reference, not code. From the chosen one write the tokens the build applies (colour roles with contrast ratios, type scale, spacing scale, radius, elevation, motion) and the composition rules (grid, density, where primary actions sit). The build implements them with the kit's components; it never copies the HTML.

8. **Record** in `DESIGN.md` → `## Visual direction` per the [design template](../ux-architecture/references/design-template.md), and add the choice to the spec's `## What we chose` summary.

Completion marker: `## DIRECTION CHOSEN` with the versions shown and their files, the choice and who made it, the kit and its alternatives, and the tokens.

## Common Mistakes

| Mistake | Why it fails | Correct |
|---------|-------------|---------|
| Three versions that differ only in colour | The user chooses a palette, not a direction | Differ on a named axis each; same screen, same content |
| Lorem ipsum or an empty dashboard | Hides density and hierarchy problems | Realistic domain content, labelled as sample |
| Overwriting a version after feedback | The user loses what they were comparing | Every round is a new numbered file |
| Shipping the chosen HTML as the first component | Demo code without states, accessibility or the kit | Extract tokens and rules; build with the kit |
| Picking the kit before the frontend | The kit may not exist for the chosen frontend | Kit after the interface layer is decided |
| Three new directions for a feature in an existing product | Restyles the product by accident | Inherit the system; vary the layout |
