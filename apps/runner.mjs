import { readFileSync, mkdirSync, renameSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { decryptEnvelope } from "../packages/envelope.mjs";

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
};

const gatewayUrl = required("GATEWAY_URL").replace(/\/$/, "");
const runnerToken = required("RUNNER_TOKEN");
const privateKey = readFileSync(required("RUNNER_PRIVATE_KEY_PATH"), "utf8");
const vaultPath = resolve(process.env.VAULT_PATH || ".");
const pollMs = Number(process.env.POLL_MS || 5000);
const once = process.argv.includes("--once");

async function gateway(path, body = {}) {
  const response = await fetch(`${gatewayUrl}${path}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${runnerToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Gateway ${path} failed: ${response.status}`);
  return response.json();
}

function saveCommand(task, payload) {
  const folder = join(vaultPath, "01_Inbox", "Commands");
  mkdirSync(folder, { recursive: true });
  const filename = `${task.id}.md`;
  const path = join(folder, filename);
  const temporary = `${path}.tmp`;
  const content = `---
type: lua-command
id: ${JSON.stringify(task.id)}
status: completed
source: telegram
received: ${JSON.stringify(payload.receivedAt)}
---

# 요청

${payload.text}
`;
  writeFileSync(temporary, content, { mode: 0o600 });
  renameSync(temporary, path);
  return basename(filename, ".md");
}

async function runOne() {
  const { task } = await gateway("/runner/claim");
  if (!task) return false;

  try {
    const payload = JSON.parse(
      decryptEnvelope(JSON.parse(task.payload), privateKey, task.id).toString(),
    );
    const note = saveCommand(task, payload);
    await gateway("/runner/complete", {
      id: task.id,
      status: "completed",
      summary: `Obsidian에 명령을 저장했습니다: [[${note}]]`,
    });
  } catch (error) {
    await gateway("/runner/complete", {
      id: task.id,
      status: "failed",
      summary: error.message,
    });
  }
  return true;
}

do {
  try {
    await runOne();
  } catch (error) {
    console.error(error);
  }
  if (!once) await new Promise((resolve) => setTimeout(resolve, pollMs));
} while (!once);

