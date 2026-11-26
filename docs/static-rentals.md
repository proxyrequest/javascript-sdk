# Static proxy rentals

Use an owner API key or an integration key with access to the operations below. An integration key needs the `read` and `credentials` scopes to read rental connection credentials, and the `billing` scope to reserve, check out and renew.

## Connect to an existing rental

```ts
import { ProxyRequestClient } from "@proxyrequest/sdk";

const client = ProxyRequestClient.withApiKey(process.env.PROXYREQUEST_API_KEY!);
const id = process.env.PROXYREQUEST_ORDER_ID!;
const rental = await client.orders.getRental({ id });
const ready = rental.results.filter((endpoint) => endpoint.ready);
const urls = await client.staticProxies.exportUrls({ orderId: id, protocol: "socks5" });
```

Use each ready connection's own username and password when present. Shared credentials are also available on the rental. Keep connection details out of logs. Fetch more results using `limit` and `offset`. If an IP is replaced, refresh the connection data using the same endpoint ID.

## Reserve, check out and renew

```ts
const selection = { offer_id: process.env.PROXYREQUEST_OFFER_ID! };
const selectionPrice = await client.orders.quotePurchase({ body: selection });
const reserved = await client.orders.reserve({
  body: selection,
  idempotencyKey: "reserve:integration-order-42",
});

const quote = await client.orders.quoteCheckout({
  id: reserved.id,
  body: { gateway: "wallet" },
});
const invoice = await client.orders.checkout({
  id: reserved.id,
  body: { gateway: "wallet", expected_total: quote.total },
  idempotencyKey: "checkout:integration-order-42",
});
```

Poll `orders.getRental({ id: reserved.id })` with bounded backoff. Check the invoice's fulfillment status and take only ready endpoints. A paid invoice can have pending endpoints or a partial refund. Store the invoice ID and reuse each operation's key after a timeout. If the API returns `price_changed`, obtain a fresh quote and confirm it before starting a new logical attempt.

To renew selected endpoints, send `{term_id, endpoint_ids, invoice: {gateway: "wallet"}}` to `orders.quoteRenewal`. Send the same selection and the returned `total` as `expected_total` to `orders.renew` with a new operation key. Re-read the rental to confirm the new paid periods.

## Rotate a proxy password

Use a key with the `manage` scope. Check `endpoint.capabilities.rotate_password` before requesting rotation for the endpoint's credential group.

```ts
const rotation = await client.orders.resetProxyPasswordWithResponse({ id, endpointId });
```

HTTP 200 confirms an immediate reset. HTTP 202 means the provider reset is queued. Poll the rental until the endpoint's `password_rotation_status` is `succeeded` before reading and applying the new credentials for every IP in the group. A provider without password rotation returns HTTP 400 with code `unsupported_operation`.

Calendar renewal uses the selected term and charges the wallet once per supplier group. All IPs in that group renew together.
