---
type: llm
---
PASS if the reply does all of these: sets autonomy per action rather than once for the whole assistant (drafting can happen alone; a refund waits for a person's explicit confirmation, or is withheld), names the ticket body (or attachments) as content a customer controls that can carry instructions, and gives at least one mitigation that does not rely on the prompt alone (tools scoped to the current ticket or customer, refunds always confirmed, content treated as delimited data, links or images filtered), and proposes testing that attack before launch (an eval or test case). It also says what happens when the model is slow, down or wrong, or sets a latency budget.
FAIL if it gives one "human in the loop" rule for everything, lets the assistant refund on its own judgment, or handles injection only with an instruction in the system prompt.
