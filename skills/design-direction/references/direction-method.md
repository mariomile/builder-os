# Direction Method

The axes, the file rules, the kit card and the token list behind `design-direction`. Product names are examples of a kind of option, never defaults.

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

## Version Files

- **In the real app** when the product exists and runs: the versions render inside the existing page behind a `?variant=` URL parameter, with a small switcher bar (previous, label, next, arrow keys) that never ships to production; the variant code lives on a throwaway branch named for the initiative, and the main branch keeps only the chosen direction, rebuilt properly. The File column records the route (`/reports?variant=b`) and the branch.
- **As files** otherwise. Path: `.builderos/initiatives/{initiative}/design/{letter}-v{n}.html`, for example `a-v1.html`, `b-v1.html`, `c-v1.html`, then `a-v2.html` for the first revision of A.
- Self-contained: one file, inline CSS, system fonts or a font stack that degrades cleanly, no build step, opens from disk in any browser.
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
