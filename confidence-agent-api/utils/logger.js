// utils/logger.js
const fs = require('fs-extra');
const { Parser } = require('json2csv');
const path = require('path');

const logFile = path.join(__dirname, '../logs/query_logs.csv');

const headers = [
  "timestamp",
  "testType",
  "model",
  "prompt",
  "band",
  "tag",
  "output",
  "score",
  "notes"
];

// Init file if doesn't exist
async function initLogFile() {
  if (!(await fs.pathExists(logFile))) {
    const parser = new Parser({ fields: headers });
    const csv = parser.parse([]);
    await fs.writeFile(logFile, csv + "\n");
  }
}

async function logQueryResult(entry) {
  await initLogFile();
  const line = [
    new Date().toISOString(),
    entry.testType || "",
    entry.model || "gpt-3.5-turbo",
    entry.prompt?.replace(/\n/g, ' '),  // No longer trimming large prompts
    entry.band,
    entry.tag,
    entry.responseSummary?.replace(/\n/g, ' '),  // No longer trimming long outputs
    entry.score || "",
    entry.notes || ""
  ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(",");
  
  await fs.appendFile(logFile, line + "\n");
}

module.exports = { logQueryResult };
