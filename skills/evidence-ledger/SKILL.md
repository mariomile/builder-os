---
name: evidence-ledger
description: "Keeps every claim traceable: the source-tag grammar, one evidence file per tag, importing outside material, how gates count sources. Use when writing a claim into an artifact, saving notes or data the person brings, or auditing for unsourced numbers."
---

# Evidence Ledger

The ledger makes "every number has a source" checkable. Every factual claim in a lifecycle artifact carries a source tag. Gates check resolving pointers and source counts; the model still judges whether a source supports the claim.

**Mode.** A standalone answer cites its direct sources in the requested format and destination; the evidence files, gates and state writes below belong to a lifecycle initiative. Both per [operating modes](../../references/operating-modes.md).

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

Write the evidence file when the source is captured: notes written from memory a week later are a `doc` about an interview, not the interview. What the user tells you in the conversation is `[doc:user-{YYYY-MM-DD}-{topic}]`, with their words copied verbatim into the file.

## Evidence From Outside the Session

Most evidence lives somewhere the session cannot reach: interview notes in a notes app, a call transcript, a CSV export, a support inbox, a survey tool. It counts the moment its raw material is in `evidence/`. Ask the user to paste it or give the file path, then save it with `scripts/bos.mjs evidence add --class interview|doc|data --id {id} --where "{where it came from}" [--from {file}]` (the raw material from the file or pasted on stdin; `--shared` for evidence behind `PRODUCT.md`, `DOMAIN.md` or `TECH.md`), which writes the format above and prints the tag to cite. One participant per interview file. A link alone is not evidence: save the excerpt the claim rests on, with the link as **Where**. Where commands cannot run, write the same file by hand. Resolve a connected source first when one answers the question (`tickets.read`, `meetings.read`, `docs.search`); importing is the floor, not a second-class path.

## Source Hierarchy

Choose the source that best answers this claim by directness, relevant population, observation date, provenance and known limitations; the source class alone leaves a conflict open. Estimates and assumptions stay explicitly uncertain. Read every relevant conflicting source. Write the conflict into the artifact, recording both and explaining the choice or leaving it unresolved. Examples: [examples.md](references/examples.md), Source Conflicts.

## Counting Rules

1. **An evidence unit is one tag on one distinct claim.** One tag repeated across five sentences is one unit.
2. **Primary sources** are `data`, `interview`, `code`. `doc` counts as primary only when the document is itself a record of primary contact (a transcript, a support ticket), not a summary of one.
3. **Evidence thresholds count `data`, `interview`, `code` and primary `doc` units.** `estimate` and `assumption` belong in artifacts, marked as what they are.
4. **Distinct sources.** Five quotes from one interview are one source. So are lines of one code file (regardless of line number or symlink alias) and multiple exports of one query or document; evidence files may declare `**Source identity:** {stable upstream source}` to identify this equivalence. A new filename does not create independent evidence.
5. **Every number gets a tag.** Percentages, counts, currency, dates of events. Adjectives of scale ("most", "many", "rapidly") count as numbers and need a tag or a rewrite.

## Rewrite Protocol

An untagged claim is kept and made honest: rewrite it into the weakest honest form and mark it: narrow the claim to what the source supports, separate the observation from the causal story, and name the test that would settle it. All three, every time. Worked example: [examples.md](references/examples.md), Rewrite Protocol.

## Audit Mode

A gate check or an artifact audit runs this pass:

1. Extract every sentence containing a number, a proportion word, or a causal claim.
2. Flag each one without a tag.
3. Count units per class.
4. Report: total claims, tagged, untagged, primary units, distinct sources, assumption ratio.
5. Fail the gate if the phase threshold is not met, naming the specific untagged sentences.

A high assumption ratio fails only when that phase's gate demands otherwise; phase 0 is almost entirely assumptions, correctly.

## Watch for

| Do | Instead of |
|---|---|
| Tag each claim | One tag for a whole paragraph |
| `[interview:P2,P5]` with a participant key in the artifact | `[interview:users]` |
| `[assumption:unvalidated]` when there is no method | An `[estimate:*]` with no method behind it |
| Tag the evidence a recommendation rests on | Tagging the recommendation itself |
