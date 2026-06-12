# Agentic Hub Sanitized Proof Bundle

Generated: 2026-06-11T22:51:00.000Z

This folder contains publishable proof artifacts derived from a local Agentic Hub workspace. It is designed for public case-study review after client approval, not as a private delivery bundle.

## Included

- `lead-briefs/` - redacted account briefs
- `lead-briefs-json/` - redacted machine-readable lead brief JSON artifacts
- `drafts/` - redacted human-review follow-up drafts
- `reports/weekly-pipeline-report.md` - redacted operating report
- `reports/metrics.csv` - metrics in CSV form
- `evals/quality-report.md` - redacted deterministic quality/readiness evaluation
- `evals/quality-scores.csv` - eval scores in CSV form
- `manifest.json` - bundle metadata and redaction policy

## Excluded By Default

- `inputs/`
- `state/`
- `logs/`
- `outputs/console/`
- `outputs/screenshots/`

## Redaction Policy

- Account names are replaced with Account 01, Account 02, ...
- Contact names are replaced with Contact 01, Contact 02, ...
- Extra --redact values are replaced literally.
- Raw inputs, local state, logs, console HTML, and screenshots are excluded by default.

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

## Publication Checklist

1. Inspect every file in this bundle.
2. Confirm no private names, emails, domains, client details, or screenshots remain.
3. Get explicit approval before publishing a real-client case study.
4. Keep the no-send and human-review guardrails visible in the published narrative.
