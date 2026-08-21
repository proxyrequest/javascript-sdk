import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";

const root = resolve(import.meta.dirname, "..");
const types = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
]);

createServer(async (request, response) => {
  const pathname = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
  if (pathname === "/health") {
    response.writeHead(200, { "content-type": "text/plain" });
    response.end("ok");
    return;
  }
  const relative = pathname === "/" ? "tests/browser/fixture.html" : pathname.slice(1);
  const filename = resolve(root, relative);
  if (filename !== root && !filename.startsWith(`${root}${sep}`)) {
    response.writeHead(403).end();
    return;
  }
  try {
    const metadata = await stat(filename);
    if (!metadata.isFile()) throw new Error("not a file");
    response.writeHead(200, {
      "content-type": types.get(extname(filename)) ?? "application/octet-stream",
      "cache-control": "no-store",
    });
    createReadStream(filename).pipe(response);
  } catch {
    response.writeHead(404).end();
  }
}).listen(4178, "127.0.0.1");
