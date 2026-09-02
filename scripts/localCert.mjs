/* Certificate for the local HTTPS preview: mkcert when available (trusted by
 * the OS), otherwise an openssl self-signed cert that follows Apple's TLS
 * requirements (RSA 2048, SHA-256, SAN, serverAuth, <= 825 days) so it can be
 * trusted in Keychain if desired. Written to .certs/ (git-ignored). */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = fileURLToPath(new URL("../.certs", import.meta.url));
const CERT = join(DIR, "localhost.pem");
const KEY = join(DIR, "localhost-key.pem");

function hasMkcert() {
  try {
    execFileSync("mkcert", ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function generate() {
  mkdirSync(DIR, { recursive: true });
  if (hasMkcert()) {
    execFileSync(
      "mkcert",
      ["-cert-file", CERT, "-key-file", KEY, "localhost", "127.0.0.1", "::1"],
      {
        stdio: "inherit",
      },
    );
    return;
  }
  execFileSync(
    "openssl",
    [
      "req",
      "-x509",
      "-newkey",
      "rsa:2048",
      "-sha256",
      "-nodes",
      "-days",
      "365",
      "-keyout",
      KEY,
      "-out",
      CERT,
      "-subj",
      "/CN=localhost",
      "-addext",
      "subjectAltName=DNS:localhost,IP:127.0.0.1,IP:0:0:0:0:0:0:0:1",
      "-addext",
      "extendedKeyUsage=serverAuth",
      "-addext",
      "keyUsage=digitalSignature,keyEncipherment",
    ],
    { stdio: "ignore" },
  );
}

/** @returns {{ cert: Buffer, key: Buffer }} */
export function ensureLocalCert() {
  if (!existsSync(CERT) || !existsSync(KEY)) generate();
  return { cert: readFileSync(CERT), key: readFileSync(KEY) };
}

/** The certificate authority a client must trust to validate the preview
 * server properly (instead of disabling validation): mkcert's root CA when
 * the cert came from mkcert, otherwise the self-signed cert itself.
 * @returns {Buffer} */
export function localTrustAnchor() {
  const { cert } = ensureLocalCert();
  if (!hasMkcert()) return cert;
  const caRoot = execFileSync("mkcert", ["-CAROOT"], { encoding: "utf8" }).trim();
  const rootCa = join(caRoot, "rootCA.pem");
  return existsSync(rootCa) ? readFileSync(rootCa) : cert;
}
