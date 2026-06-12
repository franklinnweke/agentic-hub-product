#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const workspace = path.resolve(process.argv[2] ?? "examples/sample-workspace");
const failures = [];

const accounts = readJson("state/accounts.json");
const evidence = readJson("state/evidence.json");
const contacts = readJson("state/contacts.json");
const research = readCsv("inputs/research.csv");
const interactions = readJson("state/interactions.json");
const drafts = readJson("state/drafts.json");
const outcomes = readCsv("inputs/outcomes.csv");
const report = readText("outputs/reports/weekly-pipeline-report.md");
const qualityReport = readText("outputs/evals/quality-report.md");
const qualityScores = readCsv("outputs/evals/quality-scores.csv");
const operatorConsole = readText("outputs/console/index.html");
const screenshotPath = path.join(workspace, "outputs/screenshots/operator-console.jpg");
const handoffManifest = readJson("outputs/handoff/manifest.json");
const handoffReadme = readText("outputs/handoff/README.md");
const sanitizedManifest = readJson("outputs/sanitized/manifest.json");
const sanitizedReadme = readText("outputs/sanitized/README.md");
const sanitizedNorthstarBrief = readText("outputs/sanitized/lead-briefs/acct_01.md");

expect(accounts.length >= 25, "fixture should include at least 25 accounts");
expect(contacts.length >= 10, "fixture should include at least 10 local contact records");
expect(research.length >= 10, "fixture should include at least 10 manually captured research rows");
expect(interactions.length >= 6, "fixture should include at least 6 local previous-interaction records");
expect(evidence.length >= accounts.length * 3, "fixture should average at least three evidence records per account");
expect(evidence.some((item) => item.source_type === "approved_public_source"), "fixture should include approved public-source evidence");
expect(evidence.some((item) => item.source_type === "manual_research"), "fixture should include manual research evidence");
expect(drafts.length >= 20, "fixture should include at least 20 review-gated drafts");
expect(drafts.some((draft) => draft.status === "approved"), "fixture should include an approved draft");
expect(drafts.some((draft) => draft.status === "edited"), "fixture should include an edited draft");
expect(drafts.some((draft) => draft.status === "rejected"), "fixture should include a rejected draft");
expect(drafts.some((draft) => draft.status === "superseded"), "fixture should include a superseded draft after revision");
expect(drafts.some((draft) => draft.revision_of && draft.status === "needs_review"), "fixture should include an active revised draft needing review");
expect(drafts.every((draft) => draft.status !== "sent_external"), "fixture must not use sent_external status");
expect(accounts.some((account) => account.status === "rejected" && account.disqualifiers.length > 0), "fixture should reject a disqualified account");
expect(outcomes.some((outcome) => outcome.manual_status === "meeting_booked"), "fixture should include one manually recorded meeting outcome");
expect(drafts.some((draft) => draft.contact_name && draft.contact_role), "fixture should include drafts with local contact context");
for (const draftType of ["warm_follow_up", "meeting_recap", "stale_opportunity_revive", "referral_request"]) {
  expect(drafts.some((draft) => draft.draft_type === draftType), `fixture should include a ${draftType} draft`);
}
expect(drafts.some((draft) => draft.interaction_id && draft.interaction_summary), "fixture should include drafts with prior interaction context");
expect(report.includes("Contact coverage"), "report should include contact coverage");
expect(report.includes("Interaction coverage"), "report should include interaction coverage");
expect(report.includes("## Draft Type Mix"), "report should include draft type mix");
expect(report.includes("No outbound sending is implemented"), "report should state that outbound sending is not implemented");
expect(report.includes("Denominator: manually recorded sends"), "report should name the outcome denominator");
expect(!report.includes("autonomously sent"), "report should not imply autonomous sending");
expect(qualityReport.includes("Workflow Quality Evaluation"), "quality eval should include a report heading");
expect(qualityReport.includes("Scores are readiness indicators for human review"), "quality eval should preserve human review framing");
expect(qualityScores.length >= accounts.length + drafts.length, "quality scores CSV should include account and draft rows");
expect(qualityScores.some((row) => row.type === "account" && Number(row.score) >= 70), "quality scores should include reviewable account rows");
expect(qualityScores.some((row) => row.type === "draft" && Number(row.score) >= 75), "quality scores should include reviewable draft rows");
expect(operatorConsole.includes("Agentic Hub Operator Console"), "operator console should render the product surface");
expect(operatorConsole.includes("No send command"), "operator console should state the no-send boundary");
expect(operatorConsole.includes("workspace-data"), "operator console should embed local workspace data for file-based inspection");
expect(fs.existsSync(screenshotPath), "fixture should include an operator console screenshot");
if (fs.existsSync(screenshotPath)) {
  expect(fs.statSync(screenshotPath).size > 100_000, "operator console screenshot should be a real rendered image artifact");
}
expect(handoffReadme.includes("Agentic Hub Handoff Bundle"), "handoff bundle should include a README");
expect(handoffManifest.included_files.includes("reports/weekly-pipeline-report.md"), "handoff manifest should include the weekly report");
expect(handoffManifest.included_files.includes("evals/quality-report.md"), "handoff manifest should include the quality report");
expect(handoffManifest.included_files.includes("evals/quality-scores.csv"), "handoff manifest should include quality scores");
expect(handoffManifest.included_files.includes("console/index.html"), "handoff manifest should include the static console");
expect(handoffManifest.included_files.includes("screenshots/operator-console.jpg"), "handoff manifest should include the console screenshot");
expect(!handoffManifest.included_files.some((file) => file.startsWith("inputs/") || file.startsWith("state/") || file.startsWith("logs/")), "handoff manifest must not include raw inputs, state, or logs by default");
expect(!fs.existsSync(path.join(workspace, "outputs/handoff/state")), "handoff bundle must not include raw state");
expect(!fs.existsSync(path.join(workspace, "outputs/handoff/logs")), "handoff bundle must not include run logs");
expect(sanitizedReadme.includes("Agentic Hub Sanitized Proof Bundle"), "sanitized bundle should include a README");
expect(sanitizedManifest.included_files.includes("reports/weekly-pipeline-report.md"), "sanitized manifest should include the weekly report");
expect(sanitizedManifest.included_files.includes("evals/quality-report.md"), "sanitized manifest should include the quality report");
expect(!sanitizedManifest.included_files.some((file) => file.startsWith("inputs/") || file.startsWith("state/") || file.startsWith("logs/") || file.startsWith("console/") || file.startsWith("screenshots/")), "sanitized manifest must not include raw internals, console, or screenshots");
expect(!fs.existsSync(path.join(workspace, "outputs/sanitized/state")), "sanitized bundle must not include raw state");
expect(!fs.existsSync(path.join(workspace, "outputs/sanitized/logs")), "sanitized bundle must not include run logs");
expect(!fs.existsSync(path.join(workspace, "outputs/sanitized/console")), "sanitized bundle must not include console HTML");
expect(!sanitizedNorthstarBrief.includes("Northstar Ops Studio"), "sanitized proof should redact account names");
expect(sanitizedNorthstarBrief.includes("Account 01"), "sanitized proof should include stable account placeholders");

if (failures.length > 0) {
  console.error("Fixture quality eval failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Fixture quality eval passed for ${workspace}`);

function expect(condition, message) {
  if (!condition) failures.push(message);
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(workspace, relativePath), "utf8");
}

function readCsv(relativePath) {
  const input = readText(relativePath).trim();
  if (!input) return [];
  const [headerLine, ...lines] = input.split(/\r?\n/);
  const headers = headerLine.split(",");
  return lines.map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function parseCsvLine(line) {
  const values = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(cell);
      cell = "";
    } else {
      cell += char;
    }
  }

  values.push(cell);
  return values;
}
