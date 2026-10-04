---
name: builder-os
description: "Use when the user requests a BuilderOS initiative, a lifecycle phase, or continuation of a gated pipeline from a problem toward verified production and learning"
---

# BuilderOS — Lifecycle Hub

Orchestrate the requested initiative. Standalone documents, research guides, calculations and reviews use the relevant skill without lifecycle state; read [operating modes](../../references/operating-modes.md) when the boundary is unclear.

## Phase Routing

| Phase | Responsibility | Skills | Artifact |
|-------|----------------|--------|----------|
| 0 FRAME | Problem and falsifiable assumption | `problem-framing` | `00-frame.md` |
| 1 DISCOVER | Evidence, synthesis, verdict | `research-methods`, `discovery-methods` | `01-discovery.md` |
| 2 DEFINE | Opportunity and outcome metric | `opportunity-mapping`, strategy as needed | `02-definition.md` |
| 3 IDEATE | Distinct options, bet and test | `ideation-methods`, experiments as needed | `03-solution-bet.md` |
| 4 SHAPE | Buildable spec, states, measurement | `spec-writing`, UX/tracking as needed | `04-spec.md`, `DESIGN.md` |
| 5 BUILD | Authorized implementation and verification | `delivery-discipline`, tracking as needed | `05-build-plan.md` |
| 6 SHIP | Readiness, authorized exposure and verification | `release-ops`, writing as needed | `06-release.md` |
| 7 LEARN | Compare outcomes, decide or defer | `outcome-review`, analysis as needed | `07-outcome.md` |

Methods and procedures live in skills. Resolve capabilities against this session, per [capability map](../../references/capability-map.md) when an operation needs them. If delegation is available, pass the request, scope and relevant context to a phase skill, wait for its result, then verify it. Otherwise run the same procedure inline; do not invent a dispatch or install a host feature.

## Procedure

1. **Resolve the initiative.** Read relevant roadmap/state and `PRODUCT.md`; read `TECH.md` when code is involved. If initialization, migration, track classification or switching is requested, use [lifecycle setup](../../references/lifecycle-setup.md). Missing state does not authorize initialization for an unrelated request.
2. **Check the input.** Read the prior artifact and gate. A covered feature phase uses the evidenced `PRODUCT.md` contract. A failed upstream gate blocks progression until corrected or explicitly overridden. Existing supplied context may answer questions; do not re-interview settled facts.
3. **Run the phase skill.** Pass the user's request verbatim, authorized actions, current state, prior artifact and relevant capabilities. Load only supporting skills needed for this phase. Read `evidence-ledger` when capturing claims and `pressure-testing` for a material unresolved assumption or requested critique.
4. **Verify the output.** Re-read the written artifact and run the relevant gate using the installation's `scripts/bos.mjs`. Completion markers are claims; gates verify only their stated structural and semantic conditions. Read `gate-checks` before recording. Commands that execute checks require an explicit authorized invocation; a gate never reruns an arbitrary command from an artifact.
5. **Record and update.** Use `scripts/bos.mjs record N` with required judgments and matching verdict, and at phases 0, 4 and 6 the person who accepted (`--accepted-by`, from their own words; see `gate-checks`, Acceptance); update roadmap/context and preserve history. Where execution is unavailable, apply the same checks by reading and record them as model-judged with the limitation stated.

## State and Completion

- A passed or explicitly overridden gate advances the initiative; failed conditions stay visible.
- A spike closes after phase 1 with its problem verdict. A KILLED problem stops the lifecycle; continuing requires an explicit track/new-cycle decision.
- RELEASE READY means the preparation exists. SHIPPED requires observed, authorized exposure with its environment, version, actual timestamp and source-backed verification. A planned rollout date cannot advance to LEARN.
- A gate verdict is not an acceptance. The frame, the spec, the build plan and the release each wait for a person; the agent never approves its own work, and a standing instruction counts only when it named that scope.
- KEEP closes the cycle and sets a watch; a breach of its bands starts a new initiative from the anomaly. ITERATE/KILL use a coherent re-entry point or an explicit close. An insufficient observation window defers review with date and reason while phase 7 remains open; it fabricates no verdict.

Keep the initiative's roadmap in sync with state. Archive earlier cycle artifacts before overwriting them. Preserve baseline definition and provenance through every phase; unavailable does not become zero.

## Output Contract

Report the active initiative, phase, artifact, gate outcome and the next in-scope action. Name a blocking condition and what would satisfy it. Use the selected phase skill's actual completion marker and never treat a marker as proof. RELEASE READY and REVIEW DEFERRED explicitly do not advance the lifecycle. Phase 1 accepts validated, killed or reshaped verdicts; a spike derives answered status from its matching recorded verdict.

## Common Mistakes

| Mistake | Correct |
|---------|---------|
| A PRD request becomes an initiative or override | Run standalone spec-writing with supplied requirements |
| A delegated agent's success claim advances state | Read the artifact and verify the gate before recording |
| A pasted pass table overrides failed runner output | Use capture/result evidence and judge its relevance |
| A release plan enters LEARN | Remain in SHIP until actual exposure is verified |
| Missing metrics become zero | Preserve the unavailable baseline and name the measurement gap |
| Repeating an already authorized decision question | Proceed within the scope and authority granted |
| Recording an acceptance nobody gave | Ask at phases 0, 4, 6 and before the build loop; record only the person's answer |
