import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { createResourceCollection } from "../src/generated/resources.js";

const root = resolve(import.meta.dirname, "..");

describe("generated SDK contract", () => {
  it("covers all 82 operations, 127 schemas and 19 resources", async () => {
    const schema = parse(await readFile(resolve(root, "openapi/openapi.yaml"), "utf8")) as {
      paths: Record<string, Record<string, { operationId?: string }>>;
      components: { schemas: Record<string, unknown> };
    };
    const configuration = parse(
      await readFile(resolve(root, "openapi/operations.yaml"), "utf8"),
    ) as { operations: Record<string, string>; resources: Record<string, unknown> };
    const operationIds = Object.values(schema.paths)
      .flatMap((item) => Object.values(item))
      .map((operation) => operation.operationId)
      .filter((value): value is string => value !== undefined);
    const client = {
      async _call<Result>(): Promise<Result> {
        return undefined as Result;
      },
    };

    expect(new Set(operationIds).size).toBe(82);
    expect(Object.keys(schema.components.schemas)).toHaveLength(127);
    expect(Object.keys(configuration.operations)).toHaveLength(82);
    expect(Object.keys(configuration.resources)).toHaveLength(19);
    expect(Object.keys(createResourceCollection(client))).toHaveLength(19);
    expect(new Set(operationIds)).toEqual(new Set(Object.keys(configuration.operations)));
  });
});
