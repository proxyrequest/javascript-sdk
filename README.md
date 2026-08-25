# ProxyRequest TypeScript SDK

[![npm version](https://img.shields.io/npm/v/@proxyrequest/sdk.svg)](https://www.npmjs.com/package/@proxyrequest/sdk)
[![CI](https://github.com/proxyrequest/javascript-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/proxyrequest/javascript-sdk/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/node/v/@proxyrequest/sdk.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

The official TypeScript SDK for the [ProxyRequest public API](https://proxyrequest.com/docs/api/). It provides a typed, promise-based client for Node.js 22+ and modern browsers, with both ESM and CommonJS builds.

## What is ProxyRequest?

[ProxyRequest](https://proxyrequest.com/) is the control plane for operating a white-label proxy platform. It connects the commercial and operational pieces that a proxy provider or reseller would otherwise have to build separately:

- customer and sub-user accounts;
- packages, traffic allocations, connection limits, and proxy credentials;
- invoices, payment links, coupons, rewards, and reseller workflows;
- residential and static ISP proxy inventory, targeting, routing, and sessions;
- usage accounting, analytics, operational visibility, and webhooks;
- dashboard, branding, API automation, and Telegram integration.

This SDK talks to the management API at `https://api.proxyrequest.com/api/v1`. It is not itself an HTTP/SOCKS proxy client. The credentials returned by the proxy generation endpoints are used separately by your application, browser, scraper, or other proxy-aware software.

Start with the [platform overview](https://proxyrequest.com/docs/), then see [API fundamentals](https://proxyrequest.com/docs/integration/api-fundamentals/) and the [API resource map](https://proxyrequest.com/docs/integration/api-resource-map/).

## Installation

```bash
npm install @proxyrequest/sdk
```

```bash
pnpm add @proxyrequest/sdk
```

```bash
yarn add @proxyrequest/sdk
```

## Quick start

```ts
import { ProxyRequestClient } from "@proxyrequest/sdk";

const client = ProxyRequestClient.withApiKey(process.env.PROXYREQUEST_API_KEY!);

const users = await client.users.list({ limit: 25, search: "customer@example.com" });
for (const user of users.results) {
  console.log(user.id, user.username);
}
```

CommonJS is supported as well:

```js
const { ProxyRequestClient } = require("@proxyrequest/sdk");
```

`Client` is exported as a shorter alias for `ProxyRequestClient`.

## Authentication

Static API keys are intended for trusted backend services:

```ts
const client = ProxyRequestClient.withApiKey(process.env.PROXYREQUEST_API_KEY!, {
  language: "en",
  timeoutMs: 15_000,
});
```

Dashboard access tokens use Bearer authentication:

```ts
const client = ProxyRequestClient.withBearerToken(accessToken);
```

Public login, signup, locations, and similar calls can use an anonymous client:

```ts
const client = ProxyRequestClient.anonymous();
```

Never embed a Static API key or webhook secret in frontend JavaScript. Browser support is intended for anonymous or appropriately scoped end-user token flows. See the service documentation on [authentication and API fundamentals](https://proxyrequest.com/docs/integration/api-fundamentals/).

## Resource API

The client exposes all 80 operations through 18 resource groups:

```ts
client.apiKeys;
client.affiliates;
client.analytics;
client.authorization;
client.coupons;
client.invoices;
client.locations;
client.news;
client.orders;
client.packages;
client.profile;
client.proxies;
client.rewards;
client.sessions;
client.settings;
client.telegram;
client.users;
client.webhooks;
```

Method and option names use idiomatic `camelCase`. Request and response bodies preserve the API's `snake_case` JSON fields, so the values you inspect are exactly the values sent over the wire.

### Create a managed user

```ts
const user = await client.users.create({
  body: {
    username: "customer_123",
    password: "a-long-random-password",
    is_reseller: false,
    is_top_level: false,
    package_id: "7ef79941-a099-4e4e-9282-a231bc683003",
  },
});
```

Read [users and data](https://proxyrequest.com/docs/integration/users-and-data/) for traditional and package-based account models.

### Add data to a user's order

```ts
await client.users.addData({
  id: user.id!,
  body: {
    package_id: "7ef79941-a099-4e4e-9282-a231bc683003",
    data: 10 * 1024 ** 3,
  },
});
```

### Create an invoice and payment link

```ts
const invoice = await client.invoices.create({
  body: {
    gateway: "stripe",
    package_id: "7ef79941-a099-4e4e-9282-a231bc683003",
    user_id: user.id,
    data: 10 * 1024 ** 3,
  },
});

const payment = await client.invoices.getPaymentLink({ id: invoice.id! });
console.log(payment.payment_url);
```

Invoice creation is the normal API workflow for selling packages or topping up a user. Review [reseller workflow](https://proxyrequest.com/docs/integration/reseller-workflow/) and [billing and growth](https://proxyrequest.com/docs/integration/billing-and-growth/) before implementing checkout.

### Generate proxy credentials

```ts
const generated = await client.proxies.generate({
  body: {
    package_id: "7ef79941-a099-4e4e-9282-a231bc683003",
    user_id: user.id,
    quantity: 5,
    targeting: { country: "US" },
  },
});

console.log(generated.proxies);
```

See [catalog and proxies](https://proxyrequest.com/docs/integration/catalog-and-proxies/) and the separate [proxy connection documentation](https://proxyrequest.com/docs/proxy/authentication/).

## Safe mutations and optimistic concurrency

For API operations that declare `Idempotency-Key`, the SDK generates a UUID by
default. It reuses that key for up to three total attempts when the outcome is
ambiguous: a network failure, or `409 Conflict` with a numeric `Retry-After` of
at most five seconds. Other HTTP errors are returned immediately. Existing
method calls need no changes; pass a stable key when it must survive a process
restart:

```ts
const response = await client.invoices.createWithResponse({
  body: { gateway: "stripe", package_id: packageId },
  idempotencyKey: `checkout:${orderId}`,
});

console.log(response.data.id, response.etag, response.idempotencyReplayed);
```

Every generated method also has a `WithResponse` variant exposing `statusCode`,
`headers`, `etag`, and `idempotencyReplayed`. Automatic key generation can be
disabled without blocking explicit keys:

```ts
const client = ProxyRequestClient.withApiKey(apiKey, { idempotency: false });
```

Updates and deletes that declare `If-Match` accept the latest strong ETag:

```ts
await client.users.update({ id: userId, ifMatch: response.etag, body: changes });
```

A stale value raises `ApiError` with `kind === "precondition"` and the current
server ETag in `currentEtag`. The SDK deliberately does not cache ETags: callers
choose which representation is being updated.

## Pagination

List methods return the API page model. Use `client.paginate()` when you want a lazy async stream:

```ts
for await (const user of client.paginate(
  ({ limit, offset }) => client.users.list({ limit, offset, ordering: "-created" }),
  { limit: 100 },
)) {
  console.log(user.username);
}
```

The iterator follows `next`, rejects repeated pages, and stops after a configurable safety limit.

## Errors

Every non-2xx API response and transport failure is normalized as `ApiError`:

```ts
import { ApiError } from "@proxyrequest/sdk";

try {
  await client.users.get({ id: "missing-user-id" });
} catch (error) {
  if (error instanceof ApiError) {
    console.error(error.kind, error.statusCode, error.detail);
    console.error(error.fieldErrors, error.requestId, error.retryAfter);
  }
}
```

Kinds include `validation`, `authentication`, `permission`, `not_found`, `conflict`, `precondition`, `rate_limit`, `server`, `network`, and `unexpected`. Only ambiguous outcomes for idempotent operations are retried automatically; tokens are never refreshed automatically. See [common integration errors](https://proxyrequest.com/docs/integration/common-errors/).

## Per-request controls and custom Fetch

```ts
const controller = new AbortController();

await client.analytics.getOverall({
  start: "2026-08-01",
  end: "2026-08-31",
  request: {
    signal: controller.signal,
    timeoutMs: 30_000,
    headers: { "X-Correlation-ID": crypto.randomUUID() },
  },
});
```

Frameworks such as SvelteKit or test suites can inject their own Fetch implementation:

```ts
const client = ProxyRequestClient.withBearerToken(token, { fetch });
```

## Invoice PDFs

```ts
const download = await client.invoices.downloadPdf({ id: invoice.id! });

// Node.js
const { writeFile } = await import("node:fs/promises");
await writeFile(download.filename, download.content);

// Browser
const objectUrl = URL.createObjectURL(download.blob());
```

`FileDownload` is deliberately filesystem-independent. It exposes `content`, `filename`, `contentType`, `arrayBuffer()`, `blob()`, and `text()`.

## Webhooks

Always verify the exact raw request body before parsing JSON:

```ts
import { WebhookVerifier } from "@proxyrequest/sdk";

const event = await WebhookVerifier.decodeVerifiedJson(
  rawBody,
  request.headers.get("ProxyRequest-Signature") ?? "",
  process.env.PROXYREQUEST_WEBHOOK_SECRET!,
);
```

Verification supports the `t=...,v1=...` format, multiple `v1` values, Web Crypto HMAC-SHA256, and a default five-minute tolerance. See the [webhook integration guide](https://proxyrequest.com/docs/integration/webhooks/) and [event reference](https://proxyrequest.com/docs/reference/webhook-events/).

## Raw requests

Use the escape hatch for a newly introduced endpoint that is not yet present in the generated resources:

```ts
const response = await client.request("POST", "/new-endpoint", {
  query: { preview: true },
  body: { example_field: "value" },
});
```

It reuses base URL, authentication, language, timeout, cancellation, and `ApiError` behavior.

## Types and generated code

All 127 OpenAPI model types are exported from both the package root and `@proxyrequest/sdk/models`:

```ts
import type { User, InvoiceCreateRequestRequest } from "@proxyrequest/sdk/models";
```

Advanced consumers can import raw schema types:

```ts
import type { paths, operations } from "@proxyrequest/sdk/openapi";
```

Generated files are committed for reproducible builds. Run `npm run generate` after replacing `openapi/openapi.yaml`; CI uses `npm run generate:check` to reject stale output.

## Development

```bash
npm ci
npm run generate:check
npm run lint
npm run typecheck
npm test
npm run build
npm run validate:package
npm run test:package
```

The repository also has a real Chromium smoke test via `npm run test:browser`.

## More documentation

- [Getting started](docs/getting-started.md)
- [Reseller workflow](docs/reseller-workflow.md)
- [Errors and pagination](docs/errors-and-pagination.md)
- [Webhook verification](docs/webhooks.md)
- [Release process](docs/releasing.md)
- [Full API reference](https://proxyrequest.com/docs/api/)
- [Platform changelog](https://proxyrequest.com/changelog/)

## License

[MIT](LICENSE)
