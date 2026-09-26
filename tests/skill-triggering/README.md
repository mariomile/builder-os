# Skill Triggering Tests

Each file in `prompts/` is a realistic user message that should trigger exactly one skill or command. There is no automated runner: skill triggering depends on the live model's description matching, which a script cannot fake.

## Protocol

For each prompt:

1. Open a clean session with the plugin installed and no prior context.
2. Paste the prompt verbatim.
3. Record which skill loaded and which agent was dispatched.
4. Compare against the expectation stated in the prompt file's first comment line.

A prompt that triggers nothing is a description problem in the skill's frontmatter, not a prompt problem. Per `CLAUDE.md`, a skill description states triggering conditions only — never a workflow summary.

## Expectation format

Each prompt file starts with a comment line:

```
# expects: skill=builder-os agent=problem-framer command=/bos-frame
```

Everything after that line is the user message.

## What this does not cover

Output quality. The gate model covers that: `gate-checks` holds machine-checkable conditions per phase, and a phase agent that produces a weak artifact fails its own gate. Triggering tests answer "did the right thing load", gates answer "is the output good enough to build on".

Behavior beyond triggering (state written, gate refused, a spike that stops) is covered by `tests/scenarios/`, which runs a real host and checks the files.
