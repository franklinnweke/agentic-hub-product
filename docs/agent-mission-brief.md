# Agent Mission Brief

## Mission

Build Agentic Hub into a public-proof product and reusable workflow-pack system for lead generation, follow-ups, and analytics.

The first implementation target is a local operator workflow that can run a 25-account pipeline sprint with evidence-backed lead briefs, human-approved follow-up drafts, and an analytics report.

## Context

Franklin wants Agentic Hub to become both:

1. A practical money-making system he can sell as a productized service.
2. A technically credible public artifact showing Codex workflow-pack design.

Franklin's strengths:

- AI workflow engineering
- full-stack systems
- product/ops
- LLM evaluation
- automation and orchestration
- Codex, browser/computer use, n8n, GitHub, Remotion, and docs-heavy systems

## Build Philosophy

Do not build a SaaS first.

Build a local, inspectable operator system that creates valuable artifacts. Use real runs to decide what deserves UI, integrations, or hosting.

## First Build Order

1. Create sample workspace fixtures.
2. Define JSON schemas for accounts, evidence, drafts, and events.
3. Implement CSV ingestion.
4. Generate lead briefs from fixture data.
5. Generate follow-up drafts with `needs_review` state.
6. Generate analytics report from local state.
7. Add simple quality checks.
8. Add a CLI entrypoint.
9. Add screenshots or sample outputs.
10. Package the stable workflows as Codex skills.

## Hard Constraints

- No outbound sending without explicit human approval.
- No form submission without explicit human approval.
- No credential misuse.
- No platform-bypassing scraping.
- No fake personalization.
- No claims without evidence.
- No SaaS UI until local workflow is useful.

## MVP Definition Of Done

The MVP is done when this repo can demonstrate:

- `targets.csv` input
- `icp.md` input
- generated lead briefs
- generated follow-up drafts
- approval states
- generated analytics report
- static operator console
- console screenshot
- audit log
- sample case study

## Suggested Technical Direction

Start with plain files and scripts:

- TypeScript or Python are both acceptable.
- Prefer TypeScript if building toward a web console.
- Prefer Python if document/data extraction dominates.
- Keep state in JSON/JSONL until a database is clearly needed.
- Keep deterministic validation separate from LLM judgment.

## Future Product Direction

After the local workflow works:

- add n8n templates for scheduled reporting
- add Gmail/Calendar read-only connectors
- add CRM import/export
- expand the local web console
- add workflow-pack evals
- publish sanitized examples
- create a productized service landing page
