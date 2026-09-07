import { readFile } from "node:fs/promises";
import type { OpenAPI3 } from "openapi-typescript";
import { parse } from "yaml";

export const excludedOperations = ["sessions_destroy", "sessions_list"] as const;
const methods = ["get", "post", "put", "patch", "delete", "head", "options", "trace"] as const;

/** Keep the upstream snapshot intact; exclusions affect generated SDKs only. */
export function sdkSchema(source: OpenAPI3): OpenAPI3 {
  const document = structuredClone(source);
  const seen = new Set<string>();
  for (const [path, item] of Object.entries(document.paths ?? {})) {
    if ("$ref" in item) throw new Error(`Unsupported path reference: ${path}`);
    for (const method of methods) {
      const operation = item[method];
      if (!operation) continue;
      if ("$ref" in operation)
        throw new Error(`Unsupported operation reference: ${method} ${path}`);
      const id = operation.operationId;
      if (!id || seen.has(id)) throw new Error(`Missing or duplicate operationId: ${id}`);
      seen.add(id);
      if (excludedOperations.some((excluded) => excluded === id)) delete item[method];
    }
    if (!methods.some((method) => item[method])) delete document.paths?.[path];
  }
  if (document.tags) document.tags = document.tags.filter((tag) => tag.name !== "Sessions");
  for (const name of Object.keys(document.components?.schemas ?? {})) {
    if (/^Sessions?(List|Delete|Destroy)/u.test(name)) delete document.components?.schemas?.[name];
  }
  return document;
}

export async function loadSdkSchema(): Promise<OpenAPI3> {
  return sdkSchema(
    parse(await readFile(new URL("../openapi/openapi.yaml", import.meta.url), "utf8")) as OpenAPI3,
  );
}
