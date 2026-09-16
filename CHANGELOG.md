# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Fixed

- Keep the exported `SDK_VERSION` synchronized with the package version and verify it in the package smoke test.

## [2.1.0] - 2026-09-17

- Add atomic per-package data reset with typed requests, response metadata, and idempotent retries.
- Refresh the public API contract and document root balances versus child allocations.

## [2.0.0] - 2026-09-16

### Changed

- Replace the incorrect webhook verifier with the actual `X-Signature`
  Base64 HMAC-SHA256 format over exact raw bytes.

- Regenerated from the public backend contract (81 operations, 130 schemas).
- Added the optional `pending`/`paid` status to invoice creation requests.
- Removed the disabled sessions-management resource; 79 supported operations remain.
- Corrected OTP login unions, MFA request bodies, payment fields, nullable invoices,
  and configuration-dependent user/invoice responses.
- Replaced fixed contract-size gates with operation-ID and coverage validation.
- Added backend-serializer fixtures and compatibility regression tests.

### Added

- Automatic and explicit idempotency keys with bounded ambiguous-outcome retries.
- Response metadata variants and explicit ETag/`If-Match` optimistic concurrency support.

## [1.0.0] - 2026-08-21

### Added

- Initial official TypeScript SDK for all 82 ProxyRequest API operations and 127 schemas.
- Universal Fetch transport for Node.js 22+ and modern browsers.
- ESM and CommonJS builds with declaration and source maps.
- Static, Bearer, anonymous, and explicit Telegram service authentication.
- Normalized errors, lazy pagination, invoice downloads, raw requests, and webhook verification.
- Reproducible OpenAPI generation, package validation, Node/browser tests, CI, and npm provenance workflow.

[Unreleased]: https://github.com/proxyrequest/javascript-sdk/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/proxyrequest/javascript-sdk/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/proxyrequest/javascript-sdk/releases/tag/v1.0.0
