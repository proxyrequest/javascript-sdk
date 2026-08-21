# Releasing

## Normal release

1. Update `version` in `package.json` and `package-lock.json`.
2. Add the release to `CHANGELOG.md`.
3. Run `npm run verify` and `npm run test:browser` from a clean checkout.
4. Merge to `main` and wait for CI.
5. Create and push the matching immutable tag, for example `v1.1.0`.
6. The `publish.yml` workflow validates the tag, rebuilds the package, and publishes through npm Trusted Publishing with provenance.
7. Verify the npm package, then create the GitHub Release from the same tag.

Configure the npm Trusted Publisher with these exact values:

- Provider: GitHub Actions
- Organization or user: `proxyrequest`
- Repository: `javascript-sdk`
- Workflow filename: `publish.yml`
- Environment name: `npm`
- Allowed actions: `npm publish`

The workflow requires `id-token: write` and runs on GitHub-hosted infrastructure. It uses the temporary `NPM_TOKEN` only while that environment secret exists; after the secret is deleted, it removes the token placeholder written by `setup-node` so npm can perform the OIDC exchange.

## First release bootstrap

npm can configure a Trusted Publisher only after a package exists. For the first version:

1. Create a short-lived granular npm token that can publish public packages in the `@proxyrequest` organization and can satisfy the initial 2FA publishing requirement.
2. Store it only as the GitHub environment secret `NPM_TOKEN` in the `npm` environment.
3. Push `v1.0.0` and verify the workflow publishes the package with provenance.
4. Configure the Trusted Publisher described above in the package settings on npmjs.com.
5. Delete the GitHub environment secret with `gh secret delete NPM_TOKEN --env npm --repo proxyrequest/javascript-sdk`.
6. Revoke the bootstrap token immediately in the npm access-token settings.

Never put a token in `.npmrc`, workflow YAML, shell history, issues, release notes, or repository files.
