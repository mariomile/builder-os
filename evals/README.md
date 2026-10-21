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

First measurements, 2026-10-21, Claude Code 2.1.306, one or two runs per arm: with the plugin every non-shell case scored 1.0; without it `idea-to-production`, `standalone-prd`, `refuses-to-skip-gates` and `state-written-by-script` scored 0.3 to 0.5. A full two-run pass costs about 2.6 USD at list price. Every failure found in a live run becomes a case.

Product loop cases, 2026-10-21, two runs per arm: `what-to-build-next` 1.0 with the plugin, 0.5 without (Δ +0.5); `scale-work-before-pmf` 1.0 in both arms (Δ 0: when `PRODUCT.md` says pre-PMF, Claude without the plugin also questions enterprise work; the plugin's value there is the gate in lifecycle mode, 3.8 and 4.15). About 0.65 USD.
