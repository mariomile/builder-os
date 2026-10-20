# Design Template

The lifecycle output contract for `DESIGN.md` in the active initiative's folder, `.builderos/initiatives/{initiative}/`. Gate 4.5 reads its accessibility floor, gate 4.9 its visual direction and gate 4.10 its domain model; keep the headings and bold labels exactly. Standalone output follows the requested format and destination, adapting this template only where useful and omitting lifecycle gate claims.

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
| Version | Axis and direction | File | Verdict |
|---------|--------------------|------|---------|
| A | {axis: what it optimizes} | design/a-v1.html, or the route and branch | chosen / rejected: {why} / combined into {version} |

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
