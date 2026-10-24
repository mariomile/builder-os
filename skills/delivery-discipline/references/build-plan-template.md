# Build Plan Template

The output contract for phase 5. Copy the headings, bold field labels and tables exactly; the gate script parses them.

`.builderos/initiatives/{initiative}/05-build-plan.md`:

```markdown
# Build — {feature}

## Plan
**In plain words:** {what gets built, in what order, what the owner can try after each slice, the riskiest step; no jargon}
**Accepted:** {who} · {ISO timestamp with Z or an offset, before the first code change}
**Branch:** {the branch the build happens on, and the pull request once open}

## Seams
| Module | New or changed | Interface | Hides | Tests at | In plain words |
| {name} | new / changed | {what callers ask, what it promises, how it fails} | {what stays inside} | {the seam the tests cross} | {one line a non-engineer follows} |

## Test baseline
**Run:** {project-relative evidence/runs/*.json captured before any change}
{passing, failing, duration}

## Pre-existing failures
| Test | Since |
| {name exactly as the baseline log prints it} | {before this initiative; TECH.md → Known failing, or the commit} |
{only when the baseline was red; omit otherwise}

## Slices
| # | Slice | Files | Acceptance criteria | Blocks on | Status |
| 1 | {end-to-end description} | {files created or changed} | 1, 4 | none | done |

**Critical path:** {the longest blocking chain, and its length}
**Tickets:** {the folder or tracker the accepted slices were published to, one ticket per slice; or "not published"}

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
**Mapped run:** {only when the baseline was red: a captured run of the mapped tests alone, exiting 0}
{captured runner output; command, exit status and log are resolved from the record}

## Instrumentation
| Event | Triggered by | Arrived | Properties verified | Evidence |
| {event} | {action} | yes | {list} | `[tag]` |

## Eval results
**Run:** {project-relative captured eval run JSON}
**Results:** {project-relative JSON array of unique {id, pass: boolean} entries covering the dataset}
{only for model-output specs: dataset/result hashes bound in the run, pass rate, must-pass results, prompt/model versions and rubric}

## Interface review
**Widths:** {the widest and the narrowest the ICP uses, in pixels: 1280 and 390}
| State | Screenshot or route | Matches the chosen direction |
| empty | {images at both widths, project- or initiative-relative, or the route to open} | yes / no, {what differs} |
| loading | {} | {} |
| partial | {} | {} |
| error | {} | {} |
| success | {} | {} |
| permission | {or "not applicable, {why}" when the flow has no such state} | {} |
{A "no" is fixed, or recorded in DESIGN.md as a deviation and then yes. The change track reviews empty and error at one width. Without an interface: **Interface review:** not applicable, {reason}}

## Craft critique
**Run by:** {a separate agent given only DESIGN.md, the voice adjectives, the captures and the reference screens; or a person who did not build it}
| Aspect | Finding | What happened |
| Hierarchy | {what draws the eye first, and whether it should; or "none found"} | {fixed, or recorded in DESIGN.md} |
| Spacing rhythm | {} | {} |
| Typography | {} | {} |
| Copy against the voice | {} | {} |
| Focus states | {} | {} |
| Motion and reduced motion | {} | {} |
| Interaction states | {hover, pressed, focus-visible, disabled, loading on every control; feedback within 100 ms; per interface-details.md} | {} |
| Next to the references | {per reference screen, where the built screen falls short on the detail it was chosen for} | {} |

## Demo
**Test:** {the end-to-end test that walks the flow, a project-relative path}
**Run:** {project-relative evidence/runs/e2e-demo-*.json from run-check: the run that was filmed, exiting 0}
**Recorded by:** {only on the floor: the person who recorded the screen}
| Flow | Recording | Shows |
| {primary flow, as named in DESIGN.md} | {the https link where the person opens it (pull request, artifact); a local copy only under the git-ignored .builderos/media/{initiative}/} | {the steps and the outcome a viewer sees, with the length} |
| First day | {product track} | {} |
{With step screenshots instead of a video: the files in order, and why no video. Without an interface: **Demo:** not applicable, {reason}. Per feature-demo}

## Security review
**Run by:** {a separate agent given the diff, the spec's threat model and TECH.md; or a person who did not build it}
| Area | Finding | What happened |
| Access control | {every endpoint that takes an id checks the owner; or "none found"} | {fixed, or recorded with the reason} |
| Input handling | {} | {} |
| Secrets and configuration | {} | {} |
| Abuse limits | {} | {} |
| Data exposure | {errors, logs and responses carrying personal data or internals} | {} |
{Skipped when the spec's threat model is not applicable}

## Performance
| Measure | Budget | Measured | Within budget | Evidence |
| {primary action, p95} | {from the spec's quality bar} | {number} | yes | {evidence/runs/*.json from run-check, or a data tag} |
| {largest contentful paint at the narrowest width; with an interface} | {2.5 s} | {} | {} | {} |
{Skipped when the spec's quality bar says performance does not apply}

## Scope check
| Out-of-scope item (phase 4) | Built? | Note |

## Review findings
| Finding | Axis | Severity | Resolution |
{Important findings all resolved; at most five nits, the rest as a count}

## Deviations from spec
{anything built differently, with the reason and whether the spec was amended; deviations from the plan are recorded in the plan itself}

## Retro
**Environment:** {what slowed or misled the agent during the build, and the pointer, check or convention changed for it, per `retro`}
```
