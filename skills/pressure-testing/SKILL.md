---
name: pressure-testing
description: "Grills a decision before it is relied on: rounds of up to four questions, each with options, consequences and a recommendation, until no branch is open. Use when a decision is about to pass a gate, the person asks to be grilled, or branches are open."
---

# Pressure Testing

An interview primitive any phase can call, against unchallenged premises turned into confident artifacts. Standalone or inside a phase, per [operating modes](../../references/operating-modes.md); the ADRs and gate effects below belong to a lifecycle initiative.

## The Design Tree

Interview relentlessly until you and the person share one understanding of the decision. Map it as a **design tree**: every decision branches into the decisions that hang off it.

**Stop when the frontier is empty:** every branch decided by the person, accepted as a risk, or deferred with a named test and owner, and nothing silently assumed. Agreement is not a stop. Branches past the requested decision are named once as out of scope. Act once the person confirms the understanding is shared.

## Method

1. **Restate the claim in its strongest form**, better than the person put it, and show it in the first round, so a misreading is corrected early.
2. **Name the load-bearing assumption:** the single belief that, if false, collapses the whole thing.
3. **Attack that one, plainly.** Peripheral objections change nothing.
4. **Demand the falsifier:** what would have to be true for this to be wrong? If nothing could, it is a preference; record it as one.
5. **Price the answer:** the cheapest way to find out. Every unresolved branch exits with a test and a cost, or an explicit decision to proceed without one.
6. **Log the deferrals.** An unnoticed risk is the failure.

## Rounds

A **round** asks the frontier: the open questions whose answers depend on no other open question. At most four, most load-bearing first. **Numbers run on across rounds and sessions:** if round 1 ends at Q4, round 2 starts at Q5, so Qn always names one question. The attack on the load-bearing assumption is a chain, so it runs one question per round beside the independent branches.

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

**Options:** two to four the person could credibly pick, including ones you would argue against (doing nothing, the cheaper version, the reversal). **Recommend the strongest option, not the safest**, in one clause naming the deciding factor; when none clearly wins, recommend the cheapest way to get the deciding fact. "Yes" accepts the recommendation.

**Facts come in three kinds.** One the session can retrieve (a document, the repository, a search, a query) is yours: get it with its tag, without blocking the other questions. One only the person holds (who uses the product, what a customer said) is one plain line with no options; the decisions resting on it wait a round. One neither side holds gets the ways to close the gap as options, per [round formats](references/round-formats.md). Guessed values as options invent evidence.

**Answering costs one line:** "yes", a code (`1B, 2A, 3 other: …`), free text, or "go with the recommendations", which records every recommended decision in the round as the person's. An answer that maps to no option and decides something hard to undo, or lifts a gate or scope limit, is restated as one option for a letter; otherwise take the likeliest reading and say so. A hard-to-reverse, surprising trade-off becomes an ADR in `decisions/` in lifecycle mode; the rest live in the resolution table.

Each answer reshapes the tree: recompute the frontier and ask the next round. Routine reversible choices within delegated scope need no question (operating modes, Questions).

## Across Sessions

A decision takes as many sessions as its frontier needs, sharing one **question log**: each Qn, its answer, who, when, the answers it **rests on**, its status. In lifecycle mode it is `grilling.md` in the initiative's folder, so phase 0 and phase 4 answers meet; elsewhere `.builderos/grilling/{topic}.md` where a project exists, or the closing table in the conversation. Read it first: numbering resumes after its last Qn, its open branches are the frontier. Check each new answer against every logged answer and recorded decision: one that **contradicts** an earlier answer becomes the next round's first question (⚠️, both answers quoted, which one holds), and one that **opens a branch** adds it to the tree, marked with the Qn it came from. A replaced answer stays, marked superseded, and every answer resting on it, directly or through another, is asked again. Where commands run, `scripts/bos.mjs grill` reads the logs: next number, open questions, answers to ask again, a broken log; the briefing shows them. Format: [round formats](references/round-formats.md).

## Working Ahead

A waiting round does not stop the work: draft on the recommended options, each block opened with `**Provisional:**`, nothing irreversible; gate E.2 fails while a marker is left. Details and round recording: [round formats](references/round-formats.md).

## Tone and Question Banks

Direct and warm; a softened question lets the premise survive. Follow the answer, not the script; [question banks](references/question-banks.md) hold examples.

## Output

Ends with the design tree as a resolution table, one row per branch, then three plain lines: what was decided, what is still at risk, what will be tested and by when.

```markdown
| Branch | Status | Evidence / Test | Cost |
|--------|--------|-----------------|------|
| ICP is mid-market ops leads | Resolved | 5 of 7 interviews `[interview:P1-P5]` | — |
| They will pay €200/mo | Deferred | Pricing page smoke test | 2 days |
| Integration is the blocker | Unresolved | No test designed | — |
```

Only unresolved branches the applicable gate names block it; a deferred risk leaves a mandatory condition mandatory, and standalone work reports the limitation.

## Watch for

| Do | Instead of |
|---|---|
| Continue the numbering from the last round or session | Restarting at Q1, so `1B` names two questions |
| Ask a contradiction with an earlier answer first, both quoted | Letting the later answer silently win |
| Reopen every answer resting on a replaced one | Keeping decisions built on an answer nobody holds anymore |
| Stop at an empty frontier | Stopping when the person agrees |
| Ask a fact only the person holds in one plain line | Options that guess its value |
| Recommend the strongest option, in one clause | The safest option, or a paragraph of reasons |
| Decide on an explicit answer or "go with the recommendations" | Applying recommendations nobody accepted |
| Draft ahead on the recommendation, marked provisional | Idling, or writing the recommendation in as decided |
