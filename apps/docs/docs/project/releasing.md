# Releasing

This monorepo publishes seven packages under the `@nnkogift` npm scope. They share a **fixed**
version across the group, managed with [Changesets](https://github.com/changesets/changesets).

| Package                               | Role                                                       |
| ------------------------------------- | ---------------------------------------------------------- |
| `@nnkogift/dhis2-form-utils-metadata` | Zod schemas, DHIS2 queries/resolvers, metadata types       |
| `@nnkogift/dhis2-form-utils-rules`    | Rule-engine wrappers, field/section state, `filterPayload` |
| `@nnkogift/dhis2-form-utils-hooks`    | Headless form lifecycle + field control                    |
| `@nnkogift/dhis2-form-utils-dhis2-ui` | DHIS2 UI adapter                                           |
| `@nnkogift/dhis2-form-utils-mantine`  | Mantine adapter                                            |
| `@nnkogift/dhis2-form-utils-mui`      | Material UI adapter                                        |
| `@nnkogift/dhis2-form-utils-devtools` | Optional rule trace / graph panels (dev only)              |

`@nnkogift/dhis2-form-utils-config` is private (workspace tsconfig/tsup helper only) and isn't
published.

## Release channels

| Git branch | npm dist-tag | Version shape   |
| ---------- | ------------ | --------------- |
| `alpha`    | `alpha`      | `x.y.z-alpha.n` |
| `beta`     | `beta`       | `x.y.z-beta.n`  |
| `main`     | `latest`     | `x.y.z`         |

```bash
pnpm add @nnkogift/dhis2-form-utils-hooks          # latest (stable)
pnpm add @nnkogift/dhis2-form-utils-hooks@alpha    # prerelease
pnpm add @nnkogift/dhis2-form-utils-hooks@beta     # prerelease
```

## Contributor workflow

1. On a feature branch, run `pnpm changeset` and pick a bump type (major/minor/patch) with a
   short summary.
2. Open a PR into `main` (or the relevant prerelease channel branch).
3. Once merged, the **Release** GitHub Action either opens/updates a "Version Packages" PR, or —
   once that PR is merged — runs `changeset publish`.

A release publishes to npmjs.org via OIDC trusted publishing, creates per-package git tags and
GitHub Releases, creates a unified `vX.Y.Z` tag/release for the shared version, and mirrors the
same versions to GitHub Packages.

### Installing from GitHub Packages

```bash
# .npmrc
@nnkogift:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN

pnpm add @nnkogift/dhis2-form-utils-hooks
```

See the [source `docs/releasing.md`](https://github.com/nnkogift/dhis2-form-utils/blob/main/docs/releasing.md)
in the repository for the full maintainer-facing procedure, including one-time npm Trusted
Publisher setup and local dry-run commands.

## Contributing

```bash
git clone https://github.com/nnkogift/dhis2-form-utils.git
cd dhis2-form-utils
pnpm install

pnpm test          # unit tests + Storybook browser tests
pnpm lint
pnpm typecheck
pnpm storybook      # Storybook dev server
pnpm docs           # this documentation site, locally
```

Branch naming follows `feature/`, `fix/`, `chore/`, `refactor/`. Commits follow
[Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`).

## License

MIT
