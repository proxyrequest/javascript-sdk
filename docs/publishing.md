# Publishing locally tested artifacts

Run generation, lint, type checks, tests, build and package checks locally. Pack
the resulting distribution with `npm pack --ignore-scripts`, then attach the
tarball to a draft GitHub release. Tag a commit containing `[skip ci]` to keep
checks local. Dispatch `publish.yml` with `release_tag` to publish the prepared
tarball through the existing npm Trusted Publisher. The dispatch job does not
install project dependencies, build the SDK or run tests.
