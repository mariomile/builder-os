# Behavioral Scenarios

Each case in `cases/` is a prompt, a fixture project and what a correct run leaves behind: text the answer must or must not contain, files that must stay unchanged or must not appear, fields the initiative's `state.json` must hold. The runner copies the fixture to a temporary directory, runs a real host there, and checks.

```bash
node tests/scenarios/run.mjs --host "<command with {prompt} and {plugin}>" [--only name] [--keep] [--timeout seconds]
```

Claude Code, as run for the first time on 2026-09-25:

```bash
node tests/scenarios/run.mjs --host "claude -p {prompt} --setting-sources project,local --plugin-dir {plugin} --add-dir {plugin} --permission-mode acceptEdits --allowedTools 'Bash(node:*)'"
```

`--setting-sources project,local` keeps your own plugins and settings out of the run. `--add-dir {plugin}` lets the host read `references/` and the script, and `--allowedTools 'Bash(node:*)'` lets it run the script: without them a headless run cannot ask for permission, and falls back to writing state by hand. The prompt comes right after `-p` because `--allowedTools` takes every argument that follows it. If your environment gives Claude Code a memory store through environment variables, unset them in the host command (`env -u VAR claude ...`): a run that remembers you is not testing BuilderOS.

Codex: `codex exec {prompt}` with BuilderOS installed per `docs/hosts.md`. Not yet run; check your version's flags for non-interactive mode and file-write permission.

A failing case keeps its directory, with the host's full output in `.scenario-output.txt`. Every failure found in a live run of a real initiative becomes a new case here.

Cases are judged on effects, not prose, wherever possible. Where a check has to read the answer, the pattern is loose on purpose (Italian and English, either casing): the question is whether the behavior happened, not how it was phrased.
