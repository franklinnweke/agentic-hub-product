#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const workspace = path.resolve(process.argv[2] ?? "examples/sample-workspace");
const failures = [];

const accounts = readJson("state/accounts.json");
const evidence = readJson("state/evidence.json");
const drafts = readJson("state/drafts.json");
const outcomes = readCsv("inputs/outcomes.csv");
const report = readText("outputs/reports/weekly-pipeline-report.md");

expect(accounts.length >= 5, "fixture should include at least five accounts");
expect(evidence.length >= accounts.length * 3, "fixture should average at least three evidence records per account");
expect(drafts.length >= 4, "fixture should include at least four drafts");
expect(drafts.some((draft) => draft.status === "approved"), "fixture should include an approved draft");
expect(drafts.some((draft) => draft.status === "edited"), "fixture should include an edited draft");
expect(drafts.some((draft) => draft.status === "rejected"), "fixture should include a rejected draft");
expect(drafts.every((draft) => draft.status !== "sent_external"), "fixture must not use sent_external status");
expect(accounts.some((account) => account.status === "rejected" && account.disqualifiers.length > 0), "fixture should reject a disqualified account");
expect(outcomes.some((outcome) => outcome.manual_status === "meeting_booked"), "fixture should include one manually recorded meeting outcome");
expect(report.includes("No outbound sending is implemented"), "report should state that outbound sending is not implemented");
expect(report.includes("Denominator: manually recorded sends"), "report should name the outcome denominator");
expect(!report.includes("autonomously sent"), "report should not imply autonomous sending");

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
