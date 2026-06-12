# Lead Gen Pack

## Job To Be Done

Turn a rough target account list into evidence-backed lead briefs with transparent fit scoring and recommended next actions.

## User

Franklin or a client operator running a pipeline sprint.

## Inputs

Required:

- `targets.csv`
- `config/icp.md`
- `config/offer.md`

Optional:

- `contacts.csv`
- `approved-sources.md`
- `blocked-domains.md`
- prior customer examples
- segment-specific scoring notes

## Outputs

- `outputs/lead-briefs/{account_id}.md`
- `state/accounts.json`
- `state/evidence.json`
- `logs/runs.jsonl`

## Lead Brief Sections

1. Account summary
2. Fit score
3. Why this account fits
4. Evidence
5. Missing information
6. Disqualifiers checked
7. Suggested outreach angle
8. Recommended next action
9. Confidence level
10. Review status

## Workflow

1. Validate `targets.csv`.
2. Normalize account names and websites.
3. Check disqualifiers.
4. Research approved public sources.
5. Extract evidence.
6. Score fit using `icp.md`.
7. Draft lead brief.
8. Flag missing or weak evidence.
9. Write state and audit log.
10. Mark lead as `needs_review`.

## Scoring Model

Default score: 0-100.

Suggested weights:

- ICP match: 30
- pain signal: 20
- ability to pay: 15
- reachable buyer/context: 15
- timing signal: 10
- strategic relevance: 10

Disqualifiers should override score.

## Approval Gates

The pack may recommend next actions, but it must not:

- send messages
- submit forms
- mutate CRM records
- scrape private systems

Every lead brief starts as `needs_review`.

## Failure Modes

- No reliable evidence found.
- Website unreachable.
- Account is outside ICP.
- Source data conflicts.
- Fit score is high but confidence is low.
- The account appears to require sensitive handling.

## First Implementation Slice

Implement a local fixture workflow:

1. Read `targets.csv`.
2. Use user-provided notes and public website text only.
3. Generate Markdown lead briefs.
4. Generate `accounts.json`.
5. Produce a review summary.

Browser research and APIs can come later.

