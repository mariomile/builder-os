# Gate 4 — Shape

Read when running gate 4. E.1 and the procedure in `SKILL.md` apply too. **Acceptance:** whoever owns the product decision, with a technical reviewer for high-risk changes, recorded with `record 4 --accepted-by "who"` (`SKILL.md`, Acceptance).

| # | Condition | Check |
|---|-----------|-------|
| 4.1 | Acceptance criteria are testable assertions | Each starts with a subject and a verifiable verb; no "should be intuitive" |
| 4.2 | Out-of-scope list is non-empty | An empty out-of-scope list means the scope was never bounded |
| 4.3 | Every flow has error and empty states | Per flow, both states enumerated |
| 4.4 | Tracking plan measures the Phase 2 metric | Named events map to the success metric |
| 4.5 | Accessibility floor stated | Keyboard path, contrast target, focus order |
| 4.6 | Model output has an eval dataset | Existing JSON/JSONL cases (`id`, `input`, `expected`, optional `judge`, boolean `must_pass`) or Markdown case table (# / Input / Expected / Judge / Must pass). Full ≥20, lite ≥10 valid unique cases, threshold 0–100, named judge, at least one must-pass case. Prose counts and unsupported formats fail |
| 4.7 | Constraint conflicts stated, each with who decides | A `## Conflicts` section exists, stating either the conflicts between `PRODUCT.md` and `TECH.md` constraints or that none were found. Every conflict row names who decides |
| 4.8 | The stack was decided with a person | `## Stack` lists every layer the work touches as inherited, decided or not needed; every decided row names who decided it; every linked ADR exists in `decisions/`; `## What we chose` summarizes the choices for the person accepting |
| 4.9 | The look was chosen from rendered versions | `DESIGN.md` → `## Visual direction` shows at least 3 versions on a new product in full mode, 2 on the feature track or in lite mode, each version file exists; `**Chosen:**`, `**Chosen by:**` (a person), `**Design kit:**` and the tokens are filled. Or `**Visual direction:** not applicable, {reason}` when there is no interface |

Script-decided: 4.2, 4.3, 4.5, 4.6, 4.7, 4.8, 4.9. Model-judged: 4.1, 4.4. The emitted `checked_by` split is authoritative.
