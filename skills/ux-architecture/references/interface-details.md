# Interface Details

What separates a product people call well made from one that merely works. The build applies these while writing components (`delivery-discipline`, step 5), the craft critique checks them (gate 5.12), and the token check in the guardrail enforces the first section on every change (gate 5.10). Numbers are starting points with their source where one exists; a product with a reason to differ records the difference in `DESIGN.md`.

## Tokens in the Code

The chosen direction survives only if the code cannot drift from it.

- **One source.** Every colour, spacing step, radius, shadow, type size, weight and duration lives in one token file (CSS custom properties, the kit's theme, a theme object). Components read tokens.
- **A check, not a habit.** The guardrail fails on raw values outside the token file: a colour literal (hex, rgb, hsl), a utility class from the framework's default palette instead of the project's, a spacing or font size that is not on the scale. A lint rule, a stylelint rule or a search in CI all work; record which under `TECH.md` → Quality checks as the token check.
- **Exceptions are named.** A one-off value goes into the token file with a comment saying where and why, so the next screen can find it.

## Every Interactive Element, Every State

- Default, hover (pointer devices only), pressed, focus-visible, disabled, loading; selected or checked where it applies. A disabled control says why on hover or next to it.
- Hit area at least 24 by 24 CSS pixels (WCAG 2.2, target size), 44 by 44 on touch.
- The focus ring comes from the tokens, visible on every background, and appears on keyboard focus, not on mouse click.

## Feedback and Speed

- Every action answers within 100 ms: a pressed state, an optimistic update, a progress indicator. Past 1 s, show progress; past 10 s, move it to the background and notify on completion.
- A loading indicator appears after a short delay (about 300 ms) and, once shown, stays long enough to read (about 500 ms), so fast responses do not flash.
- Skeletons and reserved space match the final layout: nothing moves when content arrives.
- Reversible actions update optimistically and roll back with a message on failure; destructive ones offer undo before confirmation dialogs.
- Core Web Vitals at the 75th percentile of real visits: largest contentful paint 2.5 s or less, interaction to next paint 200 ms or less, cumulative layout shift 0.1 or less (the "good" thresholds published by web.dev). Gate 5.14 records the measurement.

## Forms

- A visible label on every field; a placeholder is an example, not the label.
- The right input type, `autocomplete` and `inputmode`, so phones show the right keyboard and browsers fill what they know. Paste works in every field, codes and passwords included.
- Errors sit next to the field, say what to do, and appear on leaving the field or on submit. The form keeps everything typed after an error and focuses the first field in error.
- Enter submits; the submit button shows progress and ignores a second press while the first is in flight.

## Keyboard and Focus

- Every action reachable by keyboard in visual order.
- A dialog takes focus when it opens, keeps it inside, returns it on close, and closes on Escape.
- In a tool people keep open all day, the frequent actions have shortcuts, shown in menus and tooltips.

## Content and Layout

- Numbers in tables use tabular figures and align right; amounts carry their currency, dates follow the locale, recent times read as relative with the exact time on hover.
- Test every screen with the longest real value (a long company name, an email, a word with no break): it truncates with the full text reachable, or wraps without breaking the layout.
- Reading text runs 45 to 75 characters per line; headings wrap balanced.
- Empty states say what goes here and offer the first action. Errors say what happened and what to do next, in the product's voice.

## State in the URL

Filters, tabs, sort order, page and the open record live in the URL, so a link, a refresh or the back button returns to the same view.

## Motion

- Durations come from the tokens, usually 100 to 300 ms for interface changes. Motion shows where something went or what changed state.
- With `prefers-reduced-motion`, movement becomes a fade or an instant change.

## Themes

When the product offers a dark theme, every colour token has a value per theme, contrast is checked in both, and shadows, borders and images are adjusted rather than inverted.

## Next to the References

The critic puts each capture beside the reference screens in `design/refs/` and names, per reference, where the built screen falls short on the detail that reference was chosen for. "None found" means the built screen holds its own next to the best of its kind.
