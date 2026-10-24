# Gate 3 — Ideate

Read when running gate 3. E.1, E.2 and the procedure in `SKILL.md` apply too.

| # | Condition | Check |
|---|-----------|-------|
| 3.1 | ≥3 mechanically distinct options | Each has a different primary user action, stated explicitly. Same action with different UI is one option |
| 3.2 | Selected bet has kill criteria | A metric, a threshold, and a date. All three |
| 3.3 | Riskiest assumption has a designed test | With a cost estimate in days |
| 3.4 | The test runs when it can change the decision | `**Order:** test first` with `**Changes the decision:**` (which result would flip the bet), or build first with `**Skip because:**` naming cheap and reversible, the pessimistic case still proceeds, strong precedent or unreliable measure, or a logged override. Replaces the 20% cost rule of 3.0 |
| 3.5 | Diverged before converging | `## Divergence` lists at least 8 raw ideas (lite: 5) before the options were formed |
| 3.6 | A person chose the bet | `**Chosen by:**` under Selected names the person and their answer, or a dated standing instruction; never the agent |
| 3.7 | The bet says how users arrive and who pays (product track) | `## Business case` has `**First 100 users:**` (channel, message, who does the work) and `**Cost per user:**` (infrastructure plus model cost); for a product for sale also `**Price:**` and `**Willingness to pay test:**`. `PRODUCT.md` → `## Business` must declare `**Revenue model:**`; "not for sale, {why}" drops the two money lines. Skipped on the other tracks |
| 3.8 | No scale work before PMF | Model-judged at `idea` and `pre-PMF`: the bet tests whether there is a product, rather than scaling, optimizing or hardening one nobody uses yet. Skipped after PMF |
| 3.9 | The bet has a value in money | `## Value`: `### Quick estimates` with a value for each option (up to four; lite two); `### Assumptions` with at least three rows, each with its population, a kind (data, analogy, estimate, decision), a source (data and analogy cite a data, doc, code or interview tag) and P14, P50, P86; a percentage carries its population; `**Two-year value:**` with P14, P50 and P86 and no more than three significant digits; `**Costs:**`. A `**Judgment:**` of at least a sentence, for value that resists a number, makes 3.9 model-judged and skips 3.10 and 3.11 |
| 3.10 | The load-bearing assumption is found and aimed at | `### Sensitivity` with at least two rows, the result at P14 and P86 for each; `**Load-bearing:**` names the row with the largest swing; when it is an estimate or analogy and the test runs, `## Cheapest test` → `**Assumption:**` names it; when it is data, `**What it counts:**` says people or events, all users or a part |
| 3.11 | The five questions are answered | `### Five questions` answers: where each number comes from, new or moved revenue, the denominator, five times smaller, what was killed and with which number |
| 3.12 | The experiment is a decision written before the data | When the test runs first: `**Question:**` as a number, `**Event:**`, `**Stop below:**`, `**Build above:**` (stop below the build line), `**Second idea:**` and `**Sample:**`. Skipped when the build goes first |
| 3.13 | Go-to-market before the build | `## Go-to-market`: on the product track `**Trigger:**`, `**Positioning:**`, `**Motion:**`, `**Channel:**`, `**Channel test:**`; on the feature track `**Audience:**`, `**Message:**`, `**Where:**` |
| 3.14 | The stake is declared and the build fits it | `## Bet size`: `**Door:**` one-way or two-way, `**Confidence:**` in percent, `**Appetite:**` in days, `**If wrong:**`. The build cost in `## Cheapest test` is within the appetite; a one-way door cannot skip its test as cheap and reversible |
| 3.15 | The evidence matches the stake | Model-judged: the evidence behind the bet meets the bar for the stage and the door (`business-case`, The evidence bar), or the person made a judgment call knowingly, recorded with its reasoning and a revisit date |

Script-decided: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.9 (model-judged when a judgment replaces the number), 3.10, 3.11, 3.12, 3.13, 3.14. Model-judged: 3.1, 3.8, 3.15. The emitted `checked_by` split is authoritative.
