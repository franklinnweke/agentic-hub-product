# Weekly Pipeline Report

Generated: 2026-06-11T22:30:00.000Z

## Executive Summary

The fixture sprint imported 5 accounts, generated 3 high-fit lead briefs, and created 4 follow-up drafts that all remain in `needs_review`. No outbound sending is implemented.

## Throughput

| Metric | Value |
| --- | ---: |
| Accounts imported | 5 |
| Accounts researched | 5 |
| Accounts scored | 5 |
| High-fit accounts | 3 |
| Drafts generated | 4 |
| Follow-ups due for review | 4 |
| Audit events | 39 |

## Lead Quality

- Average fit score: 71/100.
- High-fit denominator: accounts with score >= 75 and no disqualifiers.
- Low-confidence or disqualified accounts should be rejected or clarified before any draft is written.

## Follow-Up Queue Health

- Drafts approved: 0
- Drafts rejected: 0
- Drafts waiting for human review: 4
- The MVP intentionally has no send action.

## Outcomes

- Replies: unavailable in fixture data.
- Meetings booked: unavailable in fixture data.
- Conversion rates are not calculated because there is no outcome denominator yet.

## Segment Performance

| Segment | Accounts | Avg score | Drafts |
| --- | ---: | ---: | ---: |
| solo_consultant | 1 | 86 | 1 |
| boutique_agency | 1 | 82 | 1 |
| founder_led_b2b | 1 | 86 | 1 |
| professional_services | 1 | 71 | 1 |
| automation_vendor | 1 | 28 | 0 |

## Bottlenecks

- 4 drafts need operator review before any manual sending.
- Buyer/contact names are missing from the fixture, so every draft requires manual recipient confirmation.

## Recommended Next Actions

1. Review high-fit briefs first and mark each account as `approved`, `rejected`, or `needs_more_info`.
2. Add contact names and prior interaction context before using any draft.
3. Add manual outcome tracking after messages are sent outside Agentic Hub.
4. Keep disqualified automation requests out of the pipeline unless the use case becomes supervised and compliant.

## Data Caveats

- Tiny fixture sample; do not infer conversion rates.
- Reply and meeting outcomes are unavailable in the local fixture.
