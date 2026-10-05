# Coverage Check (feature track)

Read when initializing work classified as `feature`. E.1 applies too, against `PRODUCT.md`.

Runs once, at initialization, when the work is classified as `feature`. It stands in for gates 0 and 1 by reading `PRODUCT.md` instead of a phase artifact. The conditions are the load-bearing ones from those gates, applied to evidence that already exists.

| # | Condition | Check |
|---|-----------|-------|
| C.1 | Problem stated without solution language | The same word list as 0.1, applied to `PRODUCT.md` → The Problem |
| C.2 | Exactly one primary ICP | `PRODUCT.md` → ICP names one primary segment, its size carrying a source tag |
| C.3 | The problem is evidenced, not assumed | The Problem, Who has it, and What that costs them each carry a primary-source tag. `[assumption:unvalidated]` on any of the three fails |
| C.4 | The change serves that ICP | The request names which part of the evidenced problem it addresses. A change aimed at a different segment is a new problem |

Script-decided: C.1, C.2, C.3. Model-judged: C.4. The emitted `checked_by` split is authoritative.

The 0.1 word list is in [gate 0](gate-0-frame.md).

Pass: phases 0 and 1 are written `covered`, one `phase_covered` event each with the tags that satisfied C.1 to C.3, and the pipeline starts at phase 2. For gate 2.1 on this track, `PRODUCT.md` tags count as phase 1 evidence tags.

Check before recording. `gate C` only reads; run it on the `PRODUCT.md` just written, before `cover` records anything. A failure in how the file was written (a solution word in a sentence that has a Language term for it, a tag left off a sentence whose evidence file exists) is fixed in `PRODUCT.md` first. A failure because the evidence is not there is the answer: never add a tag to pass C.3 without the file behind it. The first failure `cover` records is final.

Fail: the work is a `product`. Use the refusal protocol with the failed C condition, then start at phase 0. Not a penalty: phase 0 and 1 are exactly what produces the evidence C.3 was looking for. The coverage check cannot be overridden, because an override would record phases as covered by evidence nobody has.
