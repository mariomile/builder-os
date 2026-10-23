---
name: agent-design
description: "Designs how a model-driven feature behaves: what it does alone, proposes, asks or is denied, the hand-off, injection surfaces with must-pass cases, degradation, latency. Use when a product has an agent, an assistant or model output that acts."
---

# Agent Design

The eval set (gate 4.6) says whether the model's answers are good. This skill decides what the model may do with them: which actions it takes alone, where it stops for a yes, what reaches it from people outside the session, and what the user gets when it is slow, down or wrong. Left to the build, an agent's autonomy is whatever its tool list happens to allow, and its security is whatever the system prompt happens to say.

**Mode.** Standalone designs the behavior of a supplied agent or feature and returns the autonomy table, the surfaces and the eval cases. In the lifecycle it runs in phase 4 whenever the spec declares `**Model output:** yes`, after the flows and the domain model (an agent's actions are the domain's transitions) and before the stack (the latency budget and the degradation plan constrain the model and provider choice); it writes `04-spec.md` → `## Agent behavior`, and gate 4.16 checks it. Both per [operating modes](../../references/operating-modes.md). Read the [agent method](references/agent-method.md) for the autonomy defaults, the surface catalogue, the mitigations, the degradation ladder, the template and a worked example.

## Procedure

1. **List the actions.** Every effect the model can cause: an answer shown, a record written, a tool called, a message sent, money spent, something deleted, private data read. Take them from the flows, the domain transitions and the tools the build will expose; one tool is at least one action. Done when every tool and every side effect has a row.
2. **Set the autonomy of each action**: **does** (acts; the person sees it and can undo), **proposes** (prepares; the person applies it), **asks** (stops and shows what it is about to do, acts only on an explicit yes), **never** (out of reach: the tool is withheld, so the rule holds whatever the prompt says). Start from the method's defaults by reversibility and blast radius, then put every level that is a real trade-off to the person as a `pressure-testing` round question with a recommendation. Done when every action has a level the person accepted.
3. **Turn every "asks" into a criterion.** Write an acceptance criterion stating what the agent shows before acting (what, to whom, how much) and that nothing happens without the yes, and put its number in the row. Phase 5 maps a test to it like any other. Done when every `asks` row cites a criterion that exists.
4. **Design the hand-off.** When the agent passes to a person (repeated failure, low confidence, the user asks, the topic is out of scope, the next step is out of its reach), to whom, what context travels with it, and what the user sees while waiting. Done when `**Hand-off:**` names the trigger, the recipient and the context.
5. **Map the injection surfaces.** Every input the model reads that someone other than the person in the session can write: inbound email, tickets and chat, web pages and search results, uploaded files and their metadata, retrieved documents, tool outputs, another tenant's data; the person's own text counts too. Per surface: what could arrive (instructions, exfiltration through links or images, a tool turned against its owner), the mitigation from the method, and one eval case that attempts it, added to the 4.6 dataset as must-pass. Done when every surface has a mitigation and a must-pass case id that exists in the dataset.
6. **Plan for slow, down and wrong.** A latency budget per turn as a number (time to first token and to a complete answer, at p95), and what happens past it. Degradation per the ladder: slow (stream, show progress, stop at the budget), down or rate-limited (a fallback model, a queue, or the product working without the feature), wrong (the user can correct, undo or report, and each report becomes an eval case). Done when `**Latency budget:**` has a number and `**Degradation:**` covers slow, down and wrong.
7. **Plan what production keeps.** Traces of every turn with its tool calls, and who reads a sample how often (gate 6.10 asks for `**Agent traces:**` at release); after PMF, the must-pass cases rerun on sampled production turns with an alert threshold (`TECH.md` → Operations → `**Model degradation:**`). Done when the trace destination and the degradation check are drafted for phase 6.
8. **Record.** Write `## Agent behavior` in `04-spec.md` per the method's template, and add the autonomy in plain words to `## What we chose`: what the agent does alone, what it always asks first, what is out of its reach. Done when gate 4.16 passes on the file.

## Watch for

| Do | Instead of |
|---|---|
| A level per action, set by reversibility and blast radius | One "human in the loop" sentence for the whole agent |
| Withhold the tool behind a `never` action | A prompt line asking the model to refrain |
| Treat outside content as data, delimited, with a must-pass case that attacks it | Trusting the system prompt to win |
| Scope each tool to the record in front of the user | One tool with the whole tenant's data behind it |
| A latency budget with a number, and what happens past it | "Fast enough" |
| The product still usable when the model is down | A spinner that waits forever |
| Every correction from a user becomes an eval case | A prompt patched and the case forgotten |

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `repo.read` | The tools, prompts, scopes and data the agent already has | Ask the person to list them; mark the action list unverified |
| `web.search` | The provider's rate limits, timeouts and fallback options | State them as unverified with the page to check |
| `logs.query` | Real latency and failure rates of the current model calls, when the product exists | Set the budget from the flow and mark it unmeasured |
| `files.read` / `files.write` | The spec, the domain model, the eval dataset | Inline answers need no write; lifecycle writes require it |

## Output Contract

`## AGENT BEHAVIOR DESIGNED` with every action and its autonomy, the criterion behind every `asks`, the hand-off, the injection surfaces with their mitigations and must-pass cases, the degradation plan, the latency budget, and where traces go. The lifecycle artifact is `04-spec.md` → `## Agent behavior`; gate 4.16 parses its table, bold labels and subsection.
