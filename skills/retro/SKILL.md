---
name: retro
description: "Runs a retrospective on an agent session and turns what slowed or misled the agent into changes to its environment: pointers, checks, conventions, cuts."
disable-model-invocation: true
---

# Retro

A retrospective on the agent's **environment**, not on the product: what made a session slower or wronger than it needed to be, each turned into a change so the next session does not repeat it. Invoked by name at the end of any session; the build (phase 5, step 11) and the outcome review (phase 7, step 6b) run this same procedure. Adapted from Pocock's `retro` (MIT).

## Procedure

1. **Read the session.** The one the person names, otherwise the current one: its transcript where `sessions.read` resolved, the conversation otherwise, plus what it changed (the diff, the files under `.builderos/`). Done when you can list the moments the agent searched long, went wrong, was corrected or was blocked.
2. **Read the guardrail and the steering files** before proposing anything: the repository's check commands (its build-tool scripts, its CI workflow, its pre-commit hook), `AGENTS.md` and `CLAUDE.md` at the root, `TECH.md` → Verify, Guardrail and Conventions. A check that exists but is unwired or broken is the finding, not a new check. Done when you can say what runs on each commit and what the steering files already ask for.
3. **Find the candidates**, category by category, each tied to a moment from step 1:
   - **Navigation.** The agent took long to find a file or a fact, or missed a hidden dependency between files. The change: a pointer, one line in `AGENTS.md` or `TECH.md` naming the file and when to read it.
   - **Automated checks.** The agent made a mistake a lint rule, a type, a test or a file-layout check would have caught; or the repository has no guardrail at all (no CI job and no pre-commit hook running Verify), which is itself the finding.
   - **Conventions for the reviewer.** The review missed a mistake. Classify it first: a **mechanical** one (a fixed pattern, a banned call, an import shape, a file location) becomes a deterministic check, full stop; only a **judgment** call (consistency across files, matching the surrounding style) goes into `TECH.md` → Conventions, which the reviewer reads.
   - **Steering files.** `AGENTS.md` or `CLAUDE.md` carries rules a check or a convention should hold instead, or has grown large. These files load into every session: keep them to pointers and the rules that must always hold, and make the change with `agents-md`.
   - **No-ops.** An instruction that changed nothing the agent would have done anyway. Cut it.
   - **Tool economy.** A call that cost far more than its answer (a whole-repo dump, a verbose tool, a repeated search). The change: a narrower command, a script, a pointer to the right file.
   - **Information access.** A fact the agent needed and could not reach: server logs, a read-only view of a service, an export. The change: the access, or the place where the fact is written down.
   - **Process.** A gate overridden or failed twice, a spec rewritten after the build plan, a round asked twice, a decision taken without the person. Read `scripts/bos.mjs pace` where commands run. The change goes to the phase skill or the project's conventions, named.
   Done when every moment from step 1 has a candidate or a stated reason it needs none.
4. **Present them by severity**, most costly first: the moment, the cost (time, a wrong result, a correction), the change, and where it lands. One round per `pressure-testing` for the changes that touch shared files or CI. Done when the person has picked which changes to make.
5. **Make the chosen changes** within what the person authorized. Done when each chosen change exists in the repository (a mechanical rule with its check wired and run once) and is listed.

## Capabilities

| Capability | Used for | Floor if absent |
|---|---|---|
| `sessions.read` | The transcript of the session under review | The current conversation; name the sessions not read |
| `repo.read` | Check commands, CI, steering files | Ask what runs on each commit |
| `files.write` | The pointers, conventions and checks | Return the exact edits for the person to apply |
| `shell.exec` | `bos.mjs pace`, running a new check once | Read the history in `state.json` |

## Output Contract

`## RETRO COMPLETE` with each candidate (moment, cost, change, where it lands), which ones the person chose, and the changes made. In a lifecycle phase, the build plan or the outcome writes the same list under its `**Environment:**` line.
