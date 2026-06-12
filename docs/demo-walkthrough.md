# Demo Walkthrough

This walkthrough is for a GitHub reviewer who wants to understand Agentic Hub in 3-5 minutes without trusting a pitch deck.

## What To Run

```sh
npm run fixture
npm run check
```

The fixture is deterministic and local-first. It uses fictional `.example` accounts, local CSV/Markdown inputs, JSON/JSONL state, Markdown artifacts, and one static HTML console. It does not use credentials, live scraping, browser automation, form submission, or outbound sending.

## What To Open First

1. `examples/sample-workspace/outputs/screenshots/operator-console.jpg`
   - Shows the operator review queue, draft status filters, draft type filters, metrics, artifact links, and the no-send boundary.

2. `examples/sample-workspace/outputs/console/index.html`
   - Open locally to filter the queue and inspect selected account details.
   - Use the status filters to compare approved, edited, rejected, and needs-review drafts.
   - Use the draft type filters to see first-touch, warm follow-up, meeting recap, stale-opportunity revive, and referral-request workflows.

3. `examples/sample-workspace/outputs/reports/weekly-pipeline-report.md`
   - Confirms throughput, contact coverage, interaction coverage, draft type mix, manual outcome rates, bottlenecks, and recommended next actions.

## The Story To Notice

Agentic Hub is not an email generator. It is a supervised operating loop:

1. A rough target list enters through `inputs/targets.csv`.
2. Local contact context enters through `inputs/contacts.csv`.
3. Prior relationship context enters through `inputs/previous_interactions.md`.
4. The CLI normalizes accounts and evidence into `state/`.
5. Lead briefs explain fit, evidence, missing information, disqualifiers, and recommended next action.
6. Follow-up drafts start in `needs_review`, never `sent`.
7. Human review can approve, edit, reject, or revise drafts.
8. Manual outcomes are recorded only after operator-controlled activity outside Agentic Hub.
9. Analytics reports reconcile local state into a weekly operating readout.

## Proof Points

- `examples/sample-workspace/outputs/lead-briefs/acct_northstar_ops_studio.md`
  - A high-fit account with contact context and an approved draft.

- `examples/sample-workspace/outputs/drafts/draft_northstar_ops_studio_first_touch.md`
  - A human-approved draft that still has no send action attached to it.

- `examples/sample-workspace/outputs/drafts/draft_brightlane_creative_warm_follow_up_rev1.md`
  - A revised draft created from an edited warm follow-up without losing the original review trail.

- `examples/sample-workspace/outputs/drafts/draft_cedar_grant_partners_meeting_recap.md`
  - A rejected draft in a compliance-sensitive segment.

- `examples/sample-workspace/outputs/lead-briefs/acct_quickscale_outreach.md`
  - A rejected automation-risk account that conflicts with the supervised outbound boundary.

## Guardrails To Check

- No CLI command sends a message.
- No CLI command submits a form.
- No credential or token is required.
- `inputs/outcomes.csv` is the only place manual send/reply/meeting outcomes are recorded.
- `logs/runs.jsonl` records every pack run.
- `state/events.jsonl` records account, evidence, draft, report, review, revision, and outcome events.
- `npm run check` validates workspace completeness and fixture quality.

## What This Proves

The MVP proves that Franklin can package an agentic workflow as an inspectable local product:

- structured inputs
- deterministic generation
- human approval gates
- evidence-backed artifacts
- local analytics
- a review console
- public proof assets

The next proof step is a permissioned real-client sprint with sanitized before/after artifacts and a short walkthrough video.
