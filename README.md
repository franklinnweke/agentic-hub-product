# Agentic Hub

Agentic Hub is a personal lead-gen, outreach, wiki, and analytics system built as reusable Codex workflow packs.

It is designed as both a portfolio project and a productizable operating system for high-trust revenue workflows: lead research, human-approved follow-ups, and pipeline analytics.

The product is intentionally not an autonomous spam tool. It is a supervised operating layer that helps a solo operator or small team find better prospects, prepare better context, draft better follow-ups, and measure what is working without handing outbound judgment to an agent.

## Product Thesis

Small teams do not need another CRM. They need a workflow layer that turns scattered inputs into reviewed actions:

- who to contact
- why they are a fit
- what evidence supports that fit
- what follow-up should be drafted
- what needs human approval
- what changed after outreach
- which workflow produced pipeline

Agentic Hub packages these jobs as reusable Codex skills and workflow packs that can run locally, connect to existing tools, and emit auditable artifacts.

## Initial Packs

1. `lead-gen`
   - Research target accounts and contacts from approved sources.
   - Score fit using explicit criteria.
   - Produce evidence-backed lead briefs.

2. `follow-ups`
   - Turn meeting notes, CRM state, inbox context, and previous outreach into human-approved follow-up drafts.
   - Track next actions and stale conversations.

3. `analytics`
   - Measure workflow performance: researched leads, approved drafts, sent follow-ups, replies, meetings, conversion, and cycle time.
   - Produce weekly operating reports.

## Repository Map

- `bin/agentic-hub.mjs` - zero-dependency local CLI for the first MVP workflow.
- `schemas/` - JSON schemas for accounts, evidence, drafts, and events.
- `examples/sample-workspace/` - runnable fixture workspace with generated sample outputs.
- `docs/product-plan.md` - product strategy, positioning, packaging, monetization.
- `docs/prd.md` - product requirements document for the first shippable version.
- `docs/workflow-pack-architecture.md` - workflow-pack design, inputs, outputs, guardrails.
- `docs/roadmap.md` - 48-hour, 30-day, and 90-day implementation path.
- `docs/go-to-market.md` - first customer, service wedge, pricing, and proof strategy.
- `packs/` - pack-level specs for lead gen, follow-ups, and analytics.
- `templates/workflow-pack-template.md` - reusable template for future packs.
- `research/source-notes.md` - research signals and operating assumptions.
- `AGENTS.md` - repo instructions for future Codex agents.

## Operating Principles

- Human approval before sending messages, submitting forms, purchasing, scraping sensitive systems, or mutating external records.
- Evidence over vibes: every lead score and recommendation should cite source evidence.
- Deterministic first: use APIs, structured data, and explicit rules before browser automation.
- Browser/computer use only when no reliable API exists.
- The system should produce artifacts a client can inspect: CSVs, briefs, reports, screenshots, logs, and GitHub issues.

## Local MVP Quickstart

The first runnable slice is a local, inspectable CLI. It uses Node.js built-ins only: no database, no credentials, no browser automation, no outbound sending.

Run the fixture workflow:

```sh
npm run fixture
```

Validate the generated workspace:

```sh
npm run check
```

Run against a new local workspace:

```sh
node ./bin/agentic-hub.mjs init --workspace ./workspace
node ./bin/agentic-hub.mjs run --workspace ./workspace
```

The fixture writes:

- `examples/sample-workspace/outputs/lead-briefs/` - evidence-backed account briefs.
- `examples/sample-workspace/outputs/drafts/` - follow-up drafts that start in `needs_review`.
- `examples/sample-workspace/outputs/reports/weekly-pipeline-report.md` - analytics report.
- `examples/sample-workspace/state/` - inspectable JSON/JSONL state.
- `examples/sample-workspace/logs/runs.jsonl` - audit log for pack runs.

### Example Output

The sample sprint imports five fictional accounts, generates five lead briefs, creates four review-gated drafts, skips one disqualified automation-risk account, and produces a weekly report. The MVP deliberately does not include any send command or external side effect.

Implementation stack: Node.js ESM with plain files. This keeps the workflow easy to run now and leaves a clean path toward a TypeScript web console later.

## First Milestone

Build a local proof that can run on a curated list of 25 target companies:

1. Ingest a CSV of target accounts.
2. Research each account from approved public sources.
3. Produce a lead brief with evidence, fit score, and suggested angle.
4. Draft a follow-up sequence that requires human approval.
5. Generate an analytics report showing workflow throughput and quality.
