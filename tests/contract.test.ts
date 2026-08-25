import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { createResourceCollection } from "../src/generated/resources.js";

const root = resolve(import.meta.dirname, "..");

describe("generated SDK contract", () => {
  it("covers all 80 operations, 124 schemas and 18 resources", async () => {
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

    expect(new Set(operationIds).size).toBe(80);
    expect(Object.keys(schema.components.schemas)).toHaveLength(124);
    expect(Object.keys(configuration.operations)).toHaveLength(80);
    expect(Object.keys(configuration.resources)).toHaveLength(18);
    const resources = createResourceCollection(client) as unknown as Record<
      string,
      Record<string, unknown>
    >;
    const camelCase = (value: string) =>
      value.replace(/_([a-z])/gu, (_, letter) => letter.toUpperCase());
    expect(Object.keys(resources)).toHaveLength(18);
    expect(new Set(operationIds)).toEqual(new Set(Object.keys(configuration.operations)));
    for (const pathItem of Object.values(schema.paths)) {
      for (const operation of Object.values(pathItem)) {
        if (operation.operationId === undefined || operation.tags?.[0] === undefined) continue;
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
