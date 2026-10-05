# Competitive Analysis Templates and Source Fitness

Read only the section the current `competitive-intel` step needs.

## Source Fitness

Choose evidence by the question, directness, date, population and limitations; no source class always outranks another.

| Question | Most pertinent evidence | Limitation to preserve |
|----------|-------------------------|------------------------|
| Current pricing or published feature terms | Current official page read directly, with region/plan/date | Marketing terms are claims about availability, not proof of practical quality |
| Workflow quality or buyer friction | Relevant recent user observations, trials and sales/support records | Sampling, segment and recency may limit generalization |
| Category positioning | Current competitor messaging and relevant buyer language | Separate what the vendor claims from independent buyer perception |
| Integration context | Current code/dependency and integration documentation | Being installed does not prove customer preference |

Saved research and team notes are leads, not automatic authority. Keep conflicting claims visible, record source/access dates and explain which evidence fits the specific claim. A newer source may supersede an older price; a relevant direct user observation may be better for a behavior question.

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

## Common Mistakes, With Reasons

| Mistake | Why it fails | Correct |
|---------|-------------|---------|
| Old internal note overriding a current official price | Source class does not establish freshness | Compare plan/region/date and retain the change in provenance |
| Treating a search snippet as verified current terms | It may be stale or omit conditions | Read the pertinent source or mark the claim unverified |
| Filling missing data with zero | Creates false certainty | Preserve unknown and state the measurement needed |
