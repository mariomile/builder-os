# Design Template

The lifecycle output contract for `DESIGN.md` in the active initiative's folder, `.builderos/initiatives/{initiative}/`. Gate 4.5 reads its accessibility floor; keep the headings and bold labels exactly. Standalone output follows the requested format and destination, adapting this template only where useful and omitting lifecycle gate claims.

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
