# Build Plan Template

The output contract for phase 5. Copy the headings, bold field labels and tables exactly; the gate script parses them.

`.builderos/initiatives/{initiative}/05-build-plan.md`:

```markdown
# Build — {feature}

## Plan
**Accepted:** {who} · {ISO timestamp with Z or an offset, before the first code change}

## Test baseline
**Run:** {project-relative evidence/runs/*.json captured before any change}
{passing, failing, duration}

## Slices
| # | Slice | Files | Acceptance criteria | Blocks on | Status |
| 1 | {end-to-end description} | {files created or changed} | 1, 4 | none | done |

**Critical path:** {the longest blocking chain, and its length}

## Risks
| Risk | Mitigation |
| {what can break, the riskiest step, the limit that applies} | {how the plan handles it} |

## Rejected alternatives
| Alternative | Why not |

## Acceptance criteria to tests
| # | Criterion | Test | Result |
| 1 | {from 04-spec.md} | {literal or backticked test file path, optionally followed by the test name} | pass |

## Test output
**Run:** {project-relative evidence/runs/*.json from the final run}
{captured runner output; command, exit status and log are resolved from the record}

## Instrumentation
| Event | Triggered by | Arrived | Properties verified | Evidence |
| {event} | {action} | yes | {list} | `[tag]` |

## Eval results
**Run:** {project-relative captured eval run JSON}
**Results:** {project-relative JSON array of unique {id, pass: boolean} entries covering the dataset}
{only for model-output specs: dataset/result hashes bound in the run, pass rate, must-pass results, prompt/model versions and rubric}

## Scope check
| Out-of-scope item (phase 4) | Built? | Note |

## Review findings
| Finding | Axis | Severity | Resolution |
{Important findings all resolved; at most five nits, the rest as a count}

## Deviations from spec
{anything built differently, with the reason and whether the spec was amended; deviations from the plan are recorded in the plan itself}
```
