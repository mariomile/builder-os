---
type: llm
---
PASS if the AGENTS.md written is short (well under 150 lines) and works as an index: it points at where things are (for example `src/export.ts` or a map in TECH.md) and at PRODUCT.md, TECH.md or the BuilderOS memory instead of copying their content, and every command or path it names exists in the repository or is marked as not yet set up.
FAIL if no AGENTS.md was written, if it restates the product description or the stack at length, or if it invents commands, scripts or directories the repository does not have.
