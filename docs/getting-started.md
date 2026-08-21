# Getting started

## Choose the correct credential

- Use a Static API key for server-to-server operator and reseller automation.
- Use a Bearer access token for a signed-in dashboard user.
- Use an anonymous client only for endpoints explicitly documented as public.
- Pass the Telegram service secret only to `client.telegramService` calls.

Static keys and service secrets must never be included in browser bundles. Create and rotate keys through `client.apiKeys` or the dashboard, restrict source IPs where appropriate, and use separate keys per integration.

## Configure the client

```ts
import { ProxyRequestClient } from "@proxyrequest/sdk";

export const proxyRequest = ProxyRequestClient.withApiKey(
  process.env.PROXYREQUEST_API_KEY!,
  {
    language: "en",
    timeoutMs: 15_000,
  },
);
```

`baseUrl` can point at a staging deployment. `fetch` can be replaced for framework integration, observability, or testing. Individual calls accept a nested `request` object with `signal`, `headers`, and `timeoutMs`.

## Understand the two traffic models

Before creating users or invoices, confirm whether your deployment uses traditional data allocation or package-based authentication. In package-based flows, keep a durable mapping between your local products and ProxyRequest package UUIDs. Headless reseller integrations also map local customer IDs to ProxyRequest user UUIDs.

Read:

- [API fundamentals](https://proxyrequest.com/docs/integration/api-fundamentals/)
- [Resource map](https://proxyrequest.com/docs/integration/api-resource-map/)
- [Users and data](https://proxyrequest.com/docs/integration/users-and-data/)
- [Catalog and proxies](https://proxyrequest.com/docs/integration/catalog-and-proxies/)

## TypeScript conventions

Resource and method names are camelCase. JSON models deliberately keep their wire-level snake_case names. Dates and datetimes remain ISO strings. Optional fields are omitted with `undefined`; the SDK does not silently convert or validate model instances at runtime.
