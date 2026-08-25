export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestControls {
  /** Cancel this individual request. */
  signal?: AbortSignal;
  /** Merge additional headers into this request. */
  headers?: HeadersInit;
  /** Override the client timeout for this request. Set to 0 to disable it. */
  timeoutMs?: number;
}

export interface OperationCallSpec {
  operationId: string;
  method: HttpMethod;
  path: string;
  binary?: boolean;
  idempotent?: boolean;
}

export interface OperationCallData {
  path?: Record<string, unknown>;
  query?: Record<string, unknown>;
  headers?: Record<string, unknown>;
  body?: unknown;
  request?: RequestControls;
}

export interface ResourceClient {
  _call<Result>(spec: OperationCallSpec, data?: OperationCallData): Promise<Result>;
  _callWithResponse<Result>(
    spec: OperationCallSpec,
    data?: OperationCallData,
  ): Promise<ApiResponse<Result>>;
}

export interface ApiResponse<Result> {
  data: Result;
  statusCode: number;
  headers: Readonly<Record<string, string>>;
  etag?: string;
  idempotencyReplayed: boolean;
}

export type OperationParameter<
  Operation,
  Location extends "path" | "query" | "header" | "cookie",
  Name extends PropertyKey,
> = Operation extends { parameters: infer Parameters }
  ? Location extends keyof Parameters
    ? Name extends keyof NonNullable<Parameters[Location]>
      ? NonNullable<Parameters[Location]>[Name]
      : never
    : never
  : never;

export type OperationBody<Operation> =
  NonNullable<Operation extends { requestBody?: infer Body } ? Body : never> extends {
    content: infer Content;
  }
    ? Content extends { "application/json": infer Json }
      ? Json
      : Content[keyof Content]
    : never;

type SuccessStatus = 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 226;

type SuccessResponses<Responses> = Responses[Extract<keyof Responses, SuccessStatus>];

type ResponseContent<Response> = Response extends { content: infer Content }
  ? keyof Content extends never
    ? undefined
    : Content[keyof Content]
  : undefined;

export type OperationResult<Operation> = Operation extends { responses: infer Responses }
  ? ResponseContent<SuccessResponses<Responses>>
  : undefined;
