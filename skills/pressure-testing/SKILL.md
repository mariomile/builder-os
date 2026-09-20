---
name: pressure-testing
description: "Use when a decision, problem statement, opportunity, or bet needs adversarial interrogation before it passes a gate, or when the user's reasoning has unresolved branches"
---

# Pressure Testing

A reusable interview primitive. Any BuilderOS phase can call it. It exists because the failure mode of AI-assisted product work is not bad analysis — it is unchallenged premises that get elaborated into confident artifacts.

## Stop Condition

The interview ends when **no unresolved branch remains**: every fork in the reasoning has been either resolved with evidence or explicitly deferred with a named test.

The interview does **not** end when:
- The user agrees with you
- The user seems satisfied
- The answers become repetitive
- You have asked a set number of questions

Agreement is the most common false stop. A user who agrees quickly has usually not been asked the question that would change their mind.

## Method

1. **Restate the claim in its strongest form.** Not a strawman, not the user's exact words. If you cannot state it better than they did, you do not understand it yet.
2. **Find the load-bearing assumption.** Which single belief, if false, collapses the whole thing?
3. **Attack that one.** Not the periphery. Peripheral objections feel productive and change nothing.
4. **Demand the falsifier.** "What would have to be true for this to be wrong?" If nothing could make it wrong, it is not a claim, it is a preference. Record it as such and move on.
5. **Price the answer.** "What is the cheapest way to find out you are wrong?" Every unresolved branch exits with a test and a cost, or an explicit decision to proceed without one.
6. **Log the deferrals.** An accepted risk is fine. An unnoticed one is not.

## Question Banks

**Phase 0 — Frame**
- Who has this problem badly enough to pay, switch, or change behavior?
- What are they doing about it today? Why is that not enough?
- Why has nobody solved this? What changed that makes now different?
- Is this a problem, or is it your solution wearing a problem's clothes?
- If you solved it perfectly and told the ICP, what would they do in the next hour?

**Phase 1 — Discover**
- Which of these quotes is someone being polite?
- Who did you not talk to because they were hard to reach, and how would they disagree?
- Did anyone say anything that surprised you? If not, you asked leading questions.
- What did the people who churned say? What did the people who never signed up say?
- Which evidence would you have accepted as a kill signal? Did you look for it?

**Phase 2 — Define**
- Which opportunity did you reject that a competitor would pick? Why are they wrong?
- Does this opportunity fit the PMF stage, or is it a scale move on an unvalidated product?
- What is the baseline of your success metric, today, from a real query?
- Who inside the company would object to this and what is their strongest argument?

**Phase 3 — Ideate**
- Are these three options, or one option in three costumes? Name the distinct user action in each.
- What is the version that takes a week? Why is it not good enough?
- What would make you kill this in six weeks? Write the number and the date.
- Which part of this could you fake to learn the same thing?

**Phase 4 — Shape**
- What did you leave out of scope, and who will ask for it in week two?
- What happens when it is empty, slow, offline, or the user is wrong?
- How will you know it worked? Which event, which query, which threshold?

**Phase 5 — Build**
- Which acceptance criterion has no test? Why is that acceptable?
- What did you build that was not in the spec?
- Is the instrumentation firing, or is it merely written?

**Phase 6 — Ship**
- How do you turn it off? Who can, at 2am, without you?
- Did you capture the baseline before exposure, or are you about to compare against a moving number?

**Phase 7 — Learn**
- Did it move the number, or did something else move it?
- What would you have concluded if the result had been the opposite? If the same, the test was decorative.
- Which belief do you now hold less confidently?

## Tone

Direct, not hostile. The target is the reasoning, never the person. One question at a time — a list of six questions gets one answer to the easiest of them.

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

Unresolved branches at a gate are gate failures. Deferred branches with a named test are not.

## Common Mistakes

| Mistake | Why it fails | Correct |
|---------|-------------|---------|
| Stopping when the user agrees | Agreement is not resolution | Stop when branches are resolved or deferred with a test |
| Asking six questions at once | The user answers the easiest | One question, then follow the answer |
| Attacking peripheral details | Feels rigorous, changes nothing | Attack the load-bearing assumption |
| Accepting an unfalsifiable claim | It is a preference, not a claim | Label it a preference and move on |
| Softening the question to be agreeable | The premise survives unexamined and gets elaborated | Ask it plainly |
| Running the full bank regardless of answers | Wastes the interview on settled branches | Follow the branch that is actually load-bearing |
