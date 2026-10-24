# Design Template

The lifecycle output contract for `DESIGN.md` in the active initiative's folder, `.builderos/initiatives/{initiative}/`. Gate 4.5 reads its accessibility floor, gate 4.9 its visual direction, gate 4.10 its domain model and gate 4.21 its messages; keep the headings and bold labels exactly. Standalone output follows the requested format and destination, adapting this template only where useful and omitting lifecycle gate claims.

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

### First day
{product track: from the first visit (the link, the sign-up, the invitation) to the first useful outcome, with the empty states a new account meets filled by sample data, a guided first action or an import; the step that counts as activated is the spec's **Activation:** criterion}
**Entry points:** {where a new user arrives from}
| Step | User action | System response | Branches |

## States
| Flow / step | Empty | Loading | Partial | Error | Success | Permission |

**Error copy:** {actual strings, per error case}

## Messages
| Message | Trigger | Recipient | Channel | Text | Opt-out | Preview |
|---------|---------|-----------|---------|------|---------|---------|
| {welcome, reset password, weekly summary, reminder, failed payment} | {the event or schedule that sends it} | {who, by role} | {email / push / in-app / WhatsApp / SMS} | {the subject or first line, real words in the product's voice} | {how to stop it, or "transactional: none needed"} | {design/messages/{name}.html or .md} |

**Languages:** {when PRODUCT.md → Markets has more than one: each message exists in each, and the preview shows the longest}
{or, when the product sends nothing outside its screens: **Messages:** none, {reason}}

## Components
| Component | Exists / Extend / New | Affects | Justification (new only) |

## Accessibility floor
**Keyboard path:** {tab order for the primary flow}
**Contrast:** {ratio for text and meaningful non-text}
**Focus:** on open {} · on close {} · on error {} · on completion {}

## Domain model
### Entities
| Entity | Means | Lifecycle |
|--------|-------|-----------|
| {entity} | {one line, in the product's words} | yes / no |

### Transitions: {entity}
| From | To | Who | Only if | Then |
|------|----|-----|---------|------|
| {state} | {state} | {role} | {guard} | {effect} |

### Invariants
- {rule that holds whatever happens}

### Data
| Entity | Key fields | Relations | Deleted with |
|--------|-----------|-----------|--------------|

**Rules decided by:** {person, with the round answers or ADR links}
**Prototype:** {design/domain-prototype.html, or "not needed: {reason}"}
{or, when nothing changes state or shape: **Domain model:** not applicable, {reason}}

## Visual direction
**References:** {3 to 5 real screens the ICP knows, saved before the versions: design/refs/{name}.png, each with what it does well}
| Version | Axis and direction | File | Avoids | Verdict |
|---------|--------------------|------|--------|---------|
| A | {axis: what it optimizes} | design/a-v1.html, or the route and branch | {the generic default this version steers away from} | chosen / rejected: {why} / combined into {version} |

**Chosen:** {version and file}
**Chosen by:** {person, from their answer}
**Why:** {voice adjective and ICP fact it serves}
**Design kit:** {kit, or "inherited: {system}"} · **Alternatives:** {kits considered, why not}
**Tokens:**
| Token group | Values |
|-------------|--------|
| Colour roles | {role: value (contrast ratio)} |
| Type | {families, scale, weights} |
| Spacing | {scale} |
| Shape | {radius, borders} |
| Elevation | {shadows or none} |
| Motion | {durations, reduced motion} |

**Composition:** {grid, density, where the primary action sits}
{or, with no interface: **Visual direction:** not applicable, {reason}}
```
