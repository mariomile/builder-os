# Running BuilderOS on Different Hosts

The portable bundle is `skills/`, `references/` and `scripts/`, kept together in the repository layout. Host components add discovery, hooks, commands or delegation; they do not own the method.

## Source and project paths

**Installation root** means the complete BuilderOS checkout or installed plugin directory. **Project root** means the user's working project, where `PRODUCT.md`, `TECH.md` and `.builderos/` live. They can be different directories.

Resolve support paths from the installation root. A loaded skill lives at `{installation}/skills/{name}/SKILL.md`: resolve its real path first if discovery uses a symlink, then go two directories above its containing directory. `references/`, `scripts/` and other `skills/` paths in the instructions are relative to that installation root. Commands and agents live one directory below the same root. Skill-local resources remain relative to their own skill folder. Never look for plugin resources in the user's project or write project state inside the installation.

The session hook and OpenCode adapter provide an explicit installation-root line. Without a hook, use the loaded component's path. If the host hides it, ask for the complete checkout path instead of guessing or creating substitute resources. Run the script with its full quoted path **from the project root**:

```bash
node '/path with spaces/builder-os/scripts/bos.mjs' brief
node '/path with spaces/builder-os/scripts/bos.mjs' gate 0
```

No automatic copying, installation or project configuration changes happen during resource resolution.

## Claude Code plugin

```text
/plugin marketplace add mariomile/builder-os
/plugin install builder-os@builder-os
```

Plugin components are namespaced. Use `/builder-os:bos-init`, `/builder-os:bos`, `/builder-os:bos-status`, `/builder-os:bos-gate` and `/builder-os:bos-frame` through `/builder-os:bos-learn`. Agent targets are also qualified, for example `builder-os:problem-framer`; skills use `builder-os:problem-framing`. See the [official component namespace contract](https://code.claude.com/docs/en/plugins-reference#name).

The SessionStart matcher covers startup, resume, fork, clear and compact. Resume/fork refresh the briefing from the current project files; see the [official hook sources](https://code.claude.com/docs/en/hooks#sessionstart).

Root `CLAUDE.md` and `AGENTS.md` describe contributing in this checkout. Installing the plugin does **not** load its root `CLAUDE.md` as project instructions. Operational rules therefore live in the loaded skills and commands. Commands dispatch in the foreground, await completion, and re-read the artifact before running its gate. A completion marker alone never advances state.

When working on BuilderOS itself, `CLAUDE.md` imports `@AGENTS.md`. This explicit import shares the repository contract; it is not an assumption that Claude Code reads `AGENTS.md` automatically.

## Codex plugin

```bash
codex plugin marketplace add mariomile/builder-os
codex plugin add builder-os@builder-os
```

Keep the supported `.codex-plugin/plugin.json` manifest. Historical loader verification on Codex CLI 0.157.1 showed the complete plugin installed, all 24 skills discovered as `builder-os:{skill}`, commands imported as `builder-os:source-command-{command}`, and the SessionStart hook discovered. That was a stand-in model run, not evidence that a real model executes the lifecycle correctly. A local marketplace clones committed files; uncommitted fixes require a separate local loading check before publication.

For that tested CLI, command files above 3875 bytes were silently dropped. Deterministic tests keep them below 3800 bytes. Omitting `hooks` from the Codex manifest preserves automatic hook discovery; an empty object disabled it in that loader. Hook approval is a host setting: if the hook is unavailable or untrusted, invoke `using-builder-os` and resolve resources from the installed skill's real path.

Resolve delegation against the **current session**, including authorization. Some Codex sessions expose separate agents; others do not. A generic agent can receive the portable skill and context without a Claude profile. Claude's `builder-os:*` agent targets and dispatch syntax are not assumed to exist on Codex. If delegation is unavailable, run the identical skill inline.

## Manual discovery on Codex or another skill-aware host

Retain a **complete checkout**, not a copy of `skills/` alone:

```bash
git clone https://github.com/mariomile/builder-os '/chosen/location/builder-os'
```

Prefer the host's skill-path setting pointed at `/chosen/location/builder-os/skills`. If the host instead requires a scanned directory, explicitly symlink each skill folder there, leaving the complete checkout in place. For example, after choosing a dedicated empty discovery directory:

```bash
mkdir -p '/chosen/discovery/skills'
for skill in '/chosen/location/builder-os/skills/'*; do
  ln -s "$skill" '/chosen/discovery/skills/'
done
```

Use the discovery directory documented for the installed host version. Do not overwrite an existing skill. Resolve symlinks before support paths as described above. To undo this manual setup, remove only the links you created; the checkout and project artifacts remain intact. A host that copies skill files but discards their source paths needs the full bundle path provided in session context; a skill-only copied install is unsupported.

`AGENTS.md` in the BuilderOS checkout applies while working there, not automatically to an unrelated project. Invoke `using-builder-os` for routing or name a specialist for a standalone task. Lifecycle initialization writes the project briefing block only as part of an authorized initialization. A standalone request does not install a briefing or create `.builderos/`.

## OpenCode and other hosts

The existing `.opencode/plugins/builder-os.js` adapter registers the sibling `skills/` path in the in-memory host configuration and injects the installation root. Keep the full checkout with the adapter; copying its JavaScript file alone loses the sibling resources. It does not write host config files. Other hosts can load the portable bundle with the manual discovery contract above.

| Runtime capability | Execution |
|---|---|
| Delegation available and authorized | Dispatch the skill and context; await the result before dependent work |
| Delegation unavailable | Same procedure inline, sequentially |
| Shell execution available | Execute the quoted installation script from the project root |
| Shell execution unavailable | Apply the skill's gate conditions; record model judgement explicitly |
| Data unavailable | State the gap; retain an unknown value instead of inventing a baseline |

Artifacts and gate rules are identical across hosts. Capability availability and a skill's operating mode are separate decisions; see [`references/operating-modes.md`](../references/operating-modes.md).

## Verification limits

`pnpm test` checks scripts, copied complete bundles, hook JSON, shell quoting, manifests and command constraints. These checks do not prove model compliance. Historical Claude scenarios and Codex prompt assembly are recorded separately in the repository; the unit remediation tests do not validate real users, production exposure, Windows execution, or installed global configuration. Bounded current model smoke checks are recorded in `tests/scenarios/README.md`; they do not certify the whole lifecycle.
