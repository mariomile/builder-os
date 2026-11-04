---
type: llm
---
PASS if the reply is one round of questions that opens with the decision restated in its strongest form together with the assumption it rests on (and invites a correction), asks every question it can ask before hearing an answer (numbered, none resting on another asked in the same round), gives every decision question two to four options each with a one-line consequence and exactly one recommended option with a short reason, and ends with a line saying how many branches are decided, open and deferred plus how to answer in one line.
FAIL if it asks a question whose answer depends on another question in the same round, asks for a fact it could have read in the repository, gives a recommendation without options or options without consequences, omits the opening restatement or the closing count, or decides the migration itself instead of asking.
