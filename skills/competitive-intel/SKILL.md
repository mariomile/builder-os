---
name: competitive-intel
description: "Use when analyzing competitors, building feature matrices, mapping market positioning, or preparing competitive briefs"
---

# Competitive Intelligence

Reference for competitive analysis: methodology, source priority, and output templates.

## Source Priority

Search sources in this order. Higher = more trusted.

| Priority | Source | MCP Tool | Best For |
|----------|--------|----------|----------|
| 1 | Vault notes | `Grep`, `Glob` | Prior competitive analysis, internal knowledge |
| 2 | Readwise highlights | `mcp__claude_ai_Readwise__search` | Curated articles on competitors/market |
| 3 | Raindrop bookmarks | `mcp__claude_ai_Randrop_io__find_bookmarks` | Saved competitor pages, industry reports |
| 4 | Lenny's Data | `mcp__claude_ai_Lenny_s_Data__search_content` | PM frameworks, market analysis |
| 5 | Web search | `WebSearch` | Current pricing, features, news |
| 6 | Competitor websites | `WebFetch` / `defuddle` | Pricing pages, feature pages |

## Feature Matrix Template

```markdown
| Category / Feature | {Product} | {Comp A} | {Comp B} | {Comp C} |
|-------------------|-----------|----------|----------|----------|
| **Core** |
| {feature} | ✅ | ⚠️ | ❌ | ✅ |
| **Pricing** |
| Free tier | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ |
| Starting price | ${n}/mo | ${n}/mo | ${n}/mo | ${n}/mo |
| **Platform** |
| API | ✅/❌ | ✅/❌ | ✅/❌ | ✅/❌ |
| **Target** |
| Primary ICP | {segment} | {segment} | {segment} | {segment} |
```

Legend: ✅ Full | ⚠️ Partial | ❌ None | — Unknown

## Positioning Map Axes

Choose 2 axes that reveal strategic white space:

| Axis Pair | Best When |
|-----------|-----------|
| Simple ↔ Complex, SMB ↔ Enterprise | B2B with varied market segments |
| Self-serve ↔ Sales-led, Horizontal ↔ Vertical | GTM strategy differences |
| Price: Low ↔ High, Depth: Shallow ↔ Deep | Value proposition differentiation |
| AI-native ↔ Traditional, New ↔ Established | Technology disruption analysis |

## Competitive Brief Structure

1. **Executive Summary** (3-5 sentences)
2. **Feature Matrix** (structured comparison)
3. **Positioning Map** (2×2 visual)
4. **Differentiation Analysis** (strengths/weaknesses table)
5. **Strategic Recommendations** (compete, avoid, position, moat, watch)
6. **Sources** (numbered, with URLs)

## Citation Standard

Every factual claim must cite its source:

```markdown
Competitor X launched feature Y in Q1 2026 [1].
Their pricing starts at $49/mo for teams up to 10 [2].

### Sources
1. {URL or article title, date accessed}
2. {URL or article title, date accessed}
```

No source = speculation, not intelligence. Mark unverified claims as `[unverified]`.
