// biome-ignore-all lint/suspicious/noExplicitAny: OpenAPI documents are validated dynamic input.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parse } from "yaml";
import { loadSdkSchema } from "./sdk-schema.js";

type Json = Record<string, any>;

const root = resolve(import.meta.dirname, "..");
const schema = (await loadSdkSchema()) as unknown as Json;
const mapping = parse(await readFile(resolve(root, "openapi/operations.yaml"), "utf8")) as Json;
const pkg = JSON.parse(await readFile(resolve(root, "package.json"), "utf8")) as Json;
const source = JSON.parse(await readFile(resolve(root, "openapi/source.json"), "utf8")) as Json;

const words = (value: string) =>
  value
    .replace(/([a-z\d])([A-Z])/gu, "$1 $2")
    .split(/[^A-Za-z\d]+/u)
    .filter(Boolean);
const camel = (value: string) => {
  const parts = words(value);
  return `${parts[0]?.toLowerCase() ?? "value"}${parts
    .slice(1)
    .map((part) => part[0]?.toUpperCase() + part.slice(1).toLowerCase())
    .join("")}`;
};
const pascal = (value: string) => {
  const valueCamel = camel(value);
  return valueCamel[0]?.toUpperCase() + valueCamel.slice(1);
};
const clean = (value: unknown) =>
  String(value ?? "")
    .replace(/\s+/gu, " ")
    .trim();

function dereference(value: any, section: string): any {
  if (!value?.$ref) return value ?? {};
  const prefix = `#/components/${section}/`;
  if (!value.$ref.startsWith(prefix)) return value;
  return schema.components?.[section]?.[value.$ref.slice(prefix.length)] ?? value;
}

function typeOf(value: any): string {
  if (!value) return "unknown";
  if (value.$ref) return value.$ref.split("/").at(-1) ?? "unknown";
  const variants = value.oneOf ?? value.anyOf ?? value.allOf;
  if (variants) return [...new Set(variants.map(typeOf))].join(" | ");
  if (value.type === "array") return `${typeOf(value.items)}[]`;
  if (value.type === "object" || value.properties) return "Record<string, unknown>";
  if (value.type === "integer" || value.type === "number") return "number";
  if (value.type === "boolean") return "boolean";
  if (value.type === "null") return "null";
  return "string";
}

function materializeModel(value: any, seen = new Set<string>()): any {
  if (!value) return {};
  if (value.$ref) {
    const name = value.$ref.split("/").at(-1) ?? "";
    if (!name || seen.has(name)) return {};
    return materializeModel(schema.components?.schemas?.[name], new Set(seen).add(name));
  }

  const parts = value.allOf ?? value.oneOf ?? value.anyOf ?? [];
  if (!parts.length) return value;
  const resolved = parts.map((part: any) => materializeModel(part, seen));
  const merged = Object.assign({}, ...resolved, value);
  return {
    ...merged,
    properties: Object.assign(
      {},
      ...resolved.map((part: any) => part.properties ?? {}),
      value.properties ?? {},
    ),
    required: [
      ...new Set([
        ...resolved.flatMap((part: any) => part.required ?? []),
        ...(value.required ?? []),
      ]),
    ],
  };
}

function placeholder(name: string, value: any): any {
  if (value?.example !== undefined) return value.example;
  if (value?.default !== undefined) return value.default;
  if (value?.enum?.length) return value.enum[0];
  const lower = name.toLowerCase();
  if (value?.format === "uuid" || lower === "id" || lower.endsWith("_id"))
    return "550e8400-e29b-41d4-a716-446655440000";
  if (value?.format === "date-time" || lower.includes("date")) return "2026-09-21T12:00:00Z";
  if (value?.format === "email" || lower.includes("email")) return "developer@example.com";
  if (lower.includes("password")) return "Correct-Horse-Battery-Staple-42";
  if (lower.includes("language")) return "en";
  if (lower === "data" || lower.endsWith("_bytes")) {
    return value.type === "string" ? "1073741824" : 1073741824;
  }
  if (value?.type === "integer" || value?.type === "number") return value.minimum ?? 1;
  if (value?.type === "boolean") return false;
  if (value?.type === "array") return [];
  return `{${name}}`;
}

function exampleOf(value: any, name = "value", seen = new Set<string>()): any {
  if (!value) return placeholder(name, {});
  if (value.example !== undefined) return value.example;
  if (value.default !== undefined) return value.default;
  if (value.$ref) {
    const model = value.$ref.split("/").at(-1) ?? name;
    if (seen.has(model)) return `{${camel(model)}}`;
    const next = new Set(seen).add(model);
    return exampleOf(schema.components?.schemas?.[model], model, next);
  }
  const variant = (value.oneOf ?? value.anyOf)?.find((item: any) => item.type !== "null");
  if (variant) return exampleOf(variant, name, seen);
  if (value.type === "array") return [exampleOf(value.items, name.replace(/s$/u, ""), seen)];
  if (value.type === "object" || value.properties) {
    const required = new Set(value.required ?? []);
    const entries = Object.entries(value.properties ?? {}).filter(([key, property]: any) =>
      required.size
        ? required.has(key)
        : property.example !== undefined || property.default !== undefined,
    );
    return Object.fromEntries(
      entries.map(([key, property]) => [key, exampleOf(property, key, seen)]),
    );
  }
  return placeholder(name, value);
}

function json(value: unknown, indent = 2): string {
  return JSON.stringify(value, null, indent);
}

function requestBody(
  operation: Json,
): { required: boolean; schema: any; type: string; description: string } | null {
  const body = dereference(operation.requestBody, "requestBodies");
  if (!operation.requestBody) return null;
  const media = body.content?.["application/json"] ?? Object.values(body.content ?? {})[0] ?? {};
  return {
    required: body.required === true,
    schema: media.schema ?? {},
    type: typeOf(media.schema),
    description: clean(body.description),
  };
}

function response(operation: Json): { type: string; description: string } {
  for (const [status, raw] of Object.entries(operation.responses ?? {})) {
    if (!String(status).startsWith("2")) continue;
    const item = dereference(raw, "responses");
    const media: any =
      item.content?.["application/json"] ??
      item.content?.["application/pdf"] ??
      Object.values(item.content ?? {})[0];
    return {
      type: item.content?.["application/pdf"]
        ? "FileDownload"
        : media
          ? typeOf(media.schema)
          : "void",
      description: clean(item.description),
    };
  }
  return { type: "unknown", description: "" };
}

function errors(operation: Json) {
  return Object.entries(operation.responses ?? {})
    .filter(([status]) => !String(status).startsWith("2"))
    .map(([status, raw]) => ({
      status,
      description: clean(dereference(raw, "responses").description),
    }));
}

const errorKinds: Record<string, { kind: string; description: string }> = {
  "400": {
    kind: "validation",
    description: "The request arguments or business rules are invalid.",
  },
  "401": {
    kind: "authentication",
    description: "Authentication credentials are missing, expired, or invalid.",
  },
  "403": {
    kind: "permission",
    description: "The authenticated account cannot perform this operation.",
  },
  "404": { kind: "not_found", description: "The requested resource does not exist." },
  "409": {
    kind: "conflict",
    description: "The operation conflicts with the current resource or idempotency state.",
  },
  "412": {
    kind: "precondition",
    description: "A required resource precondition is no longer satisfied.",
  },
  "429": { kind: "rate_limit", description: "The request was limited and can be retried later." },
};

function throwsFor(operation: Json) {
  const conditions = new Map<string, string>();
  for (const status of Object.keys(operation.responses ?? {}).filter(
    (value) => !value.startsWith("2"),
  )) {
    const mapped =
      errorKinds[status] ??
      (Number(status) >= 500
        ? { kind: "server", description: "ProxyRequest could not complete the operation." }
        : { kind: "unexpected", description: "The API returned an unexpected failure." });
    conditions.set(mapped.kind, mapped.description);
  }
  conditions.set("network", "The request could not reach ProxyRequest.");
  conditions.set(
    "unexpected",
    "The response could not be decoded or did not match the SDK contract.",
  );
  return [
    {
      type: "ApiError",
      description: "Normalized API, transport, and response processing failure.",
      conditions: [...conditions].map(([kind, description]) => ({
        kind: `kind: "${kind}"`,
        description,
      })),
    },
  ];
}

const resources = Object.entries(mapping.resources).map(([tag, config]: [string, any]) => ({
  tag,
  accessor: camel(config.attribute),
  className: config.class_name,
  description: clean(schema.tags?.find((entry: any) => entry.name === tag)?.description),
  methods: [] as any[],
}));
const resourcesByTag = new Map(resources.map((resource) => [resource.tag, resource]));

for (const [path, item] of Object.entries(schema.paths ?? {}) as Array<[string, Json]>) {
  for (const verb of ["get", "post", "put", "patch", "delete"]) {
    const operation = item[verb];
    if (!operation) continue;
    const operationId = operation.operationId;
    const methodName = camel(mapping.operations[operationId]);
    const resource = resourcesByTag.get(operation.tags?.[0]);
    if (!methodName || !resource) throw new Error(`Unmapped operation ${operationId}`);
    const rawParameters = [...(item.parameters ?? []), ...(operation.parameters ?? [])].map(
      (parameter: any) => dereference(parameter, "parameters"),
    );
    const bases = rawParameters.map((parameter: any) => camel(parameter.name));
    const publicNames = bases.map((base: string, index: number) =>
      bases.filter((candidate: string) => candidate === base).length > 1
        ? `${base}${pascal(rawParameters[index].in)}`
        : base,
    );
    const parameters = rawParameters.map((parameter: any, index: number) => ({
      name: publicNames[index],
      wireName: parameter.name,
      in: parameter.in,
      required: parameter.required === true || parameter.in === "path",
      type: typeOf(parameter.schema),
      default: parameter.schema?.default,
      description: clean(parameter.description),
      example: placeholder(parameter.name, parameter.schema),
    }));
    const body = requestBody(operation);
    const optionsType = `${resource.className.replace(/Resource$/u, "")}${pascal(methodName)}Options`;
    const responseType = `${resource.className.replace(/Resource$/u, "")}${pascal(methodName)}Response`;
    const requiredOptions = Boolean(
      body?.required || parameters.some((parameter: any) => parameter.required),
    );
    const entries = parameters
      .filter((parameter: any) => parameter.required)
      .map((parameter: any) => `${parameter.name}: ${json(parameter.example)}`);
    if (body)
      entries.push(`body: ${json(exampleOf(body.schema, body.type)).replace(/\n/gu, "\n  ")}`);
    const call = entries.length ? `({\n  ${entries.join(",\n  ")}\n})` : "()";
    resource.methods.push({
      operationId,
      name: methodName,
      summary: clean(operation.summary),
      description: clean(operation.description),
      httpMethod: verb.toUpperCase(),
      path,
      signatures: [
        {
          label: "Promise",
          signature: `client.${resource.accessor}.${methodName}(${requiredOptions ? `options: ${optionsType}` : `options: ${optionsType} = {}`}): Promise<${responseType}>`,
        },
      ],
      variants: [
        {
          name: `${methodName}WithResponse`,
          signature: `client.${resource.accessor}.${methodName}WithResponse(options): Promise<ApiResponse<${responseType}>>`,
          description:
            "Returns response status, headers, ETag and idempotency metadata with the decoded data.",
        },
      ],
      parameters,
      body: body
        ? { name: "body", required: body.required, type: body.type, description: body.description }
        : null,
      returns: response(operation),
      errors: errors(operation),
      throws: throwsFor(operation),
      example: {
        language: "typescript",
        code: `const result = await client.${resource.accessor}.${methodName}${call};`,
      },
    });
  }
}

const models = Object.entries(schema.components?.schemas ?? {})
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([name, value]: [string, any]) => {
    const model = materializeModel(value, new Set([name]));
    const required = new Set(model.required ?? []);
    return {
      name,
      kind: model.enum ? "enum" : "type",
      description: clean(model.description),
      fields: Object.entries(model.properties ?? {}).map(([field, property]: [string, any]) => ({
        name: field,
        type: typeOf(property),
        required: required.has(field),
        default: property.default,
        description: clean(property.description),
        enum: property.enum ?? undefined,
        modelRefs: [] as string[],
      })),
    };
  });

const modelNames = new Set(models.map((model) => model.name));
const modelRefs = (type: string): string[] => [
  ...new Set(type.match(/[A-Za-z_$][A-Za-z\d_$]*/gu)?.filter((name) => modelNames.has(name)) ?? []),
];

for (const model of models) {
  for (const field of model.fields) field.modelRefs = modelRefs(field.type);
}
for (const resource of resources) {
  for (const method of resource.methods) {
    for (const parameter of method.parameters) parameter.modelRefs = modelRefs(parameter.type);
    if (method.body) method.body.modelRefs = modelRefs(method.body.type);
    method.returns.modelRefs = modelRefs(method.returns.type);
  }
}

const manifest = {
  schemaVersion: 3,
  sdk: {
    id: "javascript",
    label: "JavaScript / TypeScript",
    language: "TypeScript",
    version: pkg.version,
    package: pkg.name,
    runtime: "Node.js 22 or later",
    install: "npm install @proxyrequest/sdk",
    openapi: source,
  },
  setup: [
    {
      id: "api-key",
      label: "API key",
      language: "typescript",
      code: `import { ProxyRequestClient } from "@proxyrequest/sdk";\n\nconst client = ProxyRequestClient.withApiKey("{api_key}", {\n  baseUrl: "https://{api_host}/api/v1",\n});`,
    },
  ],
  clients: [
    {
      name: "ProxyRequestClient",
      kind: "class",
      description: "Authenticated or anonymous client exposing all API resources.",
      signatures: [
        "new ProxyRequestClient(options?: ClientOptions)",
        "ProxyRequestClient.withApiKey(apiKey, options?)",
        "ProxyRequestClient.withBearerToken(token, options?)",
        "ProxyRequestClient.anonymous(options?)",
        "client.request(method, path, options?): Promise<Response>",
        "client.downloadInvoicePdf(id, request?): Promise<FileDownload>",
      ],
      members: resources.map(({ accessor, className }) => ({
        name: accessor,
        signature: `readonly ${accessor}: ${className}`,
        description: "",
      })),
    },
  ],
  resources,
  models,
  errors: [
    {
      name: "ApiError",
      kind: "class",
      description: "Normalized HTTP, validation, rate-limit and network error.",
      signatures: ["new ApiError(message, options)"],
    },
    { name: "ProxyRequestError", kind: "class", description: "Base SDK error.", signatures: [] },
    {
      name: "PaginationError",
      kind: "class",
      description: "Pagination contract error.",
      signatures: [],
    },
    {
      name: "InvalidSignatureError",
      kind: "class",
      description: "Webhook signature verification error.",
      signatures: [],
    },
  ],
  helpers: [
    {
      name: "Client options and response types",
      kind: "types",
      description:
        "Public ClientOptions, ClientCommonOptions, RawRequestOptions, RequestControls and ApiResponse types.",
      signatures: ["ClientOptions", "RequestControls", "ApiResponse<Data>"],
    },
    {
      name: "paginate",
      kind: "function",
      description: "Iterates all pages returned by a paginated resource method.",
      signatures: ["paginate(fetchPage, options?): AsyncGenerator<Item>"],
    },
    {
      name: "WebhookVerifier",
      kind: "class",
      description: "Verifies signed ProxyRequest webhook payloads.",
      signatures: [
        "WebhookVerifier.verify(rawBody, signature, secret)",
        "WebhookVerifier.verifyOrThrow(rawBody, signature, secret)",
      ],
    },
    {
      name: "FileDownload",
      kind: "class",
      description: "Binary download with filename and content type metadata.",
      signatures: ["arrayBuffer()", "blob()", "text()"],
    },
  ],
};

const output = resolve(root, "docs/reference/sdk-reference.json");
await mkdir(resolve(root, "docs/reference"), { recursive: true });
await writeFile(output, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(
  `Generated SDK reference for ${resources.reduce((total, resource) => total + resource.methods.length, 0)} operations.`,
);
