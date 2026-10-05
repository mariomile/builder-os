---
name: problem-framing
description: "Use when someone arrives with an idea, a feature request, or a vague complaint and the problem behind it has not been stated independently of the solution"
---

# Problem Framing

## Mode and resources

Follow [operating modes and resource paths](../../references/operating-modes.md). **Standalone:** Frame the supplied idea or complaint using its known audience and constraints; return the requested problem statement or framing artifact; unknown facts remain unknown. **Lifecycle:** The prerequisites, artifact paths and gate recording below apply only when the user requests this phase or initiative; a missing prerequisite blocks that transition, not a standalone artifact, and the completion marker with a gate verdict claims completion only after the gate passes.

Load `evidence-ledger` when lifecycle source tags need checking, `pressure-testing` for material unresolved decisions, and `gate-checks` only for a lifecycle completion. Retrieve facts before asking; ask what remains per the `pressure-testing` rounds: every question lists the options, recommends one and says why, and a factual question offers ways to close the gap, never guessed values.

A solution accepted as a problem cannot be tested, only built. Read [framing methods](references/framing-methods.md) when a step needs its worked detail or examples.

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `web.search` | Prior art scan | Ask the user what they and the ICP use today, tag `[doc:user-{date}-{topic}]` |
| `docs.search` | Existing strategy notes, earlier attempts at this problem | Skip; note the gap |
| `repo.read` | What was already tried, from README, changelog, issues | Skip |
| `files.write` | A requested file or lifecycle artifact/state | Not needed for an inline framing; required for lifecycle writes |

Phase 0 needs no data capability; an idea with nothing connected is the normal entry. Never ask for analytics access here.

## Procedure

Delegate when available and authorized, otherwise run inline.

1. **Capture the ask verbatim**, word for word, before interpreting it; the phrasing carries the assumption you are about to extract. For a ticket, read the record and its history and tag it `[doc:*]`. For an anomaly (a watched metric outside its bands, or an incident), start from the metric, baseline, breach and window, tagged `[data:*]` or `[doc:*]`, and climb from the observed cost, not a proposed fix; its riskiest assumption is usually about the cause. Where `PRODUCT.md` already evidences the problem and ICP, the work may qualify for the feature track (`lifecycle-setup`).
2. **Climb the ladder.** One "why does that matter" at a time, in conversation, never as a list of questions. Stop when the statement names a cost a specific person bears and the next why would produce a truism. It must pass the "so what" test: a role (not an organization) bears the cost, today's workaround is named, and its cost is named (unquantified is acceptable as `[assumption:unvalidated]`); a no means keep climbing or drop the problem. Then run the solution-language check (Gate 0.1, word list in `gate-checks`). The product's own nouns are not solution language: define such a term in `PRODUCT.md` → Language and use it as defined rather than bending the sentence to dodge the list.
3. **Run the context round.** Retrieve known ICP, why-now and prior-art facts first. Ask only material unanswered questions; every question lists its options and recommends one with the reason, per the `pressure-testing` rounds; for a fact the options are ways to close the gap, never guessed values. If `web.search` resolved, run the prior-art search first so that question arrives answered and tagged. Then work each answer until it holds:
   - **ICP.** One primary, others explicitly secondary, with all five fields: segment, size, trigger, buying power, reachability. Push hardest on size (a number with a source tag; bottom-up beats a borrowed market report) and reachability (five people the user could get on a call this week). If reachability fails, say plainly that phase 1 will stall and that finding reachable users is now the first task. When selection is required, use supplied strategy or delegated judgement; ask only if a material segment choice remains unresolved.
   - **Why now.** A dated change: behavior shifted, cost collapsed, or constraint lifted. If none exists, state that no dated change is evidenced; label candidate structural reasons as hypotheses. Never accept "the technology is good enough now" without the capability and the line it crossed.
   - **Prior art.** The two closest existing solutions, each classified solved well and adopted, solved badly but adopted, or solved and not adopted. A shallow scan, not a market study; use `competitive-intel` when needed, delegating only when available and authorized. If "solved well, adopted", say so directly: "do not proceed" is a legitimate phase 0 output and costs a conversation instead of a quarter.
4. **Extract the riskiest assumption.** List the beliefs the frame requires, score each on confidence against collapse, pick low-confidence and high-collapse. Write it as a falsifiable sentence plus the observation that would falsify it. Pressure-test it; if it turns out unfalsifiable, label it a preference and take the next candidate.
5. **List the open questions.** What the frame could not settle (a population nobody has reached, an access rule, a constraint nobody owns), who can answer each and which phase inherits it.
6. **Deliver.** In standalone mode return the requested framing and its uncertainties, then stop. In lifecycle mode: Write `.builderos/initiatives/{initiative}/00-frame.md` per the output contract. Run gate 0 per `gate-checks`; on a pass, present the frame and ask whoever owns the problem to accept it, then record it with their answer (`scripts/bos.mjs record 0 --judged ... --accepted-by "who"` where commands run), which advances to phase 1. Never accept on their behalf. On failure, emit the refusal and do not advance. If `.builderos/` does not exist, say so and stop: initialization is a separate step, not something to scaffold silently.

Completion marker: `## FRAME COMPLETE`, followed by the problem, the ICP, the riskiest assumption, the open questions, the gate verdict, who accepted, and the specific research target phase 1 inherits.

## Output Contract

Standalone output follows the requested format and destination; adapt the template only where useful and omit lifecycle gate claims. The lifecycle artifact `.builderos/initiatives/{initiative}/00-frame.md` follows [the frame template](references/frame-template.md).

## Common Mistakes

| Mistake | Correct |
|---------|---------|
| Accepting the user's first statement as the problem | Climb the ladder to a borne cost |
| Quantifying cost with an invented number | `[assumption:unvalidated]` is a legitimate answer here |
| Framing an anomaly from the proposed fix | Start from the observed metric and its window |
