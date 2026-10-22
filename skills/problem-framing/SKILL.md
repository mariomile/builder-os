---
name: problem-framing
description: "States the problem behind an idea before any solution: who has it, what it costs today, why now, prior art, the riskiest assumption. Use when someone arrives with an idea, a feature request or a vague complaint still mixed with a solution."
---

# Problem Framing

A solution accepted as a problem can only be built, never tested. Framing climbs from the ask to a **cost a specific person bears**, then names the one belief that, if false, collapses the whole thing.

**Mode.** Standalone frames the supplied idea or complaint with its known audience and constraints and returns the problem statement, unknown facts kept unknown (steps 1 to 5). The lifecycle runs every step, writes `00-frame.md` and gate 0. Both per [operating modes](../../references/operating-modes.md). Load `pressure-testing` for the rounds and `evidence-ledger` when tags need checking. Read [framing methods](references/framing-methods.md) when a step needs its worked detail or examples.

## Procedure

1. **Capture the ask verbatim**, word for word, before interpreting it: the phrasing carries the assumption you are about to extract. A ticket is read with its history and tagged `[doc:*]`. An anomaly (a watched metric outside its bands, an incident) starts from the metric, baseline, breach and window, tagged `[data:*]` or `[doc:*]`, and climbs from the observed cost; its riskiest assumption is usually about the cause. Where `PRODUCT.md` already evidences the problem and ICP, the work may qualify for the feature track (`lifecycle-setup`). Done when the ask is quoted exactly with its source.
2. **Climb the ladder.** One "why does that matter" at a time, in conversation. Stop when the statement names a cost a specific person bears and the next why would produce a truism. It passes the "so what" test when a role (not an organization) bears the cost, today's workaround is named, and its cost is named (unquantified is acceptable as `[assumption:unvalidated]`). Then run the solution-language check (gate 0.1, word list in `gate-checks`); the product's own nouns are defined in `PRODUCT.md` → Language and used as defined. Done when the statement passes both checks.
3. **Run the context round.** Retrieve known ICP, why-now and prior-art facts first (the prior-art search runs before the round where `web.search` resolved, so that question arrives answered and tagged), then ask what remains as a `pressure-testing` round. Work each answer until it holds:
   - **ICP.** One primary, others explicitly secondary, with all five fields: segment, size, trigger, buying power, reachability. Push hardest on size (a number with a source tag; bottom-up beats a borrowed market report) and reachability (five people the person could get on a call this week). When reachability fails, say plainly that phase 1 will stall and that finding reachable users is now the first task.
   - **Why now.** A dated change: behavior shifted, cost collapsed, a constraint lifted. With none evidenced, say so and label candidate structural reasons as hypotheses; "the technology is good enough now" needs the capability and the line it crossed.
   - **Prior art.** The two closest existing solutions, each classified solved well and adopted, solved badly but adopted, or solved and not adopted: a shallow scan, with `product-analysis` (competition) when more is needed. "Solved well, adopted" is said directly: stopping here is a legitimate phase 0 outcome and costs a conversation instead of a quarter.

   Done when the ICP has all five fields, why-now has a dated change or a stated gap, and prior art has two classified entries.
4. **Put the riskiest assumption to the person.** List the beliefs the frame requires and score each on confidence against collapse. The two or three low-confidence, high-collapse candidates become one round question: each as a falsifiable sentence with the observation that would falsify it and what phase 1 would then test, and a recommendation. An unfalsifiable candidate is a preference: label it and offer the next. Record `**Chosen by:**` under `## Riskiest assumption` with the person's answer (gate 0.5). Done when one chosen assumption has its falsifier.
5. **List the open questions**: what the frame could not settle (a population nobody has reached, an access rule, a constraint nobody owns), who can answer each, and which phase inherits it. Done when each open question has an owner and a phase.
6. **Deliver.** Standalone returns the framing and its uncertainties. The lifecycle writes `.builderos/initiatives/{initiative}/00-frame.md` per [the frame template](references/frame-template.md) and runs gate 0 per `gate-checks`; on a pass, present the frame and ask whoever owns the problem to accept it, then record it with their answer (`scripts/bos.mjs record 0 --judged ... --accepted-by "who"` where commands run). A failed gate gets the refusal. A project with no `.builderos/` is reported as uninitialized: initialization is its own step. Done when the frame is delivered and, in the lifecycle, gate 0 is recorded with the person's acceptance.

## Watch for

| Do | Instead of |
|---|---|
| Climb the ladder to a borne cost | Taking the first statement as the problem |
| `[assumption:unvalidated]` for an unknown cost | An invented number |
| Start an anomaly from the observed metric and its window | Framing it from the proposed fix |

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `web.search` | Prior art scan | Ask the person what they and the ICP use today, tag `[doc:user-{date}-{topic}]` |
| `docs.search` | Existing strategy notes, earlier attempts at this problem | Skip; note the gap |
| `repo.read` | What was already tried, from README, changelog, issues | Skip |
| `files.write` | A requested file or lifecycle artifact/state | An inline framing needs no write; lifecycle writes require it |

Phase 0 needs no data capability: an idea with nothing connected is the normal entry, and analytics waits for later phases.

## Output Contract

`## FRAME COMPLETE`, followed by the problem, the ICP, the riskiest assumption and who chose it, the open questions, the gate verdict, who accepted, and the research target phase 1 inherits. Standalone output follows the requested format and destination, with no gate claims.
