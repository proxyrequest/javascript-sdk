import createClient, { type Middleware, type Client as OpenApiClient } from "openapi-fetch";
import { ApiError } from "./errors.js";
import { FileDownload } from "./files.js";
import { createResourceCollection, type ResourceCollection } from "./generated/resources.js";
import type { paths } from "./generated/schema.js";
import type {
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
  readonly telegramService: ResourceCollection["telegramService"];
  readonly users: ResourceCollection["users"];
  readonly webhooks: ResourceCollection["webhooks"];

  readonly baseUrl: string;
  readonly language: string;
  readonly timeoutMs: number;
  readonly #fetch: typeof globalThis.fetch;
  readonly #headers: Headers;
  readonly #openapi: OpenApiClient<paths, `${string}/${string}`>;

  constructor(options: ClientOptions = {}) {
    this.baseUrl = normalizeBaseUrl(options.baseUrl ?? DEFAULT_BASE_URL);
    this.language = options.language ?? "en";
    this.timeoutMs = options.timeoutMs ?? 15_000;
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
    this.telegramService = resources.telegramService;
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
    const controls = data.request ?? {};
    const timeout = requestSignal(controls.signal, controls.timeoutMs ?? this.timeoutMs);
    const options = {
      params: {
        ...(data.path === undefined ? {} : { path: data.path }),
        ...(data.query === undefined ? {} : { query: data.query }),
        ...(data.headers === undefined ? {} : { header: data.headers }),
      },
      ...(data.body === undefined ? {} : { body: data.body }),
      ...(controls.headers === undefined ? {} : { headers: controls.headers }),
      signal: timeout.signal,
      ...(spec.binary ? { parseAs: "arrayBuffer" as const } : {}),
    };

    try {
      const method = this.#openapi[spec.method] as (
        path: string,
        options: unknown,
      ) => Promise<{ data?: unknown; error?: unknown; response: Response }>;
      const result = await method(spec.path, options);
      if (result.error !== undefined) {
        throw ApiError.unexpected(
          `ProxyRequest returned an undocumented error for ${spec.operationId}.`,
          result.error,
        );
      }
      if (spec.binary) {
        if (!(result.data instanceof ArrayBuffer)) {
          throw ApiError.unexpected(
            `ProxyRequest returned an invalid file for ${spec.operationId}.`,
          );
        }
        return FileDownload.fromResponse(result.data, result.response.headers) as Result;
      }
      return result.data as Result;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.unexpected(
        `Unable to process the ProxyRequest response for ${spec.operationId}.`,
        error,
      );
    } finally {
      timeout.cleanup();
    }
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
