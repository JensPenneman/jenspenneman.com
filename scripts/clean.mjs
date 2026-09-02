/* Removes out/ so every export starts from nothing (a failed or older build
 * must never leave stale files in the deployed directory). */
import { rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

rmSync(fileURLToPath(new URL("../out", import.meta.url)), { recursive: true, force: true });
