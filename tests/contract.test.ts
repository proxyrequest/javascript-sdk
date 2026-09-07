import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { excludedOperations } from "../scripts/sdk-schema.js";
import { createResourceCollection } from "../src/generated/resources.js";

const root = resolve(import.meta.dirname, "..");

describe("generated SDK contract", () => {
  it("covers the pinned public contract except explicitly excluded sessions", async () => {
    const schema = parse(await readFile(resolve(root, "openapi/openapi.yaml"), "utf8")) as {
      paths: Record<string, Record<string, { operationId?: string; tags?: string[] }>>;
      components: { schemas: Record<string, unknown> };
    };
    const configuration = parse(
      await readFile(resolve(root, "openapi/operations.yaml"), "utf8"),
    ) as {
      operations: Record<string, string>;
      resources: Record<string, { attribute: string }>;
    };
    const operationIds = Object.values(schema.paths)
      .flatMap((item) => Object.values(item))
      .map((operation) => operation.operationId)
      .filter((value): value is string => value !== undefined);
    const client = {
      async _call<Result>(): Promise<Result> {
        return undefined as Result;
      },
      async _callWithResponse<Result>() {
        return {
          data: undefined as Result,
          statusCode: 200,
          headers: {},
          idempotencyReplayed: false,
        };
      },
    };

    expect(new Set(operationIds).size).toBe(operationIds.length);
    const supported = operationIds.filter(
      (id) => !excludedOperations.some((excluded) => excluded === id),
    );
    expect(configuration.resources).not.toHaveProperty("Sessions");
    const bytes = await readFile(resolve(root, "openapi/openapi.yaml"));
    const manifest = JSON.parse(await readFile(resolve(root, "openapi/source.json"), "utf8"));
    expect(manifest.operations).toBe(operationIds.length);
    expect(manifest.schemas).toBe(Object.keys(schema.components.schemas).length);
    expect(manifest.sha256).toBe(createHash("sha256").update(bytes).digest("hex"));
    expect(manifest.excludedOperations).toEqual(excludedOperations);
    const resources = createResourceCollection(client) as unknown as Record<
      string,
      Record<string, unknown>
    >;
    const camelCase = (value: string) =>
      value.replace(/_([a-z])/gu, (_, letter) => letter.toUpperCase());
    expect(Object.keys(resources)).toHaveLength(Object.keys(configuration.resources).length);
    expect(resources).not.toHaveProperty("sessions");
    expect(new Set(supported)).toEqual(new Set(Object.keys(configuration.operations)));
    for (const pathItem of Object.values(schema.paths)) {
      for (const operation of Object.values(pathItem)) {
        if (operation.operationId === undefined || operation.tags?.[0] === undefined) continue;
        if (excludedOperations.some((id) => id === operation.operationId)) continue;
        const resource = configuration.resources[operation.tags[0]];
        const method = configuration.operations[operation.operationId];
        if (resource === undefined || method === undefined) {
          throw new Error(`Missing SDK mapping for ${operation.operationId}`);
        }
        const resourceName = camelCase(resource.attribute);
        const methodName = camelCase(method);
        expect(resources[resourceName]?.[methodName]).toBeTypeOf("function");
        expect(resources[resourceName]?.[`${methodName}WithResponse`]).toBeTypeOf("function");
      }
    }
  });
});
