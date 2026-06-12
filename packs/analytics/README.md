# Analytics Pack

## Job To Be Done

Turn workflow state into an operating report that shows throughput, quality, follow-up health, and conversion.

## User

Franklin as operator, and later clients reviewing pipeline sprint results.

## Inputs

Required:

- `state/accounts.json`
- `state/drafts.json`
- `state/events.jsonl`

Optional:

- replies CSV
- meetings CSV
- CRM export
- manual outcome notes
- segment definitions

## Outputs

- `outputs/reports/weekly-pipeline-report.md`
- `outputs/reports/metrics.csv`
- quality flags
- next-sprint recommendations

## Report Sections

1. Executive summary
2. Throughput
3. Lead quality
4. Follow-up queue health
5. Outcomes
6. Segment performance
7. Bottlenecks
8. Recommended next actions
9. Data caveats

## Core Metrics

- accounts imported
- accounts researched
- accounts approved
- accounts rejected
- average fit score
- high-fit account count
- drafts generated
- drafts approved
- drafts rejected
- follow-ups due
- stale conversations
- replies
- meetings booked
- conversion rate by denominator
- time from research to approved draft

## Workflow

1. Load local state.
2. Validate counts.
3. Calculate metrics.
4. Identify bottlenecks.
5. Generate report.
6. Add caveats for missing data.
7. Write audit log.

## Quality Rules

- Every conversion rate must name its denominator.
- Missing reply/meeting data must be marked unavailable.
- Recommendations must be based on observed metrics.
- Do not imply causality from small samples.
- Flag tiny sample sizes.

## Failure Modes

- State files disagree.
- Events are missing timestamps.
- Draft statuses are inconsistent.
- Outcome data is not available.
- Sample size is too small for reliable conclusions.

## First Implementation Slice

Generate a Markdown report from local JSON fixtures and manually maintained outcome CSV.

