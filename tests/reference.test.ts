import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");

describe("generated SDK reference", () => {
  it("covers every public resource operation with valid examples", async () => {
    const manifest = JSON.parse(
      await readFile(resolve(root, "docs/reference/sdk-reference.json"), "utf8"),
    ) as {
      schemaVersion: number;
      sdk: { version: string; openapi: { operations: number; excludedOperations: string[] } };
      setup: Array<{ code: string }>;
      resources: Array<{
        methods: Array<{
          operationId: string;
          example: { code: string };
          parameters: Array<{ type: string; modelRefs: string[] }>;
          body: { type: string; modelRefs: string[] } | null;
          returns: { type: string; modelRefs: string[] };
          throws: Array<{ type: string; conditions: Array<{ kind: string }> }>;
        }>;
      }>;
      models: Array<{
        name: string;
        fields: Array<{ type: string; modelRefs: string[] }>;
      }>;
    };
    const methods = manifest.resources.flatMap((resource) => resource.methods);
    expect(manifest.schemaVersion).toBe(3);
    expect(manifest.sdk.version).toBe("4.0.0");
    expect(methods).toHaveLength(
      manifest.sdk.openapi.operations - manifest.sdk.openapi.excludedOperations.length,
    );
    expect(new Set(methods.map((method) => method.operationId)).size).toBe(methods.length);
    expect(manifest.models.length).toBeGreaterThan(100);
    const modelNames = new Set(manifest.models.map((model) => model.name));
    for (const method of methods) {
      expect(method.returns.type).toBeTruthy();
      expect(method.throws[0]?.type).toBe("ApiError");
      expect(method.throws[0]?.conditions.length).toBeGreaterThan(1);
      for (const typed of [
        ...method.parameters,
        ...(method.body ? [method.body] : []),
        method.returns,
      ]) {
        expect(typed.modelRefs.every((name) => modelNames.has(name))).toBe(true);
      }
    }
    for (const model of manifest.models) {
      for (const field of model.fields) {
        expect(field.modelRefs.every((name) => modelNames.has(name))).toBe(true);
      }
    }
    expect(
      methods.find((method) => method.operationId === "settings_retrieve")?.returns.modelRefs,
    ).toContain("SettingsResponse");
    expect(
      manifest.models.find((model) => model.name === "InvoiceRead")?.fields.length,
    ).toBeGreaterThan(0);
    for (const code of [
      ...manifest.setup.map((setup) => setup.code),
      ...methods.map((method) => method.example.code),
    ]) {
      const result = ts.transpileModule(code, {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
        reportDiagnostics: true,
      });
      expect(result.diagnostics ?? []).toEqual([]);
    }
  });
});
