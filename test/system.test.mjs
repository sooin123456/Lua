import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import test from "node:test";
import { decryptEnvelope, encryptEnvelope } from "../packages/envelope.mjs";

const keys = () => generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

test("encrypted envelopes round-trip and reject tampering", () => {
  const { publicKey, privateKey } = keys();
  const envelope = encryptEnvelope(Buffer.from("비밀 명령"), publicKey, "task-1");
  assert.equal(decryptEnvelope(envelope, privateKey, "task-1").toString(), "비밀 명령");
  envelope.ciphertext = `${envelope.ciphertext.slice(0, -2)}AA`;
  assert.throws(() => decryptEnvelope(envelope, privateKey, "task-1"));
});

test("Telegram command reaches the local vault", async (context) => {
  const root = mkdtempSync(join(tmpdir(), "lua-main-"));
  context.after(() => rmSync(root, { recursive: true, force: true }));
  const { publicKey, privateKey } = keys();
  const privateKeyPath = join(root, "private.pem");
  writeFileSync(privateKeyPath, privateKey);

  const gateway = spawn(process.execPath, ["apps/gateway.mjs"], {
    cwd: new URL("..", import.meta.url),
    env: {
      ...process.env,
      PORT: "0",
      HOST: "127.0.0.1",
      GATEWAY_DB_PATH: join(root, "gateway.sqlite"),
      TELEGRAM_BOT_TOKEN: "test",
      TELEGRAM_WEBHOOK_SECRET: "webhook-secret",
      TELEGRAM_USER_ID: "42",
      RUNNER_TOKEN: "runner-secret",
      RUNNER_PUBLIC_KEY_B64: Buffer.from(publicKey).toString("base64"),
      TELEGRAM_DRY_RUN: "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  context.after(() => gateway.kill());

  const port = await new Promise((resolve, reject) => {
    let output = "";
    const timeout = setTimeout(() => reject(new Error(`Gateway startup timed out: ${output}`)), 5000);
    gateway.stdout.on("data", (chunk) => {
      output += chunk;
      const match = output.match(/listening on (\d+)/);
      if (match) {
        clearTimeout(timeout);
        resolve(match[1]);
      }
    });
    gateway.stderr.on("data", (chunk) => { output += chunk; });
    gateway.once("error", reject);
    gateway.once("exit", (code) => reject(new Error(`Gateway exited ${code}: ${output}`)));
  });

  const response = await fetch(`http://localhost:${port}/telegram/webhook`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-telegram-bot-api-secret-token": "webhook-secret",
    },
    body: JSON.stringify({
      update_id: 1001,
      message: {
        from: { id: 42 },
        chat: { id: 42, type: "private" },
        text: "이 명령을 기억해줘",
      },
    }),
  });
  assert.equal(response.status, 200);

  const runner = spawn(process.execPath, ["apps/runner.mjs", "--once"], {
    cwd: new URL("..", import.meta.url),
    env: {
      ...process.env,
      GATEWAY_URL: `http://localhost:${port}`,
      RUNNER_TOKEN: "runner-secret",
      RUNNER_PRIVATE_KEY_PATH: privateKeyPath,
      VAULT_PATH: root,
    },
  });
  assert.equal(await new Promise((resolve) => runner.once("exit", resolve)), 0);
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const note = readFileSync(join(root, `01_Inbox/Commands/LUA-${date}-1001.md`), "utf8");
  assert.match(note, /이 명령을 기억해줘/);
});
