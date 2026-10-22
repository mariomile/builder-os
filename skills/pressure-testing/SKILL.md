---
name: pressure-testing
description: "Grills a decision before it is relied on: rounds of up to four questions, each with options, consequences and a recommendation, until no branch is open. Use when a decision is about to pass a gate, the person asks to be grilled, or branches are open."
---

# Pressure Testing

An interview primitive any BuilderOS phase can call. It guards against unchallenged premises elaborated into confident artifacts. Standalone or inside a phase, per [operating modes](../../references/operating-modes.md); the ADRs and gate effects below belong to a lifecycle initiative.

## The Design Tree

Interview relentlessly until you and the person share one understanding of the decision. Map it as a **design tree**: every decision branches into the decisions that hang off it. Keep the tree written in the conversation (or the artifact being shaped), each branch marked open, decided, deferred with its test, or out of scope, so you and the person can both see what is left.

**Stop when the frontier is empty:** every branch visited, each decided by the person, accepted as a risk, or deferred with a named test and owner, and nothing silently assumed. Agreement is not a stop; an empty frontier is. Depth follows the tree, not a budget: a reversible detail is one branch, an irreversible bet grows many. Branches past the requested decision are out of scope: name them once and leave them. Act on the outcome once the person confirms the understanding is shared.

## Method

1. **Restate the claim in its strongest form**, better than the person put it; until you can, you have not understood it yet.
2. **Find the load-bearing assumption:** the single belief that, if false, collapses the whole thing.
3. **Attack that one.** Peripheral objections feel productive and change nothing.
4. **Demand the falsifier.** "What would have to be true for this to be wrong?" If nothing could make it wrong, it is a preference: record it as such and move on.
5. **Price the answer.** "What is the cheapest way to find out you are wrong?" Every unresolved branch exits with a test and a cost, or an explicit decision to proceed without one.
6. **Log the deferrals.** An accepted risk is fine; an unnoticed one is the failure.

## Rounds

Questions come in **rounds**. A round holds every open question whose answer does not depend on another question still open: the frontier of the reasoning. Ask the smallest material frontier, numbered, at most four questions per round; the rest wait for the next round, most load-bearing first.

**Word each question so that "yes" accepts your recommendation.** **Every question carries options, a recommendation and its reason.** List the options the person could credibly pick, two to four, including the ones you would argue against (doing nothing, the cheaper version, the reversal). Each option gets one line on what happens if it is chosen. Then recommend one and say why: the reason names the deciding factor and, when it rests on a fact, its source tag. When no option clearly wins, say which fact would decide it and recommend the cheapest way to get that fact. The recommendation waits for the person's answer.

**Answering costs one line.** Close every round with how to answer: "yes" to a question, question number plus option letter (`1B, 2A, 3 other: …`), or free text. "Go with the recommendations", said by the person, accepts every recommended decision in the round, each recorded as their decision; a factual gap still needs its source or becomes a recorded assumption. An answer that maps to no option, or that repeats your own sentence back with "do it" in front, is not a choice: when it decides something hard to undo or lifts a gate, condition or scope limit, restate what you understood as one option and ask for the letter; otherwise take the most conservative reading and say which. An accepted decision that is hard to reverse, surprising without context and the result of a real trade-off is written as an ADR in `decisions/` in lifecycle mode; the rest live in the resolution table.

```markdown
**Q1 — {short title}.** {The question.}
- **A. {option}:** {what happens if chosen}
- **B. {option}:** {what happens if chosen}
- **C. {option}:** {what happens if chosen}
→ Recommended: **B**, because {deciding factor, with a source tag if it rests on a fact}.

**Q2 — {short title}.** …

Answer like `1B, 2A`, or "go with the recommendations".
```

**Factual questions get options too: the ways to close the gap.** When the session cannot retrieve a fact (a baseline, a budget, what a user said, a past result), the options are how to get it, and the recommendation picks one; guessed numbers or quotes as options would anchor the answer and invent evidence:

```markdown
**Q3 — Weekly report open rate.** No analytics capability resolved in this session, so I need this from you.
- **A. You know it:** give the number and where it comes from; it enters as a tagged fact.
- **B. Query it:** name the dashboard or table and I write the query; the round waits for the result.
- **C. Proceed without it:** recorded as an unverified assumption with the test that would check it.
→ Recommended: **B**, because the success metric depends on this baseline and a guess here moves the target.
```

Each answered round reshapes the tree: settled decisions push the frontier outward and unblock what hung on them. Recompute the frontier, update the tree, ask the next round. A question whose answer depends on another question in the same round belongs to the next round. The attack on the load-bearing assumption (Method, steps 2 to 5) is a chain: each answer decides the next question, so that chain runs one question per round. Independent branches (who the ICP is, what changed, who solved it before) go together.

**Facts are yours, decisions are theirs.** Before a question reaches the person, check whether it asks for a fact the session can retrieve: a document, the repository, a search, a data query. If a capability that answers it resolved, get the answer yourself and state it with its tag. Look it up without blocking the round: delegate the lookup where the host supports it, and while it runs ask the rest of the frontier; only the questions downstream of that fact wait. Only when the ladder in `references/capability-map.md` is exhausted does a fact become a question, and then it says so ("no search resolved in this session, so I need this from you"). Carry forward explicit decisions and authorization, and make routine reversible choices within delegated scope, stating important assumptions (operating modes, Questions). Ask only when a material preference remains unresolved or the choice exceeds authorization.

## Working Ahead

A round that waits on the person should not stop the work. While it waits, draft what hangs on each question as if its recommended option were chosen, in the artifact where it will live, each block opened with `**Provisional:** drafted on the recommendation of round {n}, Q{k}; not chosen yet`. Keep it apart from the decision: the `**Chosen by:**` line stays empty, nothing provisional goes into `decisions/`, and nothing irreversible runs on it (no exposure, no migration, no message sent outside the project). Work only on the recommended option, and only on branches whose upstream questions are answered.

When the answer arrives: a confirmed block loses its marker and the decision gets its `**Chosen by:**`; a block whose question went another way is deleted and redrafted on the chosen option, before anything else builds on it. Gate E.2 fails while any marker is left, so provisional work cannot pass as decided.

Where commands run, record the round when it reaches the person (`scripts/bos.mjs round --asked {questions}`) and the answer as given (`round --answered "1B, 2A" --by "{person}"`): the briefing then says a round is waiting, and `pace` shows how long the work waited on decisions.

## Tone and Question Banks

Direct, aimed at the reasoning, warm toward the person. Ask plainly; a softened question lets the premise survive. Follow the answer, not the script: load [phase question banks](references/question-banks.md) only when a deeper review needs examples, as a starting point, and follow whichever branch is load-bearing in this case.

## Output

Ends with the design tree as a resolution table, one row per branch:

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
| Stop at an empty frontier | Stopping when the person agrees |
| Decide on an explicit answer or "go with the recommendations" | Applying recommendations nobody accepted |
| Offer ways to close a factual gap and recommend one | Guessed values as options |
| Resolve the capability first; ask when the ladder is exhausted | Asking the person for a fact the session could retrieve |
| Attack the load-bearing assumption, plainly | Peripheral details, softened questions |
| Draft ahead on the recommendation, marked provisional, while a round waits | Idling until the person answers, or writing the recommendation in as decided |
