# Qualitative Synthesis Method Details

Load only the relevant coding, scoring, card, confidence, research-gap or common-mistakes section. Resolve this resource relative to its owning `SKILL.md`.

## Synthesis Process

```
Raw Data → Codes → Themes → Patterns → Opportunities → Insights → Recommendations
```

1. **Code**: Label each observation with a short descriptive tag
2. **Group**: Cluster similar codes into themes
3. **Count**: Quantify prevalence (% of participants) and intensity (mentions per participant)
4. **Score**: Apply opportunity scoring framework
5. **Generate**: Create structured insight cards

## Coding Guide

| Raw Observation | Code |
|----------------|------|
| "I couldn't find the export button" | `[Feature Discovery: Export]` |
| "Setup took us 3 days" | `[Setup Friction: Duration]` |
| "The moment I saw the report I was sold" | `[Aha Moment: Report]` |
| "I wish I could share this with my team" | `[Unmet Need: Collaboration]` |
| "We ended up building a workaround in Sheets" | `[Workaround: Manual Process]` |

## Opportunity prioritization: adapted ODI score

An Opportunity Solution Tree organizes outcomes, opportunities, solutions and assumption tests; it is not the source of the arithmetic below. See [Product Talk’s method definition](https://www.producttalk.org/glossary-discovery-opportunity-solution-tree/). This skill uses an explicit **adaptation of Outcome-Driven Innovation's importance/satisfaction scoring** on a 1–5 scale:

```
Adapted opportunity score = Importance + max(Importance - Satisfaction, 0)
Importance and Satisfaction: 1–5; score range: 1–9
```

The previous `Importance + (Importance - Satisfaction)` could produce negative scores, while its table claimed 1–10; that mismatch is removed. This adapted 1–5 rubric must not be compared directly with original ODI scores or thresholds. Original ODI aggregates the share of respondents selecting high importance/satisfaction ratings and applies its opportunity algorithm to those aggregate scores. This skill’s paired 1–5 respondent scoring is a local adaptation, not the original survey method. See [Strategyn’s algorithm](https://strategyn.com/outcome-driven-innovation/market-opportunity/) and [survey aggregation definition](https://strategyn.com/quantify-your-customers-unmet-needs/).

Ask respondents to rate the same desired outcome's importance and current satisfaction on a stated 1–5 scale, with anchored endpoints (1 = least important/least satisfied; 5 = most important/most satisfied). Keep segment, period and respondent set consistent. Compute the score from paired respondent-level ratings and average those scores within each segment; report n, distribution and missingness. Do not fill missing ratings with zero, infer importance from mention share, or treat a researcher's severity estimate as a respondent rating. Without valid paired ratings, leave the score unavailable.

| Adapted score | Interpretation | Next decision |
|---------------|----------------|---------------|
| 7–9 | Higher reported unmet importance | Validate opportunity and test solution assumptions |
| 4–<7 | Mixed unmet importance | Examine segments, alternatives and uncertainty |
| 1–<4 | Lower unmet importance in this sample | Keep evidence; compare strategic fit before deprioritizing |

These are local heuristics, not validated universal cutoffs. A high score does not mean “build now”. Reach, severity, evidence quality, cost and strategic fit remain separate dimensions.

**Examples:** Importance 5, satisfaction 1 → 9; importance 1, satisfaction 5 → 1, not −3. Two respondents at (5,1) and (1,5) yield scores 9 and 1, average 5; scoring the averaged inputs (3,3) would incorrectly give 3. No ratings in eight transcripts → opportunity unscored, eight-participant qualitative evidence still usable.

## Insight Card Template

```markdown
### Insight: {Descriptive Title}

**Pattern:** {What we observed, stated as a pattern not an anecdote}
**Evidence:** {N} participants ({%}), {M} total mentions
**Evidence strength:** {strong / moderate / tentative, with sampling and triangulation rationale}

**Key quotes:**
> "{exact quote}" — P{n}, {role at company_size}
> "{exact quote}" — P{n}, {role}

**Implication:** {What this means for the product}
**Opportunity:** {Unmet desired outcome; solution ideas, if requested, labeled separately}
**Adapted ODI score:** {mean of paired respondent scores, n, distribution, or unavailable}
```

## Confidence and sampling

Prevalence is descriptive: “3 of 5 recruited participants mentioned export friction”, not “60% of users need it”. Repeated mentions from one person do not add independent observations. Convenience interviews are not probability samples and their prevalence does not supply population confidence intervals.

| Evidence strength | Grounds |
|-------------------|---------|
| Strong within the stated sample | Relevant segment coverage, concrete behavior, independent corroboration, negative cases examined |
| Moderate | Specific corroborated reports but missing segments, observation or independent source types |
| Tentative | Few/selected respondents, vague statements, prompting, unresolved contradictions or indirect evidence |

Always explain the rating with recruitment, sample size/coverage, question wording, possible selection bias, corroboration and contradictory observations. A theme from 4 of 5 hand-picked power users can have high sample prevalence and tentative population applicability. Statistical precision belongs to representative quantitative sampling, not to counting interview mentions. Saturation can guide further qualitative recruitment but cannot prove prevalence.

## Research Gap Identification

After synthesis, check for:
- **Segments not represented**: Which user types were not interviewed?
- **Questions not asked**: What do we still not know?
- **Contradictions**: Where do participants disagree? Why?
- **Behavioral vs. stated**: Did observed behavior match stated preferences?

For each gap, recommend the research method to fill it:
- **Interview more**: If need qualitative depth on a specific theme
- **Survey**: If need quantitative validation of a pattern
- **Usability test**: If need to observe specific interaction
- **Data analysis**: If behavioral data could answer the question

## Common Mistakes

| Mistake | Correction |
|---------|------------|
| Labeling interview prevalence “confidence” | Separate counts from evidence strength and sampling limits |
| Counting several quotes from one person as several users | Deduplicate participants, preserving repeated-mention context |
| ODT attributed an ODI formula with incompatible range | Name the adapted ODI method, paired ratings, 1–9 range and local heuristic |
| Deriving importance from mention share | Require direct outcome ratings or report score unavailable |
| Opportunity interpreted as feature commitment | State unmet outcome and separate solution testing |

**Narrow example:** “Summarize these five transcripts into three themes” produces three themes with participant counts, quotes and sampling limits in the requested format; no initiative, full scoring exercise or mandatory opportunity selection.
