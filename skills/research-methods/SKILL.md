---
name: research-methods
description: "Use when planning user research, writing interview guides, deciding how many people to talk to, mining existing sources for evidence, or judging whether research is finished"
---

# Research Methods

## Mode and resources

Follow [operating modes and resource paths](../../references/operating-modes.md). **Standalone:** Use the supplied research goal, audience and constraints to produce the requested interview guide, questionnaire or research plan. Synthesize only when actual transcripts or evidence are supplied; a guide does not imply a discovery verdict. **Lifecycle:** The prerequisites, artifact paths and gate recording below apply only when the user requests this phase or initiative; a missing prerequisite blocks that transition, not a standalone artifact, and the completion marker with a gate verdict claims completion only after the gate passes.

Load `evidence-ledger` for lifecycle tagging/counting and `discovery-methods` only when synthesizing real transcripts. Load `gate-checks` only for the lifecycle verdict. Retrieve facts before asking; ask what remains per the `pressure-testing` rounds: every question lists the options, recommends one and says why, and a factual question offers ways to close the gap, never guessed values.

Read [the research guide](references/research-guide.md) when sizing a sample, writing or auditing a guide, choosing sources to mine, or stating the disconfirming test. Read [async questionnaire](references/async-questionnaire.md) when the knowledge sits with someone the user cannot get on a call, or when tagging a returned questionnaire.

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `db.query` | Churn and cancellation reasons | Ask the user to export them; tag `[doc:user-{date}-{topic}]` |
| `tickets.read` | Support tickets, bug reports in the user's words | Ask for a sample |
| `docs.search` | Sales notes, prior research, earlier interviews | Search local notes, then ask |
| `meetings.read` | Call transcripts | The user brings transcript files |
| `analytics.replay` | Where users stall, unprompted | Skip; note the gap |
| `analytics.query` | Behavior that contradicts the story people tell | Skip; note the gap |
| `research.search` | Prior art and framing from saved reading | `web.search`, then skip |
| `files.write` | Requested file or lifecycle artifact/state | Not needed for an inline guide; required for lifecycle writes |

Gate 1 is fully satisfiable with five interviews and nothing else. Never tell a user to connect analytics to validate a problem whose product does not exist.

## Procedure

Apply only the steps the requested artifact needs. Delegate when available and authorized; otherwise run inline.

1. **Establish the research target**, write it at the top of the plan, and check every question against it. For a standalone guide or plan, use the supplied goal, audience and decisions; no frame file is required. Lifecycle DISCOVER answers one question, **is the riskiest assumption from phase 0 true?**, with a verdict, not a summary. Read the frame: `.builderos/initiatives/{initiative}/00-frame.md`: the riskiest assumption and its falsifier become the research target; the ICP's reachability shapes recruiting; the prior-art classification shapes who to chase first ("solved, not adopted" means abandoners before anyone else). No frame on disk → stop and say phase 0 has not run. Never reconstruct it from conversation memory.
2. **Mine what already exists.** Resolve the source capabilities above and pull against the problem keywords before interviewing. Tag each extracted finding with its real provider. A ticket in the user's words is primary; your summary of forty tickets is not.
3. **Design the sample.** How many, which classes, from where. The four classes: people paying to solve the problem badly, people tolerating it, people who tried a solution and abandoned it (class 3), and ICP lookalikes without the problem (class 4, the boundary). Name explicitly how you will reach all four. If class 3 or class 4 is unreachable, first ask who could reach them and offer an async questionnaire to that person; if that fails too, say so and state what the verdict therefore cannot conclude. Never drop a class silently. State the saturation stop condition, not just a count.
4. **Write the guide**, adapting the example sections and timing to the research purpose, then audit your own guide in the open: flag every question a polite person could answer "yes" to and rewrite it as a request for a story; flag every question about the future and rewrite it as the last occurrence; check that solution framing does not bias the observations. A guide presented without its audit has not been checked.
5. **State the disconfirming test** before any interview happens. This is gate 1.5; a disconfirming test invented after the results is a rationalization.
6. **Ingest and synthesize.** When transcripts exist, run thematic synthesis (delegate to a synthesis specialist where one is available, otherwise apply `discovery-methods` directly). Build the evidence ledger: group by theme, tag every claim, count primary units and distinct sources.
7. **Decide a verdict when requested.** Lifecycle DISCOVER requires it; a standalone guide or descriptive synthesis does not. Exactly one of: `VALIDATED` (the riskiest assumption held → phase 2); `KILLED` (it failed, or the problem is real but not worth solving for this ICP → the pipeline stops, and that is a win); `RESHAPED` (the problem is real but different: person, cost or trigger → amend `PRODUCT.md`, re-run phase 0 briefly, then phase 2). Cite tags in the reasoning. Do not soften a kill. Do not upgrade a reshape because the user is invested. On reshape, state precisely what changed: the person, the cost, the trigger, or the scope.
8. **Deliver.** For standalone work, return the requested plan, guide or synthesis without a gate verdict. For lifecycle work: Write `.builderos/initiatives/{initiative}/01-discovery.md`, run gate 1 and record it with the verdict (`scripts/bos.mjs record 1 --verdict validated|killed|reshaped` where commands run). On `KILLED`, the phase becomes killed and the initiative `closed`; stop the pipeline, reporting it as a win and naming what it saved. On the `spike` track, the script derives closure after a passing gate 1 from the track; keep the actual discovery verdict and do not advance: report the verdict as the answer and offer to reclassify, per `gate-checks`, section Spike Stop.

**When no transcripts exist yet**, the phase ends after step 5 with the plan as the deliverable and the gate not yet runnable. Say that plainly. Phase 1 normally spans two sessions and the state file carries the gap.

Completion marker: `## DISCOVERY COMPLETE` with the verdict, or `## RESEARCH PLAN READY` when only the plan was produced.

## Output Contract

Standalone output follows the requested format and destination; adapt the template only where useful and omit lifecycle gate claims. The lifecycle artifact `.builderos/initiatives/{initiative}/01-discovery.md` follows [the discovery template](references/discovery-template.md).

## Common Mistakes

| Mistake | Correct |
|---------|---------|
| Interviewing only reachable believers | Sample classes 2, 3 and 4 deliberately; research that cannot return KILLED is not research |
| Counting five quotes from one person as five units | One source, one unit |
| Treating RESHAPED as failure | It is the most common honest outcome; amend the frame and continue |
