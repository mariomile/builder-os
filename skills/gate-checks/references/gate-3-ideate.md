# Gate 3 — Ideate

Read when running gate 3. E.1 and the procedure in `SKILL.md` apply too.

| # | Condition | Check |
|---|-----------|-------|
| 3.1 | ≥3 mechanically distinct options | Each has a different primary user action, stated explicitly. Same action with different UI is one option |
| 3.2 | Selected bet has kill criteria | A metric, a threshold, and a date. All three |
| 3.3 | Riskiest assumption has a designed test | With a cost estimate in days |
| 3.4 | Cheap-test-first rule honored | If test cost < 20% of build cost, the artifact shows the test running first or an override |
| 3.5 | Diverged before converging | `## Divergence` lists at least 8 raw ideas (lite: 5) before the options were formed |
| 3.6 | A person chose the bet | `**Chosen by:**` under Selected names the person and their answer, or a dated standing instruction; never the agent |
| 3.7 | The bet says how users arrive and who pays (product track) | `## Business case` has `**First 100 users:**` (channel, message, who does the work) and `**Cost per user:**` (infrastructure plus model cost); for a product for sale also `**Price:**` and `**Willingness to pay test:**`. `PRODUCT.md` → `## Business` must declare `**Revenue model:**`; "not for sale, {why}" drops the two money lines. Skipped on the other tracks |
| 3.8 | No scale work before PMF | Model-judged at `idea` and `pre-PMF`: the bet tests whether there is a product, rather than scaling, optimizing or hardening one nobody uses yet. Skipped after PMF |

Script-decided: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7. Model-judged: 3.1, 3.8. The emitted `checked_by` split is authoritative.
