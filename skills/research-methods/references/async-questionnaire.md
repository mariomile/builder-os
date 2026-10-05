# Async Questionnaire

Read this from `research-methods` when the knowledge sits with someone the user cannot get on a call (a customer's ops lead, the sales rep who hears the objection every week, a partner), or when tagging the answers a questionnaire brought back. Write a questionnaire the user sends to that one person instead of dropping the question.

1. **Use supplied recipient and purpose first; ask only if material context is missing:** who receives it, what they know that the user does not, and which decisions or facts the user needs back. The user can always answer these, even when they cannot answer the research question itself.
2. **Write the document** at the requested destination; lifecycle questionnaires use `.builderos/initiatives/{initiative}/questionnaires/{recipient-slug}.md`: purpose and the decision riding on it, one paragraph of context for someone who was not in the conversation, how to answer (deadline, effort, "I don't know" is a useful answer), then questions grouped by theme, most important first. One idea per question, with an empty answer stub beneath it, and a one-line "why this matters" only where the question could be misread.
3. **The interview-guide rules still apply.** Ask for the last occurrence, not the future; ask for a story, not a yes. A questionnaire is a guide the respondent reads alone, so every leading question goes unchallenged.

Tag the returned answers by who wrote them. A member of the ICP describing their own experience is primary: `[interview:Q{n}]`, with the respondent in the participant key. Someone reporting on other people (sales about customers, support about users) is secondary: `[doc:questionnaire-{recipient-slug}]`. Gate 1 counts the first kind, not the second.
