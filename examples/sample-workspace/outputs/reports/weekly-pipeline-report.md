# Weekly Pipeline Report

Generated: 2026-06-11T22:50:00.000Z

## Executive Summary

The fixture sprint imported 6 accounts, generated 4 high-fit lead briefs, and created 5 follow-up drafts. 1 draft is approved for manual use, 1 draft needs edits, 1 draft is rejected, and 2 draft remains in `needs_review`. No outbound sending is implemented.

## Throughput

| Metric | Value |
| --- | ---: |
| Accounts imported | 6 |
| Accounts researched | 6 |
| Accounts scored | 6 |
| High-fit accounts | 4 |
| Drafts generated | 5 |
| Accounts approved | 2 |
| Accounts rejected | 1 |
| Drafts approved | 1 |
| Drafts edited | 1 |
| Drafts rejected | 1 |
| Follow-ups due for review | 2 |
| Manual sends recorded | 1 |
| Replies | 1 |
| Meetings booked | 1 |
| Audit events | 55 |

## Lead Quality

- Average fit score: 72/100.
- High-fit denominator: accounts with score >= 75 and no disqualifiers.
- Low-confidence or disqualified accounts should be rejected or clarified before any draft is written.

## Follow-Up Queue Health

- Drafts approved: 1
- Drafts edited: 1
- Drafts rejected: 1
- Drafts waiting for human review: 2
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
| solo_consultant | 1 | 86 | 1 | 1 | 1 |
| boutique_agency | 1 | 82 | 1 | 0 | 0 |
| founder_led_b2b | 1 | 86 | 1 | 0 | 0 |
| professional_services | 2 | 75 | 2 | 0 | 0 |
| automation_vendor | 1 | 28 | 0 | 0 | 0 |

## Bottlenecks

- Drafts needing operator review before manual sending: 2.
- Drafts needing edits before approval: 1.
- Drafts rejected from use without a new review cycle: 1.
- Buyer/contact names are missing from the fixture, so every draft requires manual recipient confirmation.

## Recommended Next Actions

1. Convert edited drafts into revised drafts only after adding missing proof points.
2. Add contact names and prior interaction context before using any draft.
3. Keep `inputs/outcomes.csv` updated after manually controlled outreach activity.
4. Keep disqualified automation requests out of the pipeline unless the use case becomes supervised and compliant.

## Data Caveats

- Tiny fixture sample; do not infer conversion rates.
