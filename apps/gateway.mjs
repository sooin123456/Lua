import { timingSafeEqual } from "node:crypto";
import { mkdirSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { encryptEnvelope } from "../packages/envelope.mjs";

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
};

const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || "0.0.0.0";
const dbPath = resolve(process.env.GATEWAY_DB_PATH || "./data/gateway.sqlite");
const botToken = required("TELEGRAM_BOT_TOKEN");
const webhookSecret = required("TELEGRAM_WEBHOOK_SECRET");
const allowedUserId = required("TELEGRAM_USER_ID");
const runnerToken = required("RUNNER_TOKEN");
const runnerPublicKey = Buffer.from(required("RUNNER_PUBLIC_KEY_B64"), "base64").toString();
const dryRun = process.env.TELEGRAM_DRY_RUN === "1";

mkdirSync(dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    telegram_update_id TEXT NOT NULL UNIQUE,
    telegram_chat_id TEXT NOT NULL,
    status TEXT NOT NULL,
    payload TEXT NOT NULL,
    lease_until INTEGER,
    result TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
`);

function sameSecret(actual, expected) {
  const a = Buffer.from(actual || "");
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 1_000_000) throw new Error("Request too large");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString() || "{}");
}

function reply(response, status, body) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

async function telegram(method, body) {
  if (dryRun) {
    console.log(JSON.stringify({ telegram: method, body }));
    return;
  }
  const response = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Telegram ${method} failed: ${response.status}`);
}

function authorizedRunner(request) {
  return sameSecret(request.headers.authorization, `Bearer ${runnerToken}`);
}

async function handleTelegram(request, response) {
  if (!sameSecret(request.headers["x-telegram-bot-api-secret-token"], webhookSecret)) {
    return reply(response, 401, { error: "Unauthorized" });
  }

  const update = await readJson(request);
  const message = update.message;
  if (
    !message ||
    message.chat?.type !== "private" ||
    String(message.from?.id) !== allowedUserId
  ) return reply(response, 200, { ok: true });

  const text = message.text || message.caption;
  if (!text) return reply(response, 200, { ok: true });

  const id = `LUA-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${update.update_id}`;
  const now = Date.now();
  const payload = encryptEnvelope(
    Buffer.from(JSON.stringify({ text, receivedAt: new Date(now).toISOString() })),
    runnerPublicKey,
    id,
  );
  const result = db.prepare(`
    INSERT OR IGNORE INTO tasks
      (id, telegram_update_id, telegram_chat_id, status, payload, created_at, updated_at)
    VALUES (?, ?, ?, 'queued', ?, ?, ?)
  `).run(id, String(update.update_id), String(message.chat.id), JSON.stringify(payload), now, now);

  if (result.changes) await telegram("sendMessage", {
    chat_id: message.chat.id,
    text: `접수했습니다.\n작업: ${id}\n상태: 로컬 실행 대기`,
  });
  return reply(response, 200, { ok: true, id });
}

async function claimTask(request, response) {
  if (!authorizedRunner(request)) return reply(response, 401, { error: "Unauthorized" });

  const now = Date.now();
  db.prepare(`
    UPDATE tasks SET status = 'queued', lease_until = NULL, updated_at = ?
    WHERE status = 'claimed' AND lease_until < ?
  `).run(now, now);

  db.exec("BEGIN IMMEDIATE");
  try {
    const task = db.prepare(`
      SELECT id, telegram_chat_id, payload FROM tasks
      WHERE status = 'queued' ORDER BY created_at LIMIT 1
    `).get();
    if (!task) {
      db.exec("COMMIT");
      return reply(response, 200, { task: null });
    }
    db.prepare(`
      UPDATE tasks SET status = 'claimed', lease_until = ?, updated_at = ? WHERE id = ?
    `).run(now + 10 * 60_000, now, task.id);
    db.exec("COMMIT");
    return reply(response, 200, { task });
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

async function completeTask(request, response) {
  if (!authorizedRunner(request)) return reply(response, 401, { error: "Unauthorized" });
  const { id, status, summary } = await readJson(request);
  if (!id || !["completed", "failed"].includes(status) || typeof summary !== "string") {
    return reply(response, 400, { error: "Invalid completion" });
  }

  const task = db.prepare("SELECT telegram_chat_id, status FROM tasks WHERE id = ?").get(id);
  if (!task) return reply(response, 404, { error: "Task not found" });
  if (["completed", "failed"].includes(task.status)) return reply(response, 200, { ok: true });

  db.prepare(`
    UPDATE tasks SET status = ?, result = ?, lease_until = NULL, updated_at = ? WHERE id = ?
  `).run(status, summary.slice(0, 4000), Date.now(), id);

  try {
    await telegram("sendMessage", {
      chat_id: task.telegram_chat_id,
      text: `${status === "completed" ? "완료" : "실패"}: ${id}\n${summary.slice(0, 3500)}`,
    });
  } catch (error) {
    console.error(error);
  }
  return reply(response, 200, { ok: true });
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://localhost");
    if (request.method === "GET" && url.pathname === "/health") {
      return reply(response, 200, { ok: true });
    }
    if (request.method === "POST" && url.pathname === "/telegram/webhook") {
      return await handleTelegram(request, response);
    }
    if (request.method === "POST" && url.pathname === "/runner/claim") {
      return await claimTask(request, response);
    }
    if (request.method === "POST" && url.pathname === "/runner/complete") {
      return await completeTask(request, response);
    }
    return reply(response, 404, { error: "Not found" });
  } catch (error) {
    console.error(error);
    return reply(response, 500, { error: "Internal error" });
  }
});

server.listen(port, host, () => {
  console.log(`Lua Gateway listening on ${server.address().port}`);
});
