# Webhook verification

ProxyRequest signs a string composed from the timestamp, a period, and the exact raw body. Parsing and re-serializing JSON before verification changes the signed bytes and invalidates the signature.

```ts
const valid = await WebhookVerifier.verify(rawBody, signature, webhookSecret, {
  timestampHeader,
  tolerance: 300,
});
```

`verifyOrThrow()` raises `InvalidSignatureError`. `decodeVerifiedJson()` verifies first and then returns a typed JSON object.

Operational requirements:

- preserve the raw request bytes in the web framework;
- store webhook secrets only on the server;
- reject expired signatures and mismatched timestamp headers;
- return quickly and move slow processing to a queue;
- make event handling idempotent because delivery can be retried;
- reconcile critical invoice/order state through the API.

Refer to [webhook integration](https://proxyrequest.com/docs/integration/webhooks/) and the [event reference](https://proxyrequest.com/docs/reference/webhook-events/).
