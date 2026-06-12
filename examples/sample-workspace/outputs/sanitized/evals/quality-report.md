# Workflow Quality Evaluation

Generated: 2026-06-11T22:49:00.000Z

This deterministic eval checks whether the local sprint artifacts are specific, evidence-backed, reviewable, and bounded by the MVP guardrails. It does not call an LLM or any external service.

## Summary

| Metric | Value |
| --- | ---: |
| Accounts evaluated | 25 |
| Drafts evaluated | 25 |
| Average account score | 73/100 |
| Average draft score | 83/100 |
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
| Account 01 | approved | 100 | strong | 7 evidence; 1 contacts; 0 interactions; 86/100 fit; high | None |
| Account 02 | approved | 100 | strong | 7 evidence; 1 contacts; 1 interactions; 82/100 fit; high | None |
| Account 03 | needs_review | 93 | strong | 6 evidence; 1 contacts; 0 interactions; 86/100 fit; high | None |
| Account 04 | needs_review | 85 | strong | 6 evidence; 1 contacts; 1 interactions; 71/100 fit; high | None |
| Account 05 | needs_review | 93 | strong | 6 evidence; 1 contacts; 1 interactions; 79/100 fit; high | None |
| Account 06 | needs_review | 93 | strong | 6 evidence; 1 contacts; 1 interactions; 80/100 fit; high | None |
| Account 07 | needs_review | 93 | strong | 6 evidence; 1 contacts; 0 interactions; 82/100 fit; high | None |
| Account 08 | needs_review | 85 | strong | 6 evidence; 1 contacts; 0 interactions; 73/100 fit; high | None |
| Account 09 | needs_review | 88 | strong | 5 evidence; 1 contacts; 0 interactions; 80/100 fit; high | None |
| Account 10 | needs_review | 80 | reviewable | 5 evidence; 1 contacts; 0 interactions; 72/100 fit; high | None |
| Account 11 | needs_review | 68 | needs work | 5 evidence; 0 contacts; 0 interactions; 76/100 fit; high | missing local contact context |
| Account 12 | needs_review | 73 | reviewable | 5 evidence; 0 contacts; 0 interactions; 84/100 fit; high | missing local contact context |
| Account 13 | needs_review | 58 | needs work | 5 evidence; 0 contacts; 0 interactions; 63/100 fit; medium | missing local contact context |
| Account 14 | needs_review | 73 | reviewable | 5 evidence; 0 contacts; 1 interactions; 78/100 fit; high | missing local contact context |
| Account 15 | needs_review | 41 | blocked | 5 evidence; 0 contacts; 0 interactions; 59/100 fit; medium | low fit score or disqualified; missing local contact context |
| Account 16 | needs_review | 73 | reviewable | 5 evidence; 0 contacts; 0 interactions; 82/100 fit; high | missing local contact context |
| Account 17 | needs_review | 73 | reviewable | 5 evidence; 0 contacts; 0 interactions; 86/100 fit; high | missing local contact context |
| Account 18 | needs_review | 73 | reviewable | 5 evidence; 0 contacts; 0 interactions; 78/100 fit; high | missing local contact context |
| Account 19 | needs_review | 58 | needs work | 5 evidence; 0 contacts; 0 interactions; 69/100 fit; medium | missing local contact context |
| Account 20 | needs_review | 68 | needs work | 5 evidence; 0 contacts; 1 interactions; 80/100 fit; high | missing local contact context |
| Account 21 | needs_review | 60 | needs work | 5 evidence; 0 contacts; 0 interactions; 72/100 fit; high | missing local contact context |
| Account 22 | needs_review | 58 | needs work | 5 evidence; 0 contacts; 0 interactions; 67/100 fit; medium | missing local contact context |
| Account 23 | needs_review | 53 | needs work | 5 evidence; 0 contacts; 0 interactions; 68/100 fit; medium | missing local contact context |
| Account 24 | needs_review | 65 | needs work | 5 evidence; 0 contacts; 0 interactions; 74/100 fit; high | missing local contact context |
| Account 25 | rejected | 25 | blocked | 4 evidence; 0 contacts; 0 interactions; 28/100 fit; low | low fit score or disqualified; low confidence; missing local contact context; rejected by operator |

## Draft Scores

| Account | Draft | Status | Score | Band | Signals | Warnings |
| --- | --- | --- | ---: | --- | --- | --- |
| Account 01 | draft_01 | approved | 96 | strong | first_touch; 3 evidence; contact context; no prior context; 0 risk flags | None |
| Account 02 | draft_02 | superseded | 70 | reviewable | warm_follow_up; 3 evidence; contact context; prior context; 0 risk flags | None |
| Account 03 | draft_03 | needs_review | 91 | strong | first_touch; 3 evidence; contact context; no prior context; 0 risk flags | None |
| Account 04 | draft_04 | rejected | 65 | needs work | meeting_recap; 3 evidence; contact context; prior context; 0 risk flags | rejected by operator |
| Account 05 | draft_05 | edited | 91 | strong | stale_opportunity_revive; 3 evidence; contact context; prior context; 0 risk flags | None |
| Account 06 | draft_06 | needs_review | 91 | strong | referral_request; 3 evidence; contact context; prior context; 0 risk flags | None |
| Account 07 | draft_07 | needs_review | 91 | strong | first_touch; 3 evidence; contact context; no prior context; 0 risk flags | None |
| Account 08 | draft_08 | needs_review | 91 | strong | first_touch; 3 evidence; contact context; no prior context; 0 risk flags | None |
| Account 09 | draft_09 | needs_review | 95 | strong | first_touch; 3 evidence; contact context; no prior context; 1 risk flags | None |
| Account 10 | draft_10 | needs_review | 95 | strong | first_touch; 3 evidence; contact context; no prior context; 1 risk flags | None |
| Account 11 | draft_11 | needs_review | 80 | reviewable | first_touch; 3 evidence; no contact; no prior context; 2 risk flags | missing contact context |
| Account 12 | draft_12 | needs_review | 80 | reviewable | first_touch; 3 evidence; no contact; no prior context; 2 risk flags | missing contact context |
| Account 13 | draft_13 | needs_review | 80 | reviewable | first_touch; 3 evidence; no contact; no prior context; 3 risk flags | missing contact context |
| Account 14 | draft_14 | needs_review | 80 | reviewable | meeting_recap; 3 evidence; no contact; prior context; 2 risk flags | missing contact context |
| Account 15 | draft_15 | needs_review | 80 | reviewable | first_touch; 3 evidence; no contact; no prior context; 3 risk flags | missing contact context |
| Account 16 | draft_16 | needs_review | 80 | reviewable | first_touch; 3 evidence; no contact; no prior context; 2 risk flags | missing contact context |
| Account 17 | draft_17 | needs_review | 80 | reviewable | first_touch; 3 evidence; no contact; no prior context; 2 risk flags | missing contact context |
| Account 18 | draft_18 | needs_review | 80 | reviewable | first_touch; 3 evidence; no contact; no prior context; 2 risk flags | missing contact context |
| Account 19 | draft_19 | needs_review | 80 | reviewable | first_touch; 3 evidence; no contact; no prior context; 3 risk flags | missing contact context |
| Account 20 | draft_20 | needs_review | 80 | reviewable | stale_opportunity_revive; 3 evidence; no contact; prior context; 2 risk flags | missing contact context |
| Account 21 | draft_21 | needs_review | 80 | reviewable | first_touch; 3 evidence; no contact; no prior context; 2 risk flags | missing contact context |
| Account 22 | draft_22 | needs_review | 80 | reviewable | first_touch; 3 evidence; no contact; no prior context; 3 risk flags | missing contact context |
| Account 23 | draft_23 | needs_review | 80 | reviewable | first_touch; 3 evidence; no contact; no prior context; 3 risk flags | missing contact context |
| Account 24 | draft_24 | needs_review | 80 | reviewable | first_touch; 3 evidence; no contact; no prior context; 2 risk flags | missing contact context |
| Account 02 | draft_25 | needs_review | 91 | strong | warm_follow_up; 3 evidence; contact context; prior context; 0 risk flags | None |

## Eval Caveats

- No aggregate quality caveats triggered.
- This eval checks structure and local evidence coverage. A human still needs to verify recipient accuracy, source truth, tone, and compliance before using any draft outside Agentic Hub.
- The MVP intentionally has no send action and no external side effects.
