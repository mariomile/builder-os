---
type: llm
---
PASS if the reply is one round of questions that opens with the decision restated in its strongest form together with the assumption it rests on (and invites a correction), asks at most four numbered questions, gives every decision question two to four options each with a one-line consequence and exactly one recommended option with a short reason, and ends with a line saying how many branches are decided, open and deferred plus how to answer in one line.
FAIL if it asks more than four questions, gives a recommendation without options or options without consequences, omits the opening restatement or the closing count, or decides the migration itself instead of asking.
