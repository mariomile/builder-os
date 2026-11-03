---
type: llm
---
PASS if the reply interviews before it proposes: numbered questions that pull out the context the next step needs (who the first salons are or how they are reached, what done looks like for a salon, constraints such as price, tools already used or what must not change), facts only the user holds asked as plain questions, decision questions with options and one recommendation, and a closing line with what is left and how to answer.
FAIL if it writes a plan, a feature list, a stack or a spec before asking, offers guessed values for a fact only the user knows as options (for example "A. 10 salons B. 50 salons"), or asks a single question when several could be asked at once.
