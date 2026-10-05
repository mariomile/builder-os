# Tracking Plan Template

The output contract for `tracking-standards`. Standalone output follows the requested format and destination; adapt the template only where useful and omit lifecycle gate claims.

```markdown
## TRACKING PLAN COMPLETE

**Feature:** {name}
**Capabilities resolved:** {capability → concrete source, or "none: files only"}

### Event Taxonomy
| Event | Trigger | Properties | Question it answers | New or existing |

### Funnels
{ordered steps per path, with conversion windows}

### Dashboard Spec
{shape, events, breakdowns, per tile}

### Implementation Checklist
{per event: call site, available properties, verification}

### Findings
{dead events, duplicate events, missing properties for the segments that matter}
```
