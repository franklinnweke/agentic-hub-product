# Pipeline Sprint Intake Template

Use this before running Agentic Hub on a real permissioned sprint. The goal is to collect enough context to produce useful lead briefs and review-gated drafts without asking the system to scrape, send, submit forms, or use credentials.

## Client Snapshot

- Company:
- Website:
- Primary contact:
- Role:
- Offer being sold:
- Average contract value or deal value range:
- Sales cycle length:
- Current CRM/source of truth:
- Current follow-up owner:

## Permission Boundary

Confirm each item before work starts:

- Franklin may process the target list supplied for this sprint.
- Franklin may use notes, contact context, and prior interaction summaries supplied by the client.
- Franklin may generate local lead briefs, drafts, analytics, and a static console.
- Franklin will not send messages from Agentic Hub.
- Franklin will not submit forms from Agentic Hub.
- Franklin will not use client credentials in the MVP workflow.
- Franklin will not scrape private systems or bypass platform controls.
- Client/operator will review and manually send any approved messages outside Agentic Hub.

## Target Customer Definition

- Best-fit customer type:
- Best-fit company size:
- Best-fit geography:
- Best-fit industries:
- Trigger events or timing signals:
- Budget/ability-to-pay signals:
- Disqualifiers:
- Compliance or language constraints:

## Target List Inputs

Expected format: `inputs/targets.csv`

Required fields:

- `account_name`
- `website`
- `segment`
- `notes`
- `source`

Questions:

- Where did the target list come from?
- How fresh is it?
- Which accounts should be excluded before scoring?
- Are any accounts existing customers, competitors, partners, or sensitive relationships?

## Contact Context Inputs

Expected format: `inputs/contacts.csv`

Required fields:

- `account_id`
- `name`
- `role`
- `context`
- `source`
- `confidence`

Questions:

- Who is the tentative buyer or reviewer?
- How was this contact identified?
- What should be verified before any draft is used?
- Are there contacts Franklin should avoid referencing?

## Prior Interaction Inputs

Expected format: `inputs/previous_interactions.md`

Collect only client-provided summaries, not raw private inbox exports unless explicitly approved and sanitized.

For each account with prior context:

- Account id:
- Draft type: `warm_follow_up`, `meeting_recap`, `stale_opportunity_revive`, or `referral_request`
- Summary:
- Last interaction date:
- Recommended next action:
- Source:
- Confidence:

## Offer And Tone

- Core offer:
- Primary promise:
- Proof points that can be safely mentioned:
- Claims to avoid:
- Tone:
- Words/phrases to avoid:
- Required disclaimers:

## Review Workflow

- Who approves accounts?
- Who approves drafts?
- What counts as approved, edited, rejected, or needs more information?
- What changes must be made manually before sending?
- Where should manual outcomes be recorded?

## Success Criteria

Define success before running the sprint:

- Number of accounts reviewed:
- Number of briefs considered useful:
- Draft rewrite rate target:
- Manual sends expected:
- Replies expected:
- Meetings expected:
- Time saved estimate:
- Decision after sprint:

## Deliverables

Default deliverables:

- `outputs/lead-briefs/`
- `outputs/drafts/`
- `outputs/reports/weekly-pipeline-report.md`
- `outputs/console/index.html`
- `state/`
- `logs/runs.jsonl`
- sanitized before/after proof, if approved by the client
