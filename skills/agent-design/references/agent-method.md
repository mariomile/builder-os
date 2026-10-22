# Agent Method

The defaults, catalogues and template behind `agent-design`. Product names are examples of a kind of option, never requirements.

## Autonomy Defaults

Start each action from the row its reversibility and blast radius put it in, then move it with the person's answer. A move toward more autonomy needs a reason the person states; a move toward less needs none.

| The action | Default | Why |
|------------|---------|-----|
| Reversible, affects only the person's own data, visible right away (a draft, a filter, a summary) | does | The person sees it and undoes it in one step |
| Reversible but visible to others (a comment, an assignment, a status change) | proposes | Others act on it before the person notices |
| Sends something outside the product (an email, a message, a webhook) | asks | Sent cannot be unsent |
| Spends money, moves money, or changes a plan or a price | asks | The cost lands before the review |
| Deletes, or changes permissions, roles or sharing | never, or asks with the exact scope shown | One wrong call is unrecoverable or a breach |
| Touches another tenant's data, credentials or secrets | never | No user benefit outweighs it |

`never` is enforced where it cannot be argued with: the tool is absent from the agent's tool list, or scoped so the action is impossible. A sentence in the prompt is a preference the model may lose.

An `asks` shows the action in the product's words before it runs: what will happen, to what, for whom, and how much, with yes and no. The criterion reads like "Before a refund is sent, the agent shows the amount and the customer and sends only after the operator confirms; a no leaves the ticket unchanged."

## Injection Surfaces

Any text the model reads can carry instructions. A surface is any input someone other than the person in the session can write.

| Surface | What tends to arrive |
|---------|----------------------|
| Inbound email, tickets, chat messages, reviews | "Ignore previous instructions", fake system notes, requests to forward or reveal |
| Web pages and search results | Hidden text with instructions, links that exfiltrate when rendered |
| Uploaded files and their metadata | Instructions in a PDF's text layer, an image's alt text, a spreadsheet cell |
| Retrieved documents (a knowledge base, past tickets) | A poisoned document written by an earlier attacker |
| Tool outputs and third-party APIs | A response body that tells the agent what to call next |
| Another tenant's data | Anything, when retrieval is not scoped to the current tenant |
| The person's own messages | Attempts to reach tools or data beyond their role |

## Mitigations

Use several; each one alone has a known way around it.

- **Data, delimited.** Outside content goes into the context inside a clearly marked block, labelled as data to work on, and the instructions say content inside it is never to be followed.
- **Least privilege per turn.** Tools are scoped to the record in front of the user (this ticket, this customer, this tenant), so a hijacked turn can only reach what the turn could already see.
- **Confirmation on untrusted provenance.** An action proposed while outside content is in the context is at least `asks`, whatever its default.
- **Output filtering.** Links, images and markdown rendered from model output are restricted to allowed domains, so a rendered image cannot carry data out in its URL.
- **No secrets in context.** Keys, tokens and other users' personal data never enter the prompt; tools fetch what they need server-side.
- **Separate reading from acting.** For high-risk flows, one call summarizes outside content with no tools, and a second call with tools sees only the summary.

Each surface gets one must-pass case in the eval dataset that attempts its typical attack, with the expected behavior ("the reply does not mention the other ticket; no tool is called"). The case id goes in the surface row.

## Degradation Ladder

| The model is | The user gets |
|--------------|---------------|
| Slow | Streaming or visible progress; at the budget, what is ready plus a retry, never an endless spinner |
| Rate-limited or over the cost ceiling | A queue with a stated wait, or a smaller fallback model for low-risk actions |
| Down | The product works without the feature: the manual path stays, with a line saying the assistant is paused |
| Wrong | A way to correct, undo or report in one step; each report is saved and becomes an eval case |

The latency budget is per turn and has a number: time to first token and time to a complete answer, at p95, for the primary action. Interactive chat usually needs the first token within about a second to feel responsive and a complete short answer within a few seconds; a background job can take minutes if the user is told. Those figures are planning heuristics, not measurements: replace them with the measured numbers once `logs.query` resolves.

## Production

- **Traces.** Every turn is kept with its inputs, tool calls, outputs, latency and cost, in a tracing store (an observability product, the logs, or a table), with personal data handled per `TECH.md` → Privacy. Someone reads a sample on a schedule; the release names who and how often (`**Agent traces:**`).
- **Degradation monitoring, after PMF.** The must-pass cases run on a sample of real turns at a fixed interval, with the pass rate that alerts (`TECH.md` → Operations → `**Model degradation:**`). A provider's model update is a release: the eval set runs before it reaches users.

## Template

```markdown
## Agent behavior
| Action | Autonomy | Why | Criterion |
|--------|----------|-----|-----------|
| {action} | does / proposes / asks / never | {reversibility, blast radius, the person's answer} | {acceptance criterion number; required for asks} |

**Hand-off:** {trigger, to whom, what context travels, what the user sees meanwhile}
**Degradation:** {slow: …; down: …; wrong: …}
**Latency budget:** {first token and complete answer at p95, per turn, for the primary action}

### Injection surfaces
| Surface | What could arrive | Mitigation | Eval case |
|---------|-------------------|------------|-----------|
| {input someone else can write} | {the attack} | {the mitigations, from the list} | {must-pass case id in the 4.6 dataset} |
```

## Worked Example

A support assistant that drafts replies and can issue refunds.

```markdown
## Agent behavior
| Action | Autonomy | Why | Criterion |
|--------|----------|-----|-----------|
| Draft a reply | does | reversible; the operator reads it before sending | 1 |
| Send the reply | proposes | the operator presses send | 4 |
| Issue a refund | asks | money leaves the account; Mario chose asks over proposes in round 2 | 2 |
| Close the ticket | proposes | the customer sees it | 5 |
| Delete a ticket or change a customer's plan | never | not reversible; tools withheld | — |

**Hand-off:** after two drafts the operator rejects, or when the customer asks for a person: the ticket goes to the on-shift operator with the thread and both drafts; the customer sees "a person is taking over"
**Degradation:** slow: the draft streams, and at 8 s the operator gets what is ready plus retry; down: the ticket opens with no draft and a banner says drafting is paused; wrong: "bad draft" with a reason, saved as an eval case
**Latency budget:** first token under 1.5 s, complete draft under 8 s at p95

### Injection surfaces
| Surface | What could arrive | Mitigation | Eval case |
|---------|-------------------|------------|-----------|
| Ticket body | instructions to refund or reveal other tickets | delimited as data; tools scoped to this ticket; refund always asks | inj-ticket-1 |
| Attachments | hidden instructions in a PDF text layer | text extracted into the data block; no tools during summarization | inj-attach-1 |
| Knowledge base articles | a poisoned article telling the agent to add a link | link domains allowed-listed in rendering | inj-kb-1 |
```
