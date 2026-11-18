# Need Check (build track)

Read when initializing work classified as `build` (named `internal` before 3.8.0). E.1 and E.2 apply too, against `BRIEF.md` → Request.

Runs once, at initialization, when the work is classified as `build`: the person knows what they want to build and for whom (themselves, their team, a client, the users they describe), and only how to build it is open. It stands in for gates 0 to 2: a pressure test on what to build and where to focus (N.7) and the person's account of the job replace the frame, the discovery and the outcome metric. Discovery runs only when the person asks for it, and then the work is a `product`. It does not replace anything after: phase 3 explores the solution feature by feature, and the spec, the build and the release run their gates. Phase 7 runs only when the release sets an outcome review, as on the change track.

`BRIEF.md` in the initiative folder, as on the feature track: the thread on top, then the Request part with the need:

```markdown
# Brief — {title}

**Building:** {one sentence: what this initiative builds, in the words of the person who asked}
**Why:** {one sentence: the problem it removes or the result it moves, with its tag}
**For:** {who uses it, in the person's words}
**Done when:** {what the person will see or be able to do when it is done}
**Not:** {what it must not do or become}

# Request — {title}

## Request
{the need, verbatim, with who said it}

**Evidence:** {tags of the builder's own account, a timing log, the sheet or the script it replaces, each with its file in evidence/}
**Population:** {who uses it}

## Need
**Job:** {When {situation}, I want {to get something done}, so {the result}: in the words of the person who does it}
**Users:** {who will use it: you, your team, a client's people, or the users you are building it for}
**Today:** {how the job is done now: minutes or hours per run and how often, tagged; an estimate from what you were told is enough to start}
**Hired today:** {what does the job now (a paid tool, a sheet, a person, nothing) and what it costs in money and hours, tagged}
**Done when:** {the result the builder will see, with a number and a date: the job in 15 minutes instead of 90, by 2026-12-15}

### Forces
**Push:** {what pushes away from what is hired today}
**Pull:** {what the new one promises that today's cannot}
**Anxiety:** {what worries the users about switching: the data, learning it, a mistake reaching a client}
**Habit:** {what keeps them where they are}

### Replacing
{only when **Hired today** is a tool someone pays for}
**Tool:** {the product}
**Cost:** {a year, or a month and the seats, tagged: the invoice or the pricing page}
**Renewal:** {the date it renews, or "monthly, no contract"}
**Data out:** {what has to leave it and how: an export, an API, by hand, or none}
**Integrations:** {what is wired to it today, or none}

| Feature | Use | Must keep |
|---------|-----|-----------|
| {from the tool's own feature list} | {daily, weekly, monthly, sometimes, rarely, never} | {yes / no} |

### Steps today
1. {who does what, in the tool they use now}
2. {the next step, breaks: where the time goes, the errors, the waiting}
3. {…}
```

| # | Condition | Check |
|---|-----------|-------|
| N.1 | The need has a source | **Evidence** under Request has a `data`, `interview` or `doc` tag. The builder's own words, saved per `evidence-ledger`, are first-hand here: the requester is the user |
| N.2 | The users are named | **Users** names who will use it |
| N.3 | Today is counted | **Today** has a number (time per run, runs per week, errors per month) and a tag. Drafted by the agent from what it was told, never asked as a questionnaire: an `estimate` or `assumption` tag warns, to be measured before the release; a `data`, `doc` or `interview` tag passes. It is the baseline a release with an outcome review captures again |
| N.4 | Done is a result with a date | **Done when** has a number and a date. It is the success metric and the target for phase 4's tracking plan (4.4) and, when it runs, phase 7 (7.1) |
| N.5 | The idea is clear | The person knows what to build and for whom, only how to build it is open, and nobody asked to prove the problem first. A problem still unproven, a request for discovery, or no idea yet of what to build is a `product` |
| N.6 | The job is understood step by step | `### Steps today` under the Need lists at least 3 numbered steps (who does what, in which tool) and at least one marked `breaks:` with where the time, the errors or the waiting are. It is the depth a discovery would give, from the people who do the job and their materials in one session; a real discovery runs only when the person asks for one |
| N.8 | The job is a job | **Job** reads "When {situation}, I want {…}, so {…}" (or the same in the person's language): the moment it starts, what they are trying to get done, and the result it buys them. A feature name or a topic is not a job |
| N.9 | What is hired today, and why they would switch | **Hired today** names what does the job now with a tag, and `### Forces` has **Push**, **Pull**, **Anxiety** and **Habit**. Anxiety and habit are the risks of the release: data to move, people to retrain, a mistake reaching a client |
| N.10 | A paid tool being replaced is understood | When **Hired today** is a tool someone pays for (a price, a licence, a subscription), `### Replacing` has **Tool**, **Cost** with a number and a tag, **Renewal** (a date, or monthly), **Data out**, **Integrations**, and at least 3 of its features with how often each is used. Passes with nothing to write when nothing is paid for |
| N.7 | Pressure-tested | `grilling.md` in the initiative folder ends with `## Context brief` carrying **Goal:**, **Decided:**, **Out of scope:** and **Next step:**: the interview on what to build, for whom, what the first version does and leaves out, and what makes it the best, run until the frontier is empty (`pressure-testing`, Done) |

Script-decided: N.1 to N.4 and N.6 to N.10. Model-judged: N.5. The emitted `checked_by` split is authoritative.

Where commands run: `scripts/bos.mjs gate N` first (it only reads), fix drafting errors, judge N.5, then `scripts/bos.mjs cover --n5 "why the users are the team and only the how is open"`. Pass: phases 0 to 2 are written `covered`, one `phase_covered` event each with the tags of Request and Need, and the pipeline starts at phase 3 in lite mode. If you judge N.5 a fail, do not call `cover`: run `scripts/bos.mjs upgrade --to product --reason "..."`.

Fail: the work is a `product`, in full mode, at phase 0. Fix a drafting error before `cover` (a missing number in Today you can ask for in one line); the first failure `cover` records is final.

**Drafting the need.** The agent drafts it from the person's account and their materials (a screenshot or the feature page of the tool they pay for, an export, the invoice), then asks only what is missing, in one round. When a tool is being replaced, the inventory comes from that tool's own feature list, rated by the people who use it: usually a few features carry the work, and only those are rebuilt.

**What changes after the check.** Gate 3 maps the features (3.5) and, when a paid tool is replaced, maps every feature in use and counts the licence saved (3.17) and values each option in time instead of money (`business-case`, Internal Tools): hours saved a week against days to build, and **Not building:**, the best way of not building it and why it loses; 3.7, 3.8, 3.10 and 3.11 are skipped, and 3.13 too unless `PRODUCT.md` names a revenue model: a product for sale plans how buyers arrive. Gate 4 needs one visual version, or the look inherited or not applicable for a tool with no screen. Gate 6 skips the launch, first outside use and first payment, and its release note is for the people named in **Users**. A release with no Baseline, Measurement or Outcome review section skips 6.2, 6.3 and 6.5 and closes the initiative at phase 6; one that sets a review goes to phase 7, which compares against **Done when** and skips the go-to-market read. Everything else holds: kill criteria (checked at the review when there is one), the cheapest test when it can change the decision, the stake, the spec, the threat model (a tool often holds credentials and client data), the accepted plan, the tests, the rollback.

**Ratchet.** Build work moves only to `product`, when the person asks to prove the problem or the market first (`upgrade --to product`). On a project whose `PRODUCT.md` revenue model reads "not for sale, …", a `change` whose mandate check fails becomes `build`, not `feature`.

| Mistake | Why it fails | Correct |
|---------|-------------|---------|
| "I think people have this problem" filed as build | The problem itself is the open question | A `product`, or a `spike` to answer it |
| Today written as "slow" | Phase 7 has nothing to compare against | A number: "90 minutes, four times a week", timed once if unknown |
| Job written as "a proposal tool" | A tool is a solution; the job is why anyone would hire it | "When the sheets arrive, I want the proposal drafted, so it goes out the same day" |
| Rebuilding every feature of the paid tool | Most are never used, and each one costs days and upkeep | The `### Replacing` inventory: only features in use enter the feature map |
| Skipping phase 3 because the builder already pictures the solution | The picture is one option; the cheap one is often a script or an existing tool | Three options, one of them not building |
