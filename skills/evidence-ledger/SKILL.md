---
name: evidence-ledger
description: "Use when writing any claim into a BuilderOS phase artifact, when auditing an artifact for unsourced numbers, or when a gate requires counting evidence"
---

# Evidence Ledger

The mechanism behind the Iron Law. "Never invent data" is a prohibition; the ledger makes it checkable.

Every factual claim in a BuilderOS artifact carries a source tag. Gates count tags. An artifact whose claims are mostly assumptions cannot pass a gate that requires evidence, and no agent has to exercise taste to decide that.

## Tag Grammar

```
[class:identifier]
```

Placed at the end of the sentence it substantiates, before the period or after it, consistently within a document.

| Class | Meaning | Identifier format | Example |
|-------|---------|-------------------|---------|
| `mcp` | Live query against a connected data source | `tool:query-name` | `[mcp:mixpanel:activation_funnel_q3]` |
| `interview` | Primary conversation with a real person | participant codes, comma-separated | `[interview:P3,P7]` |
| `doc` | Existing written source: ticket, note, transcript, report | source slug or path | `[doc:support-tickets-aug]` |
| `code` | Read from the codebase | `path:line` | `[code:src/billing.ts:142]` |
| `estimate` | Derived number, method stated | method slug | `[estimate:bottom-up-tam]` |
| `assumption` | Believed, not verified | `unvalidated` or a test id | `[assumption:unvalidated]` |

## Source Hierarchy

When two sources disagree, the higher class wins and the conflict is recorded rather than smoothed:

```
mcp  >  code  >  interview  >  doc  >  estimate  >  assumption
```

Live data beats what someone remembers. What someone said beats what a document claims about them. A stated method beats a feeling. An assumption never beats anything: it is a question wearing the clothes of an answer.

Conflicts are written into the artifact explicitly:

> Churn is 4.2% monthly `[mcp:supabase:churn_q3]`, though the board deck states 2.8% `[doc:board-deck-jul]`. Live data used; the deck is stale.

## Counting Rules

Gates ask questions like "≥5 evidence units from primary sources". The rules:

1. **An evidence unit is one tag on one distinct claim.** The same tag repeated across five sentences is one unit, not five.
2. **Primary sources** are `mcp`, `interview`, `code`. `doc` counts as primary only when the document is itself a record of primary contact (a transcript, a support ticket) and not a summary of one.
3. **`estimate` and `assumption` never count toward an evidence threshold.** They are allowed in artifacts, and they are useful, but they are not evidence.
4. **Distinct sources.** Five quotes from one interview are one source. Gate 1 requires five distinct sources, not five quotes.
5. **Every number gets a tag.** Percentages, counts, currency, dates of events. Adjectives of scale ("most", "many", "rapidly") count as numbers and need a tag or a rewrite.

## Rewrite Protocol

When an agent finds an untagged claim, it does not delete it and does not silently tag it. It rewrites it into the weakest honest form and marks it.

**Before:**
> Most sales reps spend over an hour a day on manual logging, which is why churn is high in that segment.

**After:**
> Three of seven reps interviewed described spending "over an hour" a day on manual logging `[interview:P1,P4,P6]`. Whether this drives churn in the segment is untested `[assumption:unvalidated]` — the link would show as a correlation between logging time and renewal, which we cannot query today.

The rewrite does three things: it narrows the claim to what the source supports, it separates the observation from the causal story, and it names the test that would settle it. Agents perform all three.

## Audit Mode

`/bos-gate` and any agent asked to audit an artifact runs this pass:

1. Extract every sentence containing a number, a proportion word, or a causal claim.
2. Flag each one without a tag.
3. Count units per class.
4. Report: total claims, tagged, untagged, primary units, distinct sources, assumption ratio.
5. Fail the gate if the phase threshold is not met, naming the specific untagged sentences.

An artifact with a high assumption ratio is not wrong. Phase 0 is almost entirely assumptions, correctly. The ratio is only a failure when the gate for that phase demands otherwise.

## Common Mistakes

| Mistake | Why it fails | Correct |
|---------|-------------|---------|
| Tagging a whole paragraph once | The tag no longer identifies which claim came from where | Tag each claim |
| `[interview:users]` | Not a distinct source; unverifiable | `[interview:P2,P5]` with a participant key in the artifact |
| Using `[estimate:*]` to launder an assumption | An estimate states a method; an assumption has none | If there is no method, it is `[assumption:unvalidated]` |
| Counting five quotes from one person as five units | Inflates the evidence base | One source, one unit |
| Dropping the conflicting source | Hides the disagreement that mattered | Record both, state which won and why |
| Tagging a recommendation | Recommendations are judgments, not facts | Tag the evidence the recommendation rests on |
