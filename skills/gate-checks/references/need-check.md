# Need Check (internal track)

Read when initializing work classified as `internal`. E.1 and E.2 apply too, against `00-request.md`.

Runs once, at initialization, when the work is classified as `internal`: a tool whose users are the builder or their own team, reachable by name, where the job is known and only the way to do it is open. Nobody outside uses it or pays for it, so there is no customer to interview, no market to size and no launch to plan. It stands in for gates 0 to 2: the builder's own account of the job replaces the frame, the discovery and the outcome metric, because the person who has the problem is the person deciding. It does not replace anything after: phase 3 compares the ways to do it, and the spec, the build and the release run their gates. Phase 7 runs only when the release sets an outcome review, as on the change track.

`00-request.md` in the initiative folder, the same file the feature and change tracks use, plus the need:

```markdown
# Request — {title}

## Request
{the need, verbatim, with who said it}

**Evidence:** {tags of the builder's own account, a timing log, the sheet or the script it replaces, each with its file in evidence/}
**Population:** {who uses it}

## Need
**Job:** {the job the tool does, in the words of the person who does it}
**Users:** {by name: the builder, or the people on their team}
**Today:** {how the job is done now: minutes or hours per run and how often, tagged}
**Done when:** {the result the builder will see, with a number and a date: the job in 15 minutes instead of 90, by 2026-12-15}
```

| # | Condition | Check |
|---|-----------|-------|
| N.1 | The need has a source | **Evidence** under Request has a `data`, `interview` or `doc` tag. The builder's own words, saved per `evidence-ledger`, are first-hand here: the requester is the user |
| N.2 | The users are named | **Users** names who will use it |
| N.3 | Today is measured | **Today** has a number (time per run, runs per week, errors per month) and a `data`, `doc` or `interview` tag. It is the baseline a release with an outcome review captures again |
| N.4 | Done is a result with a date | **Done when** has a number and a date. It is the success metric and the target for phase 4's tracking plan (4.4) and, when it runs, phase 7 (7.1) |
| N.5 | Internal for real | The users are the builder or their own team, nobody outside uses or pays for it, and the job is known while the way to do it is open. A tool meant for clients, for sale, or for a team the builder cannot reach by name is a `feature` or a `product` |

Script-decided: N.1 to N.4. Model-judged: N.5. The emitted `checked_by` split is authoritative.

Where commands run: `scripts/bos.mjs gate N` first (it only reads), fix drafting errors, judge N.5, then `scripts/bos.mjs cover --n5 "why the users are the team and only the how is open"`. Pass: phases 0 to 2 are written `covered`, one `phase_covered` event each with the tags of Request and Need, and the pipeline starts at phase 3 in lite mode. If you judge N.5 a fail, do not call `cover`: run `scripts/bos.mjs upgrade --to product --reason "..."`.

Fail: the work is a `product`, in full mode, at phase 0. Fix a drafting error before `cover` (a missing number in Today you can ask for in one line); the first failure `cover` records is final.

**What changes after the check.** Gate 3 values each option in time instead of money (`business-case`, Internal Tools): hours saved a week against days to build, and **Not building:**, the best way of not building it and why it loses; 3.7, 3.8, 3.10, 3.11 and 3.13 are skipped. Gate 4 needs one visual version, or the look inherited or not applicable for a tool with no screen. Gate 6 skips the launch, first outside use and first payment, and its release note is for the people named in **Users**. A release with no Baseline, Measurement or Outcome review section skips 6.2, 6.3 and 6.5 and closes the initiative at phase 6; one that sets a review goes to phase 7, which compares against **Done when** and skips the go-to-market read. Everything else holds: kill criteria (checked at the review when there is one), the cheapest test when it can change the decision, the stake, the spec, the threat model (an internal tool often holds credentials and client data), the accepted plan, the tests, the rollback.

**Ratchet.** An internal tool moves only to `product`: once people outside the team use it or pay for it, it has a market to find (`upgrade --to product`). On a project whose `PRODUCT.md` revenue model reads "not for sale, internal …", a `change` whose mandate check fails becomes `internal`, not `feature`.

| Mistake | Why it fails | Correct |
|---------|-------------|---------|
| "My clients will love it" filed as internal | Someone outside has to adopt it | A `product`, or a `feature` of the product they already use |
| Today written as "slow" | Phase 7 has nothing to compare against | A number: "90 minutes, four times a week", timed once if unknown |
| Skipping phase 3 because the builder already pictures the solution | The picture is one option; the cheap one is often a script or an existing tool | Three options, one of them not building |
