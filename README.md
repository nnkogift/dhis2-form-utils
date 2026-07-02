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
| ---------------------------- | ------------------------------------------------------------------------------------------------------ |
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

---

## Quick start

### Composed form with UI adapter

Fetch program stage metadata in your app (or use the exported `programStageQuery` helper with
`useDataQuery`), then wire the hook, providers, and field components:

```tsx
import { FormStateProvider, useEventForm } from '@dhis2-form-utils/hooks';
import { D2Field } from '@dhis2-form-utils/dhis2-ui';
import { filterPayload } from '@dhis2-form-utils/rules';
import type { ProgramStageMetadata } from '@dhis2-form-utils/metadata';
import { FormProvider } from 'react-hook-form';

function EventEntryForm({ metadata }: { metadata: ProgramStageMetadata }) {
    const { form, formStore } = useEventForm({
        options: {
            programStageId: metadata.id,
            metadata,
        },
        formOptions: {
            defaultValues: {
                /* fieldUid: value */
            },
        },
    });

    const onSubmit = form.handleSubmit((values) => {
        const payload = filterPayload(values, formStore.fieldStore.getSnapshot());
        // post payload via useDataMutation in your app
        void payload;
    });

    return (
        <FormStateProvider formStore={formStore} form={form}>
            <FormProvider {...form}>
                <form onSubmit={onSubmit}>
                    {(metadata.programStageDataElements ?? []).map((psde) => (
                        <D2Field
                            key={psde.dataElement.id}
                            field={{ kind: 'dataElement', config: psde }}
                        />
                    ))}
                    <button type="submit">Save</button>
                </form>
            </FormProvider>
        </FormStateProvider>
    );
}
```

`D2Field` calls `useFieldControl` internally — it merges DHIS2 metadata, React Hook Form state,
and per-field rule-engine state into a single widget contract. The same pattern works with
`@dhis2-form-utils/mantine` and `@dhis2-form-utils/mui`.

### Headless hook

The same hook works without a UI adapter. Use `useFieldControl` in custom field components, or
`useFieldState` / `useSectionState` / `useFormFeedback` for lower-level access to rule state:

```tsx
import {
    FormStateProvider,
    useEventForm,
    useFieldControl,
    useSectionState,
    useFormFeedback,
} from '@dhis2-form-utils/hooks';
import { FormProvider } from 'react-hook-form';

function CustomField({ psde }) {
    const control = useFieldControl({ kind: 'dataElement', config: psde });
    if (control.isHidden) return null;
    // render your own input using control.field, control.isMandatory, etc.
}

function CustomForm({ metadata }) {
    const { form, formStore } = useEventForm({
        options: { programStageId: metadata.id, metadata },
    });

    return (
        <FormStateProvider formStore={formStore} form={form}>
            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(() => {})}>{/* CustomField or D2Field */}</form>
            </FormProvider>
        </FormStateProvider>
    );
}
```

### Custom rule action handlers

Some DHIS2 implementations use standard action types like `DISPLAYTEXT` or `ASSIGN` in
non-standard ways — for example, passing machine-readable instructions to a custom widget. Pass an
`effectHandlers` map in `options` to handle specific action types after the standard evaluation
pass:

```tsx
const { form, formStore } = useEventForm({
    options: {
        programStageId: metadata.id,
        metadata,
        effectHandlers: {
            SENDMESSAGE: (effect) => {
                // custom side-effect handling
                void effect;
            },
        },
    },
});
```

---

## How program rules work

`dhis2-form-utils` uses `@dhis2/rule-engine` — the same engine running in DHIS2's own web and
Android apps — to evaluate program rules. The library does not reimplement rule expression parsing
or variable resolution.

When `useEventForm` initialises, it builds a `RuleEngineContext` from the supplied program stage
metadata (rules, rule variables, option sets). A `FormStore` subscribes to form value changes
(debounced at 40ms), evaluates the current values, and pushes results into external stores:

- **Per-field state** — `formStore.fieldStore`, read via `useFieldState(fieldId)` or
  `useFieldControl`
- **Section visibility and feedback widgets** — `formStore.nonFieldStore`, read via
  `useSectionState(sectionId)` and `useFormFeedback()`

```ts
const ruleState = useFieldState('dataElementUid');
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
`DISPLAYKEYVALUEPAIR`. At submission time, call `filterPayload` from `@dhis2-form-utils/rules`
to strip hidden fields and substitute assigned values before posting the payload.

Because the evaluation is built on `@dhis2/rule-engine` rather than a custom implementation, any
new rule action types or expression functions that DHIS2 adds to the engine are automatically
available — no corresponding change is needed in `dhis2-form-utils`.

See [form state architecture](/docs/form-state-architecture.md) for the full store design.

---

## Supported hooks

| Hook               | Status    | Use case                               |
| ------------------ | --------- | -------------------------------------- |
| `useEventForm`     | Available | Single tracker event                   |
| `useTrackerForm`   | Planned   | Enrollment + events (tracker programs) |
| `useDataEntryForm` | Planned   | Aggregate data sets                    |

`useEventForm` returns `{ form, formStore }`. Rule state stores live on `formStore`
(`formStore.fieldStore`, `formStore.nonFieldStore`) and are consumed through
`FormStateProvider` and the companion hooks below.

| Companion hook    | Purpose                                   |
| ----------------- | ----------------------------------------- |
| `useFieldControl` | Field components — metadata + RHF + rules |
| `useFieldState`   | Per-field rule state (lower-level)        |
| `useSectionState` | Per-section visibility from `HIDESECTION` |
| `useFormFeedback` | Feedback / indicator widget content       |

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

# Run all unit tests
pnpm test

# Storybook (component docs + browser tests)
pnpm --filter storybook dev
pnpm --filter storybook test

# Lint
pnpm lint
```

Branch naming follows `feature/`, `fix/`, `chore/`, `refactor/`. Commits follow the Conventional
Commits format (`feat:`, `fix:`, `docs:`, `chore:`).

---

## License

MIT
