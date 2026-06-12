# Before / After Proof Template

Use this template after a permissioned sprint to publish a sanitized proof artifact. Do not include client names, personal contact details, private notes, raw inbox content, confidential deal values, or unapproved screenshots.

## Summary

- Client type:
- Sprint date:
- Number of accounts:
- Input sources:
- Deliverables returned:
- What was intentionally excluded:

## Before

Describe the starting workflow:

- Where target accounts lived:
- Where contact context lived:
- Where prior interaction context lived:
- How follow-ups were drafted before:
- How reviews happened before:
- How outcomes were tracked before:

## Workflow Run

Commands:

```sh
node ./bin/agentic-hub.mjs run --workspace ../client-sprint-workspace
node ./bin/agentic-hub.mjs validate --workspace ../client-sprint-workspace
```

Replace `../client-sprint-workspace` with the sanitized local workspace label used for the sprint. Keep sensitive paths out of the public version.

What ran:

1. Ingested target accounts.
2. Loaded local contact context.
3. Loaded prior-interaction summaries.
4. Generated evidence-backed lead briefs.
5. Generated review-gated drafts.
6. Applied human review states.
7. Recorded manual outcomes after operator-controlled activity.
8. Generated the analytics report and static console.

## After

Report sanitized outcomes:

- Accounts imported:
- Lead briefs generated:
- Drafts generated:
- Drafts approved:
- Drafts edited:
- Drafts rejected:
- Draft revisions created:
- Manual sends recorded:
- Replies:
- Meetings:
- Time saved estimate:

## Example Artifact Pair

Before:

- A sanitized description of the original account row, notes, or manual process.

After:

- Sanitized lead brief excerpt:
- Sanitized draft excerpt:
- Sanitized analytics excerpt:

## What Changed

- Lead quality:
- Follow-up specificity:
- Review discipline:
- Outcome visibility:
- Guardrail confidence:

## Guardrails Preserved

- No outbound send command was used.
- No form submission was used.
- No credentials were used.
- No private systems were scraped.
- Drafts required human review.
- Outcomes were recorded manually after operator-controlled activity.

## Permission Notes

- What the client approved for publication:
- What was removed or generalized:
- What screenshots are safe to publish:
- What examples must remain private:

## Next Sprint Recommendation

- Keep:
- Change:
- Add:
- Do not automate yet:
