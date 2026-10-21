---
type: llm
focus: { source: file, path: prd.md }
---
PASS if prd.md has an out-of-scope list, numbered acceptance criteria a tester could check, and treats the number of tickets or users as unknown or to be confirmed rather than stating a figure.
FAIL if prd.md is missing, has no out-of-scope list, has criteria like "should be easy to use", or states a specific count of tickets, users or revenue that the prompt did not give.
