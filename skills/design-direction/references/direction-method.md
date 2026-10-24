# Direction Method

The references, the axes, the defaults to steer away from, the file rules, the kit card and the token list behind `design-direction`. Product names are examples of a kind of option, never defaults.

## References

Three to five real screens, captured before any version is drawn, saved as `design/refs/{product}-{screen}.png` in the initiative folder and listed under `**References:**` with one line each. Pick them for this ICP and this kind of screen: the tools the ICP opens every day, and the best example of the same pattern anywhere (the list, the report, the editor). Each line names what to take from it: the hierarchy, the density, how the primary action sits, a typographic choice, an empty state. A reference is a source of craft, never a template to copy; a version that reads as a clone of one reference has failed the axis.

## Defaults to Steer Away From

The look a generator produces unprompted is the same for every product, so it says nothing about this one. Each version names in its `Avoids` column the default it replaces, and what replaces it:

- A centred hero with a gradient headline and two buttons, on a page that is a tool, not a landing page
- Purple-to-blue gradients, glassmorphism, glowing borders
- One sans-serif at one weight everywhere, with hierarchy done by size alone
- Cards with identical radius and shadow for every kind of content
- Emoji or generic line icons as the only visual identity
- Centred text blocks, equal spacing everywhere, no rhythm between sections
- Grey placeholder content ("Lorem ipsum", "Item 1") that hides density problems

## Axes of Difference

Structural axes first: every version takes a different one of the first four rows. The last two are tone, layered on a structure on a new product, never a version on their own.

Pick one axis per version and say it. Two versions on the same axis at opposite ends make the trade-off visible; three versions on three axes give the widest spread.

| Axis | One end | Other end | Who it tends to fit |
|------|---------|-----------|---------------------|
| Density | Compact tables, many rows on screen | Spacious cards, one thing at a time | Operators all day / occasional users |
| Tone | Quiet, neutral, tool-like | Expressive, branded, warm | Back-office / consumer or sales-led |
| Hierarchy | One dominant action per screen | Many equal entry points | First-time users / experts |
| Layout model | Sidebar navigation + workspace | Single column, step by step | Multi-object products / linear flows |
| Colour temperature | Cool, low saturation | Warm, high contrast accents | Trust and data / energy and action |
| Type personality | Neutral sans, tight | Characterful serif or rounded sans | Utility / editorial or friendly |

Tie each version to the voice adjectives in `PRODUCT.md`. A version that contradicts a counter-example ("calm, not sleepy") is dropped before the user sees it.

## Clickable Prototype

What a person from the ICP walks in the real-user session (gate 4.13), before the look, the stack or the architecture cost anything. It tests the concept, so it carries no visual decisions that would draw comments away from it.

- **One file, every screen.** `design/prototype.html`, inline styles only, each step of the primary flow a `<section id="step-n">` and each action a link to the next step; a hash router of three lines is enough. The first day comes first on a new product.
- **Real words.** Labels, empty states, errors and the one message the flow sends, in the voice from `PRODUCT.md`; sample data labelled as sample, at realistic volume.
- **The hard states.** At least the empty screen and one error, reachable by a link, because that is where people stick.
- **Neutral look.** System fonts, greys, one accent for the primary action. A person who comments on colour is telling you the concept passed.
- **What it does not do.** No backend, no saved state beyond the page, no login. The price is shown where it will be, so the session can record what the person did with it (gate 4.14).

Example, a no-show reminder for a physio clinic: welcome (connect your calendar) → today's list (sample patients, one flagged at risk) → a reminder preview with the WhatsApp text → sent, with the empty list for a day with no bookings and the error for a calendar that refused access.

## Version Files

- **In the real app** when the product exists and runs: the versions render inside the existing page behind a `?variant=` URL parameter, with a small switcher bar (previous, label, next, arrow keys) that never ships to production; the variant code lives on a throwaway branch named for the initiative, and the main branch keeps only the chosen direction, rebuilt properly. The File column records the route (`/reports?variant=b`) and the branch.
- **As files** otherwise. Path: `.builderos/initiatives/{initiative}/design/{letter}-v{n}.html`, for example `a-v1.html`, `b-v1.html`, `c-v1.html`, then `a-v2.html` for the first revision of A.
- Self-contained: one file, inline CSS, no build step, opens from disk in any browser. Type is part of the direction: where the version has type personality, embed a real typeface (a web font linked from a font service, or inlined) with a system stack as the fallback, and name it in the header comment. System fonts are a choice for a quiet, tool-like direction, not the default for all.
- Same screen in every version, at desktop width, with a narrow-width rendering below it when the ICP uses phones.
- Realistic content from the domain, with a visible "sample content" label. The empty and error state of that screen, small, under the main rendering, so the direction is judged on its hard states too.
- A header comment with the axis, the voice adjectives it serves and the date.

Where `ui.render` resolved, show the same files through it; the files remain the record.

## Presenting a Round

```markdown
Versions on the main screen of {flow step}; open the files to compare them side by side.

- **A. {name}** (`design/a-v1.html`): {axis and what it optimizes}. Gives up {what}. Fits {who}.
- **B. {name}** (`design/b-v1.html`): …
- **C. {name}** (`design/c-v1.html`): …
→ Recommended: **{X}**, because {voice adjective and ICP fact, with tag}.

Answer with a letter, or combine named parts: "A's layout with C's palette".
```

## The Kit Card

Asked after the interface layer is decided.

```markdown
**Q{n} — Design kit: which component library builds this direction?**
- **A. {kit}** ({one-line gloss}): fits {frontend} {yes/how}. Accessibility: {what it handles: focus, keyboard, ARIA}. Theming to the chosen tokens: {easy / partial / fights it}. Licence: {licence, tagged or unverified}. Leaving later: {what that takes}.
- **B. …**
→ Recommended: **{X}**, because {deciding factor}.
```

Kinds of option: the kit already installed; a headless library that brings behaviour and accessibility while the look comes from the tokens (Radix, React Aria, Headless UI); a copy-in component collection on a utility CSS framework (shadcn/ui on Tailwind); a full opinionated kit (MUI, Mantine, Chakra); platform-native components (Material, Human Interface); custom components on the tokens alone, which is rarely right for a first version.

## Tokens

Extracted from the chosen version into `DESIGN.md`, in a table the build reads:

| Token group | What to write |
|-------------|---------------|
| Colour roles | background, surface, text, muted text, primary, primary text, border, success, warning, danger; each value with its contrast ratio against what it sits on |
| Type | families, scale (sizes and line heights per role), weights |
| Spacing | the scale (for example 4, 8, 12, 16, 24, 32) and the default gaps |
| Shape | radius per element kind, border widths |
| Elevation | shadows or the decision not to use them |
| Motion | durations and the reduced-motion behaviour |

Composition rules sit under the table in a few lines: grid and max width, density, where the primary action sits, how many actions a screen may surface.
