# Round formats

Read when a round needs a fact neither side holds, when a session resumes or checks a question log, when work proceeds while a round waits, or when commands record rounds. The round shape itself is in `SKILL.md`, Rounds.

## A fact neither side holds

When the session cannot retrieve a fact and the person does not know it either (a baseline nobody has queried, a price nobody has checked), the options are the ways to get it, and the recommendation picks one:

```markdown
❓ **Q3 · Weekly report open rate**
No analytics capability resolved in this session, and the number is not in the memory.
- **A** You find it → give the number and its source; it enters as a tagged fact
- **B** Query it → name the dashboard or table, I write the query, the round waits for the result
- **C** Proceed without it → recorded as an unverified assumption with the test that would check it

➡️ **B**: the success metric depends on this baseline, and a guess here moves the target.
```

Say why the session could not get it ("no search resolved in this session"); the capability ladder is in `references/capability-map.md` at the installation root.

## A fact only the person holds

One plain line, no options, in the same round as the independent questions:

```markdown
❓ **Q2 · Who uses it today**
Who on your team opens the product at least once a week, by name?
```

The decisions that rest on the answer (which change to make, whether a pilot comes first) go in the next round.

## The question log

One file per decision, shared by every session on it: `grilling.md` in the initiative's folder in lifecycle mode, `.builderos/grilling/{topic}.md` elsewhere in a project. Rows are added, never removed; a status changes.

```markdown
# Question log: {the decision}

| Q | Question | Answer | By, date | Status |
|---|----------|--------|----------|--------|
| Q1 | Who uses the product weekly? | Four people on the team, by name | Dana, 2026-10-29 | decided |
| Q2 | Pilot before the change? | B, a one-week pilot first | Dana, 2026-10-29 | superseded by Q6 |
| Q5 | Which reports move first? | — | — | open, from Q1 |
| Q6 | Pilot before the change? | A, ship without a pilot | Dana, 2026-11-03 | decided, replaces Q2 |
```

Status is one of: open (with the Qn it came from, when an answer opened it), decided, deferred with its test, out of scope, superseded by Qn. The session's closing table and three plain lines are written from it.

## A contradiction

An answer that contradicts a logged answer or a recorded decision opens the next round, numbered on, both sides quoted with their dates:

```markdown
❓ **Q6 · ⚠️ Contradicts Q2**
Q2 (2026-10-29): a one-week pilot comes first. Today: ship the change without one.
- **A** Q2 holds → the change waits for the pilot week
- **B** Q6 replaces Q2 → Q2 is marked superseded, the pilot leaves the plan
- **C** Both, on a condition → ship to one team as the pilot, the rest after a week

➡️ **C**: it keeps the date and still puts the change in front of users before everyone.
```

An answer that opens a branch nobody asked about adds it to the log as open, from the Qn that opened it, and it joins the frontier.

## Working ahead while a round waits

Open each provisional block with `**Provisional:** drafted on the recommendation of round {n}, Q{k}; not chosen yet`. Work only on the recommended option, and only on branches whose upstream questions are answered. The `**Chosen by:**` line stays empty, nothing provisional goes into `decisions/`, and nothing irreversible runs on it: no exposure, no migration, no message sent outside the project.

When the answer arrives, a confirmed block loses its marker and the decision gets its `**Chosen by:**`; a block whose question went another way is deleted and redrafted on the chosen option before anything else builds on it.

## Recording rounds

Where commands run, record the round when it reaches the person (`scripts/bos.mjs round --asked {questions}`) and the answer as given (`round --answered "1B, 2A" --by "{person}"`). The briefing then says a round is waiting, and `pace` shows how long the work waited on decisions.
