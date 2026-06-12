#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const WORKSPACE_DIRS = [
  "config",
  "inputs",
  "outputs/lead-briefs",
  "outputs/drafts",
  "outputs/reports",
  "state",
  "logs"
];

const REQUIRED_TARGET_COLUMNS = ["account_name", "website", "segment", "notes", "source"];
const REQUIRED_CONTACT_COLUMNS = ["account_id", "name", "role", "context", "source", "confidence"];
const REQUIRED_OUTCOME_COLUMNS = ["draft_id", "account_id", "manual_status", "sent_at", "reply_at", "meeting_at", "notes"];
const ACCOUNT_REVIEW_STATUSES = ["approved", "rejected", "needs_more_info"];
const DRAFT_REVIEW_STATUSES = ["approved", "edited", "rejected"];
const DRAFT_TYPES = ["first_touch", "warm_follow_up", "meeting_recap", "stale_opportunity_revive", "referral_request"];
const OUTCOME_STATUSES = ["sent_manual", "replied", "meeting_booked", "no_reply", "stale"];
const SCORE_WEIGHTS = {
  icp_match: 30,
  pain_signal: 20,
  ability_to_pay: 15,
  reachable_context: 15,
  timing_signal: 10,
  strategic_relevance: 10
};

function main() {
  const { command, flags } = parseArgs(process.argv.slice(2));
  const workspace = path.resolve(flags.workspace ?? "workspace");
  const now = flags.now ?? new Date().toISOString();

  try {
    switch (command) {
      case "init":
        initWorkspace(workspace, now);
        break;
      case "ingest":
        ingestTargets(workspace, now);
        break;
      case "generate-briefs":
        generateBriefs(workspace, now);
        break;
      case "generate-drafts":
        generateDrafts(workspace, now);
        break;
      case "review-account":
        reviewAccount(workspace, flags, now);
        break;
      case "review-draft":
        reviewDraft(workspace, flags, now);
        break;
      case "revise-draft":
        reviseDraft(workspace, flags, now);
        break;
      case "record-outcome":
        recordOutcome(workspace, flags, now);
        break;
      case "report":
        generateReport(workspace, now);
        break;
      case "run":
        if (flags.fresh) {
          resetGeneratedWorkspaceFiles(workspace);
        }
        initWorkspace(workspace, now, { preserveExisting: true });
        ingestTargets(workspace, now);
        generateBriefs(workspace, now);
        generateDrafts(workspace, now);
        generateReport(workspace, now);
        validateWorkspace(workspace);
        break;
      case "validate":
        validateWorkspace(workspace);
        break;
      case "help":
      default:
        printHelp(command);
        process.exit(command && command !== "help" ? 1 : 0);
    }
  } catch (error) {
    console.error(`agentic-hub: ${error.message}`);
    process.exit(1);
  }
}

function parseArgs(argv) {
  const [command = "help", ...rest] = argv;
  const flags = {};

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (!token.startsWith("--")) {
      throw new Error(`Unexpected argument: ${token}`);
    }

    const [rawKey, inlineValue] = token.slice(2).split("=");
    const next = rest[index + 1];
    if (inlineValue !== undefined) {
      flags[rawKey] = inlineValue;
    } else if (next && !next.startsWith("--")) {
      flags[rawKey] = next;
      index += 1;
    } else {
      flags[rawKey] = true;
    }
  }

  return { command, flags };
}

function printHelp(command) {
  if (command && command !== "help") {
    console.error(`Unknown command: ${command}`);
  }

  console.log(`Agentic Hub CLI

Usage:
  node ./bin/agentic-hub.mjs <command> --workspace <path>

Commands:
  init              Create a local workspace layout and starter input files
  ingest            Read inputs/targets.csv and write state/accounts.json + evidence.json
  generate-briefs   Generate Markdown lead briefs from local state
  generate-drafts   Generate human-review follow-up drafts from lead briefs
  review-account    Mark an account approved, rejected, or needs_more_info
  review-draft      Mark a draft approved, edited, or rejected
  revise-draft      Create a new needs_review draft version from an edited draft
  record-outcome    Record a manual outcome after operator-controlled activity
  report            Generate a weekly analytics report from local state
  run               Execute init, ingest, briefs, drafts, report, and validate
  validate          Check the local workspace for MVP completeness and guardrails

Options:
  --workspace PATH   Workspace folder to read/write
  --now ISO_DATE     Fixed timestamp for deterministic fixture runs
  --fresh            With run, clear generated outputs/state/logs and outcomes before execution
  --account ID       Account id for review-account
  --draft ID         Draft id for review-draft
  --status STATUS    Review status
  --note TEXT        Optional human review note
  --changes TEXT     Required revision notes for revise-draft
  --sent-at DATE     Manual send timestamp/date for record-outcome
  --reply-at DATE    Reply timestamp/date for record-outcome
  --meeting-at DATE  Meeting timestamp/date for record-outcome
`);
}

function initWorkspace(workspace, now, options = {}) {
  const preserveExisting = options.preserveExisting ?? false;
  for (const dir of WORKSPACE_DIRS) {
    fs.mkdirSync(path.join(workspace, dir), { recursive: true });
  }

  writeFileIfAllowed(
    path.join(workspace, "README.md"),
    workspaceReadme(),
    preserveExisting
  );
  writeFileIfAllowed(
    path.join(workspace, "inputs", "targets.csv"),
    starterTargetsCsv(),
    preserveExisting
  );
  writeFileIfAllowed(
    path.join(workspace, "config", "icp.md"),
    starterIcp(),
    preserveExisting
  );
  writeFileIfAllowed(
    path.join(workspace, "config", "offer.md"),
    starterOffer(),
    preserveExisting
  );
  writeFileIfAllowed(
    path.join(workspace, "inputs", "outcomes.csv"),
    starterOutcomesCsv(),
    preserveExisting
  );
  writeFileIfAllowed(
    path.join(workspace, "inputs", "contacts.csv"),
    starterContactsCsv(),
    preserveExisting
  );
  writeFileIfAllowed(
    path.join(workspace, "inputs", "previous_interactions.md"),
    starterPreviousInteractions(),
    preserveExisting
  );

  appendRunLog(workspace, {
    run_id: runId("init", now),
    timestamp: now,
    pack: "workspace",
    command: "init",
    input_files: [],
    output_files: ["README.md", "inputs/targets.csv", "inputs/contacts.csv", "inputs/previous_interactions.md", "inputs/outcomes.csv", "config/icp.md", "config/offer.md"],
    status: "completed",
    warnings: [],
    errors: []
  });

  console.log(`Initialized workspace: ${workspace}`);
}

function ingestTargets(workspace, now) {
  ensureWorkspaceDirs(workspace);
  const targetPath = path.join(workspace, "inputs", "targets.csv");
  if (!fs.existsSync(targetPath)) {
    throw new Error(`Missing ${relative(workspace, targetPath)}. Run init or add targets.csv.`);
  }

  const rows = parseCsv(fs.readFileSync(targetPath, "utf8"));
  validateTargetRows(rows);
  const contacts = readContactsInput(workspace, now);
  const interactions = readPreviousInteractionsInput(workspace, now);

  const accounts = [];
  const evidence = [];
  const events = [];

  for (const row of rows) {
    const account = buildAccount(row, now);
    accounts.push(account);
    const accountEvidence = buildEvidence(account, row, now);
    evidence.push(...accountEvidence);
    events.push(eventFor("account", account.id, "account_imported", now, {
      source: row.source,
      segment: row.segment
    }));
    for (const item of accountEvidence) {
      events.push(eventFor("evidence", item.id, "evidence_captured", now, {
        account_id: account.id,
        source_type: item.source_type
      }));
    }
  }
  applyContactsToAccounts(accounts, contacts, now);

  writeJson(path.join(workspace, "state", "accounts.json"), accounts);
  writeJson(path.join(workspace, "state", "evidence.json"), evidence);
  writeJson(path.join(workspace, "state", "contacts.json"), contacts);
  writeJson(path.join(workspace, "state", "interactions.json"), interactions);
  writeJsonl(path.join(workspace, "state", "events.jsonl"), events);

  appendRunLog(workspace, {
    run_id: runId("ingest", now),
    timestamp: now,
    pack: "lead-gen",
    command: "ingest",
    input_files: ["inputs/targets.csv", "inputs/contacts.csv", "inputs/previous_interactions.md"],
    output_files: ["state/accounts.json", "state/evidence.json", "state/contacts.json", "state/interactions.json", "state/events.jsonl"],
    status: "completed",
    warnings: accounts.filter((account) => account.confidence === "low").map((account) => `${account.id} has low confidence`),
    errors: []
  });

  console.log(`Ingested ${accounts.length} accounts, ${contacts.length} contacts, ${interactions.length} interactions, and ${evidence.length} evidence items.`);
}

function generateBriefs(workspace, now) {
  ensureWorkspaceDirs(workspace);
  const accounts = readJson(path.join(workspace, "state", "accounts.json"));
  const evidence = readJson(path.join(workspace, "state", "evidence.json"));
  const contacts = readJson(path.join(workspace, "state", "contacts.json"), []);
  const events = readEvents(workspace);
  const outputFiles = [];

  for (const account of accounts) {
    const accountEvidence = evidence.filter((item) => item.account_id === account.id);
    const accountContacts = contacts.filter((contact) => contact.account_id === account.id);
    const brief = renderLeadBrief(account, accountEvidence, accountContacts, now);
    const briefPath = path.join(workspace, "outputs", "lead-briefs", `${account.id}.md`);
    fs.writeFileSync(briefPath, brief);
    outputFiles.push(relative(workspace, briefPath));
    events.push(eventFor("account", account.id, "lead_brief_generated", now, {
      output_file: relative(workspace, briefPath),
      evidence_count: accountEvidence.length
    }));
  }

  writeJsonl(path.join(workspace, "state", "events.jsonl"), events);
  appendRunLog(workspace, {
    run_id: runId("briefs", now),
    timestamp: now,
    pack: "lead-gen",
    command: "generate-briefs",
    input_files: ["state/accounts.json", "state/evidence.json", "state/contacts.json"],
    output_files: outputFiles,
    status: "completed",
    warnings: accounts.filter((account) => account.missing_information.length > 0).map((account) => `${account.id} has missing information`),
    errors: []
  });

  console.log(`Generated ${outputFiles.length} lead briefs.`);
}

function generateDrafts(workspace, now) {
  ensureWorkspaceDirs(workspace);
  const accounts = readJson(path.join(workspace, "state", "accounts.json"));
  const evidence = readJson(path.join(workspace, "state", "evidence.json"));
  const contacts = readJson(path.join(workspace, "state", "contacts.json"), []);
  const interactions = readJson(path.join(workspace, "state", "interactions.json"), []);
  const events = readEvents(workspace);
  const drafts = [];
  const skipped = [];

  for (const account of accounts) {
    if (account.disqualifiers.length > 0 || account.fit_score < 50) {
      skipped.push(`${account.id} skipped because it is disqualified or below draft threshold`);
      continue;
    }

    const accountEvidence = evidence.filter((item) => item.account_id === account.id);
    const accountContacts = contacts.filter((contact) => contact.account_id === account.id);
    const interaction = interactions.find((item) => item.account_id === account.id);
    const draft = buildDraft(account, accountEvidence, accountContacts, interaction, now);
    drafts.push(draft);
    const draftPath = path.join(workspace, "outputs", "drafts", `${draft.id}.md`);
    fs.writeFileSync(draftPath, renderDraft(account, draft, accountEvidence, accountContacts));
    events.push(eventFor("draft", draft.id, "draft_generated_needs_review", now, {
      account_id: account.id,
      output_file: relative(workspace, draftPath)
    }));
  }

  writeJson(path.join(workspace, "state", "drafts.json"), drafts);
  writeJsonl(path.join(workspace, "state", "events.jsonl"), events);
  appendRunLog(workspace, {
    run_id: runId("drafts", now),
    timestamp: now,
    pack: "follow-ups",
    command: "generate-drafts",
    input_files: ["state/accounts.json", "state/evidence.json", "state/contacts.json", "state/interactions.json", "outputs/lead-briefs/*.md"],
    output_files: ["state/drafts.json", ...drafts.map((draft) => `outputs/drafts/${draft.id}.md`)],
    status: "completed",
    warnings: skipped,
    errors: []
  });

  console.log(`Generated ${drafts.length} drafts. Skipped ${skipped.length} accounts.`);
}

function reviewAccount(workspace, flags, now) {
  ensureWorkspaceDirs(workspace);
  const accountId = requireFlag(flags, "account");
  const status = requireFlag(flags, "status");
  if (!ACCOUNT_REVIEW_STATUSES.includes(status)) {
    throw new Error(`Invalid account status ${status}. Use one of: ${ACCOUNT_REVIEW_STATUSES.join(", ")}`);
  }

  const accountsPath = path.join(workspace, "state", "accounts.json");
  const accounts = readJson(accountsPath);
  const account = accounts.find((item) => item.id === accountId);
  if (!account) throw new Error(`Unknown account: ${accountId}`);
  if (status === "approved" && account.disqualifiers.length > 0) {
    throw new Error(`${accountId} has disqualifiers and cannot be approved without changing source state.`);
  }

  account.status = status;
  account.updated_at = now;
  account.review_note = flags.note ?? "";
  writeJson(accountsPath, accounts);

  const events = readEvents(workspace);
  events.push(eventFor("account", account.id, `account_${status}`, now, {
    note: flags.note ?? ""
  }));
  writeJsonl(path.join(workspace, "state", "events.jsonl"), events);

  appendRunLog(workspace, {
    run_id: runId(`review_account_${account.id}`, now),
    timestamp: now,
    pack: "lead-gen",
    command: "review-account",
    input_files: ["state/accounts.json"],
    output_files: ["state/accounts.json", "state/events.jsonl"],
    status: "completed",
    warnings: [],
    errors: []
  });

  regenerateLeadBrief(workspace, account, now);
  console.log(`Updated ${account.id} to ${status}.`);
}

function reviewDraft(workspace, flags, now) {
  ensureWorkspaceDirs(workspace);
  const draftId = requireFlag(flags, "draft");
  const status = requireFlag(flags, "status");
  if (!DRAFT_REVIEW_STATUSES.includes(status)) {
    throw new Error(`Invalid draft status ${status}. Use one of: ${DRAFT_REVIEW_STATUSES.join(", ")}`);
  }

  const draftsPath = path.join(workspace, "state", "drafts.json");
  const drafts = readJson(draftsPath);
  const draft = drafts.find((item) => item.id === draftId);
  if (!draft) throw new Error(`Unknown draft: ${draftId}`);
  if (draft.status === "superseded") {
    throw new Error(`${draftId} is superseded; review the active revision instead.`);
  }

  const accounts = readJson(path.join(workspace, "state", "accounts.json"));
  const account = accounts.find((item) => item.id === draft.account_id);
  if (!account) throw new Error(`Draft ${draftId} references unknown account ${draft.account_id}`);
  if (status === "approved" && account.status !== "approved") {
    throw new Error(`${draftId} cannot be approved until account ${account.id} is approved.`);
  }

  draft.status = status;
  draft.updated_at = now;
  draft.review_note = flags.note ?? "";
  writeJson(draftsPath, drafts);

  const events = readEvents(workspace);
  events.push(eventFor("draft", draft.id, `draft_${status}`, now, {
    account_id: draft.account_id,
    note: flags.note ?? ""
  }));
  writeJsonl(path.join(workspace, "state", "events.jsonl"), events);

  appendRunLog(workspace, {
    run_id: runId(`review_draft_${draft.id}`, now),
    timestamp: now,
    pack: "follow-ups",
    command: "review-draft",
    input_files: ["state/drafts.json", "state/accounts.json"],
    output_files: ["state/drafts.json", "state/events.jsonl", `outputs/drafts/${draft.id}.md`],
    status: "completed",
    warnings: [],
    errors: []
  });

  regenerateDraft(workspace, account, draft);
  console.log(`Updated ${draft.id} to ${status}.`);
}

function reviseDraft(workspace, flags, now) {
  ensureWorkspaceDirs(workspace);
  const draftId = requireFlag(flags, "draft");
  const changes = requireFlag(flags, "changes");
  const draftsPath = path.join(workspace, "state", "drafts.json");
  const drafts = readJson(draftsPath);
  const original = drafts.find((item) => item.id === draftId);
  if (!original) throw new Error(`Unknown draft: ${draftId}`);
  if (original.status !== "edited") {
    throw new Error(`${draftId} must be edited before it can be revised.`);
  }
  if (drafts.some((item) => item.revision_of === original.id)) {
    throw new Error(`${draftId} already has a revision. Review that revision before creating another.`);
  }

  const accounts = readJson(path.join(workspace, "state", "accounts.json"));
  const account = accounts.find((item) => item.id === original.account_id);
  if (!account) throw new Error(`Draft ${draftId} references unknown account ${original.account_id}`);

  original.status = "superseded";
  original.updated_at = now;
  original.superseded_at = now;
  const revisionNumber = nextRevisionNumber(original, drafts);
  const revised = {
    ...original,
    id: `${original.id}_rev${revisionNumber}`,
    body: reviseDraftBody(original.body, changes),
    status: "needs_review",
    review_note: flags.note ?? `Revision ${revisionNumber} created from ${original.id}.`,
    revision_of: original.id,
    revision_number: revisionNumber,
    revision_changes: changes,
    superseded_at: undefined,
    created_at: now,
    updated_at: now
  };
  delete revised.superseded_at;
  drafts.push(revised);
  writeJson(draftsPath, drafts);

  const events = readEvents(workspace);
  events.push(eventFor("draft", original.id, "draft_superseded_by_revision", now, {
    account_id: original.account_id,
    revision_id: revised.id,
    changes
  }));
  events.push(eventFor("draft", revised.id, "draft_revision_created_needs_review", now, {
    account_id: revised.account_id,
    revision_of: original.id,
    changes
  }));
  writeJsonl(path.join(workspace, "state", "events.jsonl"), events);

  appendRunLog(workspace, {
    run_id: runId(`revise_draft_${original.id}`, now),
    timestamp: now,
    pack: "follow-ups",
    command: "revise-draft",
    input_files: ["state/drafts.json", "state/accounts.json"],
    output_files: ["state/drafts.json", "state/events.jsonl", `outputs/drafts/${original.id}.md`, `outputs/drafts/${revised.id}.md`],
    status: "completed",
    warnings: [],
    errors: []
  });

  regenerateDraft(workspace, account, original);
  regenerateDraft(workspace, account, revised);
  console.log(`Created revision ${revised.id} from ${original.id}.`);
}

function recordOutcome(workspace, flags, now) {
  ensureWorkspaceDirs(workspace);
  const draftId = requireFlag(flags, "draft");
  const manualStatus = requireFlag(flags, "status");
  if (!OUTCOME_STATUSES.includes(manualStatus)) {
    throw new Error(`Invalid outcome status ${manualStatus}. Use one of: ${OUTCOME_STATUSES.join(", ")}`);
  }

  const drafts = readJson(path.join(workspace, "state", "drafts.json"));
  const draft = drafts.find((item) => item.id === draftId);
  if (!draft) throw new Error(`Unknown draft: ${draftId}`);
  if (draft.status === "superseded") {
    throw new Error(`${draftId} is superseded; record outcomes against the active revision.`);
  }
  if (["sent_manual", "replied", "meeting_booked"].includes(manualStatus) && draft.status !== "approved") {
    throw new Error(`${draftId} must be approved before recording ${manualStatus}.`);
  }

  const outcomesPath = path.join(workspace, "inputs", "outcomes.csv");
  const outcomes = readOutcomes(workspace).filter((outcome) => outcome.draft_id !== draftId);
  outcomes.push({
    draft_id: draftId,
    account_id: draft.account_id,
    manual_status: manualStatus,
    sent_at: flags["sent-at"] ?? "",
    reply_at: flags["reply-at"] ?? "",
    meeting_at: flags["meeting-at"] ?? "",
    notes: flags.note ?? ""
  });
  writeOutcomes(outcomesPath, outcomes);

  const events = readEvents(workspace);
  events.push(eventFor("draft", draft.id, `outcome_${manualStatus}`, now, {
    account_id: draft.account_id,
    sent_at: flags["sent-at"] ?? "",
    reply_at: flags["reply-at"] ?? "",
    meeting_at: flags["meeting-at"] ?? "",
    note: flags.note ?? ""
  }));
  writeJsonl(path.join(workspace, "state", "events.jsonl"), events);

  appendRunLog(workspace, {
    run_id: runId(`record_outcome_${draft.id}`, now),
    timestamp: now,
    pack: "analytics",
    command: "record-outcome",
    input_files: ["state/drafts.json"],
    output_files: ["inputs/outcomes.csv", "state/events.jsonl"],
    status: "completed",
    warnings: [],
    errors: []
  });

  console.log(`Recorded ${manualStatus} for ${draft.id}.`);
}

function generateReport(workspace, now) {
  ensureWorkspaceDirs(workspace);
  const accounts = readJson(path.join(workspace, "state", "accounts.json"));
  const drafts = readJson(path.join(workspace, "state", "drafts.json"), []);
  const contacts = readJson(path.join(workspace, "state", "contacts.json"), []);
  const interactions = readJson(path.join(workspace, "state", "interactions.json"), []);
  const outcomes = readOutcomes(workspace);
  const events = readEvents(workspace);
  events.push(eventFor("report", "weekly-pipeline-report", "analytics_report_generated", now, {
    output_file: "outputs/reports/weekly-pipeline-report.md",
    metrics_file: "outputs/reports/metrics.csv"
  }));
  const metrics = buildMetrics(accounts, drafts, events, outcomes, contacts, interactions);
  const reportPath = path.join(workspace, "outputs", "reports", "weekly-pipeline-report.md");
  const metricsPath = path.join(workspace, "outputs", "reports", "metrics.csv");

  fs.writeFileSync(reportPath, renderReport(metrics, accounts, drafts, outcomes, now));
  fs.writeFileSync(metricsPath, renderMetricsCsv(metrics));

  writeJsonl(path.join(workspace, "state", "events.jsonl"), events);

  appendRunLog(workspace, {
    run_id: runId("report", now),
    timestamp: now,
    pack: "analytics",
    command: "report",
    input_files: ["state/accounts.json", "state/drafts.json", "state/contacts.json", "state/interactions.json", "state/events.jsonl", "inputs/outcomes.csv"],
    output_files: ["outputs/reports/weekly-pipeline-report.md", "outputs/reports/metrics.csv"],
    status: "completed",
    warnings: metrics.warnings,
    errors: []
  });

  console.log(`Generated analytics report: ${relative(workspace, reportPath)}`);
}

function validateWorkspace(workspace) {
  ensureWorkspaceDirs(workspace);
  const requiredFiles = [
    "inputs/targets.csv",
    "config/icp.md",
    "state/accounts.json",
    "state/evidence.json",
    "state/contacts.json",
    "state/interactions.json",
    "state/drafts.json",
    "state/events.jsonl",
    "logs/runs.jsonl",
    "outputs/reports/weekly-pipeline-report.md",
    "outputs/reports/metrics.csv"
  ];
  const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(workspace, file)));
  if (missing.length > 0) {
    throw new Error(`Workspace is incomplete. Missing: ${missing.join(", ")}`);
  }

  const accounts = readJson(path.join(workspace, "state", "accounts.json"));
  const evidence = readJson(path.join(workspace, "state", "evidence.json"));
  const contacts = readJson(path.join(workspace, "state", "contacts.json"), []);
  const interactions = readJson(path.join(workspace, "state", "interactions.json"), []);
  const drafts = readJson(path.join(workspace, "state", "drafts.json"));
  const outcomes = readOutcomes(workspace);
  const events = readEvents(workspace);
  const errors = [];

  for (const account of accounts) {
    if (!account.id || !account.name || !account.website) errors.push(`Invalid account record: ${JSON.stringify(account)}`);
    if (!["needs_review", "approved", "rejected", "needs_more_info", "new", "researching"].includes(account.status)) errors.push(`${account.id} has invalid status ${account.status}`);
    const evidenceCount = evidence.filter((item) => item.account_id === account.id).length;
    if (evidenceCount < 3) errors.push(`${account.id} has fewer than three evidence items`);
    const briefPath = path.join(workspace, "outputs", "lead-briefs", `${account.id}.md`);
    if (!fs.existsSync(briefPath)) errors.push(`${account.id} is missing a lead brief`);
  }

  for (const contact of contacts) {
    if (!contact.account_id || !accounts.some((account) => account.id === contact.account_id)) errors.push(`Contact references unknown account ${contact.account_id}`);
    if (!contact.name || !contact.role) errors.push(`Invalid contact record: ${JSON.stringify(contact)}`);
    if (!["low", "medium", "high"].includes(contact.confidence)) errors.push(`Contact ${contact.name} has invalid confidence ${contact.confidence}`);
  }

  for (const interaction of interactions) {
    if (!interaction.account_id || !accounts.some((account) => account.id === interaction.account_id)) errors.push(`Interaction references unknown account ${interaction.account_id}`);
    if (!DRAFT_TYPES.includes(interaction.draft_type)) errors.push(`Interaction ${interaction.account_id} has invalid draft_type ${interaction.draft_type}`);
    if (!interaction.summary || !interaction.next_action) errors.push(`Interaction ${interaction.account_id} is missing summary or next_action`);
  }

  for (const draft of drafts) {
    if (!["needs_review", "approved", "edited", "rejected", "superseded"].includes(draft.status)) errors.push(`${draft.id} has invalid status ${draft.status}`);
    if (draft.status === "sent_external") errors.push(`${draft.id} uses forbidden MVP status sent_external`);
    if (draft.evidence_ids.length === 0) errors.push(`${draft.id} has no evidence references`);
    const account = accounts.find((item) => item.id === draft.account_id);
    if (draft.status === "approved" && account?.status !== "approved") errors.push(`${draft.id} is approved but account ${draft.account_id} is not approved`);
    if (draft.status === "superseded" && !drafts.some((item) => item.revision_of === draft.id)) errors.push(`${draft.id} is superseded but has no revision`);
    if (draft.revision_of && !drafts.some((item) => item.id === draft.revision_of)) errors.push(`${draft.id} references unknown revision parent ${draft.revision_of}`);
  }

  for (const outcome of outcomes) {
    const draft = drafts.find((item) => item.id === outcome.draft_id);
    if (!draft) errors.push(`outcomes.csv references unknown draft ${outcome.draft_id}`);
    if (draft?.status === "superseded") errors.push(`outcomes.csv references superseded draft ${outcome.draft_id}`);
    if (outcome.account_id && !accounts.some((item) => item.id === outcome.account_id)) errors.push(`outcomes.csv references unknown account ${outcome.account_id}`);
    if (["sent_manual", "replied", "meeting_booked"].includes(outcome.manual_status) && draft?.status !== "approved") {
      errors.push(`outcome ${outcome.draft_id} has ${outcome.manual_status} but draft is not approved`);
    }
  }

  if (events.length === 0) errors.push("events.jsonl has no audit events");
  if (errors.length > 0) throw new Error(`Validation failed:\n- ${errors.join("\n- ")}`);

  console.log(`Validation passed: ${accounts.length} accounts, ${contacts.length} contacts, ${interactions.length} interactions, ${evidence.length} evidence items, ${drafts.length} drafts, ${outcomes.length} outcomes, ${events.length} events.`);
}

function regenerateLeadBrief(workspace, account, now) {
  const evidence = readJson(path.join(workspace, "state", "evidence.json"));
  const contacts = readJson(path.join(workspace, "state", "contacts.json"), []);
  const accountEvidence = evidence.filter((item) => item.account_id === account.id);
  const accountContacts = contacts.filter((contact) => contact.account_id === account.id);
  const briefPath = path.join(workspace, "outputs", "lead-briefs", `${account.id}.md`);
  fs.writeFileSync(briefPath, renderLeadBrief(account, accountEvidence, accountContacts, now));
}

function regenerateDraft(workspace, account, draft) {
  const evidence = readJson(path.join(workspace, "state", "evidence.json"));
  const contacts = readJson(path.join(workspace, "state", "contacts.json"), []);
  const accountEvidence = evidence.filter((item) => item.account_id === account.id);
  const accountContacts = contacts.filter((contact) => contact.account_id === account.id);
  const draftPath = path.join(workspace, "outputs", "drafts", `${draft.id}.md`);
  fs.writeFileSync(draftPath, renderDraft(account, draft, accountEvidence, accountContacts));
}

function ensureWorkspaceDirs(workspace) {
  for (const dir of WORKSPACE_DIRS) {
    fs.mkdirSync(path.join(workspace, dir), { recursive: true });
  }
}

function resetGeneratedWorkspaceFiles(workspace) {
  for (const generatedDir of ["outputs", "state", "logs"]) {
    fs.rmSync(path.join(workspace, generatedDir), { recursive: true, force: true });
  }
  fs.rmSync(path.join(workspace, "inputs", "outcomes.csv"), { force: true });
}

function writeFileIfAllowed(filePath, body, preserveExisting) {
  if (preserveExisting && fs.existsSync(filePath)) return;
  fs.writeFileSync(filePath, body);
}

function validateTargetRows(rows) {
  if (rows.length === 0) throw new Error("targets.csv has no rows");
  const columns = Object.keys(rows[0]);
  const missing = REQUIRED_TARGET_COLUMNS.filter((column) => !columns.includes(column));
  if (missing.length > 0) throw new Error(`targets.csv is missing columns: ${missing.join(", ")}`);

  rows.forEach((row, index) => {
    for (const column of REQUIRED_TARGET_COLUMNS) {
      if (!row[column]?.trim()) {
        throw new Error(`targets.csv row ${index + 2} is missing ${column}`);
      }
    }
  });
}

function validateContactRows(rows) {
  if (rows.length === 0) return;
  const columns = Object.keys(rows[0]);
  const missing = REQUIRED_CONTACT_COLUMNS.filter((column) => !columns.includes(column));
  if (missing.length > 0) throw new Error(`contacts.csv is missing columns: ${missing.join(", ")}`);

  rows.forEach((row, index) => {
    for (const column of REQUIRED_CONTACT_COLUMNS) {
      if (!row[column]?.trim()) throw new Error(`contacts.csv row ${index + 2} is missing ${column}`);
    }
    if (!["low", "medium", "high"].includes(row.confidence)) {
      throw new Error(`contacts.csv row ${index + 2} has invalid confidence ${row.confidence}`);
    }
  });
}

function validateOutcomeRows(rows) {
  if (rows.length === 0) return;
  const columns = Object.keys(rows[0]);
  const missing = REQUIRED_OUTCOME_COLUMNS.filter((column) => !columns.includes(column));
  if (missing.length > 0) throw new Error(`outcomes.csv is missing columns: ${missing.join(", ")}`);

  rows.forEach((row, index) => {
    if (!row.draft_id?.trim()) throw new Error(`outcomes.csv row ${index + 2} is missing draft_id`);
    if (!OUTCOME_STATUSES.includes(row.manual_status)) {
      throw new Error(`outcomes.csv row ${index + 2} has invalid manual_status ${row.manual_status}`);
    }
  });
}

function buildAccount(row, now) {
  const id = `acct_${slug(row.account_name)}`;
  const score_breakdown = scoreTarget(row);
  const fit_score = Object.values(score_breakdown).reduce((sum, value) => sum + value, 0);
  const disqualifiers = detectDisqualifiers(row);
  const accountEvidenceCount = buildEvidence({ id }, row, now).length;
  const confidence = disqualifiers.length > 0 ? "low" : accountEvidenceCount >= 3 && fit_score >= 70 ? "high" : "medium";
  const missing_information = missingInformation(row, disqualifiers);

  return {
    id,
    name: row.account_name.trim(),
    website: row.website.trim(),
    segment: row.segment.trim(),
    source: row.source.trim(),
    notes: row.notes.trim(),
    status: "needs_review",
    fit_score,
    score_breakdown,
    confidence,
    missing_information,
    disqualifiers,
    suggested_angle: suggestedAngle(row, disqualifiers),
    recommended_next_action: disqualifiers.length > 0
      ? "Reject or clarify the use case before drafting any outreach."
      : "Review the lead brief, confirm the buyer/contact, then edit or approve the draft manually.",
    created_at: now,
    updated_at: now
  };
}

function readContactsInput(workspace, now) {
  const filePath = path.join(workspace, "inputs", "contacts.csv");
  if (!fs.existsSync(filePath)) return [];
  const rows = parseCsv(fs.readFileSync(filePath, "utf8"));
  validateContactRows(rows);
  return rows
    .filter((row) => row.account_id)
    .map((row) => ({
      id: `contact_${slug(`${row.account_id}_${row.name}`)}`,
      account_id: row.account_id.trim(),
      name: row.name.trim(),
      role: row.role.trim(),
      context: row.context.trim(),
      source: row.source.trim(),
      confidence: row.confidence.trim(),
      created_at: now,
      updated_at: now
    }));
}

function readPreviousInteractionsInput(workspace, now) {
  const filePath = path.join(workspace, "inputs", "previous_interactions.md");
  if (!fs.existsSync(filePath)) return [];
  const input = fs.readFileSync(filePath, "utf8");
  const sections = input.split(/^##\s+/m).slice(1);
  return sections.map((section) => parseInteractionSection(section, now)).filter(Boolean);
}

function parseInteractionSection(section, now) {
  const lines = section.split(/\r?\n/);
  const accountId = lines.shift()?.trim();
  if (!accountId || accountId.startsWith("Example")) return null;
  const fields = {};
  for (const line of lines) {
    const match = line.match(/^-\s*([a-z_]+):\s*(.*)$/);
    if (match) fields[match[1]] = match[2].trim();
  }
  const draftType = fields.draft_type || "first_touch";
  if (!DRAFT_TYPES.includes(draftType)) {
    throw new Error(`previous_interactions.md section ${accountId} has invalid draft_type ${draftType}`);
  }
  if (!fields.summary || !fields.next_action) {
    throw new Error(`previous_interactions.md section ${accountId} must include summary and next_action`);
  }
  return {
    id: `interaction_${slug(accountId)}`,
    account_id: accountId,
    draft_type: draftType,
    summary: fields.summary,
    last_interaction_at: fields.last_interaction_at || "",
    next_action: fields.next_action,
    source: fields.source || "inputs/previous_interactions.md",
    confidence: fields.confidence || "medium",
    created_at: now,
    updated_at: now
  };
}

function applyContactsToAccounts(accounts, contacts, now) {
  const accountsWithContacts = new Set(contacts.map((contact) => contact.account_id));
  for (const account of accounts) {
    if (!accountsWithContacts.has(account.id)) continue;
    account.missing_information = account.missing_information.filter((item) => item !== "Named buyer or decision-maker");
    account.updated_at = now;
  }
}

function buildEvidence(account, row, now) {
  const accountId = account.id;
  const noteClaims = splitClaims(row.notes).slice(0, 2).map((claim, index) => ({
    id: `ev_${slug(row.account_name)}_note_${index + 1}`,
    account_id: accountId,
    source_type: "operator_note",
    source_url: "inputs/targets.csv",
    claim,
    captured_at: now,
    confidence: "medium"
  }));

  return [
    {
      id: `ev_${slug(row.account_name)}_website`,
      account_id: accountId,
      source_type: "website",
      source_url: row.website.trim(),
      claim: `Website listed for account: ${row.website.trim()}`,
      captured_at: now,
      confidence: "medium"
    },
    {
      id: `ev_${slug(row.account_name)}_segment`,
      account_id: accountId,
      source_type: "target_csv",
      source_url: "inputs/targets.csv",
      claim: `Segment from target list: ${row.segment.trim()}`,
      captured_at: now,
      confidence: "high"
    },
    ...noteClaims,
    {
      id: `ev_${slug(row.account_name)}_source`,
      account_id: accountId,
      source_type: "target_csv",
      source_url: "inputs/targets.csv",
      claim: `Imported from source: ${row.source.trim()}`,
      captured_at: now,
      confidence: "high"
    }
  ];
}

function scoreTarget(row) {
  const haystack = `${row.segment} ${row.notes}`.toLowerCase();
  const disqualified = detectDisqualifiers(row).length > 0;
  const segmentScores = {
    solo_consultant: 30,
    boutique_agency: 28,
    founder_led_b2b: 30,
    professional_services: 24,
    automation_vendor: 5
  };

  return {
    icp_match: disqualified ? 5 : segmentScores[row.segment] ?? 18,
    pain_signal: Math.min(20, keywordScore(haystack, ["spreadsheet", "follow-up", "follow-ups", "follow up", "notes", "analytics", "deadline", "inconsistent"], 4)),
    ability_to_pay: disqualified ? 6 : row.segment === "professional_services" ? 12 : 15,
    reachable_context: row.website && row.source ? 15 : 8,
    timing_signal: Math.min(10, keywordScore(haystack, ["misses", "needs", "deadline", "wants", "inconsistent", "many"], 2)),
    strategic_relevance: disqualified ? 2 : ["solo_consultant", "boutique_agency", "founder_led_b2b"].includes(row.segment) ? 10 : 8
  };
}

function keywordScore(text, keywords, pointsPerHit) {
  let score = 0;
  for (const keyword of keywords) {
    if (text.includes(keyword)) score += pointsPerHit;
  }
  return score;
}

function detectDisqualifiers(row) {
  const haystack = `${row.segment} ${row.notes}`.toLowerCase();
  const disqualifiers = [];
  if (haystack.includes("autonomous") || haystack.includes("high-volume") || haystack.includes("platform automation")) {
    disqualifiers.push("Requests autonomous or high-volume platform automation.");
  }
  if (row.segment === "automation_vendor") {
    disqualifiers.push("Segment conflicts with the supervised, human-approved product boundary.");
  }
  return disqualifiers;
}

function missingInformation(row, disqualifiers) {
  const missing = ["Named buyer or decision-maker", "Recent public proof beyond operator notes"];
  if (!row.notes.toLowerCase().includes("follow")) missing.push("Follow-up trigger or current relationship context");
  if (disqualifiers.length > 0) missing.push("Legitimate supervised use case that does not require risky outbound automation");
  return missing;
}

function suggestedAngle(row, disqualifiers) {
  if (disqualifiers.length > 0) {
    return "Do not position outreach automation. Clarify whether there is a supervised analytics or review workflow worth discussing.";
  }

  const segment = row.segment.replaceAll("_", " ");
  if (row.notes.toLowerCase().includes("analytics")) {
    return `Lead with a local pipeline sprint for ${segment} teams that connects research quality, follow-up review, and weekly analytics.`;
  }
  if (row.notes.toLowerCase().includes("deadline")) {
    return "Lead with a human-reviewed follow-up queue for deadline-sensitive relationship workflows.";
  }
  return `Lead with evidence-backed lead briefs and review-gated drafts for ${segment} operators.`;
}

function buildDraft(account, evidence, contacts, interaction, now) {
  const primaryEvidence = evidence.slice(0, 3);
  const bestPersonalization = primaryEvidence.find((item) => item.source_type === "operator_note") ?? primaryEvidence[1] ?? primaryEvidence[0];
  const primaryContact = selectPrimaryContact(contacts);
  const draftType = interaction?.draft_type ?? "first_touch";
  const risk_flags = [];
  if (account.confidence !== "high") risk_flags.push(`Confidence is ${account.confidence}; operator should verify before sending.`);
  if (account.missing_information.length > 0) risk_flags.push(`Missing: ${account.missing_information.join("; ")}`);
  if (!primaryContact) risk_flags.push("No named buyer/contact in contacts.csv; operator must confirm recipient.");
  if (interaction?.confidence === "low") risk_flags.push("Prior interaction context is low confidence; operator should verify before use.");

  const body = [
    primaryContact ? `Hi ${primaryContact.name.split(/\s+/)[0]},` : "Hi,",
    "",
    openingLineForDraftType(draftType, account, bestPersonalization, interaction),
    primaryContact ? `I am using ${primaryContact.name} (${primaryContact.role}) as the tentative recipient from local contact context: ${primaryContact.context}.` : "",
    interaction ? `Prior context from the workspace: ${interaction.summary}` : "",
    "",
    `${account.suggested_angle}`,
    "",
    askForDraftType(draftType, interaction),
    "",
    questionForDraftType(draftType),
    "",
    "Franklin"
  ].join("\n");

  return {
    id: `draft_${account.id.replace(/^acct_/, "")}_${draftType}`,
    account_id: account.id,
    draft_type: draftType,
    subject_options: subjectOptionsForDraftType(draftType, account),
    body,
    status: "needs_review",
    contact_id: primaryContact?.id ?? "",
    contact_name: primaryContact?.name ?? "",
    contact_role: primaryContact?.role ?? "",
    interaction_id: interaction?.id ?? "",
    interaction_summary: interaction?.summary ?? "",
    evidence_ids: primaryEvidence.map((item) => item.id),
    risk_flags,
    suggested_send_window: "Operator-selected after manual review",
    next_action_if_no_reply: interaction?.next_action ?? "Wait 5 business days, then draft one low-pressure follow-up only if still relevant.",
    created_at: now,
    updated_at: now
  };
}

function openingLineForDraftType(draftType, account, evidence, interaction) {
  if (draftType === "warm_follow_up") return `Following up on prior context for ${account.name}: ${interaction.summary}`;
  if (draftType === "meeting_recap") return `Thanks again for the conversation. I captured this recap context for ${account.name}: ${interaction.summary}`;
  if (draftType === "stale_opportunity_revive") return `I am resurfacing ${account.name} because the workspace shows a stale opportunity: ${interaction.summary}`;
  if (draftType === "referral_request") return `I am using this referral context for ${account.name}: ${interaction.summary}`;
  return `I noticed ${account.name} looks like a fit for a supervised pipeline sprint based on this workspace note: ${evidence?.claim ?? "the target list shows a relevant workflow."}`;
}

function askForDraftType(draftType, interaction) {
  if (draftType === "meeting_recap") return "A useful next step would be to confirm the recap, review the proposed next action, and decide whether a small local sprint is worth testing. Nothing is sent automatically.";
  if (draftType === "stale_opportunity_revive") return "The useful starting point would be a low-pressure check-in that confirms whether the problem is still active before proposing anything. Nothing is sent automatically.";
  if (draftType === "referral_request") return "The useful starting point would be a narrow referral ask with clear context and no pressure. Nothing is sent automatically.";
  if (draftType === "warm_follow_up") return `The useful next step from the local notes is: ${interaction.next_action} Nothing is sent automatically.`;
  return "The useful starting point would be a small, local run: import a target list, generate evidence-backed lead briefs, draft follow-ups for review, and produce a weekly report. Nothing is sent automatically.";
}

function questionForDraftType(draftType) {
  if (draftType === "meeting_recap") return "Does that match your read, and should I turn it into a small next-step plan?";
  if (draftType === "stale_opportunity_revive") return "Is this still worth revisiting, or should I close the loop for now?";
  if (draftType === "referral_request") return "Would one specific introduction be reasonable if the fit looks right?";
  if (draftType === "warm_follow_up") return "Would it be worth taking the next step from here?";
  return "Would it be worth comparing this against your current follow-up process for a few accounts?";
}

function subjectOptionsForDraftType(draftType, account) {
  const options = {
    first_touch: [`Pipeline sprint idea for ${account.name}`, "Evidence-backed follow-up workflow"],
    warm_follow_up: [`Following up on ${account.name}`, "Next step from our notes"],
    meeting_recap: [`Recap and next step for ${account.name}`, "Quick recap"],
    stale_opportunity_revive: [`Still worth revisiting?`, `Reviving ${account.name}`],
    referral_request: [`Specific referral question`, `Referral fit for ${account.name}`]
  };
  return options[draftType] ?? options.first_touch;
}

function selectPrimaryContact(contacts) {
  return contacts.find((contact) => contact.confidence === "high")
    ?? contacts.find((contact) => contact.confidence === "medium")
    ?? contacts[0]
    ?? null;
}

function nextRevisionNumber(original, drafts) {
  const existingRevisions = drafts.filter((draft) => draft.revision_of === original.id);
  return existingRevisions.length + 1;
}

function reviseDraftBody(body, changes) {
  return [
    body,
    "",
    "---",
    "",
    "Operator revision notes:",
    changes,
    "",
    "Revision reminder: verify recipient, proof point, and send context before approving."
  ].join("\n");
}

function buildMetrics(accounts, drafts, events, outcomes = [], contacts = [], interactions = []) {
  const highFitAccounts = accounts.filter((account) => account.fit_score >= 75 && account.disqualifiers.length === 0);
  const approvedAccounts = accounts.filter((account) => account.status === "approved");
  const rejectedAccounts = accounts.filter((account) => account.status === "rejected");
  const sentManual = outcomes.filter((outcome) => ["sent_manual", "replied", "meeting_booked"].includes(outcome.manual_status));
  const replies = outcomes.filter((outcome) => outcome.manual_status === "replied" || outcome.reply_at);
  const meetings = outcomes.filter((outcome) => outcome.manual_status === "meeting_booked" || outcome.meeting_at);
  const staleConversations = outcomes.filter((outcome) => outcome.manual_status === "stale").length;
  const warnings = [];
  if (accounts.length < 10) warnings.push("Tiny fixture sample; do not infer conversion rates.");
  if (outcomes.length === 0) warnings.push("Reply and meeting outcomes are unavailable until inputs/outcomes.csv is populated.");

  return {
    accounts_imported: accounts.length,
    accounts_researched: accounts.length,
    accounts_scored: accounts.length,
    contacts_loaded: contacts.length,
    accounts_with_contacts: new Set(contacts.map((contact) => contact.account_id)).size,
    accounts_without_contacts: Math.max(0, accounts.length - new Set(contacts.map((contact) => contact.account_id)).size),
    contact_coverage_rate: rate(new Set(contacts.map((contact) => contact.account_id)).size, accounts.length),
    interactions_loaded: interactions.length,
    accounts_with_interactions: new Set(interactions.map((interaction) => interaction.account_id)).size,
    interaction_coverage_rate: rate(new Set(interactions.map((interaction) => interaction.account_id)).size, accounts.length),
    draft_type_counts: DRAFT_TYPES.map((type) => ({
      type,
      count: drafts.filter((draft) => draft.draft_type === type).length
    })),
    accounts_approved: approvedAccounts.length,
    accounts_rejected: rejectedAccounts.length,
    average_fit_score: accounts.length === 0 ? 0 : Math.round(accounts.reduce((sum, account) => sum + account.fit_score, 0) / accounts.length),
    high_fit_accounts: highFitAccounts.length,
    drafts_generated: drafts.length,
    drafts_approved: drafts.filter((draft) => draft.status === "approved").length,
    drafts_edited: drafts.filter((draft) => draft.status === "edited").length,
    drafts_rejected: drafts.filter((draft) => draft.status === "rejected").length,
    drafts_superseded: drafts.filter((draft) => draft.status === "superseded").length,
    draft_revisions: drafts.filter((draft) => draft.revision_of).length,
    follow_ups_due: drafts.filter((draft) => draft.status === "needs_review").length,
    manual_sends_recorded: sentManual.length,
    stale_conversations: staleConversations,
    replies: replies.length,
    meetings_booked: meetings.length,
    reply_rate: rate(replies.length, sentManual.length),
    meeting_rate: rate(meetings.length, sentManual.length),
    event_count: events.length,
    warnings
  };
}

function renderLeadBrief(account, evidence, contacts, now) {
  return `# Lead Brief: ${account.name}

Generated: ${now}
Review status: \`${account.status}\`
Review note: ${account.review_note ? account.review_note : "None yet"}

## Account Summary

- Account: ${account.name}
- Website: ${account.website}
- Segment: ${account.segment}
- Source: ${account.source}
- Confidence: ${account.confidence}

${account.notes}

## Fit Score

Total: **${account.fit_score}/100**

| Criterion | Score |
| --- | ---: |
${Object.entries(account.score_breakdown).map(([key, value]) => `| ${humanize(key)} | ${value}/${SCORE_WEIGHTS[key]} |`).join("\n")}

## Fit Rationale

${account.disqualifiers.length > 0
  ? "This account is risky for the MVP because it appears to conflict with Agentic Hub's supervised, human-approved workflow boundary."
  : "This account appears aligned with the MVP because the target data points to relationship-heavy revenue work, scattered context, or follow-up discipline needs."}

## Evidence

${evidence.map((item) => `- [${item.id}] ${item.claim} (${item.source_type}; ${item.source_url}; confidence: ${item.confidence})`).join("\n")}

## Buyer / Contact Context

${contacts.length > 0 ? contacts.map((contact) => `- [${contact.id}] ${contact.name}, ${contact.role}. Context: ${contact.context} (source: ${contact.source}; confidence: ${contact.confidence})`).join("\n") : "- No named buyer/contact provided. Operator must confirm recipient before any draft is used."}

## Missing Information

${account.missing_information.map((item) => `- ${item}`).join("\n")}

## Disqualifiers Checked

${account.disqualifiers.length > 0 ? account.disqualifiers.map((item) => `- ${item}`).join("\n") : "- None found in fixture data."}

## Suggested Outreach Angle

${account.suggested_angle}

## Recommended Next Action

${account.recommended_next_action}

## Approval Gate

This brief is for operator review only. Agentic Hub does not send messages, submit forms, mutate CRM records, or use credentials in the MVP.
`;
}

function renderDraft(account, draft, evidence, contacts = []) {
  const primaryContact = contacts.find((contact) => contact.id === draft.contact_id) ?? selectPrimaryContact(contacts);
  const revisionLines = [
    draft.revision_of ? `Revision of: \`${draft.revision_of}\`` : "",
    draft.revision_of ? `Revision changes: ${draft.revision_changes}` : "",
    draft.superseded_at ? `Superseded at: ${draft.superseded_at}` : ""
  ].filter(Boolean);
  const revisionBlock = revisionLines.length > 0 ? `${revisionLines.join("\n")}\n` : "";
  const contactBlock = primaryContact
    ? `- Contact: ${primaryContact.name}, ${primaryContact.role}\n- Contact context: ${primaryContact.context}\n- Contact source: ${primaryContact.source} (confidence: ${primaryContact.confidence})`
    : "- Contact: Unknown; operator must confirm before use.";
  return `# Follow-Up Draft: ${account.name}

Approval status: \`${draft.status}\`
Draft type: ${draft.draft_type}
Review note: ${draft.review_note ? draft.review_note : "None yet"}
${revisionBlock ? revisionBlock : ""}
## Account / Contact Context

- Account: ${account.name}
- Website: ${account.website}
- Segment: ${account.segment}
${contactBlock}

## Prior Interaction Context

${draft.interaction_summary ? `- Interaction: ${draft.interaction_summary}\n- Interaction source: ${draft.interaction_id || "state/interactions.json"}` : "- No prior interaction context provided; this draft is treated as a first touch."}

## Subject Options

${draft.subject_options.map((subject) => `- ${subject}`).join("\n")}

## Message Draft

${draft.body}

## Personalization Evidence

${evidence.filter((item) => draft.evidence_ids.includes(item.id)).map((item) => `- [${item.id}] ${item.claim}`).join("\n")}

## Risk Flags

${draft.risk_flags.length > 0 ? draft.risk_flags.map((flag) => `- ${flag}`).join("\n") : "- No automated risk flags. Operator review still required."}

## Suggested Send Window

${draft.suggested_send_window}

## Next Action If No Reply

${draft.next_action_if_no_reply}

## Approval Gate

This is a draft only. The MVP has no send action and no external side effects.
`;
}

function renderReport(metrics, accounts, drafts, outcomes, now) {
  const segmentRows = segmentSummary(accounts, drafts, outcomes);
  return `# Weekly Pipeline Report

Generated: ${now}

## Executive Summary

The fixture sprint imported ${metrics.accounts_imported} accounts, generated ${metrics.high_fit_accounts} high-fit lead briefs, and created ${metrics.drafts_generated} follow-up draft records including ${metrics.draft_revisions} revision. Draft review status: ${metrics.drafts_approved} approved for manual use, ${metrics.drafts_edited} edited, ${metrics.drafts_rejected} rejected, ${metrics.drafts_superseded} superseded, and ${metrics.follow_ups_due} still in \`needs_review\`. No outbound sending is implemented.

## Throughput

| Metric | Value |
| --- | ---: |
| Accounts imported | ${metrics.accounts_imported} |
| Accounts researched | ${metrics.accounts_researched} |
| Accounts scored | ${metrics.accounts_scored} |
| Contacts loaded | ${metrics.contacts_loaded} |
| Accounts with contacts | ${metrics.accounts_with_contacts} |
| Contact coverage | ${metrics.contact_coverage_rate} |
| Interactions loaded | ${metrics.interactions_loaded} |
| Accounts with interactions | ${metrics.accounts_with_interactions} |
| Interaction coverage | ${metrics.interaction_coverage_rate} |
| High-fit accounts | ${metrics.high_fit_accounts} |
| Drafts generated | ${metrics.drafts_generated} |
| Accounts approved | ${metrics.accounts_approved} |
| Accounts rejected | ${metrics.accounts_rejected} |
| Drafts approved | ${metrics.drafts_approved} |
| Drafts edited | ${metrics.drafts_edited} |
| Drafts rejected | ${metrics.drafts_rejected} |
| Drafts superseded | ${metrics.drafts_superseded} |
| Draft revisions | ${metrics.draft_revisions} |
| Follow-ups due for review | ${metrics.follow_ups_due} |
| Manual sends recorded | ${metrics.manual_sends_recorded} |
| Replies | ${metrics.replies} |
| Meetings booked | ${metrics.meetings_booked} |
| Audit events | ${metrics.event_count} |

## Lead Quality

- Average fit score: ${metrics.average_fit_score}/100.
- High-fit denominator: accounts with score >= 75 and no disqualifiers.
- Contact coverage: ${metrics.accounts_with_contacts}/${metrics.accounts_imported} accounts have local buyer/contact context.
- Interaction coverage: ${metrics.accounts_with_interactions}/${metrics.accounts_imported} accounts have local prior-interaction context.
- Low-confidence or disqualified accounts should be rejected or clarified before any draft is written.

## Draft Type Mix

| Draft type | Count |
| --- | ---: |
${metrics.draft_type_counts.map((row) => `| ${row.type} | ${row.count} |`).join("\n")}

## Follow-Up Queue Health

- Drafts approved: ${metrics.drafts_approved}
- Drafts edited: ${metrics.drafts_edited}
- Drafts rejected: ${metrics.drafts_rejected}
- Drafts superseded by revisions: ${metrics.drafts_superseded}
- Draft revisions created: ${metrics.draft_revisions}
- Drafts waiting for human review: ${metrics.follow_ups_due}
- Manual sends recorded in outcomes CSV: ${metrics.manual_sends_recorded}
- The MVP intentionally has no send action; outcomes are manually recorded after operator-controlled activity outside Agentic Hub.

## Outcomes

- Replies: ${metrics.replies}
- Meetings booked: ${metrics.meetings_booked}
- Reply rate: ${metrics.reply_rate} of manually recorded sends.
- Meeting rate: ${metrics.meeting_rate} of manually recorded sends.
- Denominator: manually recorded sends in \`inputs/outcomes.csv\`, not automated sends.

## Segment Performance

| Segment | Accounts | Avg score | Drafts | Replies | Meetings |
| --- | ---: | ---: | ---: | ---: | ---: |
${segmentRows.map((row) => `| ${row.segment} | ${row.accounts} | ${row.average_score} | ${row.drafts} | ${row.replies} | ${row.meetings} |`).join("\n")}

## Bottlenecks

${metrics.follow_ups_due > 0 ? `- Drafts needing operator review before manual sending: ${metrics.follow_ups_due}.` : "- No drafts are waiting for first review."}
- Drafts needing edits before approval: ${metrics.drafts_edited}.
- Drafts superseded by revisions: ${metrics.drafts_superseded}.
- Drafts rejected from use without a new review cycle: ${metrics.drafts_rejected}.
- Accounts still missing buyer/contact context: ${metrics.accounts_without_contacts}.

## Recommended Next Actions

1. Review revised drafts before manual use.
2. Add contact names and prior interaction context before using any draft.
3. Keep \`inputs/outcomes.csv\` updated after manually controlled outreach activity.
4. Keep disqualified automation requests out of the pipeline unless the use case becomes supervised and compliant.

## Data Caveats

${metrics.warnings.length > 0 ? metrics.warnings.map((warning) => `- ${warning}`).join("\n") : "- No additional caveats beyond fixture data and manually recorded outcomes."}
`;
}

function renderMetricsCsv(metrics) {
  const rows = [
    ["metric", "value", "denominator", "notes"],
    ["accounts_imported", metrics.accounts_imported, "targets.csv rows", ""],
    ["accounts_researched", metrics.accounts_researched, "accounts imported", "Fixture uses user-provided data only"],
    ["accounts_scored", metrics.accounts_scored, "accounts imported", ""],
    ["contacts_loaded", metrics.contacts_loaded, "inputs/contacts.csv rows", "Local operator-provided context"],
    ["accounts_with_contacts", metrics.accounts_with_contacts, "accounts imported", "Accounts with at least one contact row"],
    ["contact_coverage_rate", metrics.contact_coverage_rate, "accounts imported", "Accounts with contacts divided by accounts imported"],
    ["interactions_loaded", metrics.interactions_loaded, "inputs/previous_interactions.md sections", "Local operator-provided prior context"],
    ["accounts_with_interactions", metrics.accounts_with_interactions, "accounts imported", "Accounts with prior-interaction context"],
    ["interaction_coverage_rate", metrics.interaction_coverage_rate, "accounts imported", "Accounts with interactions divided by accounts imported"],
    ["average_fit_score", metrics.average_fit_score, "accounts scored", "Rounded whole number"],
    ["high_fit_accounts", metrics.high_fit_accounts, "accounts scored", "Score >= 75 and no disqualifiers"],
    ["drafts_generated", metrics.drafts_generated, "eligible accounts", "Disqualified and low-score accounts skipped"],
    ["accounts_approved", metrics.accounts_approved, "accounts imported", "Manual review state"],
    ["accounts_rejected", metrics.accounts_rejected, "accounts imported", "Manual review state"],
    ["drafts_approved", metrics.drafts_approved, "drafts generated", "Manual review state"],
    ["drafts_edited", metrics.drafts_edited, "drafts generated", "Manual review state"],
    ["drafts_rejected", metrics.drafts_rejected, "drafts generated", "Manual review state"],
    ["drafts_superseded", metrics.drafts_superseded, "drafts generated", "Superseded by a revised draft"],
    ["draft_revisions", metrics.draft_revisions, "drafts generated", "Revision records created from edited drafts"],
    ["follow_ups_due", metrics.follow_ups_due, "drafts generated", "Drafts in needs_review"],
    ["manual_sends_recorded", metrics.manual_sends_recorded, "inputs/outcomes.csv rows", "Recorded after manual operator activity outside Agentic Hub"],
    ["stale_conversations", metrics.stale_conversations, "known conversations", "Manual outcome status"],
    ["replies", metrics.replies, "manual sends recorded", "Manual outcome status or reply_at"],
    ["meetings_booked", metrics.meetings_booked, "manual sends recorded", "Manual outcome status or meeting_at"],
    ["reply_rate", metrics.reply_rate, "manual sends recorded", "Replies divided by manual sends recorded"],
    ["meeting_rate", metrics.meeting_rate, "manual sends recorded", "Meetings divided by manual sends recorded"]
  ];

  return rows.map((row) => row.map(csvCell).join(",")).join("\n") + "\n";
}

function segmentSummary(accounts, drafts, outcomes = []) {
  const bySegment = new Map();
  for (const account of accounts) {
    const accountOutcomes = outcomes.filter((outcome) => outcome.account_id === account.id);
    const current = bySegment.get(account.segment) ?? { segment: account.segment, accounts: 0, totalScore: 0, drafts: 0, replies: 0, meetings: 0 };
    current.accounts += 1;
    current.totalScore += account.fit_score;
    current.drafts += drafts.filter((draft) => draft.account_id === account.id).length;
    current.replies += accountOutcomes.filter((outcome) => outcome.manual_status === "replied" || outcome.reply_at).length;
    current.meetings += accountOutcomes.filter((outcome) => outcome.manual_status === "meeting_booked" || outcome.meeting_at).length;
    bySegment.set(account.segment, current);
  }

  return [...bySegment.values()].map((row) => ({
    segment: row.segment,
    accounts: row.accounts,
    average_score: Math.round(row.totalScore / row.accounts),
    drafts: row.drafts,
    replies: row.replies,
    meetings: row.meetings
  }));
}

function workspaceReadme() {
  return `# Agentic Hub Workspace

This local workspace contains inputs, generated artifacts, state, and logs for a supervised pipeline sprint.

Run:

\`\`\`sh
node ../../bin/agentic-hub.mjs run --workspace .
node ../../bin/agentic-hub.mjs review-account --workspace . --account acct_example_consulting_co --status approved --note "Human reviewed."
node ../../bin/agentic-hub.mjs review-draft --workspace . --draft draft_example_consulting_co_first_touch --status approved --note "Human approved."
\`\`\`

No command sends messages, submits forms, uses credentials, or mutates external systems.
`;
}

function starterTargetsCsv() {
  return `account_name,website,segment,notes,source
Example Consulting Co,https://example.com,solo_consultant,"Tracks leads in spreadsheets and wants better follow-up discipline.",manual
`;
}

function starterOutcomesCsv() {
  return `draft_id,account_id,manual_status,sent_at,reply_at,meeting_at,notes
`;
}

function starterContactsCsv() {
  return `account_id,name,role,context,source,confidence
acct_example_consulting_co,Example Buyer,Founder,Operator-provided tentative buyer for local review only,manual,medium
`;
}

function starterPreviousInteractions() {
  return `# Previous Interactions

Add one section per account when prior context exists.

## acct_example_consulting_co
- draft_type: warm_follow_up
- summary: Example prior note for local fixture review.
- last_interaction_at: 2026-06-01
- next_action: Confirm whether a small supervised pipeline sprint is still useful.
- source: manual
- confidence: medium
`;
}

function starterIcp() {
  return `# ICP

Describe ideal customers, disqualifiers, scoring criteria, offer, and tone here.
`;
}

function starterOffer() {
  return `# Offer

Describe the supervised pipeline sprint offer here.
`;
}

function appendRunLog(workspace, entry) {
  fs.mkdirSync(path.join(workspace, "logs"), { recursive: true });
  fs.appendFileSync(path.join(workspace, "logs", "runs.jsonl"), JSON.stringify(entry) + "\n");
}

function requireFlag(flags, name) {
  const value = flags[name];
  if (value === undefined || value === true || String(value).trim() === "") {
    throw new Error(`Missing required --${name}`);
  }
  return String(value).trim();
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
}

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readOutcomes(workspace) {
  const filePath = path.join(workspace, "inputs", "outcomes.csv");
  if (!fs.existsSync(filePath)) return [];
  const rows = parseCsv(fs.readFileSync(filePath, "utf8"));
  validateOutcomeRows(rows);
  return rows.filter((row) => row.draft_id);
}

function writeOutcomes(filePath, outcomes) {
  const rows = [
    REQUIRED_OUTCOME_COLUMNS,
    ...outcomes.map((outcome) => REQUIRED_OUTCOME_COLUMNS.map((column) => outcome[column] ?? ""))
  ];
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, rows.map((row) => row.map(csvCell).join(",")).join("\n") + "\n");
}

function writeJsonl(filePath, events) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, events.map((event) => JSON.stringify(event)).join("\n") + "\n");
}

function readEvents(workspace) {
  const filePath = path.join(workspace, "state", "events.jsonl");
  if (!fs.existsSync(filePath)) return [];
  return fs.readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function eventFor(entity_type, entity_id, event_type, timestamp, metadata = {}) {
  return {
    id: `evt_${slug(`${entity_type}_${entity_id}_${event_type}_${timestamp}`)}`,
    entity_type,
    entity_id,
    event_type,
    timestamp,
    metadata
  };
}

function runId(command, now) {
  return `run_${slug(`${command}_${now}`)}`;
}

function parseCsv(input) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];
    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    if (row.some((value) => value.trim() !== "")) rows.push(row);
  }

  if (rows.length === 0) return [];
  const [headers, ...dataRows] = rows;
  return dataRows.map((values) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header.trim()] = (values[index] ?? "").trim();
    });
    return record;
  });
}

function splitClaims(notes) {
  return notes
    .split(/,\s*/)
    .map((claim) => claim.trim())
    .filter(Boolean)
    .map((claim) => claim.endsWith(".") ? claim : `${claim}.`);
}

function slug(value) {
  return value
    .toLowerCase()
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
}

function humanize(value) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function csvCell(value) {
  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }
  return stringValue;
}

function rate(numerator, denominator) {
  if (denominator === 0) return "unavailable";
  return `${Math.round((numerator / denominator) * 100)}%`;
}


function relative(workspace, filePath) {
  return path.relative(workspace, filePath);
}

main();
