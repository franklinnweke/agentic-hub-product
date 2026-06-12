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
  report            Generate a weekly analytics report from local state
  run               Execute init, ingest, briefs, drafts, report, and validate
  validate          Check the local workspace for MVP completeness and guardrails

Options:
  --workspace PATH   Workspace folder to read/write
  --now ISO_DATE     Fixed timestamp for deterministic fixture runs
  --fresh            With run, clear generated outputs/state/logs before execution
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

  appendRunLog(workspace, {
    run_id: runId("init", now),
    timestamp: now,
    pack: "workspace",
    command: "init",
    input_files: [],
    output_files: ["README.md", "inputs/targets.csv", "config/icp.md", "config/offer.md"],
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

  writeJson(path.join(workspace, "state", "accounts.json"), accounts);
  writeJson(path.join(workspace, "state", "evidence.json"), evidence);
  writeJsonl(path.join(workspace, "state", "events.jsonl"), events);

  appendRunLog(workspace, {
    run_id: runId("ingest", now),
    timestamp: now,
    pack: "lead-gen",
    command: "ingest",
    input_files: ["inputs/targets.csv"],
    output_files: ["state/accounts.json", "state/evidence.json", "state/events.jsonl"],
    status: "completed",
    warnings: accounts.filter((account) => account.confidence === "low").map((account) => `${account.id} has low confidence`),
    errors: []
  });

  console.log(`Ingested ${accounts.length} accounts and ${evidence.length} evidence items.`);
}

function generateBriefs(workspace, now) {
  ensureWorkspaceDirs(workspace);
  const accounts = readJson(path.join(workspace, "state", "accounts.json"));
  const evidence = readJson(path.join(workspace, "state", "evidence.json"));
  const events = readEvents(workspace);
  const outputFiles = [];

  for (const account of accounts) {
    const accountEvidence = evidence.filter((item) => item.account_id === account.id);
    const brief = renderLeadBrief(account, accountEvidence, now);
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
    input_files: ["state/accounts.json", "state/evidence.json"],
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
  const events = readEvents(workspace);
  const drafts = [];
  const skipped = [];

  for (const account of accounts) {
    if (account.disqualifiers.length > 0 || account.fit_score < 50) {
      skipped.push(`${account.id} skipped because it is disqualified or below draft threshold`);
      continue;
    }

    const accountEvidence = evidence.filter((item) => item.account_id === account.id);
    const draft = buildDraft(account, accountEvidence, now);
    drafts.push(draft);
    const draftPath = path.join(workspace, "outputs", "drafts", `${draft.id}.md`);
    fs.writeFileSync(draftPath, renderDraft(account, draft, accountEvidence));
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
    input_files: ["state/accounts.json", "state/evidence.json", "outputs/lead-briefs/*.md"],
    output_files: ["state/drafts.json", ...drafts.map((draft) => `outputs/drafts/${draft.id}.md`)],
    status: "completed",
    warnings: skipped,
    errors: []
  });

  console.log(`Generated ${drafts.length} drafts. Skipped ${skipped.length} accounts.`);
}

function generateReport(workspace, now) {
  ensureWorkspaceDirs(workspace);
  const accounts = readJson(path.join(workspace, "state", "accounts.json"));
  const drafts = readJson(path.join(workspace, "state", "drafts.json"), []);
  const events = readEvents(workspace);
  events.push(eventFor("report", "weekly-pipeline-report", "analytics_report_generated", now, {
    output_file: "outputs/reports/weekly-pipeline-report.md",
    metrics_file: "outputs/reports/metrics.csv"
  }));
  const metrics = buildMetrics(accounts, drafts, events);
  const reportPath = path.join(workspace, "outputs", "reports", "weekly-pipeline-report.md");
  const metricsPath = path.join(workspace, "outputs", "reports", "metrics.csv");

  fs.writeFileSync(reportPath, renderReport(metrics, accounts, drafts, now));
  fs.writeFileSync(metricsPath, renderMetricsCsv(metrics));

  writeJsonl(path.join(workspace, "state", "events.jsonl"), events);

  appendRunLog(workspace, {
    run_id: runId("report", now),
    timestamp: now,
    pack: "analytics",
    command: "report",
    input_files: ["state/accounts.json", "state/drafts.json", "state/events.jsonl"],
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
  const drafts = readJson(path.join(workspace, "state", "drafts.json"));
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

  for (const draft of drafts) {
    if (draft.status !== "needs_review") errors.push(`${draft.id} must start as needs_review`);
    if (draft.status === "sent_external") errors.push(`${draft.id} uses forbidden MVP status sent_external`);
    if (draft.evidence_ids.length === 0) errors.push(`${draft.id} has no evidence references`);
  }

  if (events.length === 0) errors.push("events.jsonl has no audit events");
  if (errors.length > 0) throw new Error(`Validation failed:\n- ${errors.join("\n- ")}`);

  console.log(`Validation passed: ${accounts.length} accounts, ${evidence.length} evidence items, ${drafts.length} drafts, ${events.length} events.`);
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

function buildDraft(account, evidence, now) {
  const primaryEvidence = evidence.slice(0, 3);
  const bestPersonalization = primaryEvidence.find((item) => item.source_type === "operator_note") ?? primaryEvidence[1] ?? primaryEvidence[0];
  const risk_flags = [];
  if (account.confidence !== "high") risk_flags.push(`Confidence is ${account.confidence}; operator should verify before sending.`);
  if (account.missing_information.length > 0) risk_flags.push(`Missing: ${account.missing_information.join("; ")}`);

  const body = [
    "Hi,",
    "",
    `I noticed ${account.name} looks like a fit for a supervised pipeline sprint based on this workspace note: ${bestPersonalization?.claim ?? "the target list shows a relevant workflow."}`,
    "",
    `${account.suggested_angle}`,
    "",
    "The useful starting point would be a small, local run: import a target list, generate evidence-backed lead briefs, draft follow-ups for review, and produce a weekly report. Nothing is sent automatically.",
    "",
    "Would it be worth comparing this against your current follow-up process for a few accounts?",
    "",
    "Franklin"
  ].join("\n");

  return {
    id: `draft_${account.id.replace(/^acct_/, "")}_first_touch`,
    account_id: account.id,
    draft_type: "first_touch",
    subject_options: [
      `Pipeline sprint idea for ${account.name}`,
      "Evidence-backed follow-up workflow"
    ],
    body,
    status: "needs_review",
    evidence_ids: primaryEvidence.map((item) => item.id),
    risk_flags,
    suggested_send_window: "Operator-selected after manual review",
    next_action_if_no_reply: "Wait 5 business days, then draft one low-pressure follow-up only if still relevant.",
    created_at: now,
    updated_at: now
  };
}

function buildMetrics(accounts, drafts, events) {
  const highFitAccounts = accounts.filter((account) => account.fit_score >= 75 && account.disqualifiers.length === 0);
  const approvedAccounts = accounts.filter((account) => account.status === "approved");
  const rejectedAccounts = accounts.filter((account) => account.status === "rejected");
  const warnings = [];
  if (accounts.length < 10) warnings.push("Tiny fixture sample; do not infer conversion rates.");
  if (!events.some((event) => event.event_type.includes("reply"))) warnings.push("Reply and meeting outcomes are unavailable in the local fixture.");

  return {
    accounts_imported: accounts.length,
    accounts_researched: accounts.length,
    accounts_scored: accounts.length,
    accounts_approved: approvedAccounts.length,
    accounts_rejected: rejectedAccounts.length,
    average_fit_score: accounts.length === 0 ? 0 : Math.round(accounts.reduce((sum, account) => sum + account.fit_score, 0) / accounts.length),
    high_fit_accounts: highFitAccounts.length,
    drafts_generated: drafts.length,
    drafts_approved: drafts.filter((draft) => draft.status === "approved").length,
    drafts_rejected: drafts.filter((draft) => draft.status === "rejected").length,
    follow_ups_due: drafts.filter((draft) => draft.status === "needs_review").length,
    stale_conversations: 0,
    replies: "unavailable",
    meetings_booked: "unavailable",
    event_count: events.length,
    warnings
  };
}

function renderLeadBrief(account, evidence, now) {
  return `# Lead Brief: ${account.name}

Generated: ${now}
Review status: \`${account.status}\`

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

function renderDraft(account, draft, evidence) {
  return `# Follow-Up Draft: ${account.name}

Approval status: \`${draft.status}\`
Draft type: ${draft.draft_type}

## Account / Contact Context

- Account: ${account.name}
- Website: ${account.website}
- Segment: ${account.segment}
- Contact: Unknown; operator must confirm before use.

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

function renderReport(metrics, accounts, drafts, now) {
  const segmentRows = segmentSummary(accounts, drafts);
  return `# Weekly Pipeline Report

Generated: ${now}

## Executive Summary

The fixture sprint imported ${metrics.accounts_imported} accounts, generated ${metrics.high_fit_accounts} high-fit lead briefs, and created ${metrics.drafts_generated} follow-up drafts that all remain in \`needs_review\`. No outbound sending is implemented.

## Throughput

| Metric | Value |
| --- | ---: |
| Accounts imported | ${metrics.accounts_imported} |
| Accounts researched | ${metrics.accounts_researched} |
| Accounts scored | ${metrics.accounts_scored} |
| High-fit accounts | ${metrics.high_fit_accounts} |
| Drafts generated | ${metrics.drafts_generated} |
| Follow-ups due for review | ${metrics.follow_ups_due} |
| Audit events | ${metrics.event_count} |

## Lead Quality

- Average fit score: ${metrics.average_fit_score}/100.
- High-fit denominator: accounts with score >= 75 and no disqualifiers.
- Low-confidence or disqualified accounts should be rejected or clarified before any draft is written.

## Follow-Up Queue Health

- Drafts approved: ${metrics.drafts_approved}
- Drafts rejected: ${metrics.drafts_rejected}
- Drafts waiting for human review: ${metrics.follow_ups_due}
- The MVP intentionally has no send action.

## Outcomes

- Replies: unavailable in fixture data.
- Meetings booked: unavailable in fixture data.
- Conversion rates are not calculated because there is no outcome denominator yet.

## Segment Performance

| Segment | Accounts | Avg score | Drafts |
| --- | ---: | ---: | ---: |
${segmentRows.map((row) => `| ${row.segment} | ${row.accounts} | ${row.average_score} | ${row.drafts} |`).join("\n")}

## Bottlenecks

${metrics.follow_ups_due > 0 ? `- ${metrics.follow_ups_due} drafts need operator review before any manual sending.` : "- No drafts are waiting for review."}
- Buyer/contact names are missing from the fixture, so every draft requires manual recipient confirmation.

## Recommended Next Actions

1. Review high-fit briefs first and mark each account as \`approved\`, \`rejected\`, or \`needs_more_info\`.
2. Add contact names and prior interaction context before using any draft.
3. Add manual outcome tracking after messages are sent outside Agentic Hub.
4. Keep disqualified automation requests out of the pipeline unless the use case becomes supervised and compliant.

## Data Caveats

${metrics.warnings.map((warning) => `- ${warning}`).join("\n")}
`;
}

function renderMetricsCsv(metrics) {
  const rows = [
    ["metric", "value", "denominator", "notes"],
    ["accounts_imported", metrics.accounts_imported, "targets.csv rows", ""],
    ["accounts_researched", metrics.accounts_researched, "accounts imported", "Fixture uses user-provided data only"],
    ["accounts_scored", metrics.accounts_scored, "accounts imported", ""],
    ["average_fit_score", metrics.average_fit_score, "accounts scored", "Rounded whole number"],
    ["high_fit_accounts", metrics.high_fit_accounts, "accounts scored", "Score >= 75 and no disqualifiers"],
    ["drafts_generated", metrics.drafts_generated, "eligible accounts", "Disqualified and low-score accounts skipped"],
    ["drafts_approved", metrics.drafts_approved, "drafts generated", "Manual state not changed in fixture"],
    ["drafts_rejected", metrics.drafts_rejected, "drafts generated", "Manual state not changed in fixture"],
    ["follow_ups_due", metrics.follow_ups_due, "drafts generated", "Drafts in needs_review"],
    ["stale_conversations", metrics.stale_conversations, "known conversations", "No prior interaction fixture"],
    ["replies", metrics.replies, "sent messages", "Unavailable because MVP does not send"],
    ["meetings_booked", metrics.meetings_booked, "sent messages", "Unavailable because MVP does not send"]
  ];

  return rows.map((row) => row.map(csvCell).join(",")).join("\n") + "\n";
}

function segmentSummary(accounts, drafts) {
  const bySegment = new Map();
  for (const account of accounts) {
    const current = bySegment.get(account.segment) ?? { segment: account.segment, accounts: 0, totalScore: 0, drafts: 0 };
    current.accounts += 1;
    current.totalScore += account.fit_score;
    current.drafts += drafts.filter((draft) => draft.account_id === account.id).length;
    bySegment.set(account.segment, current);
  }

  return [...bySegment.values()].map((row) => ({
    segment: row.segment,
    accounts: row.accounts,
    average_score: Math.round(row.totalScore / row.accounts),
    drafts: row.drafts
  }));
}

function workspaceReadme() {
  return `# Agentic Hub Workspace

This local workspace contains inputs, generated artifacts, state, and logs for a supervised pipeline sprint.

Run:

\`\`\`sh
node ../../bin/agentic-hub.mjs run --workspace .
\`\`\`

No command sends messages, submits forms, uses credentials, or mutates external systems.
`;
}

function starterTargetsCsv() {
  return `account_name,website,segment,notes,source
Example Consulting Co,https://example.com,solo_consultant,"Tracks leads in spreadsheets and wants better follow-up discipline.",manual
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

function relative(workspace, filePath) {
  return path.relative(workspace, filePath);
}

main();
