# Workflow Quality Evaluation

Generated: 2026-06-11T22:49:00.000Z

This deterministic eval checks whether the local sprint artifacts are specific, evidence-backed, reviewable, and bounded by the MVP guardrails. It does not call an LLM or any external service.

## Summary

| Metric | Value |
| --- | ---: |
| Accounts evaluated | 25 |
| Drafts evaluated | 25 |
| Average account score | 72/100 |
| Average draft score | 85/100 |
| Accounts review-ready | 15 |
| Drafts review-ready | 23 |
| Quality warnings | 34 |

## Scoring Model

- Accounts are scored on evidence coverage, ICP fit, confidence, contact context, review status, and missing information.
- Drafts are scored on evidence references, contact context, prior-interaction fit, subject/body completeness, risk flags, review status, and no-send guardrail language.
- Scores are readiness indicators for human review, not permission to send.

## Account Scores

| Account | Status | Score | Band | Signals | Warnings |
| --- | --- | ---: | --- | --- | --- |
| Northstar Ops Studio | approved | 95 | strong | 5 evidence; 1 contacts; 0 interactions; 86/100 fit; high | None |
| Brightlane Creative | approved | 95 | strong | 5 evidence; 1 contacts; 1 interactions; 82/100 fit; high | None |
| Atlas Founder Labs | needs_review | 88 | strong | 5 evidence; 1 contacts; 0 interactions; 86/100 fit; high | None |
| Cedar Grant Partners | needs_review | 80 | reviewable | 5 evidence; 1 contacts; 1 interactions; 71/100 fit; high | None |
| Harbor IT Advisors | needs_review | 88 | strong | 5 evidence; 1 contacts; 1 interactions; 79/100 fit; high | None |
| SignalWorks Strategy | needs_review | 88 | strong | 5 evidence; 1 contacts; 1 interactions; 80/100 fit; high | None |
| Ridgeway Product Studio | needs_review | 88 | strong | 5 evidence; 1 contacts; 0 interactions; 82/100 fit; high | None |
| LaunchPad CFO | needs_review | 80 | reviewable | 5 evidence; 1 contacts; 0 interactions; 73/100 fit; high | None |
| VectorOps Consulting | needs_review | 88 | strong | 5 evidence; 1 contacts; 0 interactions; 80/100 fit; high | None |
| Bluebird Web Co | needs_review | 80 | reviewable | 5 evidence; 1 contacts; 0 interactions; 72/100 fit; high | None |
| Summit RevOps Lab | needs_review | 68 | needs work | 5 evidence; 0 contacts; 0 interactions; 76/100 fit; high | missing local contact context |
| Kinship Brand Studio | needs_review | 73 | reviewable | 5 evidence; 0 contacts; 0 interactions; 84/100 fit; high | missing local contact context |
| Prairie Managed Services | needs_review | 58 | needs work | 5 evidence; 0 contacts; 0 interactions; 63/100 fit; medium | missing local contact context |
| Orbit Founder Office | needs_review | 73 | reviewable | 5 evidence; 0 contacts; 1 interactions; 78/100 fit; high | missing local contact context |
| North Pier Advisory | needs_review | 41 | blocked | 5 evidence; 0 contacts; 0 interactions; 59/100 fit; medium | low fit score or disqualified; missing local contact context |
| Copperline Creative Ops | needs_review | 73 | reviewable | 5 evidence; 0 contacts; 0 interactions; 82/100 fit; high | missing local contact context |
| Beacon AI Enablement | needs_review | 73 | reviewable | 5 evidence; 0 contacts; 0 interactions; 86/100 fit; high | missing local contact context |
| Fathom Customer Lab | needs_review | 73 | reviewable | 5 evidence; 0 contacts; 0 interactions; 78/100 fit; high | missing local contact context |
| Evergreen Tax Group | needs_review | 58 | needs work | 5 evidence; 0 contacts; 0 interactions; 69/100 fit; medium | missing local contact context |
| MapleWorks Digital | needs_review | 68 | needs work | 5 evidence; 0 contacts; 1 interactions; 80/100 fit; high | missing local contact context |
| Bridgepoint GTM | needs_review | 60 | needs work | 5 evidence; 0 contacts; 0 interactions; 72/100 fit; high | missing local contact context |
| CorePath Systems | needs_review | 58 | needs work | 5 evidence; 0 contacts; 0 interactions; 67/100 fit; medium | missing local contact context |
| Lumen Launch Studio | needs_review | 53 | needs work | 5 evidence; 0 contacts; 0 interactions; 68/100 fit; medium | missing local contact context |
| Tandem Ops Partners | needs_review | 65 | needs work | 5 evidence; 0 contacts; 0 interactions; 74/100 fit; high | missing local contact context |
| QuickScale Outreach | rejected | 25 | blocked | 4 evidence; 0 contacts; 0 interactions; 28/100 fit; low | low fit score or disqualified; low confidence; missing local contact context; rejected by operator |

## Draft Scores

| Account | Draft | Status | Score | Band | Signals | Warnings |
| --- | --- | --- | ---: | --- | --- | --- |
| Northstar Ops Studio | draft_northstar_ops_studio_first_touch | approved | 100 | strong | first_touch; 3 evidence; contact context; no prior context; 1 risk flags | None |
| Brightlane Creative | draft_brightlane_creative_warm_follow_up | superseded | 70 | reviewable | warm_follow_up; 3 evidence; contact context; prior context; 1 risk flags | None |
| Atlas Founder Labs | draft_atlas_founder_labs_first_touch | needs_review | 95 | strong | first_touch; 3 evidence; contact context; no prior context; 1 risk flags | None |
| Cedar Grant Partners | draft_cedar_grant_partners_meeting_recap | rejected | 65 | needs work | meeting_recap; 3 evidence; contact context; prior context; 1 risk flags | rejected by operator |
| Harbor IT Advisors | draft_harbor_it_advisors_stale_opportunity_revive | edited | 95 | strong | stale_opportunity_revive; 3 evidence; contact context; prior context; 1 risk flags | None |
| SignalWorks Strategy | draft_signalworks_strategy_referral_request | needs_review | 95 | strong | referral_request; 3 evidence; contact context; prior context; 1 risk flags | None |
| Ridgeway Product Studio | draft_ridgeway_product_studio_first_touch | needs_review | 95 | strong | first_touch; 3 evidence; contact context; no prior context; 1 risk flags | None |
| LaunchPad CFO | draft_launchpad_cfo_first_touch | needs_review | 95 | strong | first_touch; 3 evidence; contact context; no prior context; 1 risk flags | None |
| VectorOps Consulting | draft_vectorops_consulting_first_touch | needs_review | 95 | strong | first_touch; 3 evidence; contact context; no prior context; 1 risk flags | None |
| Bluebird Web Co | draft_bluebird_web_co_first_touch | needs_review | 95 | strong | first_touch; 3 evidence; contact context; no prior context; 1 risk flags | None |
| Summit RevOps Lab | draft_summit_revops_lab_first_touch | needs_review | 80 | reviewable | first_touch; 3 evidence; no contact; no prior context; 2 risk flags | missing contact context |
| Kinship Brand Studio | draft_kinship_brand_studio_first_touch | needs_review | 80 | reviewable | first_touch; 3 evidence; no contact; no prior context; 2 risk flags | missing contact context |
| Prairie Managed Services | draft_prairie_managed_services_first_touch | needs_review | 80 | reviewable | first_touch; 3 evidence; no contact; no prior context; 3 risk flags | missing contact context |
| Orbit Founder Office | draft_orbit_founder_office_meeting_recap | needs_review | 80 | reviewable | meeting_recap; 3 evidence; no contact; prior context; 2 risk flags | missing contact context |
| North Pier Advisory | draft_north_pier_advisory_first_touch | needs_review | 80 | reviewable | first_touch; 3 evidence; no contact; no prior context; 3 risk flags | missing contact context |
| Copperline Creative Ops | draft_copperline_creative_ops_first_touch | needs_review | 80 | reviewable | first_touch; 3 evidence; no contact; no prior context; 2 risk flags | missing contact context |
| Beacon AI Enablement | draft_beacon_ai_enablement_first_touch | needs_review | 80 | reviewable | first_touch; 3 evidence; no contact; no prior context; 2 risk flags | missing contact context |
| Fathom Customer Lab | draft_fathom_customer_lab_first_touch | needs_review | 80 | reviewable | first_touch; 3 evidence; no contact; no prior context; 2 risk flags | missing contact context |
| Evergreen Tax Group | draft_evergreen_tax_group_first_touch | needs_review | 80 | reviewable | first_touch; 3 evidence; no contact; no prior context; 3 risk flags | missing contact context |
| MapleWorks Digital | draft_mapleworks_digital_stale_opportunity_revive | needs_review | 80 | reviewable | stale_opportunity_revive; 3 evidence; no contact; prior context; 2 risk flags | missing contact context |
| Bridgepoint GTM | draft_bridgepoint_gtm_first_touch | needs_review | 80 | reviewable | first_touch; 3 evidence; no contact; no prior context; 2 risk flags | missing contact context |
| CorePath Systems | draft_corepath_systems_first_touch | needs_review | 80 | reviewable | first_touch; 3 evidence; no contact; no prior context; 3 risk flags | missing contact context |
| Lumen Launch Studio | draft_lumen_launch_studio_first_touch | needs_review | 80 | reviewable | first_touch; 3 evidence; no contact; no prior context; 3 risk flags | missing contact context |
| Tandem Ops Partners | draft_tandem_ops_partners_first_touch | needs_review | 80 | reviewable | first_touch; 3 evidence; no contact; no prior context; 2 risk flags | missing contact context |
| Brightlane Creative | draft_brightlane_creative_warm_follow_up_rev1 | needs_review | 95 | strong | warm_follow_up; 3 evidence; contact context; prior context; 1 risk flags | None |

## Eval Caveats

- No aggregate quality caveats triggered.
- This eval checks structure and local evidence coverage. A human still needs to verify recipient accuracy, source truth, tone, and compliance before using any draft outside Agentic Hub.
- The MVP intentionally has no send action and no external side effects.
