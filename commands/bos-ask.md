---
name: bos-ask
description: "Not sure which skill or phase fits: answer up to three questions and get a route through the skills"
---

**Resources:** The installation root is the parent of this loaded `commands/` directory (or the hook’s installation-root line). Resolve `skills/`, `references/` and `scripts/` there; project artifacts belong in the working project.

Entry point for "I don't know where to start". Runs the routing procedure in `using-builder-os`: it reads the project memory, asks only material unanswered questions (at most three), and routes within the requested scope.

**REQUIRED BACKGROUND:** `using-builder-os`.

## Steps

1. **Run the `using-builder-os` First Move** with the user's request verbatim. Missing memory is not an error; the routing questions cover it. Capabilities resolve inside the routed skills, not here.
2. **Verify** the output carries the route block and `## ROUTE CHOSEN` once the request clearly authorizes that route or the user chooses it.
3. **Hand off** to the first step of the route: its `/builder-os:bos-*` command when one exists, otherwise its skill.

## Arguments

- `[request]` — Optional. What the user is trying to do, in their words. With no argument, the first question is what they want to walk away with.

## Output

The route block, then the first routed step running.
