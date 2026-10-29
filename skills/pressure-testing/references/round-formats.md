# Round formats

Read when a round needs a fact neither side holds, when work proceeds while a round waits, or when commands record rounds. The round shape itself is in `SKILL.md`, Rounds.

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

## Working ahead while a round waits

Open each provisional block with `**Provisional:** drafted on the recommendation of round {n}, Q{k}; not chosen yet`. Work only on the recommended option, and only on branches whose upstream questions are answered. The `**Chosen by:**` line stays empty, nothing provisional goes into `decisions/`, and nothing irreversible runs on it: no exposure, no migration, no message sent outside the project.

When the answer arrives, a confirmed block loses its marker and the decision gets its `**Chosen by:**`; a block whose question went another way is deleted and redrafted on the chosen option before anything else builds on it.

## Recording rounds

Where commands run, record the round when it reaches the person (`scripts/bos.mjs round --asked {questions}`) and the answer as given (`round --answered "1B, 2A" --by "{person}"`). The briefing then says a round is waiting, and `pace` shows how long the work waited on decisions.
