#!/usr/bin/env node
const http = require("http");

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || "0.0.0.0";
const GITHUB_OWNER = process.env.GITHUB_OWNER || "sooin123456";
const GITHUB_REPO = process.env.GITHUB_REPO || "Lua";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || "";

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function extractMessage(update) {
  const msg = update.message || update.edited_message;
  if (!msg) return "";
  if (typeof msg.text === "string") return msg.text;
  if (typeof msg.caption === "string") return msg.caption;
  return "";
}

async function dispatchToGitHub(text, source) {
  const payload = JSON.stringify({
    event_type: "telegram-message",
    client_payload: {
      text,
      source
    }
  });

  const response = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/dispatches`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json"
    },
    body: payload
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`GitHub dispatch failed: ${response.status} ${errText}`);
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url === "/health") {
      return sendJson(res, 200, { ok: true });
    }

    if (req.method !== "POST" || req.url !== "/telegram") {
      return sendJson(res, 404, { error: "Not found" });
    }

    if (TELEGRAM_WEBHOOK_SECRET) {
      const secretHeader = req.headers["x-telegram-bot-api-secret-token"];
      if (secretHeader !== TELEGRAM_WEBHOOK_SECRET) {
        return sendJson(res, 401, { error: "Invalid webhook secret" });
      }
    }

    if (!GITHUB_TOKEN) {
      return sendJson(res, 500, { error: "Missing GITHUB_TOKEN" });
    }

    const update = await parseJsonBody(req);
    const text = extractMessage(update).trim();
    if (!text) {
      return sendJson(res, 200, { ok: true, skipped: "No text/caption" });
    }

    await dispatchToGitHub(text, "telegram-webhook");
    return sendJson(res, 200, { ok: true, forwarded: true });
  } catch (err) {
    return sendJson(res, 500, { error: String(err.message || err) });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`telegram_webhook_bridge listening on http://${HOST}:${PORT}`);
});
