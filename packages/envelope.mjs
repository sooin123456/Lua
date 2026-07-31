import {
  constants,
  createCipheriv,
  createDecipheriv,
  privateDecrypt,
  publicEncrypt,
  randomBytes,
} from "node:crypto";

const b64 = (value) => Buffer.from(value).toString("base64");
const unb64 = (value) => Buffer.from(value, "base64");

export function encryptEnvelope(plaintext, publicKey, aad) {
  const key = randomBytes(32);
  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, nonce);
  cipher.setAAD(Buffer.from(aad));
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);

  return {
    version: 1,
    key: b64(publicEncrypt({
      key: publicKey,
      oaepHash: "sha256",
      padding: constants.RSA_PKCS1_OAEP_PADDING,
    }, key)),
    nonce: b64(nonce),
    tag: b64(cipher.getAuthTag()),
    ciphertext: b64(ciphertext),
  };
}

export function decryptEnvelope(envelope, privateKey, aad) {
  if (envelope?.version !== 1) throw new Error("Unsupported envelope version");

  const key = privateDecrypt({
    key: privateKey,
    oaepHash: "sha256",
    padding: constants.RSA_PKCS1_OAEP_PADDING,
  }, unb64(envelope.key));
  const decipher = createDecipheriv("aes-256-gcm", key, unb64(envelope.nonce));
  decipher.setAAD(Buffer.from(aad));
  decipher.setAuthTag(unb64(envelope.tag));
  return Buffer.concat([
    decipher.update(unb64(envelope.ciphertext)),
    decipher.final(),
  ]);
}

