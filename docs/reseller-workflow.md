# Reseller workflow

A typical headless reseller integration follows this sequence:

1. Synchronize the ProxyRequest package catalog with your local products.
2. Create a managed ProxyRequest user when a customer is created locally.
3. Create an invoice for the package, traffic amount, quantity, and gateway selected by the customer.
4. Redirect the customer to the payment link when the gateway requires it.
5. Confirm state through invoice retrieval and webhook events rather than trusting a browser redirect alone.
6. Allocate or subtract data through the user endpoints when the business workflow requires a manual adjustment.
7. Generate credentials for the selected package and user.
8. Use analytics, orders, and webhook events to reconcile usage and lifecycle state.

## Invoice example

```ts
const invoice = await client.invoices.create({
  body: {
    gateway: "stripe",
    package_id: packageId,
    user_id: userId,
    data: bytesPurchased,
    coupon_code: couponCode,
  },
});

const { payment_url } = await client.invoices.getPaymentLink({ id: invoice.id! });
```

Store the ProxyRequest invoice ID with your local checkout record. Treat invoice state and verified webhooks as the authoritative payment result. Use idempotency and reconciliation in your own application whenever a local action can be retried.

Further reading:

- [Reseller workflow](https://proxyrequest.com/docs/integration/reseller-workflow/)
- [Billing and growth](https://proxyrequest.com/docs/integration/billing-and-growth/)
- [Users and data](https://proxyrequest.com/docs/integration/users-and-data/)
- [Analytics](https://proxyrequest.com/docs/integration/analytics/)
- [Webhook events](https://proxyrequest.com/docs/reference/webhook-events/)
