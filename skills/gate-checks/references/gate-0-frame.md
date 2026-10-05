# Gate 0 — Frame

Read when running gate 0. E.1 and the procedure in `SKILL.md` apply too. **Acceptance:** whoever owns the problem, recorded with `record 0 --accepted-by "who"` (`SKILL.md`, Acceptance).

| # | Condition | Check |
|---|-----------|-------|
| 0.1 | Problem statement contains no solution language | No occurrence of: build, add, create, app, platform, dashboard, tool, feature, integration, AI, automate, redesign, migrate, rewrite, in the problem sentence. A term defined in `PRODUCT.md` → Language is the product's own noun and is exempt ("AI answer engine" for a product that monitors them) |
| 0.2 | Exactly one primary ICP named | A single named segment with a size estimate carrying a source tag |
| 0.3 | Riskiest assumption is falsifiable | Stated as a sentence that could be shown false by an observation |
| 0.4 | "Why now" cites a change in the world | A dated external change, not a preference or an availability of technology in general |

Script-decided: 0.1, 0.2. Model-judged: 0.3, 0.4. The emitted `checked_by` split is authoritative.
