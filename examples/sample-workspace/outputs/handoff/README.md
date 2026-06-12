# Agentic Hub Handoff Bundle

Generated: 2026-06-11T22:50:00.000Z

This folder contains client-facing artifacts from a supervised pipeline sprint. It is intended for review and delivery, not as the full internal workspace.

## Included

- `lead-briefs/` - evidence-backed account briefs
- `drafts/` - human-review follow-up drafts
- `reports/weekly-pipeline-report.md` - weekly operating report
- `reports/metrics.csv` - report metrics in CSV form
- `evals/quality-report.md` - deterministic quality/readiness evaluation
- `evals/quality-scores.csv` - eval scores in CSV form
- `console/index.html` - static local review console
- `screenshots/` - rendered proof assets when available
- `manifest.json` - bundle metadata and guardrails

## Excluded By Default

- `inputs/`
- `state/`
- `logs/`

Raw inputs, local state, and logs may contain private or sensitive client context. Share them only when explicitly requested and approved.

## Guardrails

- No outbound sending is implemented.
- No form submission is implemented.
- No credentials are included.
- Raw local state and run logs are excluded by default.

## Summary Metrics

| Metric | Value |
| --- | ---: |
| Accounts imported | 25 |
| Lead briefs | 25 |
| Drafts generated | 25 |
| Drafts approved | 1 |
| Drafts edited | 1 |
| Drafts rejected | 1 |
| Draft revisions | 1 |
| Manual sends recorded | 1 |
| Replies | 1 |
| Meetings booked | 1 |

## Suggested Review Path

1. Open `console/index.html`.
2. Read `reports/weekly-pipeline-report.md`.
3. Review `evals/quality-report.md` for evidence and readiness checks.
4. Review selected lead briefs and drafts.
5. Confirm any draft manually before using it outside Agentic Hub.
