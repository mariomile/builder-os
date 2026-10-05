---
name: evidence-ledger
description: "Use when writing any claim into a BuilderOS phase artifact, when auditing an artifact for unsourced numbers, or when a gate requires counting evidence"
---

# Evidence Ledger

"Never invent data" is a prohibition; the ledger makes it checkable. Every factual claim in a lifecycle artifact carries a source tag. Gates check resolving pointers and source counts; the model still judges whether a source supports the claim.

Read [operating modes](../../references/operating-modes.md) first. A standalone answer cites its direct sources in the requested format and destination, without lifecycle evidence files; the paths, gates and state writes below apply only to an explicitly selected initiative.

## Tag Grammar

`[class:identifier]`, at the end of the sentence it substantiates, before the period or after it, consistently within a document.

| Class | Meaning | Identifier format | Example |
|-------|---------|-------------------|---------|
| `data` | Live query against a connected data source | `tool:query-name` | `[data:mixpanel:activation_funnel_q3]` |
| `interview` | Primary conversation with a real person | participant codes, comma-separated | `[interview:P3,P7]` |
| `doc` | Existing written source: ticket, note, transcript, report | source slug or path | `[doc:support-tickets-aug]` |
| `code` | Read from the codebase | `path:line` | `[code:src/billing.ts:142]` |
| `estimate` | Derived number, method stated | method slug | `[estimate:bottom-up-tam]` |
| `assumption` | Believed, not verified | `unvalidated` or a test id | `[assumption:unvalidated]` |

## Every Tag Has a File

A pointer to nothing is an invented source. Every `interview`, `doc` and `data` tag has a file in `evidence/` holding the raw material it cites: notes, the pasted query output with its parameters, the excerpt. Names, format and lookup order: [the state schema](../../references/builderos-state-schema.md), section Evidence Files. Gate condition E.1 checks it on every gate.

Write the evidence file when the source is captured, not when the gate fails: notes written from memory a week later are a `doc` about an interview, not the interview. What the user tells you in the conversation is `[doc:user-{YYYY-MM-DD}-{topic}]`, with their words copied verbatim into the file.

## Source Hierarchy

Choose the source that best answers this claim by directness, relevant population, observation date, provenance and known limitations; source class alone never decides a conflict. Estimates and assumptions stay explicitly uncertain. Read all relevant conflicting sources, not just the first found. Write the conflict into the artifact, recording both and explaining the choice or leaving it unresolved. Examples: [examples.md](references/examples.md), Source Conflicts.

## Counting Rules

1. **An evidence unit is one tag on one distinct claim.** One tag repeated across five sentences is one unit.
2. **Primary sources** are `data`, `interview`, `code`. `doc` counts as primary only when the document is itself a record of primary contact (a transcript, a support ticket), not a summary of one.
3. **`estimate` and `assumption` never count toward an evidence threshold.** They are allowed in artifacts, but they are not evidence.
4. **Distinct sources.** Five quotes from one interview are one source. So are lines of one code file (regardless of line number or symlink alias) and multiple exports of one query or document; evidence files may declare `**Source identity:** {stable upstream source}` to identify this equivalence. A new filename does not create independent evidence.
5. **Every number gets a tag.** Percentages, counts, currency, dates of events. Adjectives of scale ("most", "many", "rapidly") count as numbers and need a tag or a rewrite.

## Rewrite Protocol

An untagged claim is neither deleted nor silently tagged. Rewrite it into the weakest honest form and mark it: narrow the claim to what the source supports, separate the observation from the causal story, and name the test that would settle it. All three, every time. Worked example: [examples.md](references/examples.md), Rewrite Protocol.

## Audit Mode

A gate check or an artifact audit runs this pass:

1. Extract every sentence containing a number, a proportion word, or a causal claim.
2. Flag each one without a tag.
3. Count units per class.
4. Report: total claims, tagged, untagged, primary units, distinct sources, assumption ratio.
5. Fail the gate if the phase threshold is not met, naming the specific untagged sentences.

A high assumption ratio fails only when that phase's gate demands otherwise; phase 0 is almost entirely assumptions, correctly.

## Common Mistakes

| Mistake | Why it fails | Correct |
|---------|-------------|---------|
| Tagging a whole paragraph once | The tag no longer identifies which claim came from where | Tag each claim |
| `[interview:users]` | Not a distinct source; unverifiable | `[interview:P2,P5]` with a participant key in the artifact |
| Using `[estimate:*]` to launder an assumption | An estimate states a method; an assumption has none | If there is no method, it is `[assumption:unvalidated]` |
| Tagging a recommendation | Recommendations are judgments, not facts | Tag the evidence the recommendation rests on |
