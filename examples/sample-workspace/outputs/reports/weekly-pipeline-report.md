# Weekly Pipeline Report

Generated: 2026-06-11T22:50:00.000Z

## Executive Summary

The fixture sprint imported 25 accounts, generated 14 high-fit lead briefs, and created 25 follow-up draft records including 1 revision. Draft review status: 1 approved for manual use, 1 edited, 1 rejected, 1 superseded, and 21 still in `needs_review`. No outbound sending is implemented.

## Throughput

| Metric | Value |
| --- | ---: |
| Accounts imported | 25 |
| Accounts researched | 25 |
| Accounts scored | 25 |
| Contacts loaded | 10 |
| Accounts with contacts | 10 |
| Contact coverage | 40% |
| Interactions loaded | 6 |
| Accounts with interactions | 6 |
| Interaction coverage | 24% |
| High-fit accounts | 14 |
| Drafts generated | 25 |
| Accounts approved | 2 |
| Accounts rejected | 1 |
| Drafts approved | 1 |
| Drafts edited | 1 |
| Drafts rejected | 1 |
| Drafts superseded | 1 |
| Draft revisions | 1 |
| Follow-ups due for review | 21 |
| Manual sends recorded | 1 |
| Replies | 1 |
| Meetings booked | 1 |
| Median minutes import to brief | 0 |
| Median minutes brief to draft | 0 |
| Median minutes brief to approved draft | 15 |
| Audit events | 222 |

## Cycle Time

- Import to lead brief median: 0 minutes across 25 accounts.
- Lead brief to draft median: 0 minutes across 24 drafts.
- Lead brief to approved draft median: 15 minutes across 1 approved draft.
- Denominator: audit events in `state/events.jsonl`; unavailable means no matching completed transition exists.

## Lead Quality

- Average fit score: 74/100.
- High-fit denominator: accounts with score >= 75 and no disqualifiers.
- Contact coverage: 10/25 accounts have local buyer/contact context.
- Interaction coverage: 6/25 accounts have local prior-interaction context.
- Low-confidence or disqualified accounts should be rejected or clarified before any draft is written.

## Draft Type Mix

| Draft type | Count |
| --- | ---: |
| first_touch | 18 |
| warm_follow_up | 2 |
| meeting_recap | 2 |
| stale_opportunity_revive | 2 |
| referral_request | 1 |

## Follow-Up Queue Health

- Drafts approved: 1
- Drafts edited: 1
- Drafts rejected: 1
- Drafts superseded by revisions: 1
- Draft revisions created: 1
- Drafts waiting for human review: 21
- Manual sends recorded in outcomes CSV: 1
- The MVP intentionally has no send action; outcomes are manually recorded after operator-controlled activity outside Agentic Hub.

## Outcomes

- Replies: 1
- Meetings booked: 1
- Reply rate: 100% of manually recorded sends.
- Meeting rate: 100% of manually recorded sends.
- Denominator: manually recorded sends in `inputs/outcomes.csv`, not automated sends.

## Segment Performance

| Segment | Accounts | Avg score | Drafts | Replies | Meetings |
| --- | ---: | ---: | ---: | ---: | ---: |
| solo_consultant | 7 | 79 | 7 | 1 | 1 |
| boutique_agency | 7 | 79 | 8 | 0 | 0 |
| founder_led_b2b | 3 | 81 | 3 | 0 | 0 |
| professional_services | 7 | 69 | 7 | 0 | 0 |
| automation_vendor | 1 | 28 | 0 | 0 | 0 |

## Bottlenecks

- Drafts needing operator review before manual sending: 21.
- Drafts needing edits before approval: 1.
- Drafts superseded by revisions: 1.
- Drafts rejected from use without a new review cycle: 1.
- Accounts still missing buyer/contact context: 15.

## Next-Week Recommendations

These recommendations are generated from the current local state and should be reviewed by the operator before changing the next sprint.

| Priority | Recommendation | Why it matters | Evidence |
| --- | --- | --- | --- |
| 1 | Revise or close 1 edited draft. | Edited drafts are work-in-progress; they should either become reviewed revisions or be rejected so the queue stays trustworthy. | 1 edited draft, 1 revision created |
| 2 | Review the next 5 highest-fit drafts before any manual outreach. | Drafts in needs_review are the largest controllable throughput bottleneck and cannot be used until a human approves, edits, or rejects them. | 21 drafts waiting for review |
| 3 | Add buyer/contact context for 10 accounts before expanding the target list. | Draft quality depends on a confirmed recipient; missing contacts create verification work and weaker personalization. | 10/25 accounts have contacts (40%) |
| 4 | Prioritize account review for 12 high-fit accounts. | High-fit accounts need an explicit human decision before their drafts can be approved for manual use. | 14 high-fit accounts; 2 accounts approved |
| 5 | Use solo_consultant as the next sprint learning segment unless new client constraints say otherwise. | Segment focus improves comparability and makes next-week quality and conversion changes easier to interpret. | 7 accounts, 79 avg score, 1 reply, 1 meeting |

## Data Caveats

- No additional caveats beyond fixture data and manually recorded outcomes.
