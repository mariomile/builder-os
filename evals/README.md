# Evals

Behavior checks for `claude plugin eval`. Each case is a prompt a user would type, graded on the result and on the steps, and run twice: with BuilderOS and without it, so the report shows what the plugin adds.

```bash
claude plugin eval . --scaffold --allow-tools Write Edit --runs 2 -j 4 --no-publish
```

`--scaffold` copies `tests/fixtures/acme` (a product with BuilderOS memory) into the cases that need a project. Cases tagged `shell` also need `--allow-tools Bash` and a sandbox backend (on Linux, bubblewrap and socat). Results land in `evals/results/`, which is ignored.

| Case | Checks |
|------|--------|
| `idea-to-production` | An idea gets problem questions with options, no stack and no code |
| `standalone-prd` | A PRD request loads a skill, writes no lifecycle state, invents no counts |
| `standalone-question` | A quick question gets a direct answer, no pipeline |
| `analysis-question` | A retention drop loads `product-analysis` and is checked before it is explained |
| `no-invented-numbers` | An unmeasured rate is reported as unmeasured |
| `where-are-we` | The briefing names the initiative, its phase and the next step |
| `refuses-to-skip-gates` | "Just write the code" at phase 2 writes none and offers the paths |
| `state-written-by-script` (shell) | Advancing a phase runs the gate; `state.json` is never hand-written |
| `outside-evidence` (shell) | Pasted call notes become an evidence file through `evidence add` |
| `what-to-build-next` | "What next?" reads the product's levers, proposes at most three, and lets the user pick |
| `scale-work-before-pmf` | Enterprise features asked for at pre-PMF are named as scale work and questioned |
| `big-effort-gets-a-map` | An effort too big for one session is charted as decisions to make, and the first ones are asked |
| `agents-md-index` | "Write us an AGENTS.md" gives a short index that points at the code and the memory, with no invented commands |
| `demo-video` | A video of a feature is recorded from a passing end-to-end test, kept out of the repository, with a floor when video is unavailable |
| `agent-autonomy` | A helpdesk assistant that can refund gets autonomy per action, the ticket named as an injection surface with a mitigation beyond the prompt and a test, and a plan for slow, down or wrong |

First measurements, 2026-10-21, Claude Code 2.1.306, one or two runs per arm: with the plugin every non-shell case scored 1.0; without it `idea-to-production`, `standalone-prd`, `refuses-to-skip-gates` and `state-written-by-script` scored 0.3 to 0.5. A full two-run pass costs about 2.6 USD at list price. Every failure found in a live run becomes a case.

Product loop cases, 2026-10-21, two runs per arm: `what-to-build-next` 1.0 with the plugin, 0.5 without (Δ +0.5); `scale-work-before-pmf` 1.0 in both arms (Δ 0: when `PRODUCT.md` says pre-PMF, Claude without the plugin also questions enterprise work; the plugin's value there is the gate in lifecycle mode, 3.8 and 4.15). About 0.65 USD.

Decisions and wayfinding (PR #18), 2026-10-21, two runs per arm: `big-effort-gets-a-map` 1.0 with the plugin, 0.5 without (Δ +0.5); `idea-to-production` 1.0 vs 0.5; `refuses-to-skip-gates` 1.0 vs 0.33; `what-to-build-next` 1.0 vs 0.5; `standalone-question` and `standalone-prd` 1.0 in both arms, so the more relentless rounds did not turn quick answers into interviews. About 2 USD.

`agents-md-index`, 2026-10-22, two runs per arm: 1.0 in both arms (Δ 0). On a two-file fixture Claude without the plugin also writes a short index; the plugin's value is keeping it true over time (gate 5.11 and the briefing), which a single-prompt case cannot show. About 0.40 USD.

After the writing rewrite (every skill to one standard, PR #18), 2026-10-22, Claude Code 2.1.308, two runs per arm on the eleven non-shell cases: with the plugin all 1.0 except `no-invented-numbers`, which scored 0.0 (without: 1.0). The same case on the commit before the rewrite scored 0.5, so the weakness predates it: with the plugin, Claude opened with "current rate: 0" and only then said the zero came from a synthetic fixture, and the judge read the headline. `product-analysis` now says to lead with "not measured" when the only figure is synthetic, a fixture, a plan or stale; rerun 1.0 on three of three. Deltas without the plugin: `refuses-to-skip-gates` +0.67, `idea-to-production` and `big-effort-gets-a-map` +0.5, `standalone-prd` and `what-to-build-next` +0.25, the rest 0. About 4 USD.
