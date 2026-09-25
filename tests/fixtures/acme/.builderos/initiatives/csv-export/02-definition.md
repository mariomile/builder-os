# Definition — Acme Reports

## Desired outcome
Weekly active report exports per manager

## Opportunity tree
| Opportunity | Evidence | Reach | Severity | Frequency | Score |
|-------------|----------|-------|----------|-----------|-------|
| Rebuild of the Monday view | `[interview:P1,P4]` | high | high | weekly | 9 |
| Late Friday updates missed | `[interview:P1]` | medium | medium | weekly | 6 |

## Selected: Rebuild of the Monday view
**Why:** strongest evidence.

## Rejected
| Opportunity | Why not now | Revisit when |
|-------------|------------|--------------|
| Late Friday updates missed | smaller reach | after export ships |

## Success metric
**Metric:** managers exporting the weekly view at least once a week
**Baseline:** 0, product not built, first measurement 2026-10-01
**Target:** 30% of active managers by 2026-12-01 `[estimate:analogous-feature]`
**Measured by:** export_completed events
