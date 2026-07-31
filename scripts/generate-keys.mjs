import { generateKeyPairSync } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const folder = resolve(process.argv[2] || "./local-data/keys");
mkdirSync(folder, { recursive: true });
const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 3072,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

writeFileSync(`${folder}/runner-public.pem`, publicKey, { flag: "wx", mode: 0o644 });
writeFileSync(`${folder}/runner-private.pem`, privateKey, { flag: "wx", mode: 0o600 });
console.log(`Keys created in ${folder}`);
console.log(`RUNNER_PUBLIC_KEY_B64=${Buffer.from(publicKey).toString("base64")}`);

