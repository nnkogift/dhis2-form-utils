---
sidebar_position: 1
---

# Introduction

`dhis2-form-utils` bridges the gap between DHIS2 metadata and React forms. It handles the parts
that are tedious to reimplement across every DHIS2 project: translating value types into
validators, running program rules reactively as fields change, and connecting everything to a
form library that works at scale.

Two official DHIS2 libraries do the heavy lifting under the hood:

- **[`@dhis2/rule-engine`](https://www.npmjs.com/package/@dhis2/rule-engine)** — the same program
  rule engine used by Tracker Capture, Event Capture, and the Android app. `dhis2-form-utils`
  wraps it rather than reimplementing it.
- **[`@dhis2/app-runtime`](https://www.npmjs.com/package/@dhis2/app-runtime)** — handles all API
  communication, authentication, and base URL resolution. `dhis2-form-utils` never makes a raw
  fetch call.

The result is a library that stays in sync with DHIS2's own rule behaviour by construction, not
by maintenance.

## Packages

| Package                               | Description                                                                      |
| ------------------------------------- | -------------------------------------------------------------------------------- |
| `@nnkogift/dhis2-form-utils-rules`    | Wraps `@dhis2/rule-engine` — typed field state, custom action support            |
| `@nnkogift/dhis2-form-utils-metadata` | Converts DHIS2 metadata into Zod schemas, plus queries/resolvers                 |
| `@nnkogift/dhis2-form-utils-hooks`    | Headless React hooks — composes rules, metadata, and React Hook Form             |
| `@nnkogift/dhis2-form-utils-dhis2-ui` | Field components and forms for [`@dhis2/ui`](https://ui.dhis2.nu/)               |
| `@nnkogift/dhis2-form-utils-mantine`  | Field components and forms for [Mantine](https://mantine.dev/)                   |
| `@nnkogift/dhis2-form-utils-mui`      | Field components and forms for [Material UI](https://mui.com/)                   |
| `@nnkogift/dhis2-form-utils-devtools` | Optional rule debugging panels (trace / graph) — not for production form bundles |

Where to go next:

- New to the library? Start with the [tutorial](./tutorial/build-your-first-event-form.md) and
  build a working event form end to end.
- Solving a specific problem? Check the [how-to guides](./how-to/tracker-registration-form.md).
- Looking up an API? Jump to the [reference](./reference/hooks.md) section.
- Want to understand the tools, architecture, and design rationale behind the library? Read the
  [About](./about/architecture.md) section.

## Installation

Install only what you need. If you are using a pre-built UI adapter, the hooks package is
included as a dependency automatically.

```bash
# Headless only
pnpm add @nnkogift/dhis2-form-utils-hooks @nnkogift/dhis2-form-utils-metadata

# With a UI adapter
pnpm add @nnkogift/dhis2-form-utils-dhis2-ui
pnpm add @nnkogift/dhis2-form-utils-mantine
pnpm add @nnkogift/dhis2-form-utils-mui
```

Peer dependencies — must be provided by the consuming application, never bundled:

```bash
pnpm add react react-hook-form @hookform/resolvers zod @dhis2/app-runtime @dhis2/rule-engine
```

Apps built on the [DHIS2 App Platform](https://developers.dhis2.org/docs/app-platform/getting-started)
already include `@dhis2/app-runtime`. Standalone apps must render `Provider` themselves:

```tsx
import { Provider } from '@dhis2/app-runtime';

const config = {
    baseUrl: 'https://your-dhis2-instance.org',
    apiVersion: 41,
};

function Root() {
    return (
        <Provider config={config}>
            <App />
        </Provider>
    );
}
```

All hooks in this library must render inside this `Provider`.
