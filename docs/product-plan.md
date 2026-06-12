# Product Plan: Agentic Hub

## One-Line Product

Agentic Hub is a supervised AI workflow system that helps solo operators and small teams research leads, draft follow-ups, and measure revenue workflow performance using reusable Codex workflow packs.

## Core Positioning

Agentic Hub is not a CRM replacement and not an autonomous outbound bot.

It is a high-trust workflow layer for people who already have tools but lack process leverage:

- consultants
- small agencies
- technical freelancers
- founder-led B2B startups
- local service businesses with high-ticket offers
- job seekers or grant applicants running relationship-heavy pipelines

The wedge is simple: "Give me a target list and your offer; I will return evidence-backed lead briefs, approved follow-up drafts, and an analytics report that shows what happened."

## Why This Fits Franklin

Franklin has the right combination of strengths:

- AI workflow engineering: can package workflows as repeatable Codex skills.
- Full-stack systems: can move from docs to local app to hosted product.
- Product and operations: can map messy business processes into structured workflows.
- LLM evaluation: can score output quality and catch false confidence.
- Automation: can integrate n8n, browser/computer use, GitHub, email, and analytics.
- Public proof instinct: can turn the system itself into a portfolio artifact.

## Market Problem

Small teams often have some version of this mess:

- lead lists in spreadsheets
- contact history in email
- notes in docs
- follow-up reminders in memory
- no clear scoring system
- no analytics on which efforts produce conversations
- low-quality AI drafts that feel generic
- over-automation that risks spam or account damage

They do not need an AI that "does sales." They need a system that reduces research time, improves message quality, forces review, and creates a weekly operating cadence.

## Product Hypothesis

If Agentic Hub can turn a rough lead list into evidence-backed briefs, human-approved follow-ups, and weekly analytics, then Franklin can sell it first as a productized service and later package the workflow packs as software.

## Target Customer Segments

### Primary: Solo Consultants And Small Agencies

Pain:

- need consistent outbound but hate shallow personalization
- cannot afford a full-time sales ops person
- already use spreadsheets, Gmail, LinkedIn, Notion, or HubSpot

Buyer:

- founder, principal consultant, agency owner

Initial offer:

- "25-account pipeline sprint" with research briefs, follow-up drafts, and analytics.

### Secondary: Founder-Led B2B Startups

Pain:

- founders need customer discovery and sales but get buried in context gathering
- investor/customer updates and follow-ups slip

Initial offer:

- "Founder follow-up cockpit" for warm leads, investor updates, and demo follow-ups.

### Tertiary: Job Seekers, Grant Applicants, And Scholarship Applicants

Pain:

- many opportunities, scattered documents, low follow-up discipline

Initial offer:

- personal command center, not mass-submit automation.

This segment is useful for Franklin's own productivity and public proof, but less attractive as the first paid B2B wedge.

## Jobs To Be Done

1. When I have a list of possible accounts, help me understand who is worth pursuing and why.
2. When I need to follow up, draft context-aware messages that sound like me and require approval.
3. When I am running outreach, show me what is working and where conversations are stuck.
4. When I change my offer or ICP, help me update scoring and messaging without rebuilding the whole workflow.

## Product Shape

Agentic Hub should start as a hybrid productized service plus local workflow-pack repo.

### Phase 1: Productized Service

Franklin manually operates Codex-assisted workflows for clients.

Deliverables:

- lead research CSV
- Markdown lead briefs
- follow-up drafts
- approval queue
- weekly analytics report
- recommendations for the next sprint

Why:

- fastest cash path
- real customer data exposes edge cases
- produces testimonials and before/after proof

### Phase 2: Internal Operator Console

Build a local web console around the packs.

Capabilities:

- import targets
- configure ICP and scoring criteria
- run pack tasks
- review evidence
- approve drafts
- export reports

Why:

- increases Franklin's throughput
- demonstrates product maturity
- creates screenshots and demos

### Phase 3: Packaged Software

Package workflow packs as installable Codex skills, n8n templates, and optional hosted dashboard.

Options:

- open-source core packs
- paid templates
- paid hosted workspace
- consulting/setup package
- team version with connectors

## Monetization

### Service Wedge Pricing

- Starter audit: $250-$500
  - review current pipeline process
  - build one sample lead brief
  - identify workflow gaps

- Pipeline sprint: $1,000-$2,500
  - 25-50 leads
  - evidence-backed scoring
  - first follow-up drafts
  - weekly analytics readout

- Monthly operator retainer: $1,500-$5,000
  - recurring lead research
  - follow-up queue maintenance
  - analytics report
  - workflow improvements

### Software Pricing Later

- Free: local workflow-pack templates and sample fixtures.
- Pro: advanced packs, dashboard, connectors, eval suite.
- Team: shared queues, approval roles, CRM sync, audit logs.

## Differentiation

Agentic Hub should win by being:

- evidence-backed, not vibes-based
- human-approved, not spammy
- local-first and inspectable
- workflow-pack based, not locked to one CRM
- analytics-aware from day one
- built in public as Franklin's proof of work

## Product Principles

1. Human approval beats fake autonomy.
2. Every recommendation needs evidence.
3. Every workflow needs a measurable output.
4. Every pack should run on fixtures before touching real data.
5. Every integration should have a dry-run mode.
6. Analytics is not an afterthought; it is how trust compounds.

## Success Metrics

### Service Metrics

- time saved per 25-account sprint
- percent of leads with complete evidence
- percent of drafts approved without major rewrite
- reply rate
- meeting-booked rate
- client willingness to run another sprint

### Product Metrics

- workflow pack run success rate
- human approval latency
- false-positive lead score rate
- stale follow-up count
- report generation time
- setup time for a new client/workspace

## Strategic Risks

- If it looks like another AI spam tool, trust collapses.
- If output quality is not visibly better than generic AI drafts, buyers will not pay.
- If integration setup dominates delivery time, margins shrink.
- If analytics is weak, the system cannot prove its value.
- If Franklin overbuilds before selling, the product may become a portfolio artifact only.

## Productization Strategy

Start with a service that forces real use:

1. Pick one niche Franklin understands enough to write sharp relevance criteria.
2. Run a 25-account sprint manually with Codex.
3. Convert repeated steps into workflow pack specs.
4. Turn pack specs into local scripts/skills.
5. Use every sprint to improve scoring, evidence capture, and analytics.
6. Publish sanitized case studies.
7. Only build a UI after the workflow has repeated at least three times.

