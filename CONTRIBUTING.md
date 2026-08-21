# Contributing

## Setup

Use Node.js 22 or newer and npm:

```bash
npm ci
npm run verify
```

Run `npm run test:browser` when changing browser-facing transport, files, or webhook behavior.

## Generated code

`src/generated` is derived from `openapi/openapi.yaml` and `openapi/operations.yaml`. Do not edit it manually. Update the schema or operation mapping, run `npm run generate`, and commit both the source and generated changes.

## Pull requests

Keep public API changes backwards compatible, add tests for changed behavior, update documentation, and add an Unreleased changelog entry. Never commit API keys, access tokens, webhook secrets, customer data, or production response bodies.
