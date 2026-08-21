const encoder = new TextEncoder();

export type ErrorKind =
  | "validation"
  | "authentication"
  | "permission"
  | "not_found"
  | "conflict"
  | "rate_limit"
  | "server"
  | "network"
  | "unexpected";

export class ProxyRequestError extends Error {
  override readonly name: string = "ProxyRequestError";
}

export interface ApiErrorOptions {
  kind: ErrorKind;
  statusCode?: number;
  detail?: string;
  fieldErrors?: Record<string, string[]>;
  requestId?: string;
  retryAfter?: number;
  contentLanguage?: string;
  headers?: Record<string, string>;
  rawBody?: Uint8Array;
  cause?: unknown;
}

export class ApiError extends ProxyRequestError {
  override readonly name = "ApiError";
  readonly kind: ErrorKind;
  readonly statusCode: number | undefined;
  readonly detail: string | undefined;
  readonly fieldErrors: Readonly<Record<string, string[]>>;
  readonly requestId: string | undefined;
  readonly retryAfter: number | undefined;
  readonly contentLanguage: string | undefined;
  readonly headers: Readonly<Record<string, string>>;
  readonly rawBody: Uint8Array;
  override readonly cause: unknown;

  constructor(message: string, options: ApiErrorOptions) {
    super(message);
    this.kind = options.kind;
    this.statusCode = options.statusCode;
    this.detail = options.detail;
    this.fieldErrors = options.fieldErrors ?? {};
    this.requestId = options.requestId;
    this.retryAfter = options.retryAfter;
    this.contentLanguage = options.contentLanguage;
    this.headers = options.headers ?? {};
    this.rawBody = options.rawBody ?? new Uint8Array();
    this.cause = options.cause;
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    const headers = headersToRecord(response.headers);
    let rawBody = new Uint8Array();
    try {
      rawBody = new Uint8Array(await response.clone().arrayBuffer());
    } catch {
      // A response supplied by a custom fetch can expose an unreadable body.
    }
    return ApiError.fromPayload(response.status, rawBody, headers);
  }

  static fromPayload(
    statusCode: number,
    rawBody: Uint8Array,
    headers: Record<string, string> = {},
  ): ApiError {
    const payload = decodeJson(rawBody);
    const detail = errorDetail(payload);
    const kind = kindForStatus(statusCode);
    const requestId = header(headers, "x-request-id", "x-correlation-id");
    const retryAfter = numberHeader(headers, "retry-after");
    const contentLanguage = header(headers, "content-language");
    return new ApiError(detail ?? `ProxyRequest API returned HTTP ${statusCode}.`, {
      kind,
      statusCode,
      ...(detail === undefined ? {} : { detail }),
      fieldErrors: fieldErrors(payload),
      ...(requestId === undefined ? {} : { requestId }),
      ...(retryAfter === undefined ? {} : { retryAfter }),
      ...(contentLanguage === undefined ? {} : { contentLanguage }),
      headers,
      rawBody,
    });
  }

  static network(cause: unknown): ApiError {
    const detail = cause instanceof Error ? cause.message : String(cause);
    return new ApiError(`ProxyRequest network request failed: ${detail}`, {
      kind: "network",
      cause,
    });
  }

  static unexpected(message: string, cause?: unknown): ApiError {
    return new ApiError(message, {
      kind: "unexpected",
      ...(cause === undefined ? {} : { cause }),
    });
  }
}

export class PaginationError extends ProxyRequestError {
  override readonly name = "PaginationError";
}

export class InvalidSignatureError extends ProxyRequestError {
  override readonly name = "InvalidSignatureError";
}

function kindForStatus(statusCode: number): ErrorKind {
  if (statusCode === 400 || statusCode === 422) return "validation";
  if (statusCode === 401) return "authentication";
  if (statusCode === 403) return "permission";
  if (statusCode === 404) return "not_found";
  if (statusCode === 409) return "conflict";
  if (statusCode === 429) return "rate_limit";
  if (statusCode >= 500) return "server";
  return "unexpected";
}

function headersToRecord(headers: Headers): Record<string, string> {
  return Object.fromEntries(
    [...headers.entries()].map(([key, value]) => [key.toLowerCase(), value]),
  );
}

function header(headers: Record<string, string>, ...names: string[]): string | undefined {
  for (const name of names) {
    const value = headers[name.toLowerCase()];
    if (value !== undefined && value !== "") return value;
  }
  return undefined;
}

function numberHeader(headers: Record<string, string>, name: string): number | undefined {
  const value = header(headers, name);
  if (value === undefined) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function decodeJson(rawBody: Uint8Array): unknown {
  if (rawBody.byteLength === 0) return undefined;
  try {
    return JSON.parse(new TextDecoder().decode(rawBody));
  } catch {
    return undefined;
  }
}

function errorDetail(payload: unknown): string | undefined {
  if (typeof payload === "string" && payload.length > 0) return payload;
  if (!isRecord(payload)) return undefined;
  for (const key of ["detail", "message", "error"]) {
    const value = payload[key];
    if (typeof value === "string" && value.length > 0) return value;
  }
  return undefined;
}

function fieldErrors(payload: unknown): Record<string, string[]> {
  if (!isRecord(payload)) return {};
  const source = isRecord(payload.errors) ? payload.errors : payload;
  const result: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(source)) {
    if (["detail", "message", "error", "code"].includes(key)) continue;
    if (typeof value === "string") result[key] = [value];
    if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
      result[key] = value;
    }
  }
  return result;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function bodyFromUnknown(value: unknown): Uint8Array {
  if (value instanceof Uint8Array) return value;
  if (typeof value === "string") return encoder.encode(value);
  return encoder.encode(JSON.stringify(value));
}
