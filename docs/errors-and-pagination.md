# Errors and pagination

## Error handling

`ApiError` provides a stable contract across API and network failures:

- `kind` categorizes the failure;
- `statusCode` contains the HTTP status when available;
- `detail` and `fieldErrors` expose API validation information;
- `requestId` can be supplied to ProxyRequest support;
- `retryAfter` contains a numeric Retry-After value when present;
- `contentLanguage`, `headers`, and `rawBody` preserve response context;
- `cause` preserves the underlying transport or decoding error.

The SDK performs a small number of automatic retries for supported writes after transient network failures and retryable conflicts. Other failed writes are returned immediately. If the final outcome is uncertain, inspect the affected resource before submitting another payment or mutation. Apply bounded exponential backoff to safe reads and honor `retryAfter`.

## Pagination

Page responses use `count`, `next`, `previous`, and `results`. You can process one page directly or use the lazy async iterator:

```ts
const stream = client.paginate(
  ({ limit, offset }) => client.invoices.list({
    limit,
    offset,
    status: "paid",
  }),
  { limit: 100, maxPages: 1_000 },
);

for await (const invoice of stream) {
  await reconcile(invoice);
}
```

The iterator performs no request until iteration begins. It rejects repeated `next` URLs, invalid page shapes, and runs that exceed `maxPages`.
