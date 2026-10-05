---
name: pressure-testing
description: "Use when a decision, problem statement, opportunity, or bet needs adversarial interrogation before it passes a gate, or when the user's reasoning has unresolved branches"
---

# Pressure Testing

A reusable interview primitive. Any BuilderOS phase can call it. It exists because the failure mode of AI-assisted product work is not bad analysis — it is unchallenged premises that get elaborated into confident artifacts.

Read [operating modes](../../references/operating-modes.md) first. For a standalone request, use supplied requirements and sources; keep the requested format and destination. Lifecycle artifact paths, gates and state writes below apply only to an explicitly selected initiative.

## Stop Condition

Stop when the material assumptions for the requested decision are resolved, explicitly accepted as risks, or deferred with a named test and owner. Match depth to the decision's reversibility, impact and the user's time budget. Record residual uncertainty and deliver the requested work. Agreement alone is insufficient evidence, but repetitive questions are a signal to summarize and move on.

A quick sanity check usually needs one focused round; an irreversible bet may need more. Do not require closure of every hypothetical branch or turn an implementation request into an unbounded interview.

## Method

1. **Restate the claim in its strongest form.** Not a strawman, not the user's exact words. If you cannot state it better than they did, you do not understand it yet.
2. **Find the load-bearing assumption.** Which single belief, if false, collapses the whole thing?
3. **Attack that one.** Not the periphery. Peripheral objections feel productive and change nothing.
4. **Demand the falsifier.** "What would have to be true for this to be wrong?" If nothing could make it wrong, it is not a claim, it is a preference. Record it as such and move on.
5. **Price the answer.** "What is the cheapest way to find out you are wrong?" Every unresolved branch exits with a test and a cost, or an explicit decision to proceed without one.
6. **Log the deferrals.** An accepted risk is fine. An unnoticed one is not.

## Rounds

Questions come in **rounds**. A round holds every open question whose answer does not depend on another question still open: the frontier of the reasoning. Ask the smallest material frontier, numbered, at most four questions per round; the rest wait for the next round, most load-bearing first.

**Every question carries options, a recommendation and its reason.** Never send a bare question. List the options the user could credibly pick, two to four, including the ones you would argue against (doing nothing, the cheaper version, the reversal). Each option gets one line on what happens if it is chosen. Then recommend one and say why: the reason names the deciding factor and, when it rests on a fact, its source tag. When no option clearly wins, say which fact would decide it and recommend the cheapest way to get that fact. Never treat the recommendation as a submitted answer.

**Answering costs one line.** Close every round with how to answer: question number plus option letter (`1B, 2A, 3 other: …`), free text always accepted. "Go with the recommendations" is a valid answer only when the user says it: it accepts every recommended decision in the round, each recorded as the user's decision, and it never fills a factual gap (a fact still needs its source or becomes a recorded assumption). An answer that maps to no option, or that repeats your own sentence back with "do it" in front, is not a choice: when it decides something hard to undo or lifts a gate, condition or scope limit, restate what you understood as one option and ask for the letter; otherwise take the most conservative reading and say which. An accepted decision that is hard to reverse, surprising without context and the result of a real trade-off is written as an ADR in `decisions/` in lifecycle mode; the rest live in the resolution table.

```markdown
**Q1 — {short title}.** {The question.}
- **A. {option}:** {what happens if chosen}
- **B. {option}:** {what happens if chosen}
- **C. {option}:** {what happens if chosen}
→ Recommended: **B**, because {deciding factor, with a source tag if it rests on a fact}.

**Q2 — {short title}.** …

Answer like `1B, 2A`, or "go with the recommendations".
```

**Factual questions get options too, but never candidate values.** When the session cannot retrieve a fact (a baseline, a budget, what a user said, a past result), do not list guessed numbers or quotes as options: that anchors the answer and invents evidence. The options are the ways to close the gap, and the recommendation picks one:

```markdown
**Q3 — Weekly report open rate.** No analytics capability resolved in this session, so I need this from you.
- **A. You know it:** give the number and where it comes from; it enters as a tagged fact.
- **B. Query it:** name the dashboard or table and I write the query; the round waits for the result.
- **C. Proceed without it:** recorded as an unverified assumption with the test that would check it.
→ Recommended: **B**, because the success metric depends on this baseline and a guess here moves the target.
```

A question whose answer depends on another question in the same round belongs to the next round. The attack on the load-bearing assumption (Method, steps 2 to 5) is a chain: each answer decides the next question, so that chain runs one question per round. Independent branches (who the ICP is, what changed, who solved it before) go together.

**Facts are yours, decisions are theirs.** Before a question reaches the user, check whether it asks for a fact the session can retrieve: a document, the repository, a search, a data query. If a capability that answers it resolved, get the answer yourself and state it with its tag. Only when the ladder in `references/capability-map.md` is exhausted does a fact become a question, and then it says so ("no search resolved in this session, so I need this from you"). Carry forward explicit decisions and authorization. Make routine reversible choices within delegated scope, stating important assumptions. Ask only when a material preference remains unresolved or the choice exceeds authorization.

## Question Banks

Load [phase question banks](references/question-banks.md) only when a deeper review needs examples.

## Tone

Direct, not hostile. The target is the reasoning, never the person. A round asks only the frontier: a list of six questions where four depend on the first two gets answers to the easiest, not to the ones that matter.

Follow the answer, not the script. The question banks are a starting point for a phase; the actual interview follows whichever branch is load-bearing in this specific case.

## Output

Ends with a resolution table:

```markdown
| Branch | Status | Evidence / Test | Cost |
|--------|--------|-----------------|------|
| ICP is mid-market ops leads | Resolved | 5 of 7 interviews `[interview:P1-P5]` | — |
| They will pay €200/mo | Deferred | Pricing page smoke test | 2 days |
| Integration is the blocker | Unresolved | No test designed | — |
```

Only unresolved branches named by the applicable gate block that gate. A deferred risk does not waive a mandatory condition; standalone work reports the limitation without creating an override.

## Common Mistakes

| Mistake | Why it fails | Correct |
|---------|-------------|---------|
| Stopping when the user agrees | Agreement is not resolution | Stop when branches are resolved or deferred with a test |
| Asking dependent questions in the same round | The user answers questions whose premise the first answer changes | Ask only the frontier; dependent questions wait for the next round |
| A bare question with no options | The user has to invent the alternatives and gets no view to push against | List the credible options, each with its consequence, and recommend one with the reason |
| A round of eight questions with five options each | The user skims, picks the first option or answers none | At most four questions, two to four options, answer by code |
| Applying recommendations the user never accepted | A suggestion becomes a decision nobody made | Only an explicit answer or "go with the recommendations" decides |
| Only the options you like | The user cannot reject what was never shown | Include doing nothing, the cheaper version and the reversal when they are credible |
| Guessed values as options for a factual question | Anchors the answer and invents evidence | Offer ways to close the gap (you know it, query it, proceed as an assumption) and recommend one |
| Reviewing every hypothetical risk in a quick check | Consumes the task without improving the decision | Test the material assumption and record residual uncertainty |
| Asking the user for a fact the session could retrieve | Wastes their turn and signals you did not look | Resolve the capability first; ask only when the ladder is exhausted |
| Attacking peripheral details | Feels rigorous, changes nothing | Attack the load-bearing assumption |
| Accepting an unfalsifiable claim | It is a preference, not a claim | Label it a preference and move on |
| Softening the question to be agreeable | The premise survives unexamined and gets elaborated | Ask it plainly |
| Running the full bank regardless of answers | Wastes the interview on settled branches | Follow the branch that is actually load-bearing |
