# Releasing `@nnkogift/dhis2-form-utils-*`

This monorepo publishes seven packages under the `@nnkogift` npm scope. They share a **fixed** version via [Changesets](https://github.com/changesets/changesets).

## Packages

| Package                               | Role                                                       |
| ------------------------------------- | ---------------------------------------------------------- |
| `@nnkogift/dhis2-form-utils-metadata` | Zod schemas, DHIS2 queries/resolvers, metadata types       |
| `@nnkogift/dhis2-form-utils-rules`    | Rule-engine wrappers, field/section state, `filterPayload` |
| `@nnkogift/dhis2-form-utils-hooks`    | Headless form lifecycle + field control                    |
| `@nnkogift/dhis2-form-utils-dhis2-ui` | DHIS2 UI adapter                                           |
| `@nnkogift/dhis2-form-utils-mantine`  | Mantine adapter                                            |
| `@nnkogift/dhis2-form-utils-mui`      | Material UI adapter                                        |
| `@nnkogift/dhis2-form-utils-devtools` | Optional rule trace / graph panels (dev only)              |

`@nnkogift/dhis2-form-utils-config` is **private** (workspace tsconfig / tsup helper only).

### Import contract

- Prefer `@nnkogift/dhis2-form-utils-metadata` for schemas, queries, resolvers, and metadata types.
- Use `@nnkogift/dhis2-form-utils-rules` for evaluation / field state / payload filtering.
- Use `@nnkogift/dhis2-form-utils-hooks` for React form wiring.
- UI adapters depend on hooks; pick one design-system package.
- Import `@nnkogift/dhis2-form-utils-devtools` only in development builds.

```bash
pnpm add @nnkogift/dhis2-form-utils-hooks
# prerelease channels:
pnpm add @nnkogift/dhis2-form-utils-hooks@alpha
pnpm add @nnkogift/dhis2-form-utils-hooks@beta
```

## Release channels

| Git branch | Changesets mode                  | npm dist-tag | Version shape   |
| ---------- | -------------------------------- | ------------ | --------------- |
| `alpha`    | `pnpm changeset pre enter alpha` | `alpha`      | `x.y.z-alpha.n` |
| `beta`     | `pnpm changeset pre enter beta`  | `beta`       | `x.y.z-beta.n`  |
| `main`     | no prerelease (`pre exit`)       | `latest`     | `x.y.z`         |

Never leave `.changeset/pre.json` active on `main`.

### First-time channel setup

```bash
git checkout -b alpha
pnpm changeset pre enter alpha
git add .changeset/pre.json && git commit -m "chore: enter alpha prerelease mode"
git push -u origin alpha
```

Same for `beta` with `pre enter beta`. When promoting to stable, open a PR into `main` and run `pnpm changeset pre exit` on that branch first.

## Developer workflow

1. On a feature branch: `pnpm changeset` — pick bump type (major/minor/patch) and write a short summary.
2. Merge to `alpha`, `beta`, or `main`.
3. The **Release** GitHub Action either opens/updates a **Version Packages** PR or, when that PR is merged (or when versions are already bumped), runs `changeset publish`.

## Maintainer setup (one-time)

1. Ensure your npm user can publish under the `@nnkogift` scope.
2. Create an npm **Automation** token with publish permission for the scope.
3. Add a repository secret: `NPM_TOKEN` (used by `.github/workflows/release.yml`).
4. Protect `main` / `beta` / `alpha` so CI must pass before merge.

### Local dry-run

```bash
pnpm build:packages
pnpm pack --filter @nnkogift/dhis2-form-utils-hooks
pnpm exec publint packages/metadata
pnpm size
npm whoami
```

## Scripts

| Script                  | Purpose                                 |
| ----------------------- | --------------------------------------- |
| `pnpm changeset`        | Add a changeset                         |
| `pnpm version-packages` | Apply changesets (`changeset version`)  |
| `pnpm release`          | Build packages then `changeset publish` |
| `pnpm publint:packages` | Lint publishable package exports        |
| `pnpm size`             | Check gzip size budgets                 |
