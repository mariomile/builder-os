---
name: feature-demo
description: "Records a video of a feature working: an end-to-end test walks the flow as a user would, asserts every step, and the passing run is the recording. Use when someone wants to see a feature work, a demo for a PR or release, or an e2e video."
---

# Feature Demo

A green test suite tells an engineer the feature works; a video shows everyone else. This skill turns the end-to-end test of a flow into a recording of it: the test walks the flow the way the user does, checks what the user sees at every step, and the run that passes is the one that is filmed. A video only exists of a walk that worked, so the person accepting the build, the reviewer of the pull request and the reader of the release notes all see the same proof.

**Mode.** Standalone records the flow the person names on the running product and hands over the file. In the lifecycle it runs in phase 5 after the interface review (`delivery-discipline`, step 9), writes `05-build-plan.md` → `## Demo`, and gate 5.15 checks it; phase 6 shows the same recording to whoever authorizes exposure and links it in the release notes. Both per [operating modes](../../references/operating-modes.md). Read the [demo method](references/demo-method.md) for the test shape, the recording settings with examples per runner, captions, the ladder in detail and a worked example.

## Procedure

1. **Read the flows.** `DESIGN.md` → `## Flows`: each flow's steps table and its Mermaid flowchart, the chosen direction and its widths; the spec's acceptance criteria; `TECH.md` → Verify, Quality checks and `**Demo:**` when a previous initiative left the recording command there; how the product starts locally. Done when you can name the flows to record, the command that starts the product, and the test runner in use.
2. **Choose what to record.** The primary flow, always. On the product track also `### First day`, from the first visit to the first useful outcome, because activation is decided there. On the change track the flow of the screen that changed. Standalone, the flow the person asked for. Done when each recording has a flow from `DESIGN.md` or from the request.
3. **Write the walk as a test,** or extend the end-to-end test the guardrail already runs on the primary flow (gate 5.10). One test step per step of the flow table, following the flowchart's happy path from entry to the success exit; each step acts the way the user does (by visible label and role) and asserts what the user sees afterwards. Seed data that reads like the product's real users, in `PRODUCT.md` → Language: names, amounts and dates a customer would recognize. Done when the test passes headless and every node on the happy path has its step and its assertion.
4. **Make it watchable.** Record at the width the ICP uses most (from `DESIGN.md` → Widths), pace the actions so each outcome stays on screen long enough to read, show a caption per step naming the user's action in the product's words, and keep the pointer visible. Recording runs on demand behind one switch, so the guardrail stays fast. Done when one command records, and every step has its caption.
5. **Record through `ui.record`,** down the ladder: the runner's own video; a browser the host drives, recorded; a screenshot per step from the same run; the person recording the screen while the test or they walk the flow (`**Recorded by:**`). Run it through `run-check` with the label `e2e-demo`, so the recording comes with a captured passing run. Recordings stay out of the codebase: save to `.builderos/media/{initiative}/{flow}.webm` (or `.mp4`), a folder in `.gitignore` (add the line if it is missing), then put the file where the person opens it (attached to the pull request, an artifact, the CI run's saved files) and record its link. Done when every flow has a git-ignored file or a link, from a passing run or a named person.
6. **Watch it before anyone else does.** Look at the frames step by step (extracted stills, or the runner's screenshots) against the flowchart and the chosen direction: each step visible, each caption true, the outcome on screen at the end, nothing that belongs to a test (placeholder text, an empty account, a debug overlay). A wrong frame is fixed in the product or the test, and the flow recorded again. Without a way to see frames, the person watches it and says what they saw. Done when every step of every recording has been seen and matches.
7. **Record and hand it on.** Write `## Demo` in `05-build-plan.md` per the [build-plan template](../delivery-discipline/references/build-plan-template.md): `**Test:**`, `**Run:**`, and a table (Flow / Recording / Shows). Put the recording command in `TECH.md` → `**Demo:**`, so the next initiative records with one line. The pull request carries the link. Done when gate 5.15 passes on the file.

## Watch for

| Do | Instead of |
|---|---|
| Film the run that passed, with its capture | A screen recording of a walk nobody asserted |
| One step per row of the flow, an assertion after each | A test that clicks through and checks only the last page |
| Data a customer would recognize | "Test User", "foo", an empty account |
| A caption naming the user's action | A silent video the viewer has to decode |
| Recording behind a switch | Slowing every CI run with video |
| Look at the frames, then show it | Sending a recording of a spinner |

## Capabilities

| Capability | Used for | Floor if absent |
|-----------|----------|-----------------|
| `shell.exec` | Starting the product, running the test through `run-check` | Write the test and the command; the person runs it and records the screen (`**Recorded by:**`) |
| `ui.record` | The video of the walk | A screenshot per step from the same run (`ui.capture`); then the person's screen recording |
| `ui.capture` | Stills to check each step | The person watches and says what they saw |
| `repo.read` | The existing end-to-end tests, fixtures and seed data | Ask how the product starts and where its tests live |
| `files.read` / `files.write` | `DESIGN.md`, the build plan, the recording, `TECH.md` | Inline answers need no write; lifecycle writes require it |

## Output Contract

`## DEMO RECORDED` with each flow, its recording (path or link), what it shows, the test that walks it and the passing run, or who recorded it on the floor. The lifecycle artifact is `05-build-plan.md` → `## Demo`; gate 5.15 parses `**Test:**`, `**Run:**` or `**Recorded by:**` and the table.
