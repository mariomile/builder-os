# Analytics Contract

BuilderOS asks product analytics five questions. Everything the pipeline needs from event data is one of these five shapes, or a composition of them.

A skill asks for a **shape**. Whatever provider resolved for `analytics.query` answers it. The shape is the interface; Mixpanel, Amplitude, PostHog, a warehouse, a CSV and a screenshot are implementations.

Read this with `references/capability-map.md`, which defines `analytics.query`, `analytics.events` and `analytics.replay` and their degradation ladders.

## The Five Shapes

### 1. Catalogue

*What events exist, and what properties do they carry?*

| | |
|---|---|
| **Needs** | `analytics.events` |
| **Inputs** | optional name filter, optional lookback |
| **Result** | event names, volume per event over the lookback, property keys per event, and for low-cardinality properties their values |
| **Used by** | `tracking-standards` (what is already instrumented), `growth-frameworks` (are funnel steps emitted at all), any phase that must not design an event that already exists |
| **Floor** | read the instrumentation from source: grep the repo for the analytics SDK's call sites and collect the literal event names. This is often more accurate than the catalogue, which accumulates dead events |

### 2. Volume

*How many, over time, split how?*

| | |
|---|---|
| **Needs** | `analytics.query` |
| **Inputs** | event, date range, granularity (day, week, month), unit of count (events or unique actors), optional filter, optional breakdown property |
| **Result** | a series per breakdown value: period, count |
| **Used by** | baselines everywhere, `north-star-metric` candidate sizing, anomaly detection |
| **Floor** | ask the user for the number and its date, tag `[doc:user-provided]` |

State the unit of count explicitly in the artifact. "12,400 signups" is ambiguous; "12,400 unique users firing `signup_completed`, Aug 1–31" is not.

### 3. Funnel

*Of the people who did A, how many went on to do B, then C?*

| | |
|---|---|
| **Needs** | `analytics.query` |
| **Inputs** | ordered steps (2+ events), date range, conversion window, whether steps must be strictly sequential, optional breakdown |
| **Result** | per step: actors entering, actors converting, conversion rate from previous step and from first step; median time to convert per step where available |
| **Used by** | `growth-frameworks` (activation diagnosis), gate 5 and gate 6 instrumentation checks, `experiment-methodology` |
| **Floor** | a funnel assembled from separate Volume queries, one per step, clearly marked as an **unlinked funnel**: it counts distinct populations per step, not the same cohort walking through, so it flatters conversion at every step |

The conversion window is the single most common source of a wrong funnel number. Every provider has one, their defaults differ, and a window of one day against a product with a weekly usage rhythm will report an activation collapse that is an artifact of the setting. Read the window, record it in the artifact next to the number.

### 4. Retention

*Of a cohort that started at T, how many are still active at T+n?*

| | |
|---|---|
| **Needs** | `analytics.query` |
| **Inputs** | the starting event, the returning event, cohort granularity (day, week, month), number of periods, retention definition |
| **Result** | a triangle: cohort, size, and the percentage active in each subsequent period |
| **Used by** | `strategy-frameworks` (PMF curve shape), `growth-frameworks`, `financial-models` (revenue retention is the same shape over revenue) |
| **Floor** | ask for the curve, or read repeat-usage from the application database via `db.query`. Absent both, the PMF signal that depends on it is recorded as unavailable, not guessed |

Two definitions are in circulation and they produce different curves from the same data:

- **N-day (bounded):** active *on* period n specifically.
- **Unbounded:** active on period n *or any period after it*.

Unbounded always reads higher. Which one a provider gives you by default varies, and a curve compared against a benchmark computed the other way is not a comparison. Record the definition with the curve.

### 5. Breakdown

*How does a metric differ across a property?*

| | |
|---|---|
| **Needs** | `analytics.query` |
| **Inputs** | any of shapes 2–4, plus one grouping property |
| **Result** | the same result shape, one series per property value |
| **Used by** | segment analysis in every diagnostic phase; the difference between "activation is 34%" and "activation is 61% for invited users and 12% for self-serve" |
| **Floor** | ask whether the split exists at all; if the property is not being captured, that is a tracking finding for `tracking-standards`, not a data gap to work around |

A breakdown on a property with high cardinality returns a long tail that means nothing. Cap it: top 5 to 10 values plus an explicit "other".

## Provider Vocabulary

The same shape under three names. This table exists so a skill can recognize what resolved, not so a skill can hardcode it.

| Shape | Mixpanel | Amplitude | PostHog |
|-------|----------|-----------|---------|
| Catalogue | event and property lookup | event and property taxonomy | event definitions and properties |
| Volume | Insights | Event Segmentation | Trends |
| Funnel | Funnels | Funnel Analysis | Funnels |
| Retention | Retention | Retention Analysis | Retention |
| Breakdown | breakdown on a property | group-by on a property | breakdown on a property |

Two things do not generalize and are worth knowing when one of them resolves:

- **PostHog** exposes SQL over the event table, so any of the five shapes can be expressed directly as a query when its stored insight types do not fit. It also provides `analytics.replay`, which the other two do not.
- **Mixpanel and Amplitude** both model saved cohorts as first-class objects that can be reused as a filter across shapes. When a cohort already exists for the segment under analysis, use it rather than rebuilding the filter, and cite it by name.

Beyond that, treat the differences as unknown until the session resolves a provider and you read what its tools actually accept. Do not assume a parameter exists because a sibling product has it.

## Evidence Tagging

Every number that comes out of this contract carries a tag naming the provider and the query, per `evidence-ledger`:

```
[mcp:posthog:activation_funnel_2026-09]
[mcp:amplitude:retention_w1_selfserve]
[doc:user-provided:mrr_august]
```

The tag names the concrete source, never the abstraction. `[analytics.query]` is not a valid tag: it says nothing about where the number came from, and a reader six weeks later cannot go check it.

When a number arrives through a floor rather than a live query, the tag says so and the artifact states the limitation in one line next to the number. An unlinked funnel labelled as a funnel is the failure mode this contract exists to prevent.

## Zero-Prerequisite Guarantee

None of the five shapes is required for any phase to complete. Each has a floor, and the floor is always one of: read it from the code, read it from a document, ask the user, or record the gap and the question that would close it.

A phase never tells the user to go connect a named product. It states which shape would sharpen the work and what it would answer: "a retention curve here would replace a stated assumption about week-4 behavior with a measured one." Whether the user gets that from Mixpanel, Amplitude, PostHog or a spreadsheet is their business.
