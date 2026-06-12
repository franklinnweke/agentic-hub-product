# PRD: Agentic Hub MVP

## Product Name

Agentic Hub

## MVP Name

Pipeline Sprint Operator

## Owner

Franklin

## Status

Draft 1

## Problem Statement

Solo operators and small teams waste too much time turning scattered prospect, inbox, and conversation context into useful sales actions. Existing CRMs track records but do not reliably help with research quality, follow-up discipline, or operating analytics. Generic AI outbound tools create trust and spam risks because they over-automate messaging without enough evidence, approval, or measurement.

## Goal

Build a local-first supervised workflow system that can process a curated list of target accounts, produce evidence-backed lead briefs, draft human-approved follow-ups, and generate a weekly analytics report.

## MVP Scope

The MVP should support one operator, one workspace, and CSV/Markdown/JSON-based local execution.

It does not need multi-user auth, hosted billing, full CRM sync, or autonomous sending.

## Target User

Franklin as the first operator, running pipeline sprints for:

- his own opportunities
- consulting prospects
- small agencies
- founder-led B2B teams

## User Stories

### Lead Research

As an operator, I want to import a list of target accounts so the system can research and score them against my ICP.

As an operator, I want each lead score to include source evidence so I can trust or reject the recommendation.

As an operator, I want low-confidence results flagged instead of hallucinated.

### Follow-Ups

As an operator, I want the system to draft follow-ups from lead briefs and prior context so I can approve, edit, or reject them.

As an operator, I want no messages sent without my explicit approval.

As an operator, I want follow-ups to include the reason for outreach, supporting evidence, and a suggested next action.

### Analytics

As an operator, I want to see how many leads were researched, scored, approved, contacted, replied, and converted so I can improve the workflow.

As an operator, I want weekly recommendations based on the data so I know what to change next.

### Workflow Packs

As Franklin, I want each workflow to be packaged as a reusable pack so I can productize the system and demonstrate public proof.

## MVP Inputs

### Required

- `targets.csv`
  - account_name
  - website
  - segment
  - notes
  - source

- `icp.md`
  - ideal customer profile
  - disqualifiers
  - scoring criteria
  - offer
  - tone

### Optional

- `contacts.csv`
- `previous_interactions.md`
- `approved_sources.md`
- `blocked_domains.md`
- CRM export CSV
- Gmail thread export or manually pasted thread summaries

## MVP Outputs

### Lead Brief

Format: Markdown and JSON.

Required fields:

- account name
- website
- summary
- fit score
- fit rationale
- evidence list
- missing information
- disqualifiers
- suggested angle
- recommended next action
- confidence level

### Follow-Up Draft

Format: Markdown.

Required fields:

- recipient/context
- subject options
- message draft
- personalization evidence
- approval status
- risk flags
- suggested send window
- next action if no reply

### Analytics Report

Format: Markdown and CSV.

Required fields:

- accounts imported
- accounts researched
- accounts scored
- high-fit accounts
- drafts generated
- drafts approved
- drafts rejected
- follow-ups due
- stale conversations
- replies
- meetings
- conversion by segment
- quality notes

## Functional Requirements

### FR1: Workspace Setup

The system must create or accept a workspace folder containing inputs, outputs, logs, and config.

Acceptance criteria:

- sample workspace can run from fixture data
- no external credentials required for fixture run
- outputs are deterministic enough to compare across runs

### FR2: Lead Research Pack

The system must process target accounts and produce lead briefs.

Acceptance criteria:

- each brief includes at least three evidence fields when available
- missing evidence is explicitly marked
- fit score includes transparent scoring criteria
- low-confidence leads are flagged

### FR3: Follow-Up Pack

The system must generate drafts from approved or reviewable lead briefs.

Acceptance criteria:

- every draft starts in `needs_review`
- drafts include source evidence references
- drafts can be approved, edited, or rejected
- no send action exists in MVP

### FR4: Analytics Pack

The system must summarize workflow performance.

Acceptance criteria:

- report can be generated from local CSV/JSON state
- includes throughput, quality, and conversion metrics
- includes a next-week recommendation section

### FR5: Audit Log

The system must record pack runs and major state transitions.

Acceptance criteria:

- run ID
- timestamp
- pack name
- input files
- output files
- status
- warnings
- errors

### FR6: Human Approval Gates

The system must prevent external side effects without approval.

Acceptance criteria:

- no outbound email send in MVP
- no CRM mutation in MVP
- no form submission in MVP
- approval states are visible in outputs

## Non-Functional Requirements

### Reliability

- workflows should fail with explicit error messages
- partial outputs should be marked incomplete
- source evidence should be preserved with each generated recommendation

### Privacy

- secrets must stay in `.env`
- fixtures must not include real private client data
- exports should support redaction

### Portability

- local-first execution
- plain files before database
- easy to move into a web app later

### Observability

- logs for each pack run
- count-based analytics
- quality flags for uncertain outputs

## Non-Goals

- autonomous outbound sending
- scraping behind auth or bypassing controls
- LinkedIn automation that violates platform rules
- full CRM replacement
- multi-user SaaS
- billing
- browser automation as the default path

## MVP Workflow

1. Operator creates workspace.
2. Operator adds `targets.csv` and `icp.md`.
3. Lead-gen pack researches/scaffolds lead briefs.
4. Operator reviews and marks leads as approved, rejected, or needs-more-info.
5. Follow-up pack drafts messages only for approved/reviewable leads.
6. Operator edits and approves drafts manually.
7. Analytics pack summarizes throughput and quality.
8. Operator uses report to decide next sprint.

## Data Model

### Account

- id
- name
- website
- segment
- source
- status
- fit_score
- confidence
- created_at
- updated_at

### Evidence

- id
- account_id
- source_type
- source_url
- claim
- captured_at
- confidence

### Draft

- id
- account_id
- draft_type
- subject
- body
- status
- evidence_ids
- risk_flags
- created_at
- updated_at

### Event

- id
- entity_type
- entity_id
- event_type
- timestamp
- metadata

## Quality Bar

The MVP is successful only if Franklin can use it to produce a real sample pipeline sprint that is materially better than:

- a generic ChatGPT prompt
- a basic spreadsheet
- a CRM task list
- a cold email template generator

The proof must show evidence, review states, and analytics.

## Launch Criteria

- fixture run works end to end
- one real 25-account sprint completed
- at least five sample lead briefs
- at least five follow-up drafts
- one analytics report
- sanitized case study published
- clear service offer and pricing page draft

