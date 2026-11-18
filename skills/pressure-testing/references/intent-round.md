# The Intent Round

Read when an initiative starts, and whenever a message from the person changes what they want.

Round 1 of any initiative, before its first phase: what the person has in mind, asked once, so a change of direction surfaces on day one instead of mid-build.

1. **Look first.** Read `PRODUCT.md`, `decisions/`, earlier initiatives, the person log and every file they named. What you find arrives as "found {X} in {file}: still true?", never as an open question.
2. **Ask only what is missing**, at most five questions, each with your recommended answer: what they want built, who uses it, what they will see or be able to do when it is done, what it must not do or become, and what wins when two of these pull apart.
3. **Write it in their words** on top of `BRIEF.md` or `CHANGE.md`: `**Building:**`, `**Why:**`, `**For:**`, `**Done when:**`, `**Not:**`, one line each (gates E.4, E.5). Every phase reads these lines before it starts.
4. **Keep it true.** A later message that contradicts a line is said at once, both quoted; on the person's word the line is rewritten as `new (from {date}; previously old)`, and work resting on the old line is named.

## Who decides what

**The person decides what the product is, how it looks and the technical choices that shape it:** what the user sees, does or pays, what gets built first, money or time spent; the design (layout, navigation, how many screens, the look); the stack, the architecture, the data model, an outside service, anything that costs money or is hard to reverse. Each is discussed as a round question in plain words: what it is, why it matters, each option with what it gains and costs, a recommendation. **The agent decides the details inside those choices:** a library within the chosen stack, file layout, naming, sequencing. Decide, and tell the person in one plain line, `**Decided:** {X}, because {Y}`, in `LOG.md` → Decisions and in the next slice report, so they can reverse it. A kind of question the person answers with "just do it" becomes a detail: note it and stop asking it.

In the lifecycle a round arrives with the work already drafted on its recommendations ([round formats](round-formats.md), Working ahead), so "go with the recommendations" costs no wait.

## Depth where it pays (build track)

The `build` track is the default for an idea the person can describe. It skips the discovery and the market, not the thinking. The depth goes to three places, and the ceremony around them goes away.

- **What to build, pressure-tested.** On `build` the intent round does not stop at five questions: it is the full interview on what the person really wants and where to focus (for whom, what the first version does and leaves out, what would make it the best), run until the frontier is empty and closed by the context brief in `grilling.md` (gate N.7).

- **The problem, without a discovery.** How the job runs today, step by step, who does each step in which tool, and where it breaks: the time, the errors, the waiting (`### Steps today`, gate N.6). It comes from the people who do the job and their materials, in one session. A month of research runs only when the person asks for it, and then the work is a `spike` or a `product`.
- **The solution, designed.** The journeys and flows the users will walk, drawn (4.20); the features they need; for each, how to build it and at least two real candidates to buy or integrate, searched and priced (3.5); the stack decided with cards that weigh real alternatives, never the first tool suggested; and the spec says how the code will last, `## Maintainability` (4.23), which the build review holds the diff to (5.19).

The person is asked where a choice is theirs: the solution and the prototype version (3.6, 3.16, 4.9), the spec with its rules, stack, connectors and plan (4.10, 4 acceptance, 5.6), going live (5.17, 6.8, 6.13, 6 acceptance). Choices that fall in between are drafted on their recommendation and ride in the next of these rounds, so one answer is quoted in each field it settles. Slice reports carry a link and `**Decided:**` lines, never a question.

## Plain words

Write to the person in their words. A term of yours (a gate number, a slice id, a module, a name coined in an earlier session) is explained the first time it appears in a message, or replaced by what it does. Product nouns are the ones in `PRODUCT.md` → Language.

| Do | Instead of |
|---|---|
| "found {X} in {file}: still true?" | Asking what the memory already answers |
| Five questions at most, each with a recommendation | A questionnaire per phase |
| Rewrite a contradicted line with its date, on the person's word | Building on the old line, or silently following the new one |
| Discuss a design or technical choice in plain words, with what each option gains and costs | Deciding the layout or the architecture alone, or asking in jargon |
| Decide a detail and say so in one line | A question about a file layout or a name |
