# Case Study: Fixture Pipeline Sprint

## Summary

This sanitized fixture shows how Agentic Hub turns a 25-account target list into evidence-backed account briefs, human-reviewed follow-up drafts, and an analytics readout without autonomous outbound sending.

The sample is intentionally fictional. It uses safe `.example` domains and operator-provided notes so the workflow can be inspected publicly without exposing private client data or relying on live web access.

## What Ran

Command:

```sh
npm run fixture
npm run check
```

Guided review:

- `docs/demo-walkthrough.md`

Fixture workspace:

- `examples/sample-workspace/inputs/targets.csv`
- `examples/sample-workspace/inputs/contacts.csv`
- `examples/sample-workspace/inputs/research.csv`
- `examples/sample-workspace/inputs/previous_interactions.md`
- `examples/sample-workspace/config/icp.md`
- `examples/sample-workspace/outputs/lead-briefs/`
- `examples/sample-workspace/outputs/drafts/`
- `examples/sample-workspace/outputs/evals/quality-report.md`
- `examples/sample-workspace/outputs/reports/weekly-pipeline-report.md`
- `examples/sample-workspace/outputs/console/index.html`
- `examples/sample-workspace/outputs/screenshots/operator-console.jpg`
- `examples/sample-workspace/outputs/handoff/`
- `examples/sample-workspace/state/`
- `examples/sample-workspace/logs/runs.jsonl`

## Before

The operator starts with a rough target CSV:

- account name
- website
- segment
- notes
- source

The CSV contains 25 fictional accounts. Twenty-four are plausible service-business or founder-led B2B prospects. One is intentionally risky because it asks for autonomous high-volume outbound automation.

The contacts CSV contains 10 local, operator-provided tentative buyer records. These are not scraped or enriched from live systems; they exist to show how human-provided contact context flows into briefs and drafts.

The research CSV contains 10 manually captured research evidence rows from approved fictional sources or customer-provided context. It demonstrates the permissioned source intake path without scraping or live enrichment.

The previous-interactions file contains 6 local, operator-provided notes that turn eligible drafts into warm follow-ups, meeting recaps, stale-opportunity revives, and referral requests. These notes are fixture data, not inbox scraping.

## Workflow

1. Ingest targets into local JSON state.
2. Capture evidence from the target CSV and operator notes.
3. Load manually captured research evidence.
4. Load local contact and prior-interaction context.
5. Score each account against the configured ICP.
6. Generate Markdown lead briefs.
7. Generate follow-up drafts only for eligible accounts.
8. Select draft type from local interaction context when available.
9. Apply explicit human review states to accounts and drafts.
10. Record one manual outcome after operator-controlled outreach outside Agentic Hub.
11. Generate a deterministic quality evaluation from local state.
12. Generate an analytics report from local state.
13. Generate a static local operator console from local state.
14. Export a client-safe handoff bundle without raw inputs, state, or logs.
15. Run deterministic fixture-quality checks.

## After

The fixture produces:

- 25 lead briefs
- 10 local contact records
- 10 manually captured research evidence rows
- 6 local previous-interaction records
- 24 initial follow-up drafts
- 1 revised follow-up draft
- 18 first-touch draft records
- 2 warm follow-up draft records
- 2 meeting recap draft records
- 2 stale opportunity revive draft records
- 1 referral request draft record
- 1 rejected automation-risk account
- 1 approved draft
- 1 edited draft
- 1 rejected draft
- 1 superseded draft
- 1 manually recorded meeting outcome
- 222 audit events
- 1 weekly pipeline report
- 1 deterministic quality evaluation
- 1 static operator console
- 1 rendered operator console screenshot
- 1 client-safe handoff bundle

Example artifacts:

- `examples/sample-workspace/outputs/lead-briefs/acct_northstar_ops_studio.md`
- `examples/sample-workspace/outputs/drafts/draft_northstar_ops_studio_first_touch.md`
- `examples/sample-workspace/outputs/lead-briefs/acct_quickscale_outreach.md`
- `examples/sample-workspace/outputs/reports/weekly-pipeline-report.md`
- `examples/sample-workspace/outputs/console/index.html`
- `examples/sample-workspace/outputs/screenshots/operator-console.jpg`
- `examples/sample-workspace/outputs/handoff/README.md`

## Why It Matters

The proof is not that an agent can generate a cold email. The proof is that the workflow creates an auditable operating loop:

- every account has preserved evidence
- every score is inspectable
- local contact context is visible before draft approval
- prior interaction context changes draft type without connecting to an inbox
- risky automation requests are rejected
- every draft requires human review
- edited drafts can produce revised drafts without losing the original
- outcomes are manually recorded with a clear denominator
- analytics reconciles with local state
- the operator console can be opened as a local file without credentials or a server
- the handoff bundle excludes raw inputs, state, and logs by default

That makes the project portfolio-grade because a reviewer can inspect the inputs, state, artifacts, logs, and evals from a normal GitHub checkout.

## Guardrails Demonstrated

- No outbound send command exists.
- No form submission exists.
- No credentials are required.
- No browser automation is used in the fixture.
- Contact context comes from local fixture data.
- Prior interaction context comes from local fixture data.
- Draft approval does not imply sending.
- Manual outcomes are recorded only after operator-controlled activity outside Agentic Hub.

## Remaining Gaps

- Real public-source research is not implemented yet.
- There is no permissioned real-client sprint published yet.

## Next Proof Step

Run a real permissioned 25-account sprint using `docs/permissioned-pilot-runbook.md`, then publish:

- before/after lead brief example
- approval queue screenshot or terminal walkthrough from a real permissioned sprint
- weekly analytics screenshot/report
- short operator video walkthrough
