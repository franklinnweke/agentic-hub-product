# Follow-Ups Pack

## Job To Be Done

Turn approved lead briefs, prior context, and offer notes into human-approved follow-up drafts with clear next actions.

## User

Franklin or a client operator managing sales, partnerships, job, grant, or customer follow-up workflows.

## Inputs

Required:

- approved or reviewable lead briefs
- `config/offer.md`
- `config/tone.md` or tone section in `icp.md`

Optional:

- previous interaction notes
- email thread summaries
- meeting notes
- CRM export
- calendar event summaries

## Outputs

- `outputs/drafts/{draft_id}.md`
- `state/drafts.json`
- `state/events.jsonl`
- follow-up queue summary

## Draft Sections

1. Account/contact context
2. Draft type
3. Subject options
4. Message draft
5. Personalization evidence
6. Risk flags
7. Suggested next action
8. Approval state

## Workflow

1. Load approved or reviewable lead briefs.
2. Load prior context if provided.
3. Decide draft type:
   - first touch
   - warm follow-up
   - meeting recap
   - stale opportunity revive
   - referral request
4. Generate a short draft using only available evidence.
5. Add risk flags.
6. Mark draft as `needs_review`.
7. Write state and audit log.

## Tone Rules

Default tone:

- direct
- specific
- non-hype
- respectful
- low-pressure
- one clear ask

Avoid:

- fake familiarity
- exaggerated claims
- manipulative urgency
- vague AI personalization
- long messages
- pretending to know private context

## Approval Gates

This pack must never send messages in the MVP.

Allowed states:

- `drafted`
- `needs_review`
- `approved`
- `edited`
- `rejected`

Reserved future state:

- `sent_external`

## Failure Modes

- Weak evidence leads to generic draft.
- Prior interaction context is missing.
- Draft makes unsupported claims.
- Draft creates privacy or reputational risk.
- Contact information is uncertain.

## First Implementation Slice

Implement local draft generation from existing lead brief Markdown files.

Do not add email sending.

