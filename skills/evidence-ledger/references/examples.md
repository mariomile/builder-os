# Evidence Ledger Examples

Read the section you need: a source conflict to write up, or an untagged claim to rewrite.

## Source Conflicts

Source class alone never decides a conflict. A current official pricing page can beat an older internal note; a faulty live query can lose to a reconciled historical report.

A conflict written into the artifact explicitly:

> Churn is 4.2% monthly `[data:supabase:churn_q3]`, though the board deck states 2.8% `[doc:board-deck-jul]`. Live data used; the deck is stale.

## Rewrite Protocol

**Before:**
> Most sales reps spend over an hour a day on manual logging, which is why churn is high in that segment.

**After:**
> Three of seven reps interviewed described spending "over an hour" a day on manual logging `[interview:P1,P4,P6]`. Whether this drives churn in the segment is untested `[assumption:unvalidated]` — the link would show as a correlation between logging time and renewal, which we cannot query today.

The rewrite narrows the claim to what the source supports, separates the observation from the causal story, and names the test that would settle it.
