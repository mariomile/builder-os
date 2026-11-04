---
name: pressure-testing
description: "Interviews the person on an idea, plan or decision in numbered rounds with options and a recommendation, until nothing is assumed and the context to go on is shared. Use when asked to grill, brainstorm or stress-test, or before relying on a choice."
---

# Pressure Testing

Grilling, for every situation BuilderOS meets: a raw idea, a brainstorm, a problem, a choice, a plan about to be relied on. Standalone or inside a phase, per [operating modes](../../references/operating-modes.md); ADRs and gate effects belong to a lifecycle initiative.

## The Design Tree

Interview the person relentlessly until you reach a shared understanding. Map it as a **design tree**: every decision branches into the decisions that hang off it. The root follows what was brought:

| Brought | Root | First branches |
|---|---|---|
| An idea, a brainstorm | What you need to proceed | Who it is for, the problem it removes, what done looks like, constraints, what was tried, what must not change |
| A plan or decision to rely on | The claim in its strongest form | The load-bearing assumption, what would prove it wrong, the cheapest way to find out |
| A choice between options | What the choice serves | The deciding factor, the options nobody listed: doing nothing, the cheaper version, the reversal |

Openers per situation and phase: [question banks](references/question-banks.md). Follow the answers, not the bank.

## Rounds

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are settled: the questions you can ask now without guessing at answers you have not heard. A round asks the whole **frontier**, numbered, each with your recommended answer; then wait for the person's answers before the next round. **Numbers run on across rounds and sessions:** if round 1 ends at Q6, round 2 starts at Q7, so Qn always names one question.

```markdown
🎯 **Thesis:** {the idea or claim in its strongest form}; it rests on {the load-bearing assumption}. Correct me if I misread it.

---
❓ **Q{n} · {short title}**
{The question, with the context it needs.}
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

The 🎯 line opens the first round and any round after the thesis changes; 📍 closes every round, in the person's language. Options are the two to four the person could credibly pick, including ones you would argue against. **Recommend the strongest option, not the safest**, in one clause naming the deciding factor.

Each answered round reshapes the tree: settled decisions push the frontier outward and unblock the questions that depended on them. Recompute it and ask the next round. A question resting on another still open in this round belongs to a later round. Answers cost one line: a code (`7B, 8A, 9 other: …`), free text, or "go with the recommendations", which records each recommendation of the round as the person's.

## Facts and Decisions

Finding facts is your job, never the person's. Read the memory, the question log, the repository and the documents they named before round 1; when a question needs a fact from the environment, delegate the search where the host allows, and ask the rest of the frontier meanwhile: only the questions downstream of it wait. A fact only the person holds is one plain line, with no options and no recommendation, since a guessed value invents evidence. A fact neither side holds gets the ways to close the gap as options, per [round formats](references/round-formats.md).

The decisions are the person's: put each to them and wait. Routine reversible choices within delegated scope need no question.

## Done

The interview is done when the frontier is empty: every branch visited, decided, accepted as a risk, deferred with a test and owner, or named once as out of scope, and nothing silently assumed. Then write the **context brief**, the shared understanding the next step, skill or session continues from without asking again, and act on it only once the person confirms it.

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

Only unresolved branches the applicable gate names block it; a deferred risk leaves a mandatory condition mandatory.

## Across Sessions

A topic takes as many sessions as its frontier needs, sharing one **question log**: each Qn with its answer, who, when, the answers it **rests on** and its status (`grilling.md` in the initiative's folder in lifecycle mode, `.builderos/grilling/{topic}.md` elsewhere in a project); the brief is appended to it. Read it first: numbering resumes after its last Qn, its open rows are the frontier. An answer that **contradicts** a logged answer or a decision becomes the next round's first question (⚠️, both quoted); a replaced answer is marked superseded and everything resting on it is asked again. `scripts/bos.mjs grill` checks the logs. Formats: [round formats](references/round-formats.md).

## Watch for

| Do | Instead of |
|---|---|
| Ask the whole frontier, then wait for the answers | Rationing questions, or acting before the round is answered |
| Look up what can be looked up | Asking the person for a fact in the repository or the memory |
| Continue the numbering; ask a contradiction first, both quoted | Restarting at Q1, or letting the later answer silently win |
| Ask a fact only the person holds in one plain line | Options that guess its value |
| Stop at an empty frontier, then write the brief | Stopping when the person agrees |
