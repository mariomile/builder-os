# PM artifact templates



### PRD

```markdown
# PRD: {feature}

**Author:** {name} · **Date:** {today} · **Status:** Draft · **Target:** {release}

## Problem Statement

**Who** has this problem: {specific persona}
**What** the problem is: {observable behavior or pain}
**Evidence:** {numbers with their tags, or the note that it is unvalidated}
**Cost of not solving:** {what continues to happen}

## Proposed Solution

### Overview
{1-2 paragraphs}

### User Stories
| # | As a… | I want to… | So that… | Priority |

### Detailed Requirements

**Requirement:** {what it must do}
**Acceptance criteria:**
- [ ] {specific, testable}

**Edge cases:**
- {case}: {expected behavior}

### Out of Scope
{explicit. Ambiguity here becomes scope creep later}

## Success Metrics
| Metric | Baseline (tag) | Target | How it will be measured |
| {output} | | | |
| {input} | | | |
| {guardrail} | | Must not degrade | |

## Technical Considerations
Dependencies · risks · data requirements (new events, schema changes)

## Timeline
| Phase | Scope | Duration | Owner |

## Open Questions
{questions that need answering before or during the build}
```

A PRD with no baseline in its success metrics cannot be evaluated after launch. Where the baseline is unavailable, write it as unavailable with the shape that would establish it, and treat establishing it as part of the work.

### Release Notes

```markdown
# Release Notes — {version or date}

## Highlights

### {feature}
{1-2 sentences on what it does and why it matters to the reader. Benefit, not implementation.}

## Improvements
- **{area}:** {what changed and why it is better}

## Bug Fixes
- Fixed {issue} that affected {who}

## Coming Soon
- {preview}
```

Tone: writing to a colleague, not filing a changelog. No jargon, no internal component names, no ticket numbers.

### Stakeholder Update

```markdown
# {product} Update — {date}

## TL;DR
{what happened, what is next, any blocker. Two sentences.}

## Progress
| Area | Status | Detail |
| {area} | On track / At risk / Blocked | {detail, and the mitigation or the ask} |

## Key Metrics
| Metric | Last period | This period | Trend |

## Decisions Needed
1. **{decision}:** {context, options, your recommendation}

## Next Period
1. {priority}
```

An update with no ask is a broadcast. If something is needed, it goes in Decisions Needed with a recommendation attached.

### Executive Summary

```markdown
# {product} Executive Summary — {period}

## One-Liner
{where we are, one sentence}

## Key Numbers
| Metric | Value | vs. target | vs. last period |

## What's Working
{2-3 points, each with a number}

## What Needs Attention
{2-3 points, each with a number and a proposed action}

## Strategic Ask
{what is needed from leadership, or "none this period"}

## 90-Day Outlook
{where this lands if the current trajectory holds}
```

Half a page. An executive summary that runs to two pages was not summarized.

