---
name: agents-md
description: "Creates or prunes a repository's AGENTS.md and CLAUDE.md so the agent working in the code finds what it needs: pointers, commands and must-hold rules. Use when a repo has none, when asked to write or update one, or when one is stale or too long."
---

# AGENTS.md

`AGENTS.md` (and `CLAUDE.md`, which imports it) loads into every session that opens the repository, so every line costs on every turn. Its job is to be an **index**: point at the material the agent cannot find in one search, give the commands it would otherwise guess, and hold the few rules that must always hold. Everything else lives where it is read on demand. Works on any repository, with or without BuilderOS.

## What goes where

| Material | Home |
|---|---|
| Where things are: entry points, the module holding the rules, where tests live, generated files | `TECH.md` → Map (or a `docs/` file the index points at) |
| Build, test and lint commands an agent would guess wrong | `AGENTS.md`, one line each; on a BuilderOS project `TECH.md` → Verify, pointed at |
| Rules that must hold every time (never edit generated files, never deploy without approval) | `AGENTS.md`, each with the check that enforces it when one exists |
| A mechanical rule (a banned call, an import shape, a file location) | A check: lint rule, hook, CI step. `AGENTS.md` names the check, not the rule |
| Conventions that need judgment | `TECH.md` → Conventions, read by the reviewer |
| Product, domain and decisions | `PRODUCT.md`, `DOMAIN.md`, `decisions/`, pointed at |
| Host-specific instructions (Claude Code only) | `CLAUDE.md` below its `@AGENTS.md` import |

A **pointer** is one line: what the material is, and when to read it, with the trigger word first ("Changing an export: read `src/export/README.md`"). The wording decides whether the agent reaches the material, so sharpen a weak pointer before inlining what it points at.

## Procedure

1. **Read what exists.** `AGENTS.md`, `CLAUDE.md`, `README`, the manifests and their scripts, the CI workflow, any pre-commit hook, `docs/`, and on a BuilderOS project `TECH.md`, `DOMAIN.md` and the BuilderOS block. Done when you can name the build, test and lint commands, the entry points and every rule already written down.
2. **Sort every existing line** into the table above: keep, move (to which home), turn into a check, or cut. A line is cut when it states what the agent does by default, what one look at the repository answers, or what is no longer true (a path that does not exist, a command that fails). Done when every line has a verdict.
3. **Draft the index.** Commands, pointers, must-hold rules, in that order, then the BuilderOS block on a BuilderOS project (`references/builderos-state-schema.md`, Session Start). Write each rule as the behavior wanted ("write migrations with the generator in `db/`"); a prohibition stays only as a hard guardrail, paired with what to do instead. Aim for well under 150 lines. Make `CLAUDE.md` `@AGENTS.md` plus Claude-only lines; create it when missing. Done when every kept or new line is a command, a pointer with its trigger word first, or a must-hold rule.
4. **Draft the homes.** `TECH.md` → Map from the repository (on a BuilderOS project; elsewhere a `docs/` file or the README section the index points at), and each moved line in its new place. Done when every line marked move in step 2 has a home and every pointer in the index lands on one.
5. **Show the diff, then write.** Lines they wrote are moved or cut only with their yes, one round per `pressure-testing` for the moves and cuts that are not obviously dead; new lines and fixes to dead paths need no question. Done when the files are written and every path they name exists (`scripts/bos.mjs gate 5` checks it as 5.11 on a BuilderOS project).

On a BuilderOS project this runs at initialization, at the end of each build (phase 5, step 10) and when `retro` or the briefing flags a dead pointer or a file over 150 lines.

## Capabilities

| Capability | Used for | Floor if absent |
|---|---|---|
| `repo.read` | Manifests, CI, entry points, existing steering files | Ask for the commands and the layout; mark the map unverified |
| `files.write` | The index and its homes | Return the full files for the person to apply |
| `shell.exec` | Running the commands once to confirm they work | Write them as found and say they were not run |

## Output Contract

`## AGENTS.MD UPDATED` with the line count before and after, what was moved and where, what became a check, what was cut and why, and the commands confirmed to run.
