# Workflow Pack Architecture

## Concept

A workflow pack is a reusable, inspectable unit of agentic work. It defines a business job, required inputs, outputs, state transitions, approval gates, and failure modes.

Agentic Hub should treat Codex as the operator workbench and workflow packs as the product surface.

## Pack Anatomy

Each pack should include:

- `README.md` - pack overview and usage.
- `inputs.schema.json` - required and optional input shape.
- `outputs.schema.json` - output shape.
- `fixtures/` - sample data safe to run locally.
- `prompts/` - task prompts and review prompts.
- `scripts/` - deterministic helpers.
- `evals/` - quality checks and regression fixtures.
- `examples/` - sample outputs.

The current repo starts with docs only. Implementation should add these folders pack by pack.

## Execution Model

1. Read workspace config.
2. Validate inputs.
3. Run deterministic preprocessing.
4. Ask Codex/LLM to perform bounded judgment work.
5. Validate output schema.
6. Run quality checks.
7. Emit artifacts.
8. Write audit log.
9. Require human approval before external side effects.

## Workspace Layout

```text
workspace/
  config/
    icp.md
    offer.md
    approved-sources.md
    blocked-domains.md
  inputs/
    targets.csv
    contacts.csv
    previous_interactions.md
  outputs/
    lead-briefs/
    drafts/
    reports/
    console/
  state/
    accounts.json
    contacts.json
    interactions.json
    evidence.json
    drafts.json
    events.jsonl
  logs/
    runs.jsonl
```

## Pack Interface

Each pack should expose the same conceptual interface:

```text
pack run --workspace <path> --dry-run
pack validate --workspace <path>
pack report --workspace <path>
```

Implementation can start as scripts, then evolve into CLI commands or Codex skills.

## Shared State

Use local files before a database.

Recommended files:

- `state/accounts.json`
- `state/contacts.json`
- `state/interactions.json`
- `state/evidence.json`
- `state/drafts.json`
- `state/events.jsonl`
- `logs/runs.jsonl`

This keeps the product inspectable and easy to debug.

## Approval States

Use explicit states everywhere.

### Lead States

- `new`
- `researching`
- `needs_review`
- `approved`
- `rejected`
- `needs_more_info`

### Draft States

- `drafted`
- `needs_review`
- `approved`
- `edited`
- `rejected`
- `sent_external`

The MVP should not implement `sent_external`; it is reserved for future integrations.

## Quality Gates

### Lead Brief Quality

- Has enough evidence.
- Fit score matches criteria.
- Disqualifiers are checked.
- Claims cite source URLs or user-provided evidence.
- Missing data is explicit.

### Follow-Up Quality

- Uses actual evidence.
- Avoids fake familiarity.
- No manipulative language.
- Includes one clear ask.
- Fits configured tone.
- Requires approval.

### Analytics Quality

- Counts reconcile with state files.
- Conversion metrics define denominator.
- Recommendations cite observed metrics.
- Unknowns are marked unknown.

## When To Use Browser Or Computer Use

Use browser/computer use only when:

- no API or export exists
- the user has permission to access the site
- the workflow can run in dry-run mode
- the action is read-only, or a human approves the side effect

Do not use browser automation to:

- bypass rate limits
- bypass CAPTCHAs
- scrape private data without permission
- submit forms without approval
- send messages without approval

## Codex Skill Packaging

Each stable pack can become a Codex skill.

Skill responsibilities:

- describe when to use the pack
- define input expectations
- load the pack prompts and schemas
- run local scripts when useful
- produce artifacts in the workspace
- warn when human approval is required

## Future Integrations

Start local. Add integrations only when the workflow is proven.

Likely integrations:

- Gmail: summarize authorized threads, draft replies.
- Google Calendar: detect stale meetings and follow-up windows.
- GitHub: manage workflow-pack development and PR review.
- n8n: scheduled runs, retries, connector orchestration.
- HubSpot/Pipedrive: CRM import/export, later mutation with approval.
- Google Sheets: lightweight workspace and client handoff.

## Productizable Unit

The sellable unit is not the agent. It is the workflow outcome:

- researched account pack
- approved follow-up queue
- weekly pipeline report
- improved conversion insight

The agent is the machinery. The artifact is what the buyer trusts.
