# Security policy

## Supported versions

Security fixes are provided for the latest released major version.

## Reporting a vulnerability

Do not open a public issue for a vulnerability. Email `support@proxyrequest.com` with a description, reproduction steps, affected versions, and potential impact. Avoid including active API keys, tokens, webhook secrets, or customer data.

## Credential handling

Static API keys, Telegram service secrets, and webhook secrets belong only in trusted server environments. Rotate any credential that may have been exposed and remove it from Git history and build artifacts. Bearer tokens used in browsers should be short-lived and scoped according to the ProxyRequest API documentation.
