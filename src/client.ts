import createClient, { type Middleware, type Client as OpenApiClient } from "openapi-fetch";
import { ApiError } from "./errors.js";
import { FileDownload } from "./files.js";
import { createResourceCollection, type ResourceCollection } from "./generated/resources.js";
import type { paths } from "./generated/schema.js";
import type {
  ApiResponse,
  OperationCallData,
  OperationCallSpec,
  RequestControls,
  ResourceClient,
} from "./internal.js";
import {
  type PageParameters,
  type PaginatedPage,
  type PaginationOptions,
  paginate,
} from "./pagination.js";

export const DEFAULT_BASE_URL = "https://api.proxyrequest.com/api/v1";
export const SDK_VERSION = "1.0.0";

export interface ClientCommonOptions {
  baseUrl?: string;
  language?: string;
  timeoutMs?: number;
  fetch?: typeof globalThis.fetch;
  headers?: HeadersInit;
  /** Automatically protect supported mutations with an Idempotency-Key. */
  idempotency?: boolean;
}

export type ClientOptions = ClientCommonOptions &
  (
    | { apiKey: string; bearerToken?: never }
    | { bearerToken: string; apiKey?: never }
    | { apiKey?: undefined; bearerToken?: undefined }
  );

export interface RawRequestOptions extends RequestControls {
  query?: Record<string, unknown>;
  body?: unknown;
}

export class ProxyRequestClient implements ResourceClient, ResourceCollection {
  readonly apiKeys: ResourceCollection["apiKeys"];
  readonly affiliates: ResourceCollection["affiliates"];
  readonly analytics: ResourceCollection["analytics"];
  readonly authorization: ResourceCollection["authorization"];
  readonly coupons: ResourceCollection["coupons"];
  readonly invoices: ResourceCollection["invoices"];
  readonly locations: ResourceCollection["locations"];
  readonly news: ResourceCollection["news"];
  readonly orders: ResourceCollection["orders"];
  readonly packages: ResourceCollection["packages"];
  readonly profile: ResourceCollection["profile"];
  readonly proxies: ResourceCollection["proxies"];
  readonly rewards: ResourceCollection["rewards"];
  readonly sessions: ResourceCollection["sessions"];
  readonly settings: ResourceCollection["settings"];
  readonly telegram: ResourceCollection["telegram"];
  readonly users: ResourceCollection["users"];
  readonly webhooks: ResourceCollection["webhooks"];

  readonly baseUrl: string;
  readonly language: string;
  readonly timeoutMs: number;
  readonly idempotency: boolean;
  readonly #fetch: typeof globalThis.fetch;
  readonly #headers: Headers;
  readonly #openapi: OpenApiClient<paths, `${string}/${string}`>;

  constructor(options: ClientOptions = {}) {
    this.baseUrl = normalizeBaseUrl(options.baseUrl ?? DEFAULT_BASE_URL);
    this.language = options.language ?? "en";
    this.timeoutMs = options.timeoutMs ?? 15_000;
    this.idempotency = options.idempotency ?? true;
    if (!Number.isFinite(this.timeoutMs) || this.timeoutMs < 0) {
      throw new RangeError("timeoutMs must be a non-negative finite number.");
    }
    this.#fetch = options.fetch ?? globalThis.fetch;
    if (typeof this.#fetch !== "function") {
      throw new TypeError("A Fetch API implementation is required.");
    }
    this.#headers = new Headers(options.headers);
    this.#headers.set("Accept-Language", this.language);
    if (options.apiKey !== undefined)
      this.#headers.set("Authorization", `Static ${options.apiKey}`);
    if (options.bearerToken !== undefined) {
      this.#headers.set("Authorization", `Bearer ${options.bearerToken}`);
    }

    this.#openapi = createClient<paths>({
      baseUrl: this.baseUrl,
      fetch: this.#fetch,
      headers: this.#headers,
    });
    const errorMiddleware: Middleware = {
      async onResponse({ response }) {
        if (!response.ok) throw await ApiError.fromResponse(response);
        return undefined;
      },
      onError({ error }) {
        return error instanceof ApiError ? error : ApiError.network(error);
      },
    };
    this.#openapi.use(errorMiddleware);

    const resources = createResourceCollection(this);
    this.apiKeys = resources.apiKeys;
    this.affiliates = resources.affiliates;
    this.analytics = resources.analytics;
    this.authorization = resources.authorization;
    this.coupons = resources.coupons;
    this.invoices = resources.invoices;
    this.locations = resources.locations;
    this.news = resources.news;
    this.orders = resources.orders;
    this.packages = resources.packages;
    this.profile = resources.profile;
    this.proxies = resources.proxies;
    this.rewards = resources.rewards;
    this.sessions = resources.sessions;
    this.settings = resources.settings;
    this.telegram = resources.telegram;
    this.users = resources.users;
    this.webhooks = resources.webhooks;
  }

  static withApiKey(apiKey: string, options: ClientCommonOptions = {}): ProxyRequestClient {
    return new ProxyRequestClient({ ...options, apiKey });
  }

  static withBearerToken(
    bearerToken: string,
    options: ClientCommonOptions = {},
  ): ProxyRequestClient {
    return new ProxyRequestClient({ ...options, bearerToken });
  }

  static anonymous(options: ClientCommonOptions = {}): ProxyRequestClient {
    return new ProxyRequestClient(options);
  }

  async _call<Result>(spec: OperationCallSpec, data: OperationCallData = {}): Promise<Result> {
    return (await this._callWithResponse<Result>(spec, data)).data;
  }

  async _callWithResponse<Result>(
    spec: OperationCallSpec,
    data: OperationCallData = {},
  ): Promise<ApiResponse<Result>> {
    const controls = data.request ?? {};
    const controlHeaders = new Headers(controls.headers);
    const parameterKey = stringHeader(data.headers?.["Idempotency-Key"]);
    const controlKey = controlHeaders.get("Idempotency-Key") ?? undefined;
    const idempotencyKey = spec.idempotent
      ? (parameterKey ?? controlKey ?? (this.idempotency ? newIdempotencyKey() : undefined))
      : undefined;
    if (spec.idempotent) controlHeaders.delete("Idempotency-Key");
    const operationHeaders = {
      ...data.headers,
      ...(idempotencyKey === undefined ? {} : { "Idempotency-Key": idempotencyKey }),
    };
    const method = this.#openapi[spec.method] as (
      path: string,
      options: unknown,
    ) => Promise<{ data?: unknown; error?: unknown; response: Response }>;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const timeout = requestSignal(controls.signal, controls.timeoutMs ?? this.timeoutMs);
      try {
        const result = await method(spec.path, {
          params: {
            ...(data.path === undefined ? {} : { path: data.path }),
            ...(data.query === undefined ? {} : { query: data.query }),
            ...(Object.keys(operationHeaders).length === 0 ? {} : { header: operationHeaders }),
          },
          ...(data.body === undefined ? {} : { body: data.body }),
          ...([...controlHeaders].length === 0 ? {} : { headers: controlHeaders }),
          signal: timeout.signal,
          ...(spec.binary ? { parseAs: "arrayBuffer" as const } : {}),
        });
        if (result.error !== undefined) {
          throw ApiError.unexpected(
            `ProxyRequest returned an undocumented error for ${spec.operationId}.`,
            result.error,
          );
        }
        const dataValue = spec.binary
          ? binaryResult<Result>(spec, result.data, result.response.headers)
          : (result.data as Result);
        const headers = headersToRecord(result.response.headers);
        const etag = headers.etag;
        return {
          data: dataValue,
          statusCode: result.response.status,
          headers,
          ...(etag === undefined ? {} : { etag }),
          idempotencyReplayed: headers["idempotency-replayed"]?.toLowerCase() === "true",
        };
      } catch (error) {
        const apiError = (
          error instanceof ApiError
            ? error
            : ApiError.unexpected(
                `Unable to process the ProxyRequest response for ${spec.operationId}.`,
                error,
              )
        ).withIdempotencyKey(idempotencyKey);
        const delay = retryDelay(apiError, attempt);
        if (
          attempt >= 2 ||
          idempotencyKey === undefined ||
          controls.signal?.aborted ||
          delay === undefined
        ) {
          throw apiError;
        }
        await wait(delay, controls.signal);
      } finally {
        timeout.cleanup();
      }
    }
    throw ApiError.unexpected(`Unable to complete ${spec.operationId}.`);
  }

  async request(method: string, path: string, options: RawRequestOptions = {}): Promise<Response> {
    const url = new URL(path.replace(/^\//u, ""), `${this.baseUrl}/`);
    appendQuery(url.searchParams, options.query);
    const headers = new Headers(this.#headers);
    new Headers(options.headers).forEach((value, key) => {
      headers.set(key, value);
    });
    let body: BodyInit | undefined;
    if (options.body !== undefined) {
      if (isBodyInit(options.body)) {
        body = options.body;
      } else {
        headers.set("Content-Type", "application/json");
        body = JSON.stringify(options.body);
      }
    }
    const timeout = requestSignal(options.signal, options.timeoutMs ?? this.timeoutMs);
    try {
      const response = await this.#fetch(url, {
        method: method.toUpperCase(),
        headers,
        ...(body === undefined ? {} : { body }),
        signal: timeout.signal,
      });
      if (!response.ok) throw await ApiError.fromResponse(response);
      return response;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.network(error);
    } finally {
      timeout.cleanup();
    }
  }

  paginate<Item>(
    pageFetcher: (parameters: PageParameters) => Promise<PaginatedPage<Item>>,
    options: PaginationOptions = {},
  ): AsyncGenerator<Item, void, undefined> {
    return paginate(pageFetcher, options);
  }

  downloadInvoicePdf(id: string, request?: RequestControls): Promise<FileDownload> {
    return this.invoices.downloadPdf({ id, ...(request === undefined ? {} : { request }) });
  }
}

export { ProxyRequestClient as Client };

function normalizeBaseUrl(value: string): string {
  const url = new URL(value);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new TypeError("baseUrl must use http or https.");
  }
  return url.toString().replace(/\/$/u, "");
}

function requestSignal(
  input: AbortSignal | undefined,
  timeoutMs: number,
): { signal: AbortSignal; cleanup: () => void } {
  if (!Number.isFinite(timeoutMs) || timeoutMs < 0) {
    throw new RangeError("timeoutMs must be a non-negative finite number.");
  }
  const controller = new AbortController();
  const abortFromInput = (): void => controller.abort(input?.reason);
  if (input?.aborted) abortFromInput();
  else input?.addEventListener("abort", abortFromInput, { once: true });
  const timer =
    timeoutMs === 0
      ? undefined
      : setTimeout(
          () => controller.abort(new DOMException("Request timed out.", "TimeoutError")),
          timeoutMs,
        );
  return {
    signal: controller.signal,
    cleanup: () => {
      if (timer !== undefined) clearTimeout(timer);
      input?.removeEventListener("abort", abortFromInput);
    },
  };
}

function appendQuery(search: URLSearchParams, query: Record<string, unknown> | undefined): void {
  if (query === undefined) return;
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const item of value) search.append(key, String(item));
    } else {
      search.set(key, String(value));
    }
  }
}

function isBodyInit(value: unknown): value is BodyInit {
  return (
    typeof value === "string" ||
    value instanceof Blob ||
    value instanceof ArrayBuffer ||
    ArrayBuffer.isView(value) ||
    value instanceof FormData ||
    value instanceof URLSearchParams ||
    value instanceof ReadableStream
  );
}

function stringHeader(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function newIdempotencyKey(): string {
  if (typeof globalThis.crypto?.randomUUID !== "function") {
    throw new Error("crypto.randomUUID() is required for automatic idempotency keys.");
  }
  return globalThis.crypto.randomUUID();
}

function binaryResult<Result>(spec: OperationCallSpec, data: unknown, headers: Headers): Result {
  if (!(data instanceof ArrayBuffer)) {
    throw ApiError.unexpected(`ProxyRequest returned an invalid file for ${spec.operationId}.`);
  }
  return FileDownload.fromResponse(data, headers) as Result;
}

function headersToRecord(headers: Headers): Readonly<Record<string, string>> {
  return Object.freeze(Object.fromEntries(headers.entries()));
}

function retryDelay(error: ApiError, attempt: number): number | undefined {
  if (error.kind === "network") return attempt === 0 ? 100 : 200;
  if (
    error.statusCode === 409 &&
    error.retryAfter !== undefined &&
    error.retryAfter >= 0 &&
    error.retryAfter <= 5
  ) {
    return error.retryAfter * 1_000;
  }
  return undefined;
}

function wait(milliseconds: number, signal: AbortSignal | undefined): Promise<void> {
  if (signal?.aborted) return Promise.reject(ApiError.network(signal.reason));
  return new Promise((resolvePromise, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", abort);
      resolvePromise();
    }, milliseconds);
    const abort = () => {
      clearTimeout(timer);
      reject(ApiError.network(signal?.reason));
    };
    signal?.addEventListener("abort", abort, { once: true });
  });
}
