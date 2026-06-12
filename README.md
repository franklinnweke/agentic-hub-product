# Agentic Hub

Agentic Hub is a reusable Codex workflow-pack system for high-trust revenue operations: lead research, human-approved follow-ups, and analytics.

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

## First Milestone

Build a local proof that can run on a curated list of 25 target companies:

1. Ingest a CSV of target accounts.
2. Research each account from approved public sources.
3. Produce a lead brief with evidence, fit score, and suggested angle.
4. Draft a follow-up sequence that requires human approval.
5. Generate an analytics report showing workflow throughput and quality.

