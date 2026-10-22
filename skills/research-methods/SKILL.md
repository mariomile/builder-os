---
name: research-methods
description: "Plans and runs user research: what to learn, who and how many to talk to, interview guides, existing sources, a verdict on the riskiest assumption. Use when planning interviews or a survey, writing a guide, sizing a sample, or judging discovery."
---

# Research Methods

Lifecycle discovery answers one question, **is the riskiest assumption from phase 0 true?**, with a **verdict**: validated, killed or reshaped. Research that cannot return KILLED is not research, so the sample reaches the people most likely to prove the frame wrong.

**Mode.** Standalone produces the requested interview guide, questionnaire or research plan from the supplied goal, audience and constraints, and synthesizes only when real transcripts or evidence are supplied. The lifecycle runs every step, writes `01-discovery.md` and gate 1. Both per [operating modes](../../references/operating-modes.md). Load `discovery-methods` when synthesizing real transcripts. Read [the research guide](references/research-guide.md) when sizing a sample, writing or auditing a guide, choosing sources to mine, or stating the disconfirming test; read [async questionnaire](references/async-questionnaire.md) when the knowledge sits with someone the person cannot get on a call, or when tagging a returned questionnaire.

## Procedure

1. **Establish the research target**, write it at the top of the plan, and check every question against it. Standalone uses the supplied goal, audience and decisions. The lifecycle reads `.builderos/initiatives/{initiative}/00-frame.md`: the riskiest assumption and its falsifier become the target, the ICP's reachability shapes recruiting, and the prior-art classification shapes who to chase first ("solved, not adopted" means abandoners first). A missing frame on disk means phase 0 has not run, and the phase stops there. Done when the target is one sentence that a verdict can answer.
2. **Mine what already exists.** Resolve the source capabilities and pull against the problem keywords before interviewing, tagging each finding with its real provider. A ticket in the user's words is primary; your summary of forty tickets is a `doc` about them. Done when every resolved source has been searched and its findings tagged.
3. **Design the sample**: how many, which classes, from where. The four classes: people paying to solve the problem badly, people tolerating it, people who tried a solution and abandoned it (class 3), and ICP lookalikes without the problem (class 4, the boundary). Name how you will reach each. When class 3 or 4 is out of reach, ask who could reach them and offer that person an async questionnaire; when that fails too, state what the verdict therefore cannot conclude. State the saturation stop condition alongside the count. Done when every class has a recruiting route or a written limitation.
4. **Write the guide and audit it in the open**, adapting the example sections and timing to the purpose: every question a polite person could answer "yes" to is rewritten as a request for a story; every question about the future becomes the last occurrence; solution framing that would bias observations is removed. Done when the guide is presented with its audit.
5. **State the disconfirming test** (gate 1.5) before any interview happens, so it cannot be fitted to the results. Done when it is written and dated before the first interview.
6. **Ingest and synthesize.** With transcripts in hand, run `discovery-methods` (delegated to a synthesis specialist where one is available) and build the evidence ledger: themes, every claim tagged, primary units and distinct sources counted. Done when every theme has its tagged units and source count.
7. **Decide the verdict** when requested; the lifecycle requires one. Exactly one of: `VALIDATED` (the riskiest assumption held → phase 2); `KILLED` (it failed, or the problem is real but not worth solving for this ICP → the pipeline stops, and that is a win); `RESHAPED` (the problem is real but different: person, cost or trigger → amend `PRODUCT.md`, re-run phase 0 briefly, then phase 2, stating precisely what changed). Cite tags in the reasoning and write the verdict the evidence supports, a kill as a kill. Then put what happens next to the person as a round question (continue to phase 2, stop, reshape and re-frame), with the verdict as the recommendation, and record `**Chosen by:**` under `## Verdict` (gate 1.6). Continuing past KILLED is the person's override with their reason, and the verdict stays as written. Done when the verdict and the person's choice are both recorded.
8. **Deliver.** Standalone returns the requested plan, guide or synthesis. The lifecycle writes `.builderos/initiatives/{initiative}/01-discovery.md` per [the discovery template](references/discovery-template.md), runs gate 1 and records it with the verdict (`scripts/bos.mjs record 1 --verdict validated|killed|reshaped` where commands run). `KILLED` closes the initiative; report it as a win and name what it saved. On the `spike` track the script closes the initiative after a passing gate 1; report the verdict as the answer and offer to reclassify, per `gate-checks`, Spike Stop. Done when the artifact exists and, in the lifecycle, gate 1 is recorded.

**With no transcripts yet**, the phase ends after step 5 with the plan as the deliverable and the gate not yet runnable; say so. Phase 1 normally spans two sessions, and the state file carries the gap.

## Watch for

| Do | Instead of |
|---|---|
| Sample classes 2, 3 and 4 deliberately | Interviewing only reachable believers |
| One person, one source | Five quotes from one person as five units |
| Treat RESHAPED as the common honest outcome: amend the frame and continue | Reading it as failure |

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `db.query` | Churn and cancellation reasons | Ask the person to export them; tag `[doc:user-{date}-{topic}]` |
| `tickets.read` | Support tickets, bug reports in the user's words | Ask for a sample |
| `docs.search` | Sales notes, prior research, earlier interviews | Search local notes, then ask |
| `meetings.read` | Call transcripts | The person brings transcript files |
| `analytics.replay` | Where users stall, unprompted | Skip; note the gap |
| `analytics.query` | Behavior that contradicts the story people tell | Skip; note the gap |
| `research.search` | Prior art and framing from saved reading | `web.search`, then skip |
| `files.write` | Requested file or lifecycle artifact/state | An inline guide needs no write; lifecycle writes require it |

Gate 1 is fully satisfiable with five interviews and nothing else; a problem whose product does not exist yet is validated by talking to people.

## Output Contract

`## DISCOVERY COMPLETE` with the verdict and who chose what happens next, or `## RESEARCH PLAN READY` when only the plan was produced. Standalone output follows the requested format and destination, with no gate claims.
