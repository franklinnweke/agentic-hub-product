# Case Study: Fixture Pipeline Sprint

## Summary

This sanitized fixture shows how Agentic Hub turns a small target list into evidence-backed account briefs, human-reviewed follow-up drafts, and an analytics readout without autonomous outbound sending.

The sample is intentionally fictional. It uses safe `.example` domains and operator-provided notes so the workflow can be inspected publicly without exposing private client data or relying on live web access.

## What Ran

Command:

```sh
npm run fixture
npm run check
```

Fixture workspace:

- `examples/sample-workspace/inputs/targets.csv`
- `examples/sample-workspace/config/icp.md`
- `examples/sample-workspace/outputs/lead-briefs/`
- `examples/sample-workspace/outputs/drafts/`
- `examples/sample-workspace/outputs/reports/weekly-pipeline-report.md`
- `examples/sample-workspace/state/`
- `examples/sample-workspace/logs/runs.jsonl`

## Before

The operator starts with a rough target CSV:

- account name
- website
- segment
- notes
- source

The CSV contains six fictional accounts. Five are plausible service-business or founder-led B2B prospects. One is intentionally risky because it asks for autonomous high-volume outbound automation.

## Workflow

1. Ingest targets into local JSON state.
2. Capture evidence from the target CSV and operator notes.
3. Score each account against the configured ICP.
4. Generate Markdown lead briefs.
5. Generate follow-up drafts only for eligible accounts.
6. Apply explicit human review states to accounts and drafts.
7. Record one manual outcome after operator-controlled outreach outside Agentic Hub.
8. Generate an analytics report from local state.
9. Run deterministic fixture-quality checks.

## After

The fixture produces:

- 6 lead briefs
- 5 follow-up drafts
- 1 rejected automation-risk account
- 1 approved draft
- 1 edited draft
- 1 rejected draft
- 1 manually recorded meeting outcome
- 55 audit events
- 1 weekly pipeline report

Example artifacts:

- `examples/sample-workspace/outputs/lead-briefs/acct_northstar_ops_studio.md`
- `examples/sample-workspace/outputs/drafts/draft_northstar_ops_studio_first_touch.md`
- `examples/sample-workspace/outputs/lead-briefs/acct_quickscale_outreach.md`
- `examples/sample-workspace/outputs/reports/weekly-pipeline-report.md`

## Why It Matters

The proof is not that an agent can generate a cold email. The proof is that the workflow creates an auditable operating loop:

- every account has preserved evidence
- every score is inspectable
- risky automation requests are rejected
- every draft requires human review
- outcomes are manually recorded with a clear denominator
- analytics reconciles with local state

That makes the project portfolio-grade because a reviewer can inspect the inputs, state, artifacts, logs, and evals from a normal GitHub checkout.

## Guardrails Demonstrated

- No outbound send command exists.
- No form submission exists.
- No credentials are required.
- No browser automation is used in the fixture.
- Draft approval does not imply sending.
- Manual outcomes are recorded only after operator-controlled activity outside Agentic Hub.

## Remaining Gaps

- The fixture is smaller than the eventual 25-account sprint.
- Buyer/contact names are still missing.
- Draft editing is represented as state, not a revision workflow.
- Real public-source research is not implemented yet.
- There is no local operator console or screenshot-driven UI yet.

## Next Proof Step

Run a 25-account sanitized sample or a real permissioned sprint, then publish:

- before/after lead brief example
- approval queue screenshot or terminal walkthrough
- weekly analytics screenshot/report
- short operator video walkthrough
