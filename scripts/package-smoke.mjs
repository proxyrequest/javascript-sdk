import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const packed = JSON.parse(
  execFileSync("npm", ["pack", "--json", "--ignore-scripts"], {
    cwd: root,
    encoding: "utf8",
  }),
)[0];
if (!packed?.filename || !Array.isArray(packed.files))
  throw new Error("npm pack returned no tarball.");
const names = packed.files.map((file) => file.path);
for (const required of [
  "package.json",
  "README.md",
  "LICENSE",
  "dist/index.js",
  "dist/index.cjs",
  "dist/index.d.ts",
]) {
  if (!names.includes(required)) throw new Error(`Published tarball is missing ${required}.`);
}
if (names.some((name) => /^(src|tests|openapi|scripts)\//u.test(name))) {
  throw new Error("Published tarball contains development sources.");
}

const workspace = await mkdtemp(resolve(tmpdir(), "proxyrequest-sdk-smoke-"));
const tarball = resolve(root, packed.filename);
try {
  await writeFile(
    resolve(workspace, "package.json"),
    JSON.stringify({
      private: true,
      type: "module",
      dependencies: { "@proxyrequest/sdk": tarball },
    }),
  );
  execFileSync("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund"], {
    cwd: workspace,
    stdio: "pipe",
  });
  await writeFile(
    resolve(workspace, "esm.mjs"),
    'import { ProxyRequestClient } from "@proxyrequest/sdk"; if (!ProxyRequestClient) process.exit(1);\n',
  );
  await writeFile(
    resolve(workspace, "cjs.cjs"),
    'const { ProxyRequestClient } = require("@proxyrequest/sdk"); if (!ProxyRequestClient) process.exit(1);\n',
  );
  execFileSync(process.execPath, ["esm.mjs"], { cwd: workspace, stdio: "pipe" });
  execFileSync(process.execPath, ["cjs.cjs"], { cwd: workspace, stdio: "pipe" });
  const installed = JSON.parse(
    await readFile(resolve(workspace, "node_modules/@proxyrequest/sdk/package.json"), "utf8"),
  );
  if (installed.version !== "1.0.0")
    throw new Error("Installed package has an unexpected version.");
} finally {
  await rm(workspace, { recursive: true, force: true });
  await rm(tarball, { force: true });
}
