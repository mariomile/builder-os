---
name: pressure-testing
description: "Interviews the person on an idea, plan or decision in numbered rounds with options and a recommendation, until nothing is assumed and the context to go on is shared. Use when asked to grill, brainstorm or stress-test, or before relying on a choice."
---

# Pressure Testing

The interview every BuilderOS skill runs when it needs the person: a raw idea, a brainstorm, a problem, a choice, a plan about to be relied on. It ends when you both share one understanding and you hold all the context the next step needs. Standalone or inside a phase, per [operating modes](../../references/operating-modes.md); ADRs and gate effects belong to a lifecycle initiative.

## The Design Tree

Interview relentlessly. Map what is open as a **design tree**: every decision or unknown branches into the ones hanging off it. The root depends on what was brought:

| Brought | Root | First branches |
|---|---|---|
| An idea, a brainstorm | What you need to proceed | Who it is for, the problem it removes, what done looks like, constraints, what was tried, what must not change |
| A plan or decision to rely on | The claim in its strongest form | The load-bearing assumption, what would prove it wrong, the cheapest way to find out |
| A choice between options | What the choice serves | The deciding factor, the options nobody listed: doing nothing, the cheaper version, the reversal |

Openers per situation and phase: [question banks](references/question-banks.md). Follow the answers, not the bank.

**Stop when the frontier is empty:** every branch decided by the person, accepted as a risk, deferred with a test and owner, or named once as out of scope; nothing silently assumed. Agreement is not a stop.

## Rounds

**Read before asking:** project memory, the question log, the repository, the documents the person named. A question they answer leaves the round.

A **round** asks the whole **frontier**: every open question whose prerequisites are settled, most load-bearing first; one resting on another still open waits a round. **Numbers run on across rounds and sessions:** if round 1 ends at Q6, round 2 starts at Q7, so Qn always names one question. One dry shape, in the person's language:

```markdown
🎯 **Thesis:** {the idea or claim in its strongest form}; it rests on {the load-bearing assumption}. Correct me if I misread it.

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

The 🎯 line opens the first round and any round after the thesis changes; 📍 closes every round.

**Options:** two to four the person could credibly pick, including ones you would argue against. **Recommend the strongest option, not the safest**, in one clause naming the deciding factor; when none wins, the cheapest way to get the deciding fact. Ask plainly: a softened question lets the premise survive.

**Facts come in three kinds.** One the session can retrieve is yours: get it with its tag, delegating the search where the host allows, while the rest of the frontier is asked. One only the person holds is one plain line, no options. One neither side holds gets the ways to close the gap as options. Guessed values as options invent evidence.

**Answers cost one line:** "yes", a code (`7B, 8A, 9 other: …`), free text, or "go with the recommendations", which records each recommendation of the round as the person's. Recompute the frontier and ask the next round. Routine reversible choices within delegated scope need no question. Unmapped answers, ADRs, provisional work while a round waits, round recording: [round formats](references/round-formats.md).

## Across Sessions

A topic takes as many sessions as its frontier needs, sharing one **question log**: each Qn with its answer, who, when, the answers it **rests on** and its status (`grilling.md` in the initiative's folder in lifecycle mode, `.builderos/grilling/{topic}.md` elsewhere in a project). Read it first: numbering resumes after its last Qn, its open rows are the frontier. An answer that **contradicts** a logged answer or a decision becomes the next round's first question (⚠️, both quoted); a replaced answer is marked superseded and everything resting on it is asked again. `scripts/bos.mjs grill` checks the logs. Format: [round formats](references/round-formats.md).

## Output

A **context brief**: the shared understanding, written so the next step, skill or session continues without asking again. Show it; act once the person confirms it.

```markdown
## Context brief: {topic}
**Goal:** {what this is for, in one line}
**Decided:** {each decision with its Qn}
**Facts:** {each established fact with its source tag}
**Constraints and non-goals:** {what must hold, what this will not do}
**At risk:** {accepted risks and deferred branches, each with its test, owner and date}
**Out of scope:** {branches named once and left}
**Next step:** {what happens now, and who does it}
```

Lifecycle mode appends it to the question log and carries it into the phase artifact. Only unresolved branches the applicable gate names block it; a deferred risk leaves a mandatory condition mandatory.

## Watch for

| Do | Instead of |
|---|---|
| Ask the whole frontier, round after round | Rationing questions, or asking ones that rest on open answers |
| Look up what can be looked up | Asking the person for a fact in the repository or the memory |
| Continue the numbering; ask a contradiction first, both quoted | Restarting at Q1, or letting the later answer silently win |
| Ask a fact only the person holds in one plain line | Options that guess its value |
| Stop at an empty frontier, then write the brief | Stopping when the person agrees |
