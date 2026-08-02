# AGENTS.md

This is a pnpm-workspace monorepo for `dhis2-form-utils` — a composable, design-system-agnostic
React form library for DHIS2 data entry. See `README.md` for the product overview and
`CLAUDE.md` for architecture and the full list of build/test/lint/dev commands (do not duplicate
those here).

## Cursor Cloud specific instructions

### Services

- **Storybook** (`apps/storybook`, port `6006`): component docs + the primary integration/interaction
  test surface. Run with `pnpm storybook`; run its browser tests with `pnpm test:storybook`. Network
  is mocked with MSW (`apps/storybook/.storybook/msw-handlers.ts` + `fixtures/*.json`) — no live DHIS2
  server is needed for stories or tests.
- **Playground** (`apps/playground`, port `3000`): a DHIS2 App Platform sandbox run with
  `pnpm playground`. It compiles standalone but proxies to a live DHIS2 instance
  (`https://dhis.rufaa.co.tz`) and renders a DHIS2 login screen — full end-to-end use requires DHIS2
  credentials for that instance, which are not provisioned by default. It is optional for developing
  the library.

### Node / package manager

- The cloud VM injects `/exec-daemon/node` (currently Node 22.x) early in `PATH`, so it wins over
  `nvm`. CI uses Node 24; Node 24 is installed via nvm but is not the effective default. The repo
  pins no Node version (no `engines`/`.nvmrc`), and everything (install, build, lint, typecheck,
  unit + Storybook tests) works on the injected Node 22.x. Don't fight the PATH unless you hit a
  version-specific failure.
- Use `pnpm` (version from the root `packageManager` field). Note `apps/playground/package.json`
  pins a different pnpm (`10.13.1`) than the root — harmless; use the root pnpm.

### Non-obvious gotchas

- **Storybook first-load reload**: on the very first load of the Storybook dev server, Vite runs a
  one-time dependency optimization that forces a mid-load page reload. During that window the story
  canvas may show a spinner, `ERR_INSUFFICIENT_RESOURCES`, or MSW `Failed to fetch` errors. Wait for
  the "Storybook ready" banner and for the optimizer to finish, then refresh once. Loading a story
  directly via the iframe URL
  (`http://localhost:6006/iframe.html?id=<story-id>&viewMode=story`) is lighter than the full
  manager UI and avoids most of this.
- **Storybook browser tests need Playwright chromium** (`vitest` browser mode via
  `@vitest/browser-playwright`, `browser: 'chromium'`). The update script installs it
  (`pnpm exec playwright install chromium`); the headless-shell build runs without extra system deps.
- **Expected test-console noise**: Storybook/unit runs print rule-engine messages such as
  `Unknown variable: 'apgarscore'` and MUI "out-of-range value" / uncontrolled-to-controlled
  warnings. These come from the fixtures and are expected — the suites still pass
  (unit + Storybook).
