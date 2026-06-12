# Permissioned Pilot Runbook

This runbook turns the public fixture into a real but still local-first pipeline sprint. It preserves the MVP guardrails: no autonomous sending, no form submission, no credential use, and no platform-risky automation.

## 1. Qualify The Pilot

Use `templates/pipeline-sprint-intake.md` before accepting a sprint.

Proceed only if the prospect:

- sells a high-value service or B2B product
- can define a target customer
- can provide a target list or source of target accounts
- cares about quality over outreach volume
- agrees to review messages manually before sending
- accepts that Agentic Hub will not send messages or submit forms

Decline or reshape the pilot if the prospect asks for bulk scraping, autonomous sending, guaranteed meetings, or credential-based automation.

## 2. Prepare A Local Workspace

Create a private workspace outside the public repo for client data.

```sh
node ./bin/agentic-hub.mjs pilot-init --workspace ../client-sprint-workspace
```

This creates starter inputs plus:

- `PILOT-CHECKLIST.md`
- `config/publication-approval.md`
- `.gitignore`

Then replace starter files with permissioned inputs:

- `inputs/targets.csv`
- `inputs/contacts.csv`
- `inputs/research.csv`
- `inputs/previous_interactions.md`
- `config/icp.md`
- `config/offer.md`

Use `inputs/research.csv` for manually captured approved-source claims. Do not scrape private systems or bypass platform controls.

Keep private inputs out of Git unless they are fully sanitized and approved for publication.

## 3. Run The Workflow

```sh
node ./bin/agentic-hub.mjs run --workspace ../client-sprint-workspace
```

Review generated outputs:

- `outputs/lead-briefs/`
- `outputs/drafts/`
- `outputs/evals/quality-report.md`
- `outputs/reports/weekly-pipeline-report.md`
- `outputs/console/index.html`
- `logs/runs.jsonl`
- `state/events.jsonl`

## 4. Apply Human Review

Use the CLI to record review state. Do not use review state as a send action.

```sh
node ./bin/agentic-hub.mjs review-account --workspace ../client-sprint-workspace --account acct_example --status approved --note "Human reviewed."
node ./bin/agentic-hub.mjs review-draft --workspace ../client-sprint-workspace --draft draft_example_first_touch --status edited --note "Needs a stronger proof point."
node ./bin/agentic-hub.mjs revise-draft --workspace ../client-sprint-workspace --draft draft_example_first_touch --changes "Add approved proof point and shorten the ask."
```

Valid draft outcomes remain review states only:

- `approved`
- `edited`
- `rejected`
- `superseded`
- `needs_review`

There is no `sent_external` status in the MVP.

## 5. Record Manual Outcomes

Only record outcomes after the client/operator manually sends or follows up outside Agentic Hub.

```sh
node ./bin/agentic-hub.mjs record-outcome --workspace ../client-sprint-workspace --draft draft_example_first_touch_rev1 --status replied --sent-at 2026-06-12 --reply-at 2026-06-13 --note "Recorded manually after operator-controlled outreach."
node ./bin/agentic-hub.mjs evaluate --workspace ../client-sprint-workspace
node ./bin/agentic-hub.mjs report --workspace ../client-sprint-workspace
node ./bin/agentic-hub.mjs console --workspace ../client-sprint-workspace
node ./bin/agentic-hub.mjs export --workspace ../client-sprint-workspace
node ./bin/agentic-hub.mjs sanitize --workspace ../client-sprint-workspace
node ./bin/agentic-hub.mjs validate --workspace ../client-sprint-workspace
```

## 6. Deliver The Sprint Pack

Default private handoff:

- `outputs/handoff/README.md`
- `outputs/handoff/manifest.json`
- `outputs/handoff/lead-briefs/`
- `outputs/handoff/drafts/`
- `outputs/handoff/reports/`
- `outputs/handoff/evals/`
- `outputs/handoff/console/`
- `outputs/handoff/screenshots/`

The export bundle excludes raw `inputs/`, `state/`, and `logs/` by default. Do not deliver raw state or logs if they contain sensitive data unless the client explicitly asks for them.

## 7. Publish Sanitized Proof

Use `templates/before-after-proof.md` only after the client approves what can be shown publicly.

Default public proof bundle:

- `outputs/sanitized/README.md`
- `outputs/sanitized/manifest.json`
- `outputs/sanitized/lead-briefs/`
- `outputs/sanitized/drafts/`
- `outputs/sanitized/reports/`
- `outputs/sanitized/evals/`

The sanitized proof bundle redacts account/contact names and excludes raw `inputs/`, `state/`, `logs/`, console HTML, and screenshots by default. Use `--redact "literal one,literal two"` for extra client-specific terms before publication.

Safe public proof can include:

- generalized client type
- sanitized account examples
- before/after process description
- aggregate metrics
- redacted screenshots
- lessons learned

Unsafe public proof includes:

- personal contact details
- private inbox content
- proprietary target lists
- raw client notes
- unapproved deal details
- screenshots containing private names, emails, or accounts

## 8. Decide What To Productize

After the pilot, update:

- `docs/go-to-market.md`
- `docs/service-offer.md`
- `docs/case-study-fixture-sprint.md` or a new sanitized case study
- workflow-pack specs if the same client need repeats

Only add integrations after the local workflow repeats and the permission boundary is clear.
