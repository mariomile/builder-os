# Experiment Design Reference

Read when writing the hypothesis, choosing metrics, specifying randomization and runtime, choosing an experiment type, or interpreting a borderline result. Calculations are in [proportions](proportions.md).

## Hypothesis Template

```
If we [specific, implementable change],
then [primary metric] will [increase/decrease] by [minimum detectable effect],
because [reasoning tied to user behavior or data].
```

**Bad hypothesis:** "If we improve onboarding, activation will increase."
**Good hypothesis:** "If we add a progress bar to the 3-step setup wizard, setup completion rate will increase by 8pp (from 45% to 53%), because users abandon when they don't know how many steps remain (exit survey data: 34% cite 'didn't know how long it would take')."

## Metrics and statistical method

Use one preregistered primary outcome plus the minimum applicable input indicators and guardrails. More than one guardrail may be needed; exactly three total metrics is not a statistical requirement. Specify randomization unit (usually account for B2B), allocation, exposure, eligibility, analysis population and the business effect worth detecting.

For equal-allocation binary outcomes, use the normal approximation in `references/proportions.md`: Two-sided 95% confidence, 80% power, independent units. The zero-dependency `scripts/proportions.mjs` is the calculation source and generates the committed lookup table. Where local execution is unavailable, apply the same formula explicitly; the script is optional. Do not apply it to clustered users, repeated observations, multiple arms or rare-event regimes without an appropriate design.

Runtime is sample per arm × arms / daily eligible independent units, rounded up, then extended to the preregistered full business cycles. A short calculated runtime is not proof the MDE is wrong; it still needs a calendar rule. A long runtime is a design tradeoff, not permission to change assignment unit after seeing results.

**Calculation example:** At baseline 5%, an absolute +5pp means 10% alternative (100% relative lift): 432 per arm. A +10% relative lift means 5.5% alternative: 31,196 per arm. Label both scales; never call 10% relative lift 10pp.

**Interpretation example:** A completed fixed-horizon test with an interval from −2pp to +5pp remains inconclusive when +3pp is the business threshold. Neither “no effect” nor an unplanned “run until significant” follows. A confidence interval contained inside a preregistered equivalence margin can support an equivalence claim using the appropriate equivalence test.

## Experiment Types

| Type | When to Use | Duration |
|------|------------|----------|
| **A/B test** | Binary choice, enough traffic | 2-6 weeks |
| **Multi-variant (A/B/C)** | Multiple alternatives | 3-8 weeks (more traffic needed) |
| **Holdback** | Measure long-term impact of shipped feature | 4-12 weeks |
| **Sequential testing** | Need early stopping | Varies (uses alpha spending) |
| **Quasi-experiment** | Can't randomize (e.g., pricing by region) | Varies |

## Common Mistakes

| Mistake | Correction |
|---------|------------|
| Mixing pp and relative percent | Convert both to the alternative probability before powering |
| Lookup table disagrees with formula | Generate it from `scripts/proportions.mjs`; regression tests check equality |
| Nonsignificance means no effect | Report the interval, meaningful effects still compatible with it, and inconclusive verdict |
| Extending after seeing p = 0.06 | Follow a prespecified sequential/blinded extension rule or start a new preregistered test |
| Treating users in one account as independent | Randomize/analyze at the account level or use a clustered method |
| Applying normal tests to zero conversions | Use a suitable exact/rare-event method and state approximation limits |
