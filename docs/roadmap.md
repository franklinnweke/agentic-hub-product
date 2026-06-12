# Roadmap

## 48-Hour Prototype

Goal: prove the workflow on a local fixture and one real sample set.

### Build

1. Create a sample workspace layout.
2. Add `targets.csv` fixture with 10 fake/safe accounts.
3. Add `icp.md` with scoring rules.
4. Manually produce 3 lead briefs using the lead-gen pack spec.
5. Manually produce 3 follow-up drafts using the follow-ups pack spec.
6. Produce one analytics report from the generated artifacts.
7. Document the operator workflow in the README.

### Output

- sample target CSV
- sample lead briefs
- sample follow-up drafts
- sample analytics report
- productized service offer draft

### Success Criteria

- Franklin can explain the product in one minute.
- A future agent can implement the first scripts from the docs.
- The sample output looks like something a client would pay to receive.

## 7-Day Build

Goal: convert manual specs into a local repeatable system.

### Build

1. Add schemas for accounts, evidence, drafts, and events.
2. Add a local CLI or script entrypoint.
3. Implement CSV ingestion.
4. Implement Markdown/JSON lead brief generation from structured inputs.
5. Implement draft generation with approval states.
6. Implement analytics report from state files.
7. Add fixture tests/evals for output completeness.

### Output

- runnable local workflow
- fixture test run
- first screenshot/demo
- first sanitized case study outline

## 30-Day Productized Service

Goal: sell and run the first real pipeline sprint.

### Build

1. Choose one niche.
2. Create landing page copy for a 25-account sprint.
3. Create intake form.
4. Run the workflow on 25 real targets.
5. Deliver lead briefs, follow-up drafts, and analytics.
6. Capture time saved and quality feedback.
7. Publish a sanitized before/after.

### Sales Motion

- 10 warm messages to founders/consultants Franklin already knows.
- 20 targeted manual outreach messages to small agencies/consultants.
- Offer a free 3-account sample or paid starter audit.

### Success Criteria

- one paid or serious pilot
- at least one testimonial-style quote
- evidence that one workflow step repeats enough to automate

## 90-Day Product

Goal: turn the service engine into a reusable product.

### Build

1. Create a local operator console.
2. Add n8n templates for scheduled reporting.
3. Add Gmail/Calendar read-only connectors where authorized.
4. Add CRM import/export.
5. Add eval suite for lead brief and follow-up quality.
6. Package stable workflows as Codex skills.
7. Create public docs and examples.

### Monetization

- keep service as premium implementation
- sell workflow templates
- offer hosted analytics later only if demand exists

## What To Avoid

- building a full CRM
- autonomous sending
- LinkedIn automation
- generic AI email generator positioning
- building a SaaS UI before selling the workflow
- adding integrations before the local file workflow is solid

