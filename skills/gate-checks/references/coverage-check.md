# Coverage Check (feature track)

Read when initializing work classified as `feature`. E.1 applies too, against `PRODUCT.md` and `00-request.md`.

Runs once, at initialization, when the work is classified as `feature`. It stands in for gates 0 and 1 by reading `PRODUCT.md` instead of a phase artifact, plus the initiative's `00-request.md`: the request verbatim, the sources behind it and who it concerns. The conditions are the load-bearing ones from those gates, applied to evidence that already exists. The product being evidenced does not make this request evidenced: C.5 asks for the request's own source.

`00-request.md` in the initiative folder:

```markdown
# Request — {title}

## Request
{the request, verbatim, with who made it}

**Evidence:** {tags of the tickets, data, interviews or messages behind it, each with its file in evidence/}
**Population:** {who asked or is affected: one account, a segment, everyone}
```

| # | Condition | Check |
|---|-----------|-------|
| C.1 | Problem stated without solution language | The same word list as 0.1, applied to `PRODUCT.md` → The Problem |
| C.2 | Exactly one primary ICP | `PRODUCT.md` → ICP names one primary segment, its size carrying a source tag |
| C.3 | The problem is evidenced, not assumed | The Problem, Who has it, and What that costs them each carry a `data`, `interview` or `doc` tag. `[assumption:unvalidated]` on any of the three fails. A `code` tag does not count: code shows that something exists, never that someone has the problem |
| C.4 | The change serves that ICP | The request names which part of the evidenced problem it addresses, and for how much of the ICP. A change aimed at a different segment is a new problem; a request from one large account is that account's problem until the segment shows it |
| C.5 | The request has its own source | `00-request.md` → Request names its **Evidence** (a `data`, `interview` or `doc` tag) and its **Population**. Only the requester's own words (`doc:user-*`) is a warning: a ticket, a data point or a customer's words would carry it |
| C.6 | The evidence still describes the product | Warning when a source behind C.3 was captured more than a year ago: is it still true of the product as it is now? |

Script-decided: C.1, C.2, C.3, C.5, C.6 (C.6 and the C.5 requester-only case warn, never fail). Model-judged: C.4. The emitted `checked_by` split is authoritative.

The 0.1 word list is in [gate 0](gate-0-frame.md).

Pass: phases 0 and 1 are written `covered`, one `phase_covered` event each with the tags that satisfied C.1 to C.3, and the pipeline starts at phase 2. For gate 2.1 on this track, `PRODUCT.md` tags, the tags in `00-request.md` and any `data`, `interview` or `doc` tag whose file sits in the initiative's own `evidence/` count as phase 1 evidence tags.

**Harvest before judging, on a product that is already live.** The first time BuilderOS meets a product with users, `PRODUCT.md` is drafted from the README and the code, so its problem fields start as assumptions and C.3 would fail on a product that has plenty of evidence, just not on file. Before `cover`, collect what the product already knows, using whatever resolved: support tickets and their tags (`tickets.read`), the analytics catalogue and a volume or funnel query on the area (`analytics.query`), sales or customer-call notes, reviews, churn reasons (`docs.search`), and the user's own account of who uses it and why. Save each as an evidence file and tag the `PRODUCT.md` fields it supports. With nothing connected, ask the user once for the three sources that would settle The Problem, Who has it and What that costs them. A field still unsupported after this stays an assumption, and C.3 fails honestly.

Check before recording. `gate C` only reads; run it on the `PRODUCT.md` just written, before `cover` records anything. A failure in how the file was written (a solution word in a sentence that has a Language term for it, a tag left off a sentence whose evidence file exists) is fixed in `PRODUCT.md` first. A failure because the evidence is not there is the answer: never add a tag to pass C.3 without the file behind it. The first failure `cover` records is final.

Fail: the work is a `product`. Use the refusal protocol with the failed C condition, then start at phase 0. Not a penalty: phase 0 and 1 are exactly what produces the evidence C.3 was looking for. The coverage check cannot be overridden, because an override would record phases as covered by evidence nobody has.
