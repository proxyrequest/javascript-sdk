# Backend compatibility and MFA

The canonical schema in `openapi/openapi.yaml` is copied without filtering from
the public backend. `openapi/source.json` pins its SHA-256 and source commit.
Generators derive a projection that excludes only `sessions_list` and
`sessions_destroy`: 79 supported operations in 17 groups. Do not call the removed
`client.sessions` resource. Proxy-generation sticky-session options are unchanged.

## Login with an OTP challenge

Password login and Google login return either tokens (HTTP 200) or an OTP challenge
(HTTP 202). A challenge is not an authenticated session. Complete it using the
anonymous client and the code supplied by the user:

```ts
import { ProxyRequestClient } from "@proxyrequest/sdk";

async function signIn(email: string, password: string, readCode: () => Promise<string>) {
  const anonymous = ProxyRequestClient.anonymous();
  const result = await anonymous.authorization.login({ body: { email, password } });
  const tokens = "challenge" in result
    ? await anonymous.authorization.verifyOtp({
        body: { challenge: result.challenge, code: await readCode() },
      })
    : result;
  return ProxyRequestClient.withBearerToken(tokens.token);
}
```

`loginWithGoogle({ body: { credential } })` uses the same response union.
Store refresh tokens securely; the SDK does not silently refresh or restart login.

## Set up or disable MFA

Supply the current password, or a freshly obtained Google `credential` for a
Google-authenticated account. Replacing an existing authenticator also requires
its current `code` during setup.

```ts
const setup = await client.profile.setupTwoFactor({ body: { password } });
// Show setup.otpauth_url securely; the user enrolls it in their authenticator.
await client.profile.confirmTwoFactor({ body: { code: enrollmentCode } });
// After signing in again, disabling requires the primary factor and current OTP:
await client.profile.disableTwoFactor({ body: { password, code: currentCode } });
```

MFA confirmation/disable and password changes can invalidate existing JWTs.
Reauthenticate and replace the client token; do not automatically replay security
mutations after an authentication failure.

## Response models and failures

- `User` includes optional legacy allocation fields and optional `orders` because
  the backend selects one representation according to its configuration.
- Invoice list/get returns `Invoice | InvoiceShort`. Creation returns `Invoice`;
  `package`, `country`, and `coupon` can be `null`. Narrow with `"package" in invoice`
  before accessing full-only fields.
- Payment amounts/currencies, checkout state, and current gateway values are typed.
  Gateway types also accept future strings; the server validates request values.
- `*WithResponse` methods expose HTTP status and headers alongside data.
  Preserve the local operation record when investigating an ambiguous create
  result; inspect platform state before repeating a paid operation.

Compatibility tests use synthetic responses produced by actual backend serializers
for both configuration modes, plus mocked MFA and failure scenarios. They do not
contact production. See [audit and resolution status](SDK-AUDIT.md).
