# PM-CONTEXT.md Template

Place this file as `PM-CONTEXT.md` in your project root to configure PM Toolkit agents.

```yaml
# Product Identity
product_name: "MyApp"
stage: "seed"                          # seed | series-a | growth
icp: "B2B SaaS teams, 10-50 employees" # Ideal Customer Profile

# Analytics Configuration
mixpanel_project_id: 12345             # Required for Mixpanel-based agents
posthog_project_id: ""                 # Optional: PostHog project ID
supabase_project_id: "abc-123"         # Optional: for revenue/billing queries

# Activation Definition
activation_event: "First Report Generated"  # The event that signals aha moment
activation_window_days: 14                   # Days from signup to consider activation

# Retention Definition
retention_event: "Core Action Performed"     # The event for retention measurement
retention_window: "weekly"                   # weekly | daily | monthly

# Funnel Steps (ordered)
funnel_steps:
  - "Account Created"
  - "Onboarding Completed"
  - "First Integration Connected"
  - "First Report Generated"
  - "Second Report Generated"

# Segmentation Dimensions
key_segments:
  - property: "plan"
    values: ["free", "pro", "enterprise"]
  - property: "company_size"
    values: ["1-10", "11-50", "51-200", "200+"]
  - property: "acquisition_channel"
    values: ["organic", "paid", "referral", "sales"]

# Revenue (for Finance Analyst)
billing_table: "subscriptions"          # Supabase table name
mrr_column: "plan_amount"              # Column with MRR value
customer_id_column: "account_id"       # Column linking to account

# Competitive Context (for Competitive Analyst)
competitors:
  - "Competitor A"
  - "Competitor B"
market_category: "Product Analytics"
```

## Minimal Configuration

At minimum, agents need:

```yaml
product_name: "MyApp"
stage: "seed"
mixpanel_project_id: 12345
activation_event: "First Report Generated"
activation_window_days: 14
retention_event: "Core Action Performed"
```

## Where to Place

1. **Project root**: `./PM-CONTEXT.md` (preferred)
2. **Hidden directory**: `./.pm-toolkit/context.md` (if you prefer)
3. **Agents will ask** if neither file is found
