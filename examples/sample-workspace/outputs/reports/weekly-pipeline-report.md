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
| Audit events | 210 |

## Lead Quality

- Average fit score: 74/100.
- High-fit denominator: accounts with score >= 75 and no disqualifiers.
- Low-confidence or disqualified accounts should be rejected or clarified before any draft is written.

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
- Buyer/contact names are missing from the fixture, so every draft requires manual recipient confirmation.

## Recommended Next Actions

1. Review revised drafts before manual use.
2. Add contact names and prior interaction context before using any draft.
3. Keep `inputs/outcomes.csv` updated after manually controlled outreach activity.
4. Keep disqualified automation requests out of the pipeline unless the use case becomes supervised and compliant.

## Data Caveats

- No additional caveats beyond fixture data and manually recorded outcomes.
