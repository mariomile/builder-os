---
type: llm
---
PASS if a fact only the user can know (who uses the internal tool today, how many issues or people move, what Jira is used for) is asked as a plain question without a list of guessed values to pick from, or is not asked in this round.
FAIL if the reply offers guessed values for such a fact as options (for example "A. 5 people B. 20 people") or states one as known.
