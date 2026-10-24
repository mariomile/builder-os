# Demo Method

Read the section a step of `feature-demo` needs. Runner names below are examples of what `ui.record` resolves to, never requirements: use what the project already runs before adding anything.

## The walk as a test

The flow table in `DESIGN.md` is the script. Each row becomes one step of the test, in order, and the Mermaid flowchart names the happy path from entry to the success exit. A step acts the way the user does and then asserts what the user sees:

| Flow row | Test step |
|----------|-----------|
| 1 · opens the weekly report · shows this week's deals | go to `/reports`, expect the heading "This week" and at least one deal row |
| 2 · clicks Export · builds the file | click the button named "Export", expect the toast "Your file is ready" |
| 3 · opens the file · the CSV downloads | expect a download named `deals-2026-w43.csv` |

Locate by what the user reads (role and visible label), so the test breaks when the screen breaks and survives a class rename. Wait on what the user waits on (a heading, a toast, a row), never on a fixed delay, so the run is fast headless and steady on camera.

The branches in the flowchart (empty account, error, permission) are covered by the regular tests of phase 5; the demo films the path the person will use most, plus the first day on the product track.

## Data a customer would recognize

Seed the account the test uses with records from the product's world: the company names, amounts, dates and statuses from `PRODUCT.md` → Language and the ICP. Synthetic, and never copied from a real customer: a video travels further than a database. A reviewer watching should recognize their own work in it.

## Watchable settings

| Setting | Default | Why |
|---------|---------|-----|
| Viewport | the ICP's main width from `DESIGN.md` → Widths, 1280×720 for desktop, 390×844 for a phone-first product | The viewer sees the screen their users see |
| Pace | 300 to 600 ms between actions, a 1 s hold on each outcome | Long enough to read, short enough to watch to the end |
| Captions | one line per step, the user's action in the product's words | The video explains itself without a voice-over |
| Pointer | visible, moving to each target | The viewer follows where the action happens |
| Length | under a minute per flow | A demo longer than that is several flows |
| Switch | one environment variable or script, `demo` | The guardrail runs the same test without video, at full speed |

Examples of the switch per runner: in Playwright, a `demo` project in the config with `use: { video: 'on', viewport, launchOptions: { slowMo: 400 } }`, or `browser.newContext({ recordVideo: { dir, size } })` for one test; in Cypress, `video: true` with a slower `defaultCommandTimeout` only under the demo config; in a browser the host drives, its own recording. The script `"demo": "DEMO=1 {the e2e command} {the flow's test}"` goes into `TECH.md` → `**Demo:**`.

A caption can be injected by the test itself before each step: an element fixed at the bottom of the page, the step's sentence as its text, removed at the end. Keep it out of the product's code.

## The ladder

1. **The runner's video.** The test runner records the browser context it drives. The file it writes is the recording; rename it after the flow.
2. **A browser the host drives, recorded.** Where the host can open and record a browser but the project has no runner yet, walk the same steps there and keep the assertions as checks the agent makes on each screen.
3. **A screenshot per step from the same run.** No video, but the same proof: one still after each assertion, numbered in order (`1-report.png`, `2-exported.png`), in the same git-ignored folder. The table lists them in order and says why there is no video.
4. **The person records the screen.** The test runs (or the person walks the flow) while their screen recorder runs; `**Recorded by:**` names them. The test still exists and passes in the guardrail.

Every rung ends in a real file or link. A description of what the video would show is the gap, said as a gap.

## Where the file lives

Outside the codebase. A video in the repository makes every clone heavier forever and turns a review into a binary diff, so the repository holds the link and the script that records it, never the file. The run writes to `.builderos/media/{initiative}/{flow}.webm`, a folder listed in `.gitignore`; gate 5.15 fails a recording git would commit. From there it goes where the person opens it: attached to the pull request (a GIF of the first seconds plays inline), an artifact, or the CI run's saved files with a retention long enough for the outcome review. The table holds that `https://` link, and the local path while the file is only on this machine.

A minute at 1280×720 is usually a few megabytes; a larger file means a longer flow, so shorten it or lower the size.

## Watching it before anyone else

Extract a still per step (a frame every second with a video tool where `shell.exec` resolved, or the runner's step screenshots) and look at each against the flowchart node and the chosen direction. The frequent faults: the first frame is a blank page, a spinner holds through the caption, a toast vanishes before it is readable, the seed data shows "Lorem", the window is the wrong width. Each is fixed in the test or the product, then the flow is recorded again.

## Worked example

```markdown
## Demo
**Test:** `test/e2e/export-week.spec.ts`
**Run:** .builderos/initiatives/csv-export/evidence/runs/e2e-demo-2026-10-24T10-12-03Z.json
| Flow | Recording | Shows |
|------|-----------|-------|
| Export the week | https://github.com/acme/app/pull/48 (attached; local copy .builderos/media/csv-export/export-the-week.webm) | the report with 14 deals, Export, the toast, the file in downloads (38 s) |
```

`TECH.md` → `**Demo:** pnpm demo -- test/e2e/export-week.spec.ts (records into .builderos/media/csv-export/, git-ignored)`.

In phase 6 the release notes carry the link under `**Demo:**`, and the message asking for exposure authorization opens with it.
