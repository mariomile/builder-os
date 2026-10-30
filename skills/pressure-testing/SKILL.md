---
name: pressure-testing
description: "Grills a decision before it is relied on: rounds of up to four questions, each with options, consequences and a recommendation, until no branch is open. Use when a decision is about to pass a gate, the person asks to be grilled, or branches are open."
---

# Pressure Testing

An interview primitive any phase can call, against unchallenged premises turned into confident artifacts. Standalone or inside a phase, per [operating modes](../../references/operating-modes.md); the ADRs and gate effects below belong to a lifecycle initiative.

## The Design Tree

Interview relentlessly until you and the person share one understanding of the decision. Map it as a **design tree**: every decision branches into the decisions that hang off it.

**Stop when the frontier is empty:** every branch decided by the person, accepted as a risk, or deferred with a named test and owner, and nothing silently assumed. Agreement is not a stop. A reversible detail is one branch, an irreversible bet grows many; branches past the requested decision are named once as out of scope. Act once the person confirms the understanding is shared.

## Method

1. **Restate the claim in its strongest form**, better than the person put it, and show it in the first round, so a misreading is corrected before any question rests on it.
2. **Name the load-bearing assumption:** the single belief that, if false, collapses the whole thing.
3. **Attack that one, plainly.** Peripheral objections change nothing.
4. **Demand the falsifier:** what would have to be true for this to be wrong? If nothing could, it is a preference; record it as one.
5. **Price the answer:** the cheapest way to find out. Every unresolved branch exits with a test and a cost, or an explicit decision to proceed without one.
6. **Log the deferrals.** An accepted risk is fine; an unnoticed one is the failure.

## Rounds

A **round** asks the frontier: the open questions whose answers depend on no other open question. At most four, most load-bearing first. **Numbers run on across rounds:** if round 1 ends at Q4, round 2 starts at Q5, so Qn always names one question; a question asked again keeps its number. The attack on the load-bearing assumption is a chain, so it runs one question per round beside the independent branches.

Every round has the same dry shape, in the person's language:

```markdown
🎯 **Thesis:** {the claim in its strongest form}; it rests on {the load-bearing assumption}. Correct me if I misread it.

---
❓ **Q{n} · {short title}**
- **A** {option} → {what happens if chosen}
- **B** {option} → {what happens if chosen}
- **C** {option} → {what happens if chosen}

➡️ **B**: {the deciding factor, with its source tag when it rests on a fact}.

---
❓ **Q{n+1} · {short title}**
{One plain line, for a fact only the person holds.}

---
📍 {n} decided · {n} open · {n} deferred · next: {the branch the next round opens}
✍️ `{n}B, {n+1} …` or "go with the recommendations"
```

The 🎯 line opens the first round and any round after the thesis changes; the 📍 line closes every round.

**Options:** two to four the person could credibly pick, including the ones you would argue against (doing nothing, the cheaper version, the reversal). **Recommend the strongest option, not the safest**, in one clause naming the deciding factor; when none clearly wins, recommend the cheapest way to get the deciding fact. "Yes" accepts the recommendation.

**Facts come in three kinds.** One the session can retrieve (a document, the repository, a search, a query) is yours: get it and state it with its tag, without blocking the questions that do not depend on it. One only the person holds (who uses the product, what a customer said) is one plain line with no options; the decisions resting on it wait a round. One neither side holds gets the ways to close the gap as options, per [round formats](references/round-formats.md). Guessed values as options invent evidence.

**Answering costs one line:** "yes", a code (`1B, 2A, 3 other: …`), free text, or "go with the recommendations", which records every recommended decision in the round as the person's. An answer that maps to no option and decides something hard to undo, or lifts a gate or scope limit, is restated as one option for a letter; otherwise take the most likely reading and say which. A hard-to-reverse, surprising trade-off becomes an ADR in `decisions/` in lifecycle mode; the rest live in the resolution table.

Each answer reshapes the tree: recompute the frontier and ask the next round. Routine reversible choices within delegated scope need no question (operating modes, Questions).

## Working Ahead

A waiting round does not stop the work: draft what hangs on each question on its recommended option, each block opened with `**Provisional:**`, with no `**Chosen by:**` and nothing irreversible. The answer keeps a confirmed block (marker removed) or redrafts it; gate E.2 fails while a marker is left. Details and round recording: [round formats](references/round-formats.md).

## Tone and Question Banks

Direct, aimed at the reasoning, warm toward the person; a softened question lets the premise survive. Follow the answer, not the script; [phase question banks](references/question-banks.md) hold examples for a deeper review.

## Output

Ends with the design tree as a resolution table, one row per branch, then three plain lines: what was decided, what is still at risk, what will be tested and by when.

```markdown
| Branch | Status | Evidence / Test | Cost |
|--------|--------|-----------------|------|
| ICP is mid-market ops leads | Resolved | 5 of 7 interviews `[interview:P1-P5]` | — |
| They will pay €200/mo | Deferred | Pricing page smoke test | 2 days |
| Integration is the blocker | Unresolved | No test designed | — |
```

Only unresolved branches named by the applicable gate block that gate. A mandatory condition stays mandatory when its risk is deferred; standalone work reports the limitation and creates no override.

## Watch for

| Do | Instead of |
|---|---|
| Open with the 🎯 thesis and its load-bearing assumption | Questions on a reading the person never saw |
| Close every round with the 📍 line | The person guessing how much is left |
| Continue the numbering from the last round | Restarting at Q1, so `1B` names two questions |
| Stop at an empty frontier | Stopping when the person agrees |
| Ask a fact only the person holds in one plain line | Options that guess its value |
| Recommend the strongest option, in one clause | The safest option, or a paragraph of reasons |
| Decide on an explicit answer or "go with the recommendations" | Applying recommendations nobody accepted |
| Draft ahead on the recommendation, marked provisional | Idling, or writing the recommendation in as decided |
