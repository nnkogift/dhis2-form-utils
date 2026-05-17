# dhis2-form-utils

A composable, design-system-agnostic form library for building DHIS2 data entry interfaces in React.

---

## What this is

`dhis2-form-utils` bridges the gap between DHIS2 metadata and React forms. It handles the parts
that are tedious to reimplement across every DHIS2 project: translating value types into
validators, running program rules reactively as fields change, and connecting everything to a form
library that works at scale.

Two official DHIS2 libraries do the heavy lifting under the hood:

- **`@dhis2/rule-engine`** — the same program rule engine used by Tracker Capture, Event Capture,
  and the Android app. `dhis2-form-utils` wraps it rather than reimplementing it.
- **`@dhis2/app-runtime`** — handles all API communication, authentication, and base URL
  resolution. `dhis2-form-utils` never makes a raw fetch call.

The result is a library that stays in sync with DHIS2's own rule behaviour by construction, not
by maintenance.

Learn more about the architecture [here](/docs/ARCHITECTURE.md)

---

## Packages

| Package                      | Description                                                                                            |
|------------------------------|--------------------------------------------------------------------------------------------------------|
| `@dhis2-form-utils/rules`    | Wraps `@dhis2/rule-engine` — adds React-form integration, typed field state, and custom action support |
| `@dhis2-form-utils/metadata` | Converts DHIS2 metadata into Zod schemas                                                               |
| `@dhis2-form-utils/hooks`    | Headless React hooks — composes all of the above                                                       |
| `@dhis2-form-utils/dhis2-ui` | Field components and forms for DHIS2 UI                                                                |
| `@dhis2-form-utils/mantine`  | Field components and forms for Mantine UI                                                              |
| `@dhis2-form-utils/mui`      | Field components and forms for Material UI                                                             |

---

## Installation

Install only what you need. If you are using a pre-built UI adapter, the hooks package is included
as a dependency automatically.

```bash
# Headless only
pnpm add @dhis2-form-utils/hooks

# With a UI adapter
pnpm add @dhis2-form-utils/dhis2-ui
pnpm add @dhis2-form-utils/mantine
pnpm add @dhis2-form-utils/mui
```

Peer dependencies:

```bash
pnpm add react react-hook-form @hookform/resolvers zod @dhis2/app-runtime @dhis2/rule-engine
```

> Both `@dhis2/app-runtime` and `@dhis2/rule-engine` are peer dependencies — they must be provided
> by the consuming application and are never bundled. Apps built on the DHIS2 App Platform already
> include both.

---

## Prerequisites

All hooks must render inside a `@dhis2/app-runtime` `Provider`. On the DHIS2 App Platform this is
configured automatically. For standalone apps:

```tsx
import {Provider} from '@dhis2/app-runtime'

const config = {
		baseUrl: 'https://your-dhis2-instance.org',
		apiVersion: 41,
}

function Root() {
		return (
				<Provider config={config}>
						<App/>
				</Provider>
		)
}
```

---

## Quick start

### Plug-and-play form

```tsx
import {EventForm} from '@dhis2-form-utils/dhis2-ui'

function DataEntryPage() {
		return (
				<EventForm
						programStageId="abc123"
						onSuccess={(event) => console.log('submitted', event)}
				/>
		)
}
```

The component fetches its own metadata, builds the rule engine context, evaluates program rules on
every field change, and handles submission — all without additional configuration.

### Headless hook

```tsx
import {useEventForm} from '@dhis2-form-utils/hooks'
import {FormProvider} from 'react-hook-form'

function CustomForm() {
		const {form, fieldState, isLoading, submit} = useEventForm({
				programStageId: 'abc123',
		})

		if (isLoading) return <p>Loading...</p>

		return (
				<FormProvider {...form}>
						<form onSubmit={submit}>
								{/* your own field components */}
								{/* read fieldState[fieldId].hidden / .mandatory / .warning / .error */}
						</form>
				</FormProvider>
		)
}
```

### Custom rule action handlers

Some DHIS2 implementations use standard action types like `DISPLAYTEXT` or `ASSIGN` in
non-standard ways — for example, passing machine-readable instructions to a custom widget. The
hooks accept an `effectHandlers` map to override or extend how specific action types are
interpreted after the standard evaluation pass:

```tsx
const {form, fieldState, submit} = useEventForm({
		programStageId: 'abc123',
		effectHandlers: {
				DISPLAYTEXT: (effect, state) => {
						// custom interpretation — e.g. parse structured data from effect.content
						return state
				},
		},
})
```

### Pre-fetched metadata

If your app has already fetched program stage metadata through its own data layer, pass it directly
to skip the internal fetch:

```tsx
const {form, fieldState, submit} = useEventForm({metadata: myProgramStage})
```

---

## How program rules work

`dhis2-form-utils` uses `@dhis2/rule-engine` — the same engine running in DHIS2's own web and
Android apps — to evaluate program rules. The library does not reimplement rule expression parsing
or variable resolution.

When a form hook initialises, it builds a `RuleEngineContext` once from the fetched program
metadata (rules, rule variables, option sets). On every field change, it evaluates the current
form values against that context and folds the resulting `RuleEffect` list into a `FieldStateMap`:

```ts
fieldState['dataElementUid']
// {
//   hidden: false,
//   mandatory: true,
//   warning: null,
//   error: null,
//   assignedValue: null,
//   hiddenOptions: Set {},
//   hiddenOptionGroups: Set {},
// }
```

All standard DHIS2 action types are handled: `HIDEFIELD`, `HIDESECTION`, `ASSIGN`,
`SHOWWARNING`, `SHOWERROR`, `WARNINGONCOMPLETE`, `ERRORONCOMPLETE`, `SETMANDATORYFIELD`,
`HIDEOPTION`, `HIDEOPTIONGROUP`, `SHOWOPTION`, `SHOWOPTIONGROUP`, `DISPLAYTEXT`, and
`DISPLAYKEYVALUEPAIR`. At submission time, hidden fields are stripped and assigned values are
substituted before the payload is sent.

Because the evaluation is built on `@dhis2/rule-engine` rather than a custom implementation, any
new rule action types or expression functions that DHIS2 adds to the engine are automatically
available — no corresponding change is needed in `dhis2-form-utils`.

---

## Supported hooks

| Hook               | Use case                               |
|--------------------|----------------------------------------|
| `useEventForm`     | Single tracker event                   |
| `useTrackerForm`   | Enrollment + events (tracker programs) |
| `useDataEntryForm` | Aggregate data sets                    |

All hooks share the same return shape: `{ form, fieldState, isLoading, submit }`.

---

## Contributing

This project is a personal contribution back to the DHIS2 community and welcomes involvement from
others building on DHIS2.

```bash
# Clone and install
git clone https://github.com/your-org/dhis2-form-utils.git
cd dhis2-form-utils
pnpm install

# Start the playground
pnpm --filter playground dev

# Run all tests
pnpm test

# Lint
pnpm lint
```

Branch naming follows `feature/`, `fix/`, `chore/`, `refactor/`. Commits follow the Conventional
Commits format (`feat:`, `fix:`, `docs:`, `chore:`).

---

## License

MIT