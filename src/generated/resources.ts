/** This file is generated from openapi/openapi.yaml. Do not edit manually. */

import type { FileDownload } from "../files.js";
import type {
  OperationBody,
  OperationParameter,
  OperationResult,
  RequestControls,
  ResourceClient,
} from "../internal.js";
import type { operations } from "./schema.js";

export interface APIKeysListOptions {
  limit?: OperationParameter<operations["api_keys_list"], "query", "limit">;
  offset?: OperationParameter<operations["api_keys_list"], "query", "offset">;
  acceptLanguage?: OperationParameter<operations["api_keys_list"], "header", "Accept-Language">;
  request?: RequestControls;
}

export type APIKeysListResponse = OperationResult<operations["api_keys_list"]>;

export interface APIKeysCreateOptions {
  acceptLanguage?: OperationParameter<operations["api_keys_create"], "header", "Accept-Language">;
  body?: OperationBody<operations["api_keys_create"]>;
  request?: RequestControls;
}

export type APIKeysCreateResponse = OperationResult<operations["api_keys_create"]>;

export interface APIKeysDeleteOptions {
  id: OperationParameter<operations["api_keys_destroy"], "path", "id">;
  acceptLanguage?: OperationParameter<operations["api_keys_destroy"], "header", "Accept-Language">;
  request?: RequestControls;
}

export type APIKeysDeleteResponse = OperationResult<operations["api_keys_destroy"]>;

export class APIKeysResource {
  readonly #client: ResourceClient;

  constructor(client: ResourceClient) {
    this.#client = client;
  }

  /** List API keys */
  async list(options: APIKeysListOptions = {}): Promise<APIKeysListResponse> {
    return this.#client._call<APIKeysListResponse>(
      {
        operationId: "api_keys_list",
        method: "GET",
        path: "/api-keys",
      },
      {
        query: {
          limit: options.limit,
          offset: options.offset,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Create an API key */
  async create(options: APIKeysCreateOptions = {}): Promise<APIKeysCreateResponse> {
    return this.#client._call<APIKeysCreateResponse>(
      {
        operationId: "api_keys_create",
        method: "POST",
        path: "/api-keys",
      },
      {
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.body === undefined ? {} : { body: options.body }),
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Revoke an API key */
  async delete(options: APIKeysDeleteOptions): Promise<APIKeysDeleteResponse> {
    return this.#client._call<APIKeysDeleteResponse>(
      {
        operationId: "api_keys_destroy",
        method: "DELETE",
        path: "/api-keys/{id}",
      },
      {
        path: {
          id: options.id,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }
}

export interface AffiliatesListOptions {
  limit?: OperationParameter<operations["affiliates_list"], "query", "limit">;
  offset?: OperationParameter<operations["affiliates_list"], "query", "offset">;
  acceptLanguage?: OperationParameter<operations["affiliates_list"], "header", "Accept-Language">;
  request?: RequestControls;
}

export type AffiliatesListResponse = OperationResult<operations["affiliates_list"]>;

export interface AffiliatesListRewardsOptions {
  limit?: OperationParameter<operations["affiliates_rewards_list"], "query", "limit">;
  offset?: OperationParameter<operations["affiliates_rewards_list"], "query", "offset">;
  acceptLanguage?: OperationParameter<
    operations["affiliates_rewards_list"],
    "header",
    "Accept-Language"
  >;
  request?: RequestControls;
}

export type AffiliatesListRewardsResponse = OperationResult<operations["affiliates_rewards_list"]>;

export interface AffiliatesGetRewardsOverallOptions {
  acceptLanguage?: OperationParameter<
    operations["affiliates_rewards_overall_retrieve"],
    "header",
    "Accept-Language"
  >;
  request?: RequestControls;
}

export type AffiliatesGetRewardsOverallResponse = OperationResult<
  operations["affiliates_rewards_overall_retrieve"]
>;

export class AffiliatesResource {
  readonly #client: ResourceClient;

  constructor(client: ResourceClient) {
    this.#client = client;
  }

  /** List referred customers */
  async list(options: AffiliatesListOptions = {}): Promise<AffiliatesListResponse> {
    return this.#client._call<AffiliatesListResponse>(
      {
        operationId: "affiliates_list",
        method: "GET",
        path: "/affiliates",
      },
      {
        query: {
          limit: options.limit,
          offset: options.offset,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** List affiliate reward entries */
  async listRewards(
    options: AffiliatesListRewardsOptions = {},
  ): Promise<AffiliatesListRewardsResponse> {
    return this.#client._call<AffiliatesListRewardsResponse>(
      {
        operationId: "affiliates_rewards_list",
        method: "GET",
        path: "/affiliates/rewards",
      },
      {
        query: {
          limit: options.limit,
          offset: options.offset,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Get affiliate earnings over time */
  async getRewardsOverall(
    options: AffiliatesGetRewardsOverallOptions = {},
  ): Promise<AffiliatesGetRewardsOverallResponse> {
    return this.#client._call<AffiliatesGetRewardsOverallResponse>(
      {
        operationId: "affiliates_rewards_overall_retrieve",
        method: "GET",
        path: "/affiliates/rewards/overall",
      },
      {
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }
}

export interface AnalyticsGetTransactionsOptions {
  end?: OperationParameter<operations["analytics_transactions_retrieve"], "query", "end">;
  id: OperationParameter<operations["analytics_transactions_retrieve"], "path", "id">;
  limit?: OperationParameter<operations["analytics_transactions_retrieve"], "query", "limit">;
  offset?: OperationParameter<operations["analytics_transactions_retrieve"], "query", "offset">;
  recipientId?: OperationParameter<
    operations["analytics_transactions_retrieve"],
    "query",
    "recipient_id"
  >;
  senderId?: OperationParameter<
    operations["analytics_transactions_retrieve"],
    "query",
    "sender_id"
  >;
  start?: OperationParameter<operations["analytics_transactions_retrieve"], "query", "start">;
  timezone?: OperationParameter<operations["analytics_transactions_retrieve"], "query", "timezone">;
  type?: OperationParameter<operations["analytics_transactions_retrieve"], "query", "type">;
  acceptLanguage?: OperationParameter<
    operations["analytics_transactions_retrieve"],
    "header",
    "Accept-Language"
  >;
  request?: RequestControls;
}

export type AnalyticsGetTransactionsResponse = OperationResult<
  operations["analytics_transactions_retrieve"]
>;

export interface AnalyticsGetConnectionsOptions {
  limit?: OperationParameter<operations["analytics_connections_retrieve"], "query", "limit">;
  offset?: OperationParameter<operations["analytics_connections_retrieve"], "query", "offset">;
  packageId?: OperationParameter<
    operations["analytics_connections_retrieve"],
    "query",
    "package_id"
  >;
  userId?: OperationParameter<operations["analytics_connections_retrieve"], "query", "user_id">;
  acceptLanguage?: OperationParameter<
    operations["analytics_connections_retrieve"],
    "header",
    "Accept-Language"
  >;
  request?: RequestControls;
}

export type AnalyticsGetConnectionsResponse = OperationResult<
  operations["analytics_connections_retrieve"]
>;

export interface AnalyticsListDomainsOptions {
  end?: OperationParameter<operations["analytics_domains_retrieve"], "query", "end">;
  hostname?: OperationParameter<operations["analytics_domains_retrieve"], "query", "hostname">;
  includeSubUsers?: OperationParameter<
    operations["analytics_domains_retrieve"],
    "query",
    "include_sub_users"
  >;
  ledgerId?: OperationParameter<operations["analytics_domains_retrieve"], "query", "ledger_id">;
  limit?: OperationParameter<operations["analytics_domains_retrieve"], "query", "limit">;
  offset?: OperationParameter<operations["analytics_domains_retrieve"], "query", "offset">;
  ordering?: OperationParameter<operations["analytics_domains_retrieve"], "query", "ordering">;
  packageId?: OperationParameter<operations["analytics_domains_retrieve"], "query", "package_id">;
  search?: OperationParameter<operations["analytics_domains_retrieve"], "query", "search">;
  start?: OperationParameter<operations["analytics_domains_retrieve"], "query", "start">;
  timezone?: OperationParameter<operations["analytics_domains_retrieve"], "query", "timezone">;
  userId?: OperationParameter<operations["analytics_domains_retrieve"], "query", "user_id">;
  acceptLanguage?: OperationParameter<
    operations["analytics_domains_retrieve"],
    "header",
    "Accept-Language"
  >;
  request?: RequestControls;
}

export type AnalyticsListDomainsResponse = OperationResult<
  operations["analytics_domains_retrieve"]
>;

export interface AnalyticsListFeedOptions {
  city?: OperationParameter<operations["analytics_feed_retrieve"], "query", "city">;
  country?: OperationParameter<operations["analytics_feed_retrieve"], "query", "country">;
  end?: OperationParameter<operations["analytics_feed_retrieve"], "query", "end">;
  hostname?: OperationParameter<operations["analytics_feed_retrieve"], "query", "hostname">;
  ledgerId?: OperationParameter<operations["analytics_feed_retrieve"], "query", "ledger_id">;
  limit?: OperationParameter<operations["analytics_feed_retrieve"], "query", "limit">;
  offset?: OperationParameter<operations["analytics_feed_retrieve"], "query", "offset">;
  packageId?: OperationParameter<operations["analytics_feed_retrieve"], "query", "package_id">;
  protocol?: OperationParameter<operations["analytics_feed_retrieve"], "query", "protocol">;
  region?: OperationParameter<operations["analytics_feed_retrieve"], "query", "region">;
  search?: OperationParameter<operations["analytics_feed_retrieve"], "query", "search">;
  start?: OperationParameter<operations["analytics_feed_retrieve"], "query", "start">;
  timezone?: OperationParameter<operations["analytics_feed_retrieve"], "query", "timezone">;
  userId?: OperationParameter<operations["analytics_feed_retrieve"], "query", "user_id">;
  acceptLanguage?: OperationParameter<
    operations["analytics_feed_retrieve"],
    "header",
    "Accept-Language"
  >;
  request?: RequestControls;
}

export type AnalyticsListFeedResponse = OperationResult<operations["analytics_feed_retrieve"]>;

export interface AnalyticsListLogsOptions {
  city?: OperationParameter<operations["analytics_logs_retrieve"], "query", "city">;
  country?: OperationParameter<operations["analytics_logs_retrieve"], "query", "country">;
  end?: OperationParameter<operations["analytics_logs_retrieve"], "query", "end">;
  errorCode?: OperationParameter<operations["analytics_logs_retrieve"], "query", "error_code">;
  hostname?: OperationParameter<operations["analytics_logs_retrieve"], "query", "hostname">;
  ledgerId?: OperationParameter<operations["analytics_logs_retrieve"], "query", "ledger_id">;
  limit?: OperationParameter<operations["analytics_logs_retrieve"], "query", "limit">;
  offset?: OperationParameter<operations["analytics_logs_retrieve"], "query", "offset">;
  packageId?: OperationParameter<operations["analytics_logs_retrieve"], "query", "package_id">;
  protocol?: OperationParameter<operations["analytics_logs_retrieve"], "query", "protocol">;
  region?: OperationParameter<operations["analytics_logs_retrieve"], "query", "region">;
  start?: OperationParameter<operations["analytics_logs_retrieve"], "query", "start">;
  timezone?: OperationParameter<operations["analytics_logs_retrieve"], "query", "timezone">;
  userId?: OperationParameter<operations["analytics_logs_retrieve"], "query", "user_id">;
  acceptLanguage?: OperationParameter<
    operations["analytics_logs_retrieve"],
    "header",
    "Accept-Language"
  >;
  request?: RequestControls;
}

export type AnalyticsListLogsResponse = OperationResult<operations["analytics_logs_retrieve"]>;

export interface AnalyticsGetOverallOptions {
  end?: OperationParameter<operations["analytics_overall_retrieve"], "query", "end">;
  includeSubUsers?: OperationParameter<
    operations["analytics_overall_retrieve"],
    "query",
    "include_sub_users"
  >;
  limit?: OperationParameter<operations["analytics_overall_retrieve"], "query", "limit">;
  offset?: OperationParameter<operations["analytics_overall_retrieve"], "query", "offset">;
  packageId?: OperationParameter<operations["analytics_overall_retrieve"], "query", "package_id">;
  start?: OperationParameter<operations["analytics_overall_retrieve"], "query", "start">;
  timezone?: OperationParameter<operations["analytics_overall_retrieve"], "query", "timezone">;
  userId?: OperationParameter<operations["analytics_overall_retrieve"], "query", "user_id">;
  acceptLanguage?: OperationParameter<
    operations["analytics_overall_retrieve"],
    "header",
    "Accept-Language"
  >;
  request?: RequestControls;
}

export type AnalyticsGetOverallResponse = OperationResult<operations["analytics_overall_retrieve"]>;

export class AnalyticsResource {
  readonly #client: ResourceClient;

  constructor(client: ResourceClient) {
    this.#client = client;
  }

  /** List data transactions */
  async getTransactions(
    options: AnalyticsGetTransactionsOptions,
  ): Promise<AnalyticsGetTransactionsResponse> {
    return this.#client._call<AnalyticsGetTransactionsResponse>(
      {
        operationId: "analytics_transactions_retrieve",
        method: "GET",
        path: "/analytics/{id}/transactions",
      },
      {
        path: {
          id: options.id,
        },
        query: {
          end: options.end,
          limit: options.limit,
          offset: options.offset,
          recipient_id: options.recipientId,
          sender_id: options.senderId,
          start: options.start,
          timezone: options.timezone,
          type: options.type,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** List active proxy connections */
  async getConnections(
    options: AnalyticsGetConnectionsOptions = {},
  ): Promise<AnalyticsGetConnectionsResponse> {
    return this.#client._call<AnalyticsGetConnectionsResponse>(
      {
        operationId: "analytics_connections_retrieve",
        method: "GET",
        path: "/analytics/connections",
      },
      {
        query: {
          limit: options.limit,
          offset: options.offset,
          package_id: options.packageId,
          user_id: options.userId,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** List top destination domains */
  async listDomains(
    options: AnalyticsListDomainsOptions = {},
  ): Promise<AnalyticsListDomainsResponse> {
    return this.#client._call<AnalyticsListDomainsResponse>(
      {
        operationId: "analytics_domains_retrieve",
        method: "GET",
        path: "/analytics/domains",
      },
      {
        query: {
          end: options.end,
          hostname: options.hostname,
          include_sub_users: options.includeSubUsers,
          ledger_id: options.ledgerId,
          limit: options.limit,
          offset: options.offset,
          ordering: options.ordering,
          package_id: options.packageId,
          search: options.search,
          start: options.start,
          timezone: options.timezone,
          user_id: options.userId,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** List proxy request activity */
  async listFeed(options: AnalyticsListFeedOptions = {}): Promise<AnalyticsListFeedResponse> {
    return this.#client._call<AnalyticsListFeedResponse>(
      {
        operationId: "analytics_feed_retrieve",
        method: "GET",
        path: "/analytics/feed",
      },
      {
        query: {
          city: options.city,
          country: options.country,
          end: options.end,
          hostname: options.hostname,
          ledger_id: options.ledgerId,
          limit: options.limit,
          offset: options.offset,
          package_id: options.packageId,
          protocol: options.protocol,
          region: options.region,
          search: options.search,
          start: options.start,
          timezone: options.timezone,
          user_id: options.userId,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** List proxy error logs */
  async listLogs(options: AnalyticsListLogsOptions = {}): Promise<AnalyticsListLogsResponse> {
    return this.#client._call<AnalyticsListLogsResponse>(
      {
        operationId: "analytics_logs_retrieve",
        method: "GET",
        path: "/analytics/logs",
      },
      {
        query: {
          city: options.city,
          country: options.country,
          end: options.end,
          error_code: options.errorCode,
          hostname: options.hostname,
          ledger_id: options.ledgerId,
          limit: options.limit,
          offset: options.offset,
          package_id: options.packageId,
          protocol: options.protocol,
          region: options.region,
          start: options.start,
          timezone: options.timezone,
          user_id: options.userId,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Get traffic totals over time */
  async getOverall(options: AnalyticsGetOverallOptions = {}): Promise<AnalyticsGetOverallResponse> {
    return this.#client._call<AnalyticsGetOverallResponse>(
      {
        operationId: "analytics_overall_retrieve",
        method: "GET",
        path: "/analytics/overall",
      },
      {
        query: {
          end: options.end,
          include_sub_users: options.includeSubUsers,
          limit: options.limit,
          offset: options.offset,
          package_id: options.packageId,
          start: options.start,
          timezone: options.timezone,
          user_id: options.userId,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }
}

export interface AuthorizationLoginOptions {
  acceptLanguage?: OperationParameter<operations["login_create"], "header", "Accept-Language">;
  body: OperationBody<operations["login_create"]>;
  request?: RequestControls;
}

export type AuthorizationLoginResponse = OperationResult<operations["login_create"]>;

export interface AuthorizationLoginWithGoogleOptions {
  acceptLanguage?: OperationParameter<
    operations["login_google_create"],
    "header",
    "Accept-Language"
  >;
  body: OperationBody<operations["login_google_create"]>;
  request?: RequestControls;
}

export type AuthorizationLoginWithGoogleResponse = OperationResult<
  operations["login_google_create"]
>;

export interface AuthorizationRecoverPasswordOptions {
  acceptLanguage?: OperationParameter<
    operations["recover_password_create"],
    "header",
    "Accept-Language"
  >;
  body: OperationBody<operations["recover_password_create"]>;
  request?: RequestControls;
}

export type AuthorizationRecoverPasswordResponse = OperationResult<
  operations["recover_password_create"]
>;

export interface AuthorizationRefreshOptions {
  acceptLanguage?: OperationParameter<operations["refresh_create"], "header", "Accept-Language">;
  body: OperationBody<operations["refresh_create"]>;
  request?: RequestControls;
}

export type AuthorizationRefreshResponse = OperationResult<operations["refresh_create"]>;

export interface AuthorizationSignupOptions {
  acceptLanguage?: OperationParameter<operations["signup_create"], "header", "Accept-Language">;
  body: OperationBody<operations["signup_create"]>;
  request?: RequestControls;
}

export type AuthorizationSignupResponse = OperationResult<operations["signup_create"]>;

export class AuthorizationResource {
  readonly #client: ResourceClient;

  constructor(client: ResourceClient) {
    this.#client = client;
  }

  /** Sign in with email or username */
  async login(options: AuthorizationLoginOptions): Promise<AuthorizationLoginResponse> {
    return this.#client._call<AuthorizationLoginResponse>(
      {
        operationId: "login_create",
        method: "POST",
        path: "/login",
      },
      {
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        body: options.body,
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Sign in with Google */
  async loginWithGoogle(
    options: AuthorizationLoginWithGoogleOptions,
  ): Promise<AuthorizationLoginWithGoogleResponse> {
    return this.#client._call<AuthorizationLoginWithGoogleResponse>(
      {
        operationId: "login_google_create",
        method: "POST",
        path: "/login/google",
      },
      {
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        body: options.body,
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Send a password recovery email */
  async recoverPassword(
    options: AuthorizationRecoverPasswordOptions,
  ): Promise<AuthorizationRecoverPasswordResponse> {
    return this.#client._call<AuthorizationRecoverPasswordResponse>(
      {
        operationId: "recover_password_create",
        method: "POST",
        path: "/recover-password",
      },
      {
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        body: options.body,
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Refresh an access token */
  async refresh(options: AuthorizationRefreshOptions): Promise<AuthorizationRefreshResponse> {
    return this.#client._call<AuthorizationRefreshResponse>(
      {
        operationId: "refresh_create",
        method: "POST",
        path: "/refresh",
      },
      {
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        body: options.body,
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Create a customer account */
  async signup(options: AuthorizationSignupOptions): Promise<AuthorizationSignupResponse> {
    return this.#client._call<AuthorizationSignupResponse>(
      {
        operationId: "signup_create",
        method: "POST",
        path: "/signup",
      },
      {
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        body: options.body,
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }
}

export interface CouponsListOptions {
  code?: OperationParameter<operations["coupons_list"], "query", "code">;
  limit?: OperationParameter<operations["coupons_list"], "query", "limit">;
  offset?: OperationParameter<operations["coupons_list"], "query", "offset">;
  ordering?: OperationParameter<operations["coupons_list"], "query", "ordering">;
  search?: OperationParameter<operations["coupons_list"], "query", "search">;
  type?: OperationParameter<operations["coupons_list"], "query", "type">;
  acceptLanguage?: OperationParameter<operations["coupons_list"], "header", "Accept-Language">;
  request?: RequestControls;
}

export type CouponsListResponse = OperationResult<operations["coupons_list"]>;

export interface CouponsCreateOptions {
  acceptLanguage?: OperationParameter<operations["coupons_create"], "header", "Accept-Language">;
  body: OperationBody<operations["coupons_create"]>;
  request?: RequestControls;
}

export type CouponsCreateResponse = OperationResult<operations["coupons_create"]>;

export interface CouponsGetOptions {
  id: OperationParameter<operations["coupons_retrieve"], "path", "id">;
  acceptLanguage?: OperationParameter<operations["coupons_retrieve"], "header", "Accept-Language">;
  request?: RequestControls;
}

export type CouponsGetResponse = OperationResult<operations["coupons_retrieve"]>;

export interface CouponsReplaceOptions {
  id: OperationParameter<operations["coupons_update"], "path", "id">;
  acceptLanguage?: OperationParameter<operations["coupons_update"], "header", "Accept-Language">;
  body: OperationBody<operations["coupons_update"]>;
  request?: RequestControls;
}

export type CouponsReplaceResponse = OperationResult<operations["coupons_update"]>;

export interface CouponsUpdateOptions {
  id: OperationParameter<operations["coupons_partial_update"], "path", "id">;
  acceptLanguage?: OperationParameter<
    operations["coupons_partial_update"],
    "header",
    "Accept-Language"
  >;
  body?: OperationBody<operations["coupons_partial_update"]>;
  request?: RequestControls;
}

export type CouponsUpdateResponse = OperationResult<operations["coupons_partial_update"]>;

export interface CouponsDeleteOptions {
  id: OperationParameter<operations["coupons_destroy"], "path", "id">;
  acceptLanguage?: OperationParameter<operations["coupons_destroy"], "header", "Accept-Language">;
  request?: RequestControls;
}

export type CouponsDeleteResponse = OperationResult<operations["coupons_destroy"]>;

export interface CouponsListRedeemsOptions {
  code?: OperationParameter<operations["coupons_redeems_list"], "query", "code">;
  id: OperationParameter<operations["coupons_redeems_list"], "path", "id">;
  limit?: OperationParameter<operations["coupons_redeems_list"], "query", "limit">;
  offset?: OperationParameter<operations["coupons_redeems_list"], "query", "offset">;
  ordering?: OperationParameter<operations["coupons_redeems_list"], "query", "ordering">;
  type?: OperationParameter<operations["coupons_redeems_list"], "query", "type">;
  acceptLanguage?: OperationParameter<
    operations["coupons_redeems_list"],
    "header",
    "Accept-Language"
  >;
  request?: RequestControls;
}

export type CouponsListRedeemsResponse = OperationResult<operations["coupons_redeems_list"]>;

export interface CouponsCalculatePriceOptions {
  acceptLanguage?: OperationParameter<
    operations["coupons_calculate_price_create"],
    "header",
    "Accept-Language"
  >;
  body: OperationBody<operations["coupons_calculate_price_create"]>;
  request?: RequestControls;
}

export type CouponsCalculatePriceResponse = OperationResult<
  operations["coupons_calculate_price_create"]
>;

export class CouponsResource {
  readonly #client: ResourceClient;

  constructor(client: ResourceClient) {
    this.#client = client;
  }

  /** List available coupons */
  async list(options: CouponsListOptions = {}): Promise<CouponsListResponse> {
    return this.#client._call<CouponsListResponse>(
      {
        operationId: "coupons_list",
        method: "GET",
        path: "/coupons",
      },
      {
        query: {
          code: options.code,
          limit: options.limit,
          offset: options.offset,
          ordering: options.ordering,
          search: options.search,
          type: options.type,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Create a coupon */
  async create(options: CouponsCreateOptions): Promise<CouponsCreateResponse> {
    return this.#client._call<CouponsCreateResponse>(
      {
        operationId: "coupons_create",
        method: "POST",
        path: "/coupons",
      },
      {
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        body: options.body,
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Get a coupon */
  async get(options: CouponsGetOptions): Promise<CouponsGetResponse> {
    return this.#client._call<CouponsGetResponse>(
      {
        operationId: "coupons_retrieve",
        method: "GET",
        path: "/coupons/{id}",
      },
      {
        path: {
          id: options.id,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Replace a coupon */
  async replace(options: CouponsReplaceOptions): Promise<CouponsReplaceResponse> {
    return this.#client._call<CouponsReplaceResponse>(
      {
        operationId: "coupons_update",
        method: "PUT",
        path: "/coupons/{id}",
      },
      {
        path: {
          id: options.id,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        body: options.body,
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Update a coupon */
  async update(options: CouponsUpdateOptions): Promise<CouponsUpdateResponse> {
    return this.#client._call<CouponsUpdateResponse>(
      {
        operationId: "coupons_partial_update",
        method: "PATCH",
        path: "/coupons/{id}",
      },
      {
        path: {
          id: options.id,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.body === undefined ? {} : { body: options.body }),
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Delete a coupon */
  async delete(options: CouponsDeleteOptions): Promise<CouponsDeleteResponse> {
    return this.#client._call<CouponsDeleteResponse>(
      {
        operationId: "coupons_destroy",
        method: "DELETE",
        path: "/coupons/{id}",
      },
      {
        path: {
          id: options.id,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** List coupon redemptions */
  async listRedeems(options: CouponsListRedeemsOptions): Promise<CouponsListRedeemsResponse> {
    return this.#client._call<CouponsListRedeemsResponse>(
      {
        operationId: "coupons_redeems_list",
        method: "GET",
        path: "/coupons/{id}/redeems",
      },
      {
        path: {
          id: options.id,
        },
        query: {
          code: options.code,
          limit: options.limit,
          offset: options.offset,
          ordering: options.ordering,
          type: options.type,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Calculate a discounted price */
  async calculatePrice(
    options: CouponsCalculatePriceOptions,
  ): Promise<CouponsCalculatePriceResponse> {
    return this.#client._call<CouponsCalculatePriceResponse>(
      {
        operationId: "coupons_calculate_price_create",
        method: "POST",
        path: "/coupons/calculate-price",
      },
      {
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        body: options.body,
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }
}

export interface InvoicesListOptions {
  gateway?: OperationParameter<operations["invoices_list"], "query", "gateway">;
  internalId?: OperationParameter<operations["invoices_list"], "query", "internal_id">;
  limit?: OperationParameter<operations["invoices_list"], "query", "limit">;
  offset?: OperationParameter<operations["invoices_list"], "query", "offset">;
  ordering?: OperationParameter<operations["invoices_list"], "query", "ordering">;
  packageId?: OperationParameter<operations["invoices_list"], "query", "package__id">;
  search?: OperationParameter<operations["invoices_list"], "query", "search">;
  status?: OperationParameter<operations["invoices_list"], "query", "status">;
  type?: OperationParameter<operations["invoices_list"], "query", "type">;
  userEmail?: OperationParameter<operations["invoices_list"], "query", "user__email">;
  userId?: OperationParameter<operations["invoices_list"], "query", "user__id">;
  acceptLanguage?: OperationParameter<operations["invoices_list"], "header", "Accept-Language">;
  request?: RequestControls;
}

export type InvoicesListResponse = OperationResult<operations["invoices_list"]>;

export interface InvoicesCreateOptions {
  acceptLanguage?: OperationParameter<operations["invoices_create"], "header", "Accept-Language">;
  body: OperationBody<operations["invoices_create"]>;
  request?: RequestControls;
}

export type InvoicesCreateResponse = OperationResult<operations["invoices_create"]>;

export interface InvoicesGetOptions {
  id: OperationParameter<operations["invoices_retrieve"], "path", "id">;
  acceptLanguage?: OperationParameter<operations["invoices_retrieve"], "header", "Accept-Language">;
  request?: RequestControls;
}

export type InvoicesGetResponse = OperationResult<operations["invoices_retrieve"]>;

export interface InvoicesDeleteOptions {
  id: OperationParameter<operations["invoices_destroy"], "path", "id">;
  acceptLanguage?: OperationParameter<operations["invoices_destroy"], "header", "Accept-Language">;
  request?: RequestControls;
}

export type InvoicesDeleteResponse = OperationResult<operations["invoices_destroy"]>;

export interface InvoicesDownloadPdfOptions {
  id: OperationParameter<operations["invoices_download_pdf_retrieve"], "path", "id">;
  acceptLanguage?: OperationParameter<
    operations["invoices_download_pdf_retrieve"],
    "header",
    "Accept-Language"
  >;
  request?: RequestControls;
}

export type InvoicesDownloadPdfResponse = FileDownload;

export interface InvoicesGetPaymentLinkOptions {
  id: OperationParameter<operations["invoices_pay_retrieve"], "path", "id">;
  acceptLanguage?: OperationParameter<
    operations["invoices_pay_retrieve"],
    "header",
    "Accept-Language"
  >;
  request?: RequestControls;
}

export type InvoicesGetPaymentLinkResponse = OperationResult<operations["invoices_pay_retrieve"]>;

export class InvoicesResource {
  readonly #client: ResourceClient;

  constructor(client: ResourceClient) {
    this.#client = client;
  }

  /** List invoices */
  async list(options: InvoicesListOptions = {}): Promise<InvoicesListResponse> {
    return this.#client._call<InvoicesListResponse>(
      {
        operationId: "invoices_list",
        method: "GET",
        path: "/invoices",
      },
      {
        query: {
          gateway: options.gateway,
          internal_id: options.internalId,
          limit: options.limit,
          offset: options.offset,
          ordering: options.ordering,
          package__id: options.packageId,
          search: options.search,
          status: options.status,
          type: options.type,
          user__email: options.userEmail,
          user__id: options.userId,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Create an invoice */
  async create(options: InvoicesCreateOptions): Promise<InvoicesCreateResponse> {
    return this.#client._call<InvoicesCreateResponse>(
      {
        operationId: "invoices_create",
        method: "POST",
        path: "/invoices",
      },
      {
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        body: options.body,
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Get an invoice */
  async get(options: InvoicesGetOptions): Promise<InvoicesGetResponse> {
    return this.#client._call<InvoicesGetResponse>(
      {
        operationId: "invoices_retrieve",
        method: "GET",
        path: "/invoices/{id}",
      },
      {
        path: {
          id: options.id,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Delete an invoice */
  async delete(options: InvoicesDeleteOptions): Promise<InvoicesDeleteResponse> {
    return this.#client._call<InvoicesDeleteResponse>(
      {
        operationId: "invoices_destroy",
        method: "DELETE",
        path: "/invoices/{id}",
      },
      {
        path: {
          id: options.id,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Download an invoice PDF */
  async downloadPdf(options: InvoicesDownloadPdfOptions): Promise<InvoicesDownloadPdfResponse> {
    return this.#client._call<InvoicesDownloadPdfResponse>(
      {
        operationId: "invoices_download_pdf_retrieve",
        method: "GET",
        path: "/invoices/{id}/download/pdf",
        binary: true,
      },
      {
        path: {
          id: options.id,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Get an invoice payment link */
  async getPaymentLink(
    options: InvoicesGetPaymentLinkOptions,
  ): Promise<InvoicesGetPaymentLinkResponse> {
    return this.#client._call<InvoicesGetPaymentLinkResponse>(
      {
        operationId: "invoices_pay_retrieve",
        method: "GET",
        path: "/invoices/{id}/pay",
      },
      {
        path: {
          id: options.id,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }
}

export interface LocationsListAsnsOptions {
  code?: OperationParameter<operations["locations_asn_list"], "query", "code">;
  countryCode?: OperationParameter<operations["locations_asn_list"], "query", "country__code">;
  global?: OperationParameter<operations["locations_asn_list"], "query", "global">;
  limit?: OperationParameter<operations["locations_asn_list"], "query", "limit">;
  name?: OperationParameter<operations["locations_asn_list"], "query", "name">;
  offset?: OperationParameter<operations["locations_asn_list"], "query", "offset">;
  ordering?: OperationParameter<operations["locations_asn_list"], "query", "ordering">;
  packageId?: OperationParameter<operations["locations_asn_list"], "query", "package_id">;
  search?: OperationParameter<operations["locations_asn_list"], "query", "search">;
  acceptLanguage?: OperationParameter<
    operations["locations_asn_list"],
    "header",
    "Accept-Language"
  >;
  request?: RequestControls;
}

export type LocationsListAsnsResponse = OperationResult<operations["locations_asn_list"]>;

export interface LocationsListCitiesOptions {
  code?: OperationParameter<operations["locations_cities_list"], "query", "code">;
  countryCode?: OperationParameter<operations["locations_cities_list"], "query", "country__code">;
  limit?: OperationParameter<operations["locations_cities_list"], "query", "limit">;
  name?: OperationParameter<operations["locations_cities_list"], "query", "name">;
  offset?: OperationParameter<operations["locations_cities_list"], "query", "offset">;
  ordering?: OperationParameter<operations["locations_cities_list"], "query", "ordering">;
  packageId?: OperationParameter<operations["locations_cities_list"], "query", "package_id">;
  regionCode?: OperationParameter<operations["locations_cities_list"], "query", "region__code">;
  search?: OperationParameter<operations["locations_cities_list"], "query", "search">;
  acceptLanguage?: OperationParameter<
    operations["locations_cities_list"],
    "header",
    "Accept-Language"
  >;
  request?: RequestControls;
}

export type LocationsListCitiesResponse = OperationResult<operations["locations_cities_list"]>;

export interface LocationsGetCityOptions {
  id: OperationParameter<operations["locations_cities_retrieve"], "path", "id">;
  acceptLanguage?: OperationParameter<
    operations["locations_cities_retrieve"],
    "header",
    "Accept-Language"
  >;
  request?: RequestControls;
}

export type LocationsGetCityResponse = OperationResult<operations["locations_cities_retrieve"]>;

export interface LocationsListContinentsOptions {
  code?: OperationParameter<operations["locations_continents_list"], "query", "code">;
  limit?: OperationParameter<operations["locations_continents_list"], "query", "limit">;
  name?: OperationParameter<operations["locations_continents_list"], "query", "name">;
  offset?: OperationParameter<operations["locations_continents_list"], "query", "offset">;
  ordering?: OperationParameter<operations["locations_continents_list"], "query", "ordering">;
  packageId?: OperationParameter<operations["locations_continents_list"], "query", "package_id">;
  search?: OperationParameter<operations["locations_continents_list"], "query", "search">;
  acceptLanguage?: OperationParameter<
    operations["locations_continents_list"],
    "header",
    "Accept-Language"
  >;
  request?: RequestControls;
}

export type LocationsListContinentsResponse = OperationResult<
  operations["locations_continents_list"]
>;

export interface LocationsGetContinentOptions {
  id: OperationParameter<operations["locations_continents_retrieve"], "path", "id">;
  acceptLanguage?: OperationParameter<
    operations["locations_continents_retrieve"],
    "header",
    "Accept-Language"
  >;
  request?: RequestControls;
}

export type LocationsGetContinentResponse = OperationResult<
  operations["locations_continents_retrieve"]
>;

export interface LocationsListCountriesOptions {
  code?: OperationParameter<operations["locations_countries_list"], "query", "code">;
  limit?: OperationParameter<operations["locations_countries_list"], "query", "limit">;
  name?: OperationParameter<operations["locations_countries_list"], "query", "name">;
  offset?: OperationParameter<operations["locations_countries_list"], "query", "offset">;
  ordering?: OperationParameter<operations["locations_countries_list"], "query", "ordering">;
  packageId?: OperationParameter<operations["locations_countries_list"], "query", "package_id">;
  search?: OperationParameter<operations["locations_countries_list"], "query", "search">;
  acceptLanguage?: OperationParameter<
    operations["locations_countries_list"],
    "header",
    "Accept-Language"
  >;
  request?: RequestControls;
}

export type LocationsListCountriesResponse = OperationResult<
  operations["locations_countries_list"]
>;

export interface LocationsGetCountryOptions {
  id: OperationParameter<operations["locations_countries_retrieve"], "path", "id">;
  acceptLanguage?: OperationParameter<
    operations["locations_countries_retrieve"],
    "header",
    "Accept-Language"
  >;
  request?: RequestControls;
}

export type LocationsGetCountryResponse = OperationResult<
  operations["locations_countries_retrieve"]
>;

export interface LocationsListIspsOptions {
  code?: OperationParameter<operations["locations_isps_list"], "query", "code">;
  countryCode?: OperationParameter<operations["locations_isps_list"], "query", "country__code">;
  limit?: OperationParameter<operations["locations_isps_list"], "query", "limit">;
  name?: OperationParameter<operations["locations_isps_list"], "query", "name">;
  offset?: OperationParameter<operations["locations_isps_list"], "query", "offset">;
  ordering?: OperationParameter<operations["locations_isps_list"], "query", "ordering">;
  packageId?: OperationParameter<operations["locations_isps_list"], "query", "package_id">;
  search?: OperationParameter<operations["locations_isps_list"], "query", "search">;
  acceptLanguage?: OperationParameter<
    operations["locations_isps_list"],
    "header",
    "Accept-Language"
  >;
  request?: RequestControls;
}

export type LocationsListIspsResponse = OperationResult<operations["locations_isps_list"]>;

export interface LocationsListRegionsOptions {
  code?: OperationParameter<operations["locations_regions_list"], "query", "code">;
  countryCode?: OperationParameter<operations["locations_regions_list"], "query", "country__code">;
  limit?: OperationParameter<operations["locations_regions_list"], "query", "limit">;
  name?: OperationParameter<operations["locations_regions_list"], "query", "name">;
  offset?: OperationParameter<operations["locations_regions_list"], "query", "offset">;
  ordering?: OperationParameter<operations["locations_regions_list"], "query", "ordering">;
  packageId?: OperationParameter<operations["locations_regions_list"], "query", "package_id">;
  search?: OperationParameter<operations["locations_regions_list"], "query", "search">;
  acceptLanguage?: OperationParameter<
    operations["locations_regions_list"],
    "header",
    "Accept-Language"
  >;
  request?: RequestControls;
}

export type LocationsListRegionsResponse = OperationResult<operations["locations_regions_list"]>;

export interface LocationsGetRegionOptions {
  id: OperationParameter<operations["locations_regions_retrieve"], "path", "id">;
  acceptLanguage?: OperationParameter<
    operations["locations_regions_retrieve"],
    "header",
    "Accept-Language"
  >;
  request?: RequestControls;
}

export type LocationsGetRegionResponse = OperationResult<operations["locations_regions_retrieve"]>;

export class LocationsResource {
  readonly #client: ResourceClient;

  constructor(client: ResourceClient) {
    this.#client = client;
  }

  /** List available autonomous systems */
  async listAsns(options: LocationsListAsnsOptions = {}): Promise<LocationsListAsnsResponse> {
    return this.#client._call<LocationsListAsnsResponse>(
      {
        operationId: "locations_asn_list",
        method: "GET",
        path: "/locations/asn",
      },
      {
        query: {
          code: options.code,
          country__code: options.countryCode,
          global: options.global,
          limit: options.limit,
          name: options.name,
          offset: options.offset,
          ordering: options.ordering,
          package_id: options.packageId,
          search: options.search,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** List available cities */
  async listCities(options: LocationsListCitiesOptions = {}): Promise<LocationsListCitiesResponse> {
    return this.#client._call<LocationsListCitiesResponse>(
      {
        operationId: "locations_cities_list",
        method: "GET",
        path: "/locations/cities",
      },
      {
        query: {
          code: options.code,
          country__code: options.countryCode,
          limit: options.limit,
          name: options.name,
          offset: options.offset,
          ordering: options.ordering,
          package_id: options.packageId,
          region__code: options.regionCode,
          search: options.search,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Get a city */
  async getCity(options: LocationsGetCityOptions): Promise<LocationsGetCityResponse> {
    return this.#client._call<LocationsGetCityResponse>(
      {
        operationId: "locations_cities_retrieve",
        method: "GET",
        path: "/locations/cities/{id}",
      },
      {
        path: {
          id: options.id,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** List available continents */
  async listContinents(
    options: LocationsListContinentsOptions = {},
  ): Promise<LocationsListContinentsResponse> {
    return this.#client._call<LocationsListContinentsResponse>(
      {
        operationId: "locations_continents_list",
        method: "GET",
        path: "/locations/continents",
      },
      {
        query: {
          code: options.code,
          limit: options.limit,
          name: options.name,
          offset: options.offset,
          ordering: options.ordering,
          package_id: options.packageId,
          search: options.search,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Get a continent */
  async getContinent(
    options: LocationsGetContinentOptions,
  ): Promise<LocationsGetContinentResponse> {
    return this.#client._call<LocationsGetContinentResponse>(
      {
        operationId: "locations_continents_retrieve",
        method: "GET",
        path: "/locations/continents/{id}",
      },
      {
        path: {
          id: options.id,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** List available countries */
  async listCountries(
    options: LocationsListCountriesOptions = {},
  ): Promise<LocationsListCountriesResponse> {
    return this.#client._call<LocationsListCountriesResponse>(
      {
        operationId: "locations_countries_list",
        method: "GET",
        path: "/locations/countries",
      },
      {
        query: {
          code: options.code,
          limit: options.limit,
          name: options.name,
          offset: options.offset,
          ordering: options.ordering,
          package_id: options.packageId,
          search: options.search,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Get a country */
  async getCountry(options: LocationsGetCountryOptions): Promise<LocationsGetCountryResponse> {
    return this.#client._call<LocationsGetCountryResponse>(
      {
        operationId: "locations_countries_retrieve",
        method: "GET",
        path: "/locations/countries/{id}",
      },
      {
        path: {
          id: options.id,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** List available internet service providers */
  async listIsps(options: LocationsListIspsOptions = {}): Promise<LocationsListIspsResponse> {
    return this.#client._call<LocationsListIspsResponse>(
      {
        operationId: "locations_isps_list",
        method: "GET",
        path: "/locations/isps",
      },
      {
        query: {
          code: options.code,
          country__code: options.countryCode,
          limit: options.limit,
          name: options.name,
          offset: options.offset,
          ordering: options.ordering,
          package_id: options.packageId,
          search: options.search,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** List available regions */
  async listRegions(
    options: LocationsListRegionsOptions = {},
  ): Promise<LocationsListRegionsResponse> {
    return this.#client._call<LocationsListRegionsResponse>(
      {
        operationId: "locations_regions_list",
        method: "GET",
        path: "/locations/regions",
      },
      {
        query: {
          code: options.code,
          country__code: options.countryCode,
          limit: options.limit,
          name: options.name,
          offset: options.offset,
          ordering: options.ordering,
          package_id: options.packageId,
          search: options.search,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Get a region */
  async getRegion(options: LocationsGetRegionOptions): Promise<LocationsGetRegionResponse> {
    return this.#client._call<LocationsGetRegionResponse>(
      {
        operationId: "locations_regions_retrieve",
        method: "GET",
        path: "/locations/regions/{id}",
      },
      {
        path: {
          id: options.id,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }
}

export interface NewsListOptions {
  limit?: OperationParameter<operations["news_list"], "query", "limit">;
  offset?: OperationParameter<operations["news_list"], "query", "offset">;
  ordering?: OperationParameter<operations["news_list"], "query", "ordering">;
  search?: OperationParameter<operations["news_list"], "query", "search">;
  acceptLanguage?: OperationParameter<operations["news_list"], "header", "Accept-Language">;
  request?: RequestControls;
}

export type NewsListResponse = OperationResult<operations["news_list"]>;

export class NewsResource {
  readonly #client: ResourceClient;

  constructor(client: ResourceClient) {
    this.#client = client;
  }

  /** List product announcements */
  async list(options: NewsListOptions = {}): Promise<NewsListResponse> {
    return this.#client._call<NewsListResponse>(
      {
        operationId: "news_list",
        method: "GET",
        path: "/news",
      },
      {
        query: {
          limit: options.limit,
          offset: options.offset,
          ordering: options.ordering,
          search: options.search,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }
}

export interface OrdersListOptions {
  limit?: OperationParameter<operations["orders_list"], "query", "limit">;
  offset?: OperationParameter<operations["orders_list"], "query", "offset">;
  ordering?: OperationParameter<operations["orders_list"], "query", "ordering">;
  packageAlias?: OperationParameter<operations["orders_list"], "query", "package__alias">;
  packageId?: OperationParameter<operations["orders_list"], "query", "package__id">;
  packageType?: OperationParameter<operations["orders_list"], "query", "package__type">;
  search?: OperationParameter<operations["orders_list"], "query", "search">;
  userEmail?: OperationParameter<operations["orders_list"], "query", "user__email">;
  userId?: OperationParameter<operations["orders_list"], "query", "user__id">;
  acceptLanguage?: OperationParameter<operations["orders_list"], "header", "Accept-Language">;
  request?: RequestControls;
}

export type OrdersListResponse = OperationResult<operations["orders_list"]>;

export interface OrdersGetOptions {
  id: OperationParameter<operations["orders_retrieve"], "path", "id">;
  acceptLanguage?: OperationParameter<operations["orders_retrieve"], "header", "Accept-Language">;
  request?: RequestControls;
}

export type OrdersGetResponse = OperationResult<operations["orders_retrieve"]>;

export interface OrdersUpdateAutoRenewalOptions {
  id: OperationParameter<operations["orders_partial_update"], "path", "id">;
  acceptLanguage?: OperationParameter<
    operations["orders_partial_update"],
    "header",
    "Accept-Language"
  >;
  body?: OperationBody<operations["orders_partial_update"]>;
  request?: RequestControls;
}

export type OrdersUpdateAutoRenewalResponse = OperationResult<operations["orders_partial_update"]>;

export interface OrdersDeleteOptions {
  id: OperationParameter<operations["orders_destroy"], "path", "id">;
  acceptLanguage?: OperationParameter<operations["orders_destroy"], "header", "Accept-Language">;
  request?: RequestControls;
}

export type OrdersDeleteResponse = OperationResult<operations["orders_destroy"]>;

export interface OrdersResetPasswordOptions {
  acceptLanguage?: OperationParameter<
    operations["reset_password_create"],
    "header",
    "Accept-Language"
  >;
  body: OperationBody<operations["reset_password_create"]>;
  request?: RequestControls;
}

export type OrdersResetPasswordResponse = OperationResult<operations["reset_password_create"]>;

export class OrdersResource {
  readonly #client: ResourceClient;

  constructor(client: ResourceClient) {
    this.#client = client;
  }

  /** List active orders */
  async list(options: OrdersListOptions = {}): Promise<OrdersListResponse> {
    return this.#client._call<OrdersListResponse>(
      {
        operationId: "orders_list",
        method: "GET",
        path: "/orders",
      },
      {
        query: {
          limit: options.limit,
          offset: options.offset,
          ordering: options.ordering,
          package__alias: options.packageAlias,
          package__id: options.packageId,
          package__type: options.packageType,
          search: options.search,
          user__email: options.userEmail,
          user__id: options.userId,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Get an order */
  async get(options: OrdersGetOptions): Promise<OrdersGetResponse> {
    return this.#client._call<OrdersGetResponse>(
      {
        operationId: "orders_retrieve",
        method: "GET",
        path: "/orders/{id}",
      },
      {
        path: {
          id: options.id,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Update order auto-renewal */
  async updateAutoRenewal(
    options: OrdersUpdateAutoRenewalOptions,
  ): Promise<OrdersUpdateAutoRenewalResponse> {
    return this.#client._call<OrdersUpdateAutoRenewalResponse>(
      {
        operationId: "orders_partial_update",
        method: "PATCH",
        path: "/orders/{id}",
      },
      {
        path: {
          id: options.id,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.body === undefined ? {} : { body: options.body }),
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Delete a sub-user order */
  async delete(options: OrdersDeleteOptions): Promise<OrdersDeleteResponse> {
    return this.#client._call<OrdersDeleteResponse>(
      {
        operationId: "orders_destroy",
        method: "DELETE",
        path: "/orders/{id}",
      },
      {
        path: {
          id: options.id,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Reset an order's proxy password */
  async resetPassword(options: OrdersResetPasswordOptions): Promise<OrdersResetPasswordResponse> {
    return this.#client._call<OrdersResetPasswordResponse>(
      {
        operationId: "reset_password_create",
        method: "POST",
        path: "/reset-password",
      },
      {
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        body: options.body,
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }
}

export interface PackagesListOptions {
  alias?: OperationParameter<operations["packages_list"], "query", "alias">;
  limit?: OperationParameter<operations["packages_list"], "query", "limit">;
  offset?: OperationParameter<operations["packages_list"], "query", "offset">;
  ordering?: OperationParameter<operations["packages_list"], "query", "ordering">;
  pricingUnit?: OperationParameter<operations["packages_list"], "query", "pricing_unit">;
  search?: OperationParameter<operations["packages_list"], "query", "search">;
  type?: OperationParameter<operations["packages_list"], "query", "type">;
  acceptLanguage?: OperationParameter<operations["packages_list"], "header", "Accept-Language">;
  request?: RequestControls;
}

export type PackagesListResponse = OperationResult<operations["packages_list"]>;

export interface PackagesListCommissionsOptions {
  alias?: OperationParameter<operations["packages_commissions_list"], "query", "alias">;
  limit?: OperationParameter<operations["packages_commissions_list"], "query", "limit">;
  offset?: OperationParameter<operations["packages_commissions_list"], "query", "offset">;
  ordering?: OperationParameter<operations["packages_commissions_list"], "query", "ordering">;
  pricingUnit?: OperationParameter<
    operations["packages_commissions_list"],
    "query",
    "pricing_unit"
  >;
  type?: OperationParameter<operations["packages_commissions_list"], "query", "type">;
  acceptLanguage?: OperationParameter<
    operations["packages_commissions_list"],
    "header",
    "Accept-Language"
  >;
  request?: RequestControls;
}

export type PackagesListCommissionsResponse = OperationResult<
  operations["packages_commissions_list"]
>;

export class PackagesResource {
  readonly #client: ResourceClient;

  constructor(client: ResourceClient) {
    this.#client = client;
  }

  /** List available proxy packages */
  async list(options: PackagesListOptions = {}): Promise<PackagesListResponse> {
    return this.#client._call<PackagesListResponse>(
      {
        operationId: "packages_list",
        method: "GET",
        path: "/packages",
      },
      {
        query: {
          alias: options.alias,
          limit: options.limit,
          offset: options.offset,
          ordering: options.ordering,
          pricing_unit: options.pricingUnit,
          search: options.search,
          type: options.type,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** List affiliate package commissions */
  async listCommissions(
    options: PackagesListCommissionsOptions = {},
  ): Promise<PackagesListCommissionsResponse> {
    return this.#client._call<PackagesListCommissionsResponse>(
      {
        operationId: "packages_commissions_list",
        method: "GET",
        path: "/packages/commissions",
      },
      {
        query: {
          alias: options.alias,
          limit: options.limit,
          offset: options.offset,
          ordering: options.ordering,
          pricing_unit: options.pricingUnit,
          type: options.type,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }
}

export interface ProfileGetOptions {
  acceptLanguage?: OperationParameter<operations["profile_retrieve"], "header", "Accept-Language">;
  request?: RequestControls;
}

export type ProfileGetResponse = OperationResult<operations["profile_retrieve"]>;

export interface ProfileUpdateOptions {
  acceptLanguage?: OperationParameter<
    operations["profile_partial_update"],
    "header",
    "Accept-Language"
  >;
  body?: OperationBody<operations["profile_partial_update"]>;
  request?: RequestControls;
}

export type ProfileUpdateResponse = OperationResult<operations["profile_partial_update"]>;

export interface ProfileDeleteOptions {
  acceptLanguage?: OperationParameter<operations["profile_destroy"], "header", "Accept-Language">;
  request?: RequestControls;
}

export type ProfileDeleteResponse = OperationResult<operations["profile_destroy"]>;

export interface ProfileConfirmTwoFactorOptions {
  acceptLanguage?: OperationParameter<
    operations["profile_2fa_confirm_create"],
    "header",
    "Accept-Language"
  >;
  body: OperationBody<operations["profile_2fa_confirm_create"]>;
  request?: RequestControls;
}

export type ProfileConfirmTwoFactorResponse = OperationResult<
  operations["profile_2fa_confirm_create"]
>;

export interface ProfileDisableTwoFactorOptions {
  acceptLanguage?: OperationParameter<
    operations["profile_2fa_disable_create"],
    "header",
    "Accept-Language"
  >;
  body: OperationBody<operations["profile_2fa_disable_create"]>;
  request?: RequestControls;
}

export type ProfileDisableTwoFactorResponse = OperationResult<
  operations["profile_2fa_disable_create"]
>;

export interface ProfileSetupTwoFactorOptions {
  acceptLanguage?: OperationParameter<
    operations["profile_2fa_setup_create"],
    "header",
    "Accept-Language"
  >;
  request?: RequestControls;
}

export type ProfileSetupTwoFactorResponse = OperationResult<operations["profile_2fa_setup_create"]>;

export interface ProfileGetTwoFactorStatusOptions {
  acceptLanguage?: OperationParameter<
    operations["profile_2fa_status_retrieve"],
    "header",
    "Accept-Language"
  >;
  request?: RequestControls;
}

export type ProfileGetTwoFactorStatusResponse = OperationResult<
  operations["profile_2fa_status_retrieve"]
>;

export interface ProfileChangePasswordOptions {
  acceptLanguage?: OperationParameter<
    operations["profile_change_password_create"],
    "header",
    "Accept-Language"
  >;
  body: OperationBody<operations["profile_change_password_create"]>;
  request?: RequestControls;
}

export type ProfileChangePasswordResponse = OperationResult<
  operations["profile_change_password_create"]
>;

export class ProfileResource {
  readonly #client: ResourceClient;

  constructor(client: ResourceClient) {
    this.#client = client;
  }

  /** Get the current profile */
  async get(options: ProfileGetOptions = {}): Promise<ProfileGetResponse> {
    return this.#client._call<ProfileGetResponse>(
      {
        operationId: "profile_retrieve",
        method: "GET",
        path: "/profile",
      },
      {
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Update the current profile */
  async update(options: ProfileUpdateOptions = {}): Promise<ProfileUpdateResponse> {
    return this.#client._call<ProfileUpdateResponse>(
      {
        operationId: "profile_partial_update",
        method: "PATCH",
        path: "/profile",
      },
      {
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.body === undefined ? {} : { body: options.body }),
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Delete the current account */
  async delete(options: ProfileDeleteOptions = {}): Promise<ProfileDeleteResponse> {
    return this.#client._call<ProfileDeleteResponse>(
      {
        operationId: "profile_destroy",
        method: "DELETE",
        path: "/profile",
      },
      {
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Confirm two-factor setup */
  async confirmTwoFactor(
    options: ProfileConfirmTwoFactorOptions,
  ): Promise<ProfileConfirmTwoFactorResponse> {
    return this.#client._call<ProfileConfirmTwoFactorResponse>(
      {
        operationId: "profile_2fa_confirm_create",
        method: "POST",
        path: "/profile/2fa/confirm",
      },
      {
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        body: options.body,
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Disable two-factor authentication */
  async disableTwoFactor(
    options: ProfileDisableTwoFactorOptions,
  ): Promise<ProfileDisableTwoFactorResponse> {
    return this.#client._call<ProfileDisableTwoFactorResponse>(
      {
        operationId: "profile_2fa_disable_create",
        method: "POST",
        path: "/profile/2fa/disable",
      },
      {
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        body: options.body,
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Start two-factor setup */
  async setupTwoFactor(
    options: ProfileSetupTwoFactorOptions = {},
  ): Promise<ProfileSetupTwoFactorResponse> {
    return this.#client._call<ProfileSetupTwoFactorResponse>(
      {
        operationId: "profile_2fa_setup_create",
        method: "POST",
        path: "/profile/2fa/setup",
      },
      {
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Get two-factor status */
  async getTwoFactorStatus(
    options: ProfileGetTwoFactorStatusOptions = {},
  ): Promise<ProfileGetTwoFactorStatusResponse> {
    return this.#client._call<ProfileGetTwoFactorStatusResponse>(
      {
        operationId: "profile_2fa_status_retrieve",
        method: "GET",
        path: "/profile/2fa/status",
      },
      {
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Change the account password */
  async changePassword(
    options: ProfileChangePasswordOptions,
  ): Promise<ProfileChangePasswordResponse> {
    return this.#client._call<ProfileChangePasswordResponse>(
      {
        operationId: "profile_change_password_create",
        method: "POST",
        path: "/profile/change-password",
      },
      {
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        body: options.body,
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }
}

export interface ProxiesGenerateOptions {
  acceptLanguage?: OperationParameter<
    operations["proxies_generate_create"],
    "header",
    "Accept-Language"
  >;
  body: OperationBody<operations["proxies_generate_create"]>;
  request?: RequestControls;
}

export type ProxiesGenerateResponse = OperationResult<operations["proxies_generate_create"]>;

export class ProxiesResource {
  readonly #client: ResourceClient;

  constructor(client: ResourceClient) {
    this.#client = client;
  }

  /** Generate proxy credentials */
  async generate(options: ProxiesGenerateOptions): Promise<ProxiesGenerateResponse> {
    return this.#client._call<ProxiesGenerateResponse>(
      {
        operationId: "proxies_generate_create",
        method: "POST",
        path: "/proxies/generate",
      },
      {
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        body: options.body,
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }
}

export interface RewardsListOptions {
  level?: OperationParameter<operations["rewards_list"], "query", "level">;
  limit?: OperationParameter<operations["rewards_list"], "query", "limit">;
  offset?: OperationParameter<operations["rewards_list"], "query", "offset">;
  ordering?: OperationParameter<operations["rewards_list"], "query", "ordering">;
  userEmail?: OperationParameter<operations["rewards_list"], "query", "user__email">;
  userId?: OperationParameter<operations["rewards_list"], "query", "user__id">;
  acceptLanguage?: OperationParameter<operations["rewards_list"], "header", "Accept-Language">;
  request?: RequestControls;
}

export type RewardsListResponse = OperationResult<operations["rewards_list"]>;

export interface RewardsClaimOptions {
  acceptLanguage?: OperationParameter<
    operations["rewards_claim_create"],
    "header",
    "Accept-Language"
  >;
  body: OperationBody<operations["rewards_claim_create"]>;
  request?: RequestControls;
}

export type RewardsClaimResponse = OperationResult<operations["rewards_claim_create"]>;

export class RewardsResource {
  readonly #client: ResourceClient;

  constructor(client: ResourceClient) {
    this.#client = client;
  }

  /** List account rewards */
  async list(options: RewardsListOptions = {}): Promise<RewardsListResponse> {
    return this.#client._call<RewardsListResponse>(
      {
        operationId: "rewards_list",
        method: "GET",
        path: "/rewards",
      },
      {
        query: {
          level: options.level,
          limit: options.limit,
          offset: options.offset,
          ordering: options.ordering,
          user__email: options.userEmail,
          user__id: options.userId,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Claim available rewards */
  async claim(options: RewardsClaimOptions): Promise<RewardsClaimResponse> {
    return this.#client._call<RewardsClaimResponse>(
      {
        operationId: "rewards_claim_create",
        method: "POST",
        path: "/rewards/claim",
      },
      {
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        body: options.body,
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }
}

export interface SessionsListOptions {
  acceptLanguage?: OperationParameter<operations["sessions_list"], "header", "Accept-Language">;
  request?: RequestControls;
}

export type SessionsListResponse = OperationResult<operations["sessions_list"]>;

export interface SessionsDeleteOptions {
  id: OperationParameter<operations["sessions_destroy"], "path", "id">;
  acceptLanguage?: OperationParameter<operations["sessions_destroy"], "header", "Accept-Language">;
  request?: RequestControls;
}

export type SessionsDeleteResponse = OperationResult<operations["sessions_destroy"]>;

export class SessionsResource {
  readonly #client: ResourceClient;

  constructor(client: ResourceClient) {
    this.#client = client;
  }

  /** List active proxy sessions */
  async list(options: SessionsListOptions = {}): Promise<SessionsListResponse> {
    return this.#client._call<SessionsListResponse>(
      {
        operationId: "sessions_list",
        method: "GET",
        path: "/sessions",
      },
      {
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Revoke a proxy session */
  async delete(options: SessionsDeleteOptions): Promise<SessionsDeleteResponse> {
    return this.#client._call<SessionsDeleteResponse>(
      {
        operationId: "sessions_destroy",
        method: "DELETE",
        path: "/sessions/{id}",
      },
      {
        path: {
          id: options.id,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }
}

export interface SettingsGetOptions {
  acceptLanguage?: OperationParameter<operations["settings_retrieve"], "header", "Accept-Language">;
  request?: RequestControls;
}

export type SettingsGetResponse = OperationResult<operations["settings_retrieve"]>;

export class SettingsResource {
  readonly #client: ResourceClient;

  constructor(client: ResourceClient) {
    this.#client = client;
  }

  /** Get account settings */
  async get(options: SettingsGetOptions = {}): Promise<SettingsGetResponse> {
    return this.#client._call<SettingsGetResponse>(
      {
        operationId: "settings_retrieve",
        method: "GET",
        path: "/settings",
      },
      {
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }
}

export interface TelegramDashboardGetConnectionOptions {
  acceptLanguage?: OperationParameter<
    operations["integrations_telegram_connection_retrieve"],
    "header",
    "Accept-Language"
  >;
  request?: RequestControls;
}

export type TelegramDashboardGetConnectionResponse = OperationResult<
  operations["integrations_telegram_connection_retrieve"]
>;

export interface TelegramDashboardUpdateConnectionOptions {
  acceptLanguage?: OperationParameter<
    operations["integrations_telegram_connection_partial_update"],
    "header",
    "Accept-Language"
  >;
  body?: OperationBody<operations["integrations_telegram_connection_partial_update"]>;
  request?: RequestControls;
}

export type TelegramDashboardUpdateConnectionResponse = OperationResult<
  operations["integrations_telegram_connection_partial_update"]
>;

export interface TelegramDashboardDeleteConnectionOptions {
  acceptLanguage?: OperationParameter<
    operations["integrations_telegram_connection_destroy"],
    "header",
    "Accept-Language"
  >;
  request?: RequestControls;
}

export type TelegramDashboardDeleteConnectionResponse = OperationResult<
  operations["integrations_telegram_connection_destroy"]
>;

export interface TelegramDashboardCreateLinkOptions {
  acceptLanguage?: OperationParameter<
    operations["integrations_telegram_link_create"],
    "header",
    "Accept-Language"
  >;
  request?: RequestControls;
}

export type TelegramDashboardCreateLinkResponse = OperationResult<
  operations["integrations_telegram_link_create"]
>;

export class TelegramDashboardResource {
  readonly #client: ResourceClient;

  constructor(client: ResourceClient) {
    this.#client = client;
  }

  /** Get the Telegram dashboard connection */
  async getConnection(
    options: TelegramDashboardGetConnectionOptions = {},
  ): Promise<TelegramDashboardGetConnectionResponse> {
    return this.#client._call<TelegramDashboardGetConnectionResponse>(
      {
        operationId: "integrations_telegram_connection_retrieve",
        method: "GET",
        path: "/integrations/telegram/connection",
      },
      {
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Update Telegram dashboard preferences */
  async updateConnection(
    options: TelegramDashboardUpdateConnectionOptions = {},
  ): Promise<TelegramDashboardUpdateConnectionResponse> {
    return this.#client._call<TelegramDashboardUpdateConnectionResponse>(
      {
        operationId: "integrations_telegram_connection_partial_update",
        method: "PATCH",
        path: "/integrations/telegram/connection",
      },
      {
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.body === undefined ? {} : { body: options.body }),
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Disconnect the Telegram dashboard */
  async deleteConnection(
    options: TelegramDashboardDeleteConnectionOptions = {},
  ): Promise<TelegramDashboardDeleteConnectionResponse> {
    return this.#client._call<TelegramDashboardDeleteConnectionResponse>(
      {
        operationId: "integrations_telegram_connection_destroy",
        method: "DELETE",
        path: "/integrations/telegram/connection",
      },
      {
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Create a Telegram account link */
  async createLink(
    options: TelegramDashboardCreateLinkOptions = {},
  ): Promise<TelegramDashboardCreateLinkResponse> {
    return this.#client._call<TelegramDashboardCreateLinkResponse>(
      {
        operationId: "integrations_telegram_link_create",
        method: "POST",
        path: "/integrations/telegram/link",
      },
      {
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }
}

export interface TelegramServiceConsumeLinkOptions {
  serviceSecret: OperationParameter<
    operations["integrations_telegram_link_consume_create"],
    "header",
    "X-ProxyRequest-Telegram-Secret"
  >;
  acceptLanguage?: OperationParameter<
    operations["integrations_telegram_link_consume_create"],
    "header",
    "Accept-Language"
  >;
  body: OperationBody<operations["integrations_telegram_link_consume_create"]>;
  request?: RequestControls;
}

export type TelegramServiceConsumeLinkResponse = OperationResult<
  operations["integrations_telegram_link_consume_create"]
>;

export interface TelegramServiceCreateSessionOptions {
  serviceSecret: OperationParameter<
    operations["integrations_telegram_session_create"],
    "header",
    "X-ProxyRequest-Telegram-Secret"
  >;
  acceptLanguage?: OperationParameter<
    operations["integrations_telegram_session_create"],
    "header",
    "Accept-Language"
  >;
  body: OperationBody<operations["integrations_telegram_session_create"]>;
  request?: RequestControls;
}

export type TelegramServiceCreateSessionResponse = OperationResult<
  operations["integrations_telegram_session_create"]
>;

export class TelegramServiceResource {
  readonly #client: ResourceClient;

  constructor(client: ResourceClient) {
    this.#client = client;
  }

  /** Consume a Telegram account link */
  async consumeLink(
    options: TelegramServiceConsumeLinkOptions,
  ): Promise<TelegramServiceConsumeLinkResponse> {
    return this.#client._call<TelegramServiceConsumeLinkResponse>(
      {
        operationId: "integrations_telegram_link_consume_create",
        method: "POST",
        path: "/integrations/telegram/link/consume",
      },
      {
        headers: {
          "X-ProxyRequest-Telegram-Secret": options.serviceSecret,
          "Accept-Language": options.acceptLanguage,
        },
        body: options.body,
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Create a Telegram API session */
  async createSession(
    options: TelegramServiceCreateSessionOptions,
  ): Promise<TelegramServiceCreateSessionResponse> {
    return this.#client._call<TelegramServiceCreateSessionResponse>(
      {
        operationId: "integrations_telegram_session_create",
        method: "POST",
        path: "/integrations/telegram/session",
      },
      {
        headers: {
          "X-ProxyRequest-Telegram-Secret": options.serviceSecret,
          "Accept-Language": options.acceptLanguage,
        },
        body: options.body,
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }
}

export interface UsersListOptions {
  email?: OperationParameter<operations["users_list"], "query", "email">;
  id?: OperationParameter<operations["users_list"], "query", "id">;
  limit?: OperationParameter<operations["users_list"], "query", "limit">;
  offset?: OperationParameter<operations["users_list"], "query", "offset">;
  ordering?: OperationParameter<operations["users_list"], "query", "ordering">;
  packageId?: OperationParameter<operations["users_list"], "query", "package__id">;
  search?: OperationParameter<operations["users_list"], "query", "search">;
  username?: OperationParameter<operations["users_list"], "query", "username">;
  acceptLanguage?: OperationParameter<operations["users_list"], "header", "Accept-Language">;
  request?: RequestControls;
}

export type UsersListResponse = OperationResult<operations["users_list"]>;

export interface UsersCreateOptions {
  acceptLanguage?: OperationParameter<operations["users_create"], "header", "Accept-Language">;
  body: OperationBody<operations["users_create"]>;
  request?: RequestControls;
}

export type UsersCreateResponse = OperationResult<operations["users_create"]>;

export interface UsersGetOptions {
  id: OperationParameter<operations["users_retrieve"], "path", "id">;
  acceptLanguage?: OperationParameter<operations["users_retrieve"], "header", "Accept-Language">;
  request?: RequestControls;
}

export type UsersGetResponse = OperationResult<operations["users_retrieve"]>;

export interface UsersUpdateOptions {
  id: OperationParameter<operations["users_partial_update"], "path", "id">;
  acceptLanguage?: OperationParameter<
    operations["users_partial_update"],
    "header",
    "Accept-Language"
  >;
  body?: OperationBody<operations["users_partial_update"]>;
  request?: RequestControls;
}

export type UsersUpdateResponse = OperationResult<operations["users_partial_update"]>;

export interface UsersDeleteOptions {
  id: OperationParameter<operations["users_destroy"], "path", "id">;
  acceptLanguage?: OperationParameter<operations["users_destroy"], "header", "Accept-Language">;
  request?: RequestControls;
}

export type UsersDeleteResponse = OperationResult<operations["users_destroy"]>;

export interface UsersAddDataOptions {
  id: OperationParameter<operations["users_data_add_create"], "path", "id">;
  acceptLanguage?: OperationParameter<
    operations["users_data_add_create"],
    "header",
    "Accept-Language"
  >;
  body: OperationBody<operations["users_data_add_create"]>;
  request?: RequestControls;
}

export type UsersAddDataResponse = OperationResult<operations["users_data_add_create"]>;

export interface UsersSubtractDataOptions {
  id: OperationParameter<operations["users_data_subtract_create"], "path", "id">;
  acceptLanguage?: OperationParameter<
    operations["users_data_subtract_create"],
    "header",
    "Accept-Language"
  >;
  body: OperationBody<operations["users_data_subtract_create"]>;
  request?: RequestControls;
}

export type UsersSubtractDataResponse = OperationResult<operations["users_data_subtract_create"]>;

export interface UsersListOrdersOptions {
  email?: OperationParameter<operations["users_orders_list"], "query", "email">;
  idPath: OperationParameter<operations["users_orders_list"], "path", "id">;
  idQuery?: OperationParameter<operations["users_orders_list"], "query", "id">;
  limit?: OperationParameter<operations["users_orders_list"], "query", "limit">;
  offset?: OperationParameter<operations["users_orders_list"], "query", "offset">;
  ordering?: OperationParameter<operations["users_orders_list"], "query", "ordering">;
  username?: OperationParameter<operations["users_orders_list"], "query", "username">;
  acceptLanguage?: OperationParameter<operations["users_orders_list"], "header", "Accept-Language">;
  request?: RequestControls;
}

export type UsersListOrdersResponse = OperationResult<operations["users_orders_list"]>;

export interface UsersResetPasswordOptions {
  id: OperationParameter<operations["users_password_create"], "path", "id">;
  acceptLanguage?: OperationParameter<
    operations["users_password_create"],
    "header",
    "Accept-Language"
  >;
  body?: OperationBody<operations["users_password_create"]>;
  request?: RequestControls;
}

export type UsersResetPasswordResponse = OperationResult<operations["users_password_create"]>;

export class UsersResource {
  readonly #client: ResourceClient;

  constructor(client: ResourceClient) {
    this.#client = client;
  }

  /** List users in the current account */
  async list(options: UsersListOptions = {}): Promise<UsersListResponse> {
    return this.#client._call<UsersListResponse>(
      {
        operationId: "users_list",
        method: "GET",
        path: "/users",
      },
      {
        query: {
          email: options.email,
          id: options.id,
          limit: options.limit,
          offset: options.offset,
          ordering: options.ordering,
          package__id: options.packageId,
          search: options.search,
          username: options.username,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Create a sub-user */
  async create(options: UsersCreateOptions): Promise<UsersCreateResponse> {
    return this.#client._call<UsersCreateResponse>(
      {
        operationId: "users_create",
        method: "POST",
        path: "/users",
      },
      {
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        body: options.body,
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Get a user */
  async get(options: UsersGetOptions): Promise<UsersGetResponse> {
    return this.#client._call<UsersGetResponse>(
      {
        operationId: "users_retrieve",
        method: "GET",
        path: "/users/{id}",
      },
      {
        path: {
          id: options.id,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Update a user */
  async update(options: UsersUpdateOptions): Promise<UsersUpdateResponse> {
    return this.#client._call<UsersUpdateResponse>(
      {
        operationId: "users_partial_update",
        method: "PATCH",
        path: "/users/{id}",
      },
      {
        path: {
          id: options.id,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.body === undefined ? {} : { body: options.body }),
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Delete a user */
  async delete(options: UsersDeleteOptions): Promise<UsersDeleteResponse> {
    return this.#client._call<UsersDeleteResponse>(
      {
        operationId: "users_destroy",
        method: "DELETE",
        path: "/users/{id}",
      },
      {
        path: {
          id: options.id,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Add data to a sub-user order */
  async addData(options: UsersAddDataOptions): Promise<UsersAddDataResponse> {
    return this.#client._call<UsersAddDataResponse>(
      {
        operationId: "users_data_add_create",
        method: "POST",
        path: "/users/{id}/data/add",
      },
      {
        path: {
          id: options.id,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        body: options.body,
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Subtract data from a sub-user order */
  async subtractData(options: UsersSubtractDataOptions): Promise<UsersSubtractDataResponse> {
    return this.#client._call<UsersSubtractDataResponse>(
      {
        operationId: "users_data_subtract_create",
        method: "POST",
        path: "/users/{id}/data/subtract",
      },
      {
        path: {
          id: options.id,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        body: options.body,
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** List a sub-user's orders */
  async listOrders(options: UsersListOrdersOptions): Promise<UsersListOrdersResponse> {
    return this.#client._call<UsersListOrdersResponse>(
      {
        operationId: "users_orders_list",
        method: "GET",
        path: "/users/{id}/orders",
      },
      {
        path: {
          id: options.idPath,
        },
        query: {
          email: options.email,
          id: options.idQuery,
          limit: options.limit,
          offset: options.offset,
          ordering: options.ordering,
          username: options.username,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Rotate a sub-user proxy password */
  async resetPassword(options: UsersResetPasswordOptions): Promise<UsersResetPasswordResponse> {
    return this.#client._call<UsersResetPasswordResponse>(
      {
        operationId: "users_password_create",
        method: "POST",
        path: "/users/{id}/password",
      },
      {
        path: {
          id: options.id,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.body === undefined ? {} : { body: options.body }),
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }
}

export interface WebhooksListOptions {
  limit?: OperationParameter<operations["webhooks_list"], "query", "limit">;
  offset?: OperationParameter<operations["webhooks_list"], "query", "offset">;
  acceptLanguage?: OperationParameter<operations["webhooks_list"], "header", "Accept-Language">;
  request?: RequestControls;
}

export type WebhooksListResponse = OperationResult<operations["webhooks_list"]>;

export interface WebhooksCreateOptions {
  acceptLanguage?: OperationParameter<operations["webhooks_create"], "header", "Accept-Language">;
  body: OperationBody<operations["webhooks_create"]>;
  request?: RequestControls;
}

export type WebhooksCreateResponse = OperationResult<operations["webhooks_create"]>;

export interface WebhooksGetOptions {
  id: OperationParameter<operations["webhooks_retrieve"], "path", "id">;
  acceptLanguage?: OperationParameter<operations["webhooks_retrieve"], "header", "Accept-Language">;
  request?: RequestControls;
}

export type WebhooksGetResponse = OperationResult<operations["webhooks_retrieve"]>;

export interface WebhooksDeleteOptions {
  id: OperationParameter<operations["webhooks_destroy"], "path", "id">;
  acceptLanguage?: OperationParameter<operations["webhooks_destroy"], "header", "Accept-Language">;
  request?: RequestControls;
}

export type WebhooksDeleteResponse = OperationResult<operations["webhooks_destroy"]>;

export class WebhooksResource {
  readonly #client: ResourceClient;

  constructor(client: ResourceClient) {
    this.#client = client;
  }

  /** List customer webhooks */
  async list(options: WebhooksListOptions = {}): Promise<WebhooksListResponse> {
    return this.#client._call<WebhooksListResponse>(
      {
        operationId: "webhooks_list",
        method: "GET",
        path: "/webhooks",
      },
      {
        query: {
          limit: options.limit,
          offset: options.offset,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Create a customer webhook */
  async create(options: WebhooksCreateOptions): Promise<WebhooksCreateResponse> {
    return this.#client._call<WebhooksCreateResponse>(
      {
        operationId: "webhooks_create",
        method: "POST",
        path: "/webhooks",
      },
      {
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        body: options.body,
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Get a customer webhook */
  async get(options: WebhooksGetOptions): Promise<WebhooksGetResponse> {
    return this.#client._call<WebhooksGetResponse>(
      {
        operationId: "webhooks_retrieve",
        method: "GET",
        path: "/webhooks/{id}",
      },
      {
        path: {
          id: options.id,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }

  /** Delete a customer webhook */
  async delete(options: WebhooksDeleteOptions): Promise<WebhooksDeleteResponse> {
    return this.#client._call<WebhooksDeleteResponse>(
      {
        operationId: "webhooks_destroy",
        method: "DELETE",
        path: "/webhooks/{id}",
      },
      {
        path: {
          id: options.id,
        },
        headers: {
          "Accept-Language": options.acceptLanguage,
        },
        ...(options.request === undefined ? {} : { request: options.request }),
      },
    );
  }
}

export interface ResourceCollection {
  readonly apiKeys: APIKeysResource;
  readonly affiliates: AffiliatesResource;
  readonly analytics: AnalyticsResource;
  readonly authorization: AuthorizationResource;
  readonly coupons: CouponsResource;
  readonly invoices: InvoicesResource;
  readonly locations: LocationsResource;
  readonly news: NewsResource;
  readonly orders: OrdersResource;
  readonly packages: PackagesResource;
  readonly profile: ProfileResource;
  readonly proxies: ProxiesResource;
  readonly rewards: RewardsResource;
  readonly sessions: SessionsResource;
  readonly settings: SettingsResource;
  readonly telegram: TelegramDashboardResource;
  readonly telegramService: TelegramServiceResource;
  readonly users: UsersResource;
  readonly webhooks: WebhooksResource;
}

export function createResourceCollection(client: ResourceClient): ResourceCollection {
  return {
    apiKeys: new APIKeysResource(client),
    affiliates: new AffiliatesResource(client),
    analytics: new AnalyticsResource(client),
    authorization: new AuthorizationResource(client),
    coupons: new CouponsResource(client),
    invoices: new InvoicesResource(client),
    locations: new LocationsResource(client),
    news: new NewsResource(client),
    orders: new OrdersResource(client),
    packages: new PackagesResource(client),
    profile: new ProfileResource(client),
    proxies: new ProxiesResource(client),
    rewards: new RewardsResource(client),
    sessions: new SessionsResource(client),
    settings: new SettingsResource(client),
    telegram: new TelegramDashboardResource(client),
    telegramService: new TelegramServiceResource(client),
    users: new UsersResource(client),
    webhooks: new WebhooksResource(client),
  };
}
