// Encrypt / decrypt a file with the Stats Hub password (AES-256-GCM, key from PBKDF2-SHA256).
// Same format as the page reads (static/app.js), using the same Web Crypto API.
//
//   node tools/crypto.mjs encrypt <in> <out>     password from HUB_PASSWORD, or --password-file <file>
//   node tools/crypto.mjs decrypt <in> <out>
//
// File: "SHB1" | iterations (4 bytes) | salt (16) | iv (12) | encrypted gzip of the content
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync, gunzipSync } from "node:zlib";

const MAGIC = "SHB1";
const { subtle } = globalThis.crypto;
const config = JSON.parse(readFileSync(new URL("../cloud/config.json", import.meta.url), "utf8"));

function password() {
  const i = process.argv.indexOf("--password-file");
  if (i > 0) {  // the setup file: the password is its last non-empty line
    return readFileSync(process.argv[i + 1], "utf8").split(/\r?\n/).map(l => l.trim()).filter(Boolean).pop();
  }
  if (!process.env.HUB_PASSWORD) throw new Error("HUB_PASSWORD is missing");
  return process.env.HUB_PASSWORD.trim();
}

async function key(pass, salt, iterations) {
  const base = await subtle.importKey("raw", new TextEncoder().encode(pass), "PBKDF2", false, ["deriveKey"]);
  return subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, base,
    { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

async function encrypt(data) {
  const salt = Buffer.from(config.salt, "base64"), iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const head = Buffer.alloc(8);
  head.write(MAGIC, 0, "ascii");
  head.writeUInt32BE(config.iterations, 4);
  const sealed = await subtle.encrypt({ name: "AES-GCM", iv }, await key(password(), salt, config.iterations), gzipSync(data));
  return Buffer.concat([head, salt, iv, Buffer.from(sealed)]);
}

async function decrypt(file) {
  if (file.subarray(0, 4).toString("ascii") !== MAGIC) throw new Error("not a Stats Hub file");
  const iterations = file.readUInt32BE(4), salt = file.subarray(8, 24), iv = file.subarray(24, 36);
  try {
    return gunzipSync(Buffer.from(await subtle.decrypt({ name: "AES-GCM", iv }, await key(password(), salt, iterations), file.subarray(36))));
  } catch {
    throw new Error("wrong password, or damaged file");
  }
}

const [mode, input, output] = process.argv.slice(2);
if (!["encrypt", "decrypt"].includes(mode) || !input || !output) {
  console.error("usage: node tools/crypto.mjs encrypt|decrypt <in> <out> [--password-file <file>]");
  process.exit(2);
}
try {
  const data = readFileSync(input);
  writeFileSync(output, mode === "encrypt" ? await encrypt(data) : await decrypt(data));
} catch (e) {
  console.error(e.message);  // never the password nor the content
  process.exit(1);
}
