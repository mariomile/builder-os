---
name: builder-os
description: "Runs the BuilderOS lifecycle: eight gated phases from a problem to a product in production, with state, evidence and a person's acceptance at each gate. Use when starting or continuing an initiative, running a phase, or taking an idea to production."
---

# BuilderOS — Lifecycle Hub

The hub walks one initiative through the gated phases: it routes to the phase skill, verifies what the skill wrote, and records the gate. Methods and procedures live in the phase skills. Standalone documents, research guides, calculations and reviews go straight to the relevant skill with no lifecycle state; the boundary is in [operating modes](../../references/operating-modes.md).

## Phase Routing

| Phase | Responsibility | Skills | Artifact |
|-------|----------------|--------|----------|
| 0 FRAME | Problem and falsifiable assumption | `problem-framing` | `00-frame.md` |
| 1 DISCOVER | Evidence, synthesis, verdict | `research-methods`, `discovery-methods` | `01-discovery.md` |
| 2 DEFINE | Opportunity and outcome metric | `opportunity-mapping`, strategy as needed | `02-definition.md` |
| 3 IDEATE | Wide ideas, distinct options, the person's bet and test | `ideation-methods`, experiments as needed | `03-solution-bet.md` |
| 4 SHAPE | Flows, then the rules, the look and the stack decided with the person, buildable spec, measurement | `spec-writing`, `ux-architecture`, `domain-model`, `design-direction`, `stack-decisions`, tracking as needed | `04-spec.md`, `DESIGN.md`, `TECH.md` |
| 5 BUILD | Authorized implementation and verification | `delivery-discipline`, tracking as needed | `05-build-plan.md` |
| 6 SHIP | Readiness, authorized exposure and verification | `release-ops`, writing as needed | `06-release.md` |
| 7 LEARN | Compare outcomes, decide or defer | `outcome-review`, analysis as needed | `07-outcome.md` |

When the open decisions of an idea, or of one phase, will not fit one session, chart them with `wayfinding` first: its destination is the initiative (or the phase artifact), and each new session works one ticket. Capabilities resolve against this session per the [capability map](../../references/capability-map.md); a phase skill may run delegated or inline, with the same result.

## The Product Loop

Initiatives answer whether one bet worked; the product review decides which bet comes next. `PRODUCT.md` → `## Business` holds the stage, its exit thresholds, the North Star, the revenue model, the growth engine and the metric tree. Every initiative names the lever it moves (gate 2.7). The review reads every lever weekly before PMF and monthly after, judges the stage, and proposes at most three initiatives for the person to pick. The stage changes the rules: before PMF, scale work waits and experiments are judged qualitatively; after it, operations carry an SLO, incident response and a cost per user. Read [the product review](references/product-review.md) when the person asks how the product is doing or what to build next, or when the briefing says the review is due.

## Procedure

1. **Resolve the initiative.** Read the roadmap, its `state.json` and `PRODUCT.md`; `TECH.md` when code is involved. Initialization, migration, track classification and switching follow [lifecycle setup](../../references/lifecycle-setup.md), and only when requested. Done when you can name the initiative, its track, its phase and its gate mode.
2. **Check the input.** Read the prior artifact and its gate. A covered feature phase uses the evidenced `PRODUCT.md` contract and the initiative's `00-request.md`; a change covered by its mandate enters phase 4 with `00-request.md` as its bet. A failed upstream gate holds progression until it is corrected or explicitly overridden. Settled facts in supplied context answer their own questions. Done when the upstream gate is passed or overridden, or the refusal names the failing condition.
3. **Run the phase skill.** Pass the request verbatim, the authorized actions, the state, the prior artifact and the resolved capabilities. Load the supporting skills this phase needs: `evidence-ledger` when capturing claims, `pressure-testing` for a material open assumption or a requested critique. Done when the phase artifact is written and the skill reported its marker.
4. **Verify the output.** The marker is a claim; the gate on the file is the evidence. Re-read the artifact and run the gate with the installation's `scripts/bos.mjs`, reading `gate-checks` before recording. A command that executes checks needs an explicit authorized invocation; a gate runs only its own checks. Done when every condition of the gate has a pass or fail with its reason.
5. **Record and update.** `scripts/bos.mjs record N` with the required judgments and a matching verdict, and at phases 0, 4 and 6 the person who accepted (`--accepted-by`, from their own words; `gate-checks`, Acceptance). Where execution is unavailable, apply the same checks by reading and record them as model-judged with the limitation stated. Done when `state.json` and `ROADMAP.md` show the new phase, with history preserved.

## State and Completion

- A passed or explicitly overridden gate advances the initiative; a failed condition stays visible.
- A change closes after phase 6 unless its release set an outcome review. Its mandate covers phases 0 to 3; a real choice between solutions found later upgrades it to feature.
- A spike closes after phase 1 with its problem verdict. A KILLED problem stops the lifecycle; continuing takes an explicit track or new-cycle decision.
- RELEASE READY means the preparation exists. SHIPPED takes observed, authorized exposure with its environment, version, actual timestamp and source-backed verification; a planned date stays in SHIP.
- The agent analyses and recommends; the person chooses. The assumption to test, the next step after a discovery verdict, the opportunity and target, the bet, the look, the stack, the rollout and keep/iterate/kill are each a round question, recorded as `**Chosen by:**` (`gate-checks`, Decisions).
- A gate verdict is not an acceptance. The frame, the spec, the build plan and the release each wait for a person's yes; a standing instruction counts only when it named that scope.
- KEEP closes the cycle and sets a watch; a breach of its bands starts a new initiative from the anomaly. ITERATE and KILL use a coherent re-entry point or an explicit close. An insufficient observation window defers the review with a date and a reason while phase 7 stays open.

Keep the roadmap in sync with state. Archive earlier cycle artifacts before overwriting them. Carry the baseline's definition and provenance through every phase; an unavailable value stays unavailable.

## Watch for

| Do | Instead of |
|---|---|
| Run a PRD request as standalone `spec-writing` | Opening an initiative or an override for it |
| Read the artifact and run the gate before recording | Advancing on a delegate's success claim |
| Judge the captured runner output | Trusting a pasted pass table |
| Stay in SHIP until exposure is observed | Entering LEARN on a release plan |
| Proceed within the authority already granted | Asking an authorized decision again |
| Run the product review and let the person pick | Starting the next initiative from whoever asked last |
| Ask at phases 0, 4, 6 and before the build loop; record the person's answer | Recording an acceptance nobody gave |

## Output Contract

Open every phase report with a recap in plain words, at most five lines, for someone who did not follow the work: what was decided, what changed, what is still unknown. Then the active initiative, phase, artifact, gate outcome and the next in-scope action; a blocking condition comes with what would satisfy it. End with the phase skill's own marker (`## FRAME COMPLETE`, `## DISCOVERY COMPLETE`, `## DEFINITION COMPLETE`, `## BET SELECTED`, `## SPEC COMPLETE`, `## BUILD VERIFIED`, `## RELEASE READY` or `## SHIPPED`, `## OUTCOME RECORDED` or `## REVIEW DEFERRED`). RELEASE READY and REVIEW DEFERRED leave the lifecycle where it is. Phase 1 accepts validated, killed or reshaped verdicts; a spike derives its answered status from the recorded verdict.
