# Agent Instructions

This repository defines Agentic Hub, a productized Codex workflow-pack system for lead generation, follow-ups, and analytics.

## How To Work In This Repo

- Prefer docs and specs that are directly implementable.
- Keep all workflow behavior human-gated when it can affect a real person, external system, purchase, form submission, email, CRM update, or public post.
- Do not propose spam, deceptive scraping, fake reviews, credential misuse, or ToS-violating automation.
- Use structured inputs and outputs where possible: CSV, JSON, Markdown briefs, and explicit schemas.
- Treat browser/computer use as a fallback for systems without stable APIs.
- Keep recommendations practical for Franklin: AI workflow engineering, full-stack systems, product/ops, LLM evaluation, automation, and agent orchestration.

## Documentation Standards

- Write in clear product language.
- Include assumptions, non-goals, risks, and acceptance criteria.
- Make every workflow testable with a small local fixture.
- When adding a pack, include:
  - job-to-be-done
  - inputs
  - outputs
  - workflow stages
  - approval gates
  - failure modes
  - first implementation slice

## Product Boundaries

Agentic Hub may:

- research leads from approved public or user-provided sources
- enrich records when permitted
- score fit using transparent criteria
- draft messages for human review
- summarize inbox or CRM state when connected with authorization
- generate analytics reports and operating dashboards

Agentic Hub must not:

- send outbound messages without explicit user approval
- submit web forms without explicit user approval
- impersonate people
- bypass paywalls, access controls, CAPTCHAs, or rate limits
- generate deceptive personalization
- collect private personal data without a legitimate purpose and user permission
- mutate CRM or email state without preview and confirmation

