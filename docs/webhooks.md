# Webhook verification

ProxyRequest sends `X-Signature`: standard padded Base64 of HMAC-SHA256 over the exact raw body. Parsing and re-serializing JSON before verification changes the signed bytes and invalidates the signature. Use SDK 2.0.0 or newer; version 1.0.0 does not support the current delivery format.

```ts
const valid = await WebhookVerifier.verify(rawBody, signature, webhookSecret);
```

`verifyOrThrow()` raises `InvalidSignatureError`. `decodeVerifiedJson()` verifies first and then returns a typed JSON object.

Operational requirements:

- preserve the raw request bytes in the web framework;
- store webhook secrets only on the server;
- reject invalid signatures; current deliveries have no signed timestamp, so signature verification alone cannot prevent replay;
- return quickly and move slow processing to a queue;
- make event handling safe for duplicate delivery;
- reconcile critical invoice/order state through the API.

Refer to [webhook integration](https://proxyrequest.com/docs/integration/webhooks/) and the [event reference](https://proxyrequest.com/docs/reference/webhook-events/).
