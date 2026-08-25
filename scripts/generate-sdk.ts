import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parse } from "yaml";

const root = resolve(import.meta.dirname, "..");
const schema = parse(
  await readFile(resolve(root, "openapi/openapi.yaml"), "utf8"),
) as OpenApiSchema;
const configuration = parse(
  await readFile(resolve(root, "openapi/operations.yaml"), "utf8"),
) as GeneratorConfiguration;

const operationLookup = collectOperations(schema);
const configuredIds = new Set(Object.keys(configuration.operations));
const schemaIds = new Set(operationLookup.keys());
const missingMappings = [...schemaIds].filter((id) => !configuredIds.has(id));
const unknownMappings = [...configuredIds].filter((id) => !schemaIds.has(id));
if (missingMappings.length > 0 || unknownMappings.length > 0) {
  throw new Error(
    `Operation mapping is out of sync. Missing: ${missingMappings.join(", ") || "none"}; unknown: ${unknownMappings.join(", ") || "none"}.`,
  );
}

const resources = new Map<string, ResourceDefinition>();
for (const [tag, value] of Object.entries(configuration.resources)) {
  resources.set(tag, {
    tag,
    attribute: camelCase(value.attribute),
    className: value.class_name,
    operations: [],
  });
}

for (const [operationId, configuredMethod] of Object.entries(configuration.operations)) {
  const operation = operationLookup.get(operationId);
  if (operation === undefined) throw new Error(`OpenAPI operation ${operationId} was not found.`);
  const tag = operation.operation.tags?.[0];
  const resource = tag === undefined ? undefined : resources.get(tag);
  if (resource === undefined) {
    throw new Error(`Operation ${operationId} uses unmapped tag ${tag ?? "<none>"}.`);
  }
  resource.operations.push({
    ...operation,
    methodName: camelCase(configuredMethod),
    parameters: operation.parameters.map((parameter) => resolveParameter(schema, parameter)),
  });
}

for (const resource of resources.values()) {
  if (resource.operations.length === 0)
    throw new Error(`Resource ${resource.tag} has no operations.`);
}

await writeFile(
  resolve(root, "src/generated/resources.ts"),
  renderResources([...resources.values()]),
);
await writeFile(resolve(root, "src/generated/models.ts"), renderModels(schema));

interface GeneratorConfiguration {
  resources: Record<string, { attribute: string; class_name: string }>;
  operations: Record<string, string>;
}

interface OpenApiSchema {
  paths: Record<string, OpenApiPathItem>;
  components?: {
    schemas?: Record<string, unknown>;
    parameters?: Record<string, OpenApiParameter>;
  };
}

interface OpenApiPathItem {
  parameters?: Array<OpenApiParameter | Reference>;
  get?: OpenApiOperation;
  post?: OpenApiOperation;
  put?: OpenApiOperation;
  patch?: OpenApiOperation;
  delete?: OpenApiOperation;
}

interface OpenApiOperation {
  operationId: string;
  tags?: string[];
  summary?: string;
  description?: string;
  parameters?: Array<OpenApiParameter | Reference>;
  requestBody?: { required?: boolean } | Reference;
  responses: Record<string, unknown>;
}

interface OpenApiParameter {
  name: string;
  in: "path" | "query" | "header" | "cookie";
  required?: boolean;
}

interface Reference {
  $ref: string;
}

interface CollectedOperation {
  operationId: string;
  httpMethod: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  operation: OpenApiOperation;
  parameters: Array<OpenApiParameter | Reference>;
  hasBody: boolean;
  bodyRequired: boolean;
  binary: boolean;
}

interface GeneratedOperation extends Omit<CollectedOperation, "parameters"> {
  methodName: string;
  parameters: OpenApiParameter[];
}

interface ResourceDefinition {
  tag: string;
  attribute: string;
  className: string;
  operations: GeneratedOperation[];
}

function collectOperations(schemaValue: OpenApiSchema): Map<string, CollectedOperation> {
  const result = new Map<string, CollectedOperation>();
  const methods = ["get", "post", "put", "patch", "delete"] as const;
  for (const [path, item] of Object.entries(schemaValue.paths)) {
    for (const method of methods) {
      const operation = item[method];
      if (operation === undefined) continue;
      if (!operation.operationId)
        throw new Error(`${method.toUpperCase()} ${path} has no operationId.`);
      if (result.has(operation.operationId)) {
        throw new Error(`Duplicate operationId ${operation.operationId}.`);
      }
      result.set(operation.operationId, {
        operationId: operation.operationId,
        httpMethod: method.toUpperCase() as CollectedOperation["httpMethod"],
        path,
        operation,
        parameters: [...(item.parameters ?? []), ...(operation.parameters ?? [])],
        hasBody: operation.requestBody !== undefined,
        bodyRequired:
          operation.requestBody !== undefined && !("$ref" in operation.requestBody)
            ? operation.requestBody.required === true
            : operation.requestBody !== undefined,
        binary: Object.values(operation.responses).some((response) =>
          JSON.stringify(response).includes("application/pdf"),
        ),
      });
    }
  }
  return result;
}

function resolveParameter(
  schemaValue: OpenApiSchema,
  parameter: OpenApiParameter | Reference,
): OpenApiParameter {
  if (!("$ref" in parameter)) return parameter;
  const prefix = "#/components/parameters/";
  if (!parameter.$ref.startsWith(prefix)) {
    throw new Error(`Unsupported parameter reference ${parameter.$ref}.`);
  }
  const name = parameter.$ref.slice(prefix.length);
  const resolved = schemaValue.components?.parameters?.[name];
  if (resolved === undefined)
    throw new Error(`Parameter reference ${parameter.$ref} was not found.`);
  return resolved;
}

function renderResources(resourceValues: ResourceDefinition[]): string {
  const sections = resourceValues.map(renderResource).join("\n\n");
  const collection = resourceValues
    .map((resource) => `  readonly ${resource.attribute}: ${resource.className};`)
    .join("\n");
  const factory = resourceValues
    .map((resource) => `    ${resource.attribute}: new ${resource.className}(client),`)
    .join("\n");
  return `/** This file is generated from openapi/openapi.yaml. Do not edit manually. */

import type { FileDownload } from "../files.js";
import type {
  ApiResponse,
  OperationBody,
  OperationParameter,
  OperationResult,
  RequestControls,
  ResourceClient,
} from "../internal.js";
import type { operations } from "./schema.js";

${sections}

export interface ResourceCollection {
${collection}
}

export function createResourceCollection(client: ResourceClient): ResourceCollection {
  return {
${factory}
  };
}
`;
}

function renderResource(resource: ResourceDefinition): string {
  const optionTypes = resource.operations.map((operation) => renderOptions(resource, operation));
  const methods = resource.operations.map((operation) => renderMethod(resource, operation));
  return `${optionTypes.join("\n\n")}

export class ${resource.className} {
  readonly #client: ResourceClient;

  constructor(client: ResourceClient) {
    this.#client = client;
  }

${methods.join("\n\n")}
}`;
}

function renderOptions(resource: ResourceDefinition, operation: GeneratedOperation): string {
  const typeName = optionTypeName(resource, operation);
  const names = publicParameterNames(operation.parameters);
  const properties = operation.parameters.map((parameter, index) => {
    const publicName = names[index];
    const optional = parameter.required === true || parameter.in === "path" ? "" : "?";
    return `  ${publicName}${optional}: OperationParameter<operations[${quote(operation.operationId)}], ${quote(parameter.in)}, ${quote(parameter.name)}>;`;
  });
  if (operation.hasBody) {
    properties.push(
      `  body${operation.bodyRequired ? "" : "?"}: OperationBody<operations[${quote(operation.operationId)}]>;`,
    );
  }
  properties.push("  request?: RequestControls;");
  const responseName = responseTypeName(resource, operation);
  const resultType = operation.binary
    ? "FileDownload"
    : `OperationResult<operations[${quote(operation.operationId)}]>`;
  return `export interface ${typeName} {
${properties.join("\n")}
}

export type ${responseName} = ${resultType};`;
}

function renderMethod(resource: ResourceDefinition, operation: GeneratedOperation): string {
  const optionsName = optionTypeName(resource, operation);
  const responseName = responseTypeName(resource, operation);
  const names = publicParameterNames(operation.parameters);
  const isRequired =
    operation.bodyRequired ||
    operation.parameters.some(
      (parameter) => parameter.required === true || parameter.in === "path",
    );
  const sections: string[] = [];
  for (const location of ["path", "query", "header"] as const) {
    const entries = operation.parameters
      .map((parameter, index) => ({ parameter, publicName: names[index] }))
      .filter(({ parameter }) => parameter.in === location)
      .map(({ parameter, publicName }) => `      ${quote(parameter.name)}: options.${publicName},`);
    if (entries.length > 0)
      sections.push(
        `    ${location === "header" ? "headers" : location}: {\n${entries.join("\n")}\n    },`,
      );
  }
  if (operation.hasBody) {
    sections.push(
      operation.bodyRequired
        ? "    body: options.body,"
        : "    ...(options.body === undefined ? {} : { body: options.body }),",
    );
  }
  sections.push("    ...(options.request === undefined ? {} : { request: options.request }),");
  const summary = sanitizeComment(
    operation.operation.summary ?? operation.operation.description ?? operation.operationId,
  );
  const idempotent = operation.parameters.some(
    (parameter) => parameter.in === "header" && parameter.name === "Idempotency-Key",
  );
  return `  /** ${summary} */
  async ${operation.methodName}(options: ${optionsName}${isRequired ? "" : " = {}"}): Promise<${responseName}> {
    return (await this.${operation.methodName}WithResponse(options)).data;
  }

  /** ${summary}; include response metadata. */
  async ${operation.methodName}WithResponse(options: ${optionsName}${isRequired ? "" : " = {}"}): Promise<ApiResponse<${responseName}>> {
    return this.#client._callWithResponse<${responseName}>({
      operationId: ${quote(operation.operationId)},
      method: ${quote(operation.httpMethod)},
      path: ${quote(operation.path)},${operation.binary ? "\n      binary: true," : ""}${idempotent ? "\n      idempotent: true," : ""}
    }, {
${sections.join("\n")}
    });
  }`;
}

function renderModels(schemaValue: OpenApiSchema): string {
  const schemas = Object.keys(schemaValue.components?.schemas ?? {}).sort((left, right) =>
    left.localeCompare(right),
  );
  const aliases = schemas.map(
    (name) => `export type ${safeTypeName(name)} = components["schemas"][${quote(name)}];`,
  );
  return `/** This file is generated from openapi/openapi.yaml. Do not edit manually. */
import type { components } from "./schema.js";

${aliases.join("\n")}
`;
}

function publicParameterNames(parameters: OpenApiParameter[]): string[] {
  const bases = parameters.map((parameter) => {
    if (parameter.name.toLowerCase() === "x-proxyrequest-telegram-secret") return "serviceSecret";
    return camelCase(parameter.name);
  });
  return bases.map((base, index) => {
    const duplicates = bases.filter((candidate) => candidate === base).length;
    if (duplicates <= 1) return base;
    return `${base}${pascalCase(parameters[index]?.in ?? "parameter")}`;
  });
}

function optionTypeName(resource: ResourceDefinition, operation: GeneratedOperation): string {
  return `${resource.className.replace(/Resource$/u, "")}${pascalCase(operation.methodName)}Options`;
}

function responseTypeName(resource: ResourceDefinition, operation: GeneratedOperation): string {
  return `${resource.className.replace(/Resource$/u, "")}${pascalCase(operation.methodName)}Response`;
}

function camelCase(value: string): string {
  const words = value
    .replace(/([a-z\d])([A-Z])/gu, "$1 $2")
    .split(/[^A-Za-z\d]+/u)
    .filter(Boolean);
  if (words.length === 0) return "value";
  return `${words[0]?.toLowerCase()}${words
    .slice(1)
    .map((word) => `${word[0]?.toUpperCase()}${word.slice(1).toLowerCase()}`)
    .join("")}`;
}

function pascalCase(value: string): string {
  const camel = camelCase(value);
  return `${camel[0]?.toUpperCase()}${camel.slice(1)}`;
}

function safeTypeName(value: string): string {
  const result = value.replace(/[^A-Za-z\d_$]/gu, "_");
  return /^[$A-Z_a-z]/u.test(result) ? result : `_${result}`;
}

function quote(value: string): string {
  return JSON.stringify(value);
}

function sanitizeComment(value: string): string {
  return value.replaceAll("*/", "*\\/").replace(/\s+/gu, " ").trim();
}
