---
name: ux-architecture
description: "Use when a feature needs its information architecture, user flows, state coverage, component inventory or accessibility floor defined before anyone builds it"
---

# UX Architecture

The structural half of phase 4. Not visual craft: where things live, how a person moves through them, what they see in every state, and the floor below which the experience is broken regardless of how it looks.

Visual quality is a separate discipline and often a separate tool. This skill owns the parts that must be decided before a pixel is chosen, and that stay true whatever the visual layer becomes.

**REQUIRED BACKGROUND:** `spec-writing`, which consumes this skill's output. `evidence-ledger` for tagging any claim about user behavior. `references/capability-map.md` before reading a codebase or a design source.

## Information Architecture

Where the new thing lives, in the structure the user already has in their head.

Three questions, in order:

1. **Where does the user expect this to be?** Not where it is convenient to add it. If the answer differs from where it is easy, say so and name the cost of the easy option.
2. **What does it sit beside?** A feature placed next to unrelated things inherits their mental model and confuses both.
3. **What has to move?** Adding usually means reorganizing. A feature bolted onto a navigation that was full three features ago is how products become unusable one reasonable decision at a time.

Write the current structure and the proposed structure side by side. The diff is the deliverable, not the description.

## Flow Design

A flow is the path from intent to outcome. Specify it as ordered steps, each with the decision the user makes and what the system does in response.

| Element | Requirement |
|---------|-------------|
| **Entry points** | Every way in. A flow with one documented entry point and three real ones breaks at the undocumented two |
| **Steps** | The user's action and the system's response, per step |
| **Decision points** | Where the path branches, and what determines the branch |
| **Exit** | Success, abandonment, and what happens to partial work on abandonment |
| **Reversibility** | Which steps can be undone, and how |

The abandonment exit is the one that gets skipped. Every multi-step flow needs an answer to "they closed the tab at step 3": discard, save as draft, or resume. Silence here means the implementer picks, usually discard, usually wrong.

## State Coverage

Six states per step. Gate 4.3 enforces two of them; the other four are how a feature stops feeling unfinished.

| State | What it needs |
|-------|--------------|
| **Empty** | What a new user sees, and the one action that fills it. An empty state with no action is a dead end |
| **Loading** | The indication, and what happens if it takes longer than expected. A spinner with no timeout is a hang |
| **Partial** | Some of it worked. What is shown, what is retryable, what was lost |
| **Error** | What happened in the user's words, whose problem it is, and the next action. Never a code alone |
| **Success** | Confirmation that is visible without hunting, and the next step |
| **Permission** | What someone without access sees. Not a blank screen, and not a 404 that implies the thing does not exist |

Error copy is part of the architecture, not a polish task. "Something went wrong" tells a user nothing and generates a support ticket. Name what failed, and what they can do.

## Component Inventory

What this feature needs, split three ways:

| Category | Meaning | Consequence |
|----------|---------|------------|
| **Exists** | Already in the system, used as is | Free, and consistent |
| **Exists, needs extension** | A new variant, size or state on an existing component | Cheap, but it changes every other use of that component. Say so |
| **New** | Nothing like it exists | Expensive. Each one is a maintenance obligation, so justify it |

A feature that needs four new components is usually a feature that ignored the system. Look again before accepting that count: the third question is whether the interaction is genuinely new, or whether it is an existing pattern in an unfamiliar arrangement.

## Accessibility Floor

Gate 4.5 requires the floor stated, not audited. Three things, specified before building, because retrofitting each one is an order of magnitude more expensive:

| Element | The requirement |
|---------|----------------|
| **Keyboard path** | Every action reachable and completable without a pointer, in a sensible order. Name the tab order for the primary flow |
| **Contrast target** | The standard being held to, stated as a ratio, for text and for meaningful non-text |
| **Focus order** | Where focus goes on open, on close, on error, and on completion. Focus lost to the body element after a dialog closes is the most common failure |

Beyond the floor, three more that cost nothing when designed in: every control has an accessible name, state changes are announced rather than only shown, and no information is carried by color alone.

The floor is a floor. A full audit belongs to a dedicated accessibility pass; stating these three prevents the failures that are structural rather than cosmetic.

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `repo.read` | The existing component system, current navigation, current flows | Ask the user to describe them; mark the inventory as unverified |
| `docs.search` | Design system documentation, prior flow decisions | Ask |
| `analytics.replay` | Where users actually stall in the current flow | Skip; flow design proceeds from structure rather than observation, and says so |
| `files.read` / `files.write` | `DESIGN.md`, previous artifacts, state | Required |

**No data capability is required.** Observation sharpens a flow; it does not gate one.

## Interop

Where a design-quality toolchain is present in the session, hand it the visual layer: typography, spacing, color, motion, and whatever detectors it runs. This skill keeps information architecture, flows, states, the component inventory and the accessibility floor, and the handoff is one direction only.

Where none is present, this skill carries the phase alone. It produces a structurally complete design that a competent implementer can build; it does not produce visual polish, and it says so rather than pretending otherwise.

## Procedure

Run in order. Delegate where the host allows it, run inline where it does not.

1. **Read `03-solution-bet.md`.** The primary user action is the flow this skill designs. Everything here serves that action.
2. **Map the current structure** where `repo.read` resolved: navigation, the area this touches, the existing components. Where it did not, ask, and mark the inventory unverified.
3. **Place the feature.** Current structure and proposed structure side by side. Name what moves.
4. **Design the flows.** Entry points, steps, decision points, both exits, reversibility. The abandonment exit is mandatory for any multi-step flow.
5. **Cover the states.** Six per step. Write the error copy, not a placeholder for it.
6. **Inventory the components.** Exists, needs extension, new. For each extension, name what else it affects. For each new one, justify it.
7. **State the accessibility floor.** Keyboard path with tab order for the primary flow, contrast target as a ratio, focus behavior on open, close, error and completion.
8. **Write `DESIGN.md`** in the output contract below, and hand the flow list to `spec-writing` for gate 4.

Completion marker: `## DESIGN COMPLETE` with the flow list, the state matrix, the component inventory and the accessibility floor.

## Output Contract

`DESIGN.md` in the active initiative's folder, `.builderos/initiatives/{initiative}/`:

```markdown
# Design — {feature}

## Placement
**Today:** {current structure}
**Proposed:** {new structure}
**Moves:** {what is reorganized, and why}

## Flows
### {flow name}
**Entry points:** {all of them}
| Step | User action | System response | Branches |

**Abandonment:** {what happens to partial work}
**Reversible:** {which steps, how}

## States
| Flow / step | Empty | Loading | Partial | Error | Success | Permission |

**Error copy:** {actual strings, per error case}

## Components
| Component | Exists / Extend / New | Affects | Justification (new only) |

## Accessibility floor
**Keyboard path:** {tab order for the primary flow}
**Contrast:** {ratio for text and meaningful non-text}
**Focus:** on open {} · on close {} · on error {} · on completion {}

## Not covered here
{visual craft, and whether it was delegated or is outstanding}
```

## Common Mistakes

| Mistake | Why it fails | Correct |
|---------|-------------|---------|
| Designing the happy path only | Partial and permission states are where the support load comes from | Six states per step |
| An empty state with no action | A dead end for every new user | One clear action that fills it |
| "Something went wrong" | Tells the user nothing, generates a ticket | Name what failed and the next action |
| No abandonment behavior | The implementer picks, usually discard | Specify discard, draft or resume |
| One documented entry point, three real ones | The flow breaks at the undocumented two | Enumerate every entry |
| Four new components for one feature | The design system was ignored | Look for the existing pattern first |
| Accessibility as a later pass | Keyboard and focus are structural, not cosmetic | State the floor before building |
| Information carried by color alone | Invisible to a meaningful share of users | Pair color with text or shape |
| Placing the feature where it is easy to add | The navigation degrades one reasonable decision at a time | Place it where the user expects it, or name the cost |
