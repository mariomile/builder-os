# BuilderOS

**The Operating System for Product Builders.**

Connects to live analytics, databases, and docs via MCP to produce actionable PM artifacts. 8 specialized agents that pull real data and do real work.

## What It Does

BuilderOS adds 8 specialized agents to Claude Code:

| Agent | Purpose | Data Source |
|-------|---------|-------------|
| **Product Diagnostician** | Health scorecards, metric trees, anomaly detection | Mixpanel, PostHog |
| **Growth Architect** | Funnel analysis, retention cohorts, growth loop design | Mixpanel |
| **Tracking Architect** | Event taxonomy, tracking plans, dashboard specs | Mixpanel |
| **Finance Analyst** | MRR waterfall, unit economics, revenue projections | Supabase, Mixpanel |
| **Experiment Designer** | Hypothesis formulation, sample sizing, results analysis | — |
| **Competitive Analyst** | Market analysis, competitive briefs, positioning maps | Web, Readwise, Raindrop |
| **Product Writer** | PRDs, release notes, stakeholder updates | Notion, Google Drive |
| **Discovery Synthesizer** | Interview synthesis, opportunity scoring, insight cards | Notion |

## Installation

```bash
claude plugins install builder-os
```

## Prerequisites

- **Mixpanel MCP** connection configured (required for analytics agents)
- **Supabase MCP** connection (optional, for finance agents)
- **Notion MCP** connection (optional, for product writer and discovery)

## Quick Start

1. Create a `PM-CONTEXT.md` in your project root (see `references/pm-context-template.md`)
2. Run `/pm-health` to get your first product health scorecard
3. Run `/pm-growth` to analyze your activation funnel and retention

## Commands

| Command | Description |
|---------|-------------|
| `/pm` | Hub — routes to the right agent |
| `/pm-health [product]` | Product health scorecard |
| `/pm-growth [product]` | Growth diagnosis and interventions |
| `/pm-track [feature]` | Generate tracking plan |
| `/pm-finance [product]` | Revenue and unit economics |
| `/pm-experiment [hypothesis]` | Design an experiment |
| `/pm-compete [competitor]` | Competitive analysis |
| `/pm-prd [feature]` | Write a PRD |
| `/pm-release [version]` | Write release notes |
| `/pm-discovery [topic]` | Synthesize research |
| `/pm-audit [product]` | Full product audit (parallel agents) |

## Philosophy

```
KNOW (Lenny skills)  →  UNDERSTAND (b2b-saas-analytics)  →  DO (BuilderOS)
     Theory                    Metrics & Formulas              Execution
```

BuilderOS doesn't duplicate frameworks or metric definitions. It sits on top of existing knowledge skills and adds the **execution layer** — pulling real data, running real queries, producing real artifacts.

## License

MIT
