# Build your first event form

This tutorial walks through building a working DHIS2 event data entry form from scratch, using
`@nnkogift/dhis2-form-utils-hooks` and the `@dhis2/ui` adapter. By the end you'll have a form that
fetches program stage metadata, renders fields for every data element, reacts to program rules
live as the user types, and submits a clean payload.

## What you'll need

- A DHIS2 instance with a program stage you can read (any demo instance works — for example
  `https://play.dhis2.org/`)
- A `programStageId` for that program stage
- A React app with `@dhis2/app-runtime`'s `Provider` already rendered above where this form will
  mount (see [Installation](../intro.md#installation) if you haven't set this up)

Install the packages:

```bash
pnpm add @nnkogift/dhis2-form-utils-hooks @nnkogift/dhis2-form-utils-metadata @nnkogift/dhis2-form-utils-dhis2-ui
pnpm add react-hook-form @hookform/resolvers zod @dhis2/app-runtime @dhis2/rule-engine
```

## Step 1 — Fetch program stage metadata

`dhis2-form-utils` never fetches data internally — your app owns the fetch. The hooks package
ships a thin convenience hook, `useEventProgramMetadataQuery`, that wraps the standard query +
resolver pair for you:

```tsx title="EventEntryForm.tsx"
import { useEventProgramMetadataQuery } from '@nnkogift/dhis2-form-utils-hooks';
import { selectProgramStage } from '@nnkogift/dhis2-form-utils-metadata';

function EventEntryForm({
    programId,
    programStageId,
}: {
    programId: string;
    programStageId: string;
}) {
    const { metadata, loading } = useEventProgramMetadataQuery(programId);

    if (loading || !metadata) return <span>Loading…</span>;

    const stageMetadata = selectProgramStage(metadata, programStageId);
    // continued below
}
```

`metadata` includes every program stage under the program, along with the program's rules and
rule variables. `selectProgramStage` narrows that down to the single stage you're rendering a
form for.

## Step 2 — Wire the hook

`useEventForm` takes the program stage metadata, builds a Zod validation schema and a
`RuleEngineContext` from it, and returns a React Hook Form instance plus a `FormStore` that owns
rule evaluation:

```tsx
import { useEventForm } from '@nnkogift/dhis2-form-utils-hooks';

const { form, formStore } = useEventForm({
    options: {
        programStageId,
        metadata,
    },
});
```

`formStore` is what makes the form reactive to program rules — every time a field value changes,
it re-evaluates the program's rules (debounced) and pushes the result (hidden fields, mandatory
flags, warnings, assigned values, …) into internal stores that field components subscribe to
individually.

## Step 3 — Provide form state to your fields

Wrap the fields in `FormStateProvider`. It wraps React Hook Form's own `FormProvider`
internally, so you don't render `FormProvider` yourself:

```tsx
import { FormStateProvider } from '@nnkogift/dhis2-form-utils-hooks';

return (
    <FormStateProvider formStore={formStore} form={form}>
        {/* fields go here */}
    </FormStateProvider>
);
```

## Step 4 — Render fields with `D2Field`

`D2Field` from `@nnkogift/dhis2-form-utils-dhis2-ui` is a dispatcher — give it a data element
configuration and it renders the correct widget for that value type, already wired to rule state
(hidden, mandatory, warnings, errors):

```tsx
import { D2Field } from '@nnkogift/dhis2-form-utils-dhis2-ui';

{
    (stageMetadata?.programStageDataElements ?? []).map((psde) => (
        <D2Field key={psde.dataElement.id} field={{ kind: 'dataElement', config: psde }} />
    ));
}
```

## Step 5 — Submit

Before posting, strip any fields that program rules have hidden and substitute any
rule-assigned values, using `filterPayload` from `@nnkogift/dhis2-form-utils-rules`:

```tsx
import { filterPayload } from '@nnkogift/dhis2-form-utils-rules';
import { useDataMutation } from '@dhis2/app-runtime';

const [mutate] = useDataMutation({
    resource: 'tracker',
    type: 'create',
    data: (payload) => payload,
});

const onSubmit = form.handleSubmit((values) => {
    const payload = filterPayload(values, formStore.fieldStore.getSnapshot());
    mutate({ events: [{ programStage: programStageId, dataValues: /* map payload */ [] }] });
});
```

## Putting it all together

```tsx title="EventEntryForm.tsx"
import {
    FormStateProvider,
    useEventForm,
    useEventProgramMetadataQuery,
} from '@nnkogift/dhis2-form-utils-hooks';
import { D2Field } from '@nnkogift/dhis2-form-utils-dhis2-ui';
import { filterPayload } from '@nnkogift/dhis2-form-utils-rules';
import { selectProgramStage } from '@nnkogift/dhis2-form-utils-metadata';

function EventEntryForm({
    programId,
    programStageId,
}: {
    programId: string;
    programStageId: string;
}) {
    const { metadata } = useEventProgramMetadataQuery(programId);
    if (!metadata) return null;

    const stageMetadata = selectProgramStage(metadata, programStageId);
    const { form, formStore } = useEventForm({
        options: { programStageId, metadata },
    });

    const onSubmit = form.handleSubmit((values) => {
        const payload = filterPayload(values, formStore.fieldStore.getSnapshot());
        // post payload via useDataMutation in your app
        void payload;
    });

    return (
        <FormStateProvider formStore={formStore} form={form}>
            <form onSubmit={onSubmit}>
                {(stageMetadata?.programStageDataElements ?? []).map((psde) => (
                    <D2Field
                        key={psde.dataElement.id}
                        field={{ kind: 'dataElement', config: psde }}
                    />
                ))}
                <button type="submit">Save</button>
            </form>
        </FormStateProvider>
    );
}
```

Try it against a program stage that has at least one `HIDEFIELD` or `ASSIGN` rule — you should
see fields hide/show and values populate as you fill in the fields that drive those rules, with
no manual wiring required.

## Next steps

- Need a registration form instead of an event form? See
  [Set up a tracker registration form](../how-to/tracker-registration-form.md).
- Want to use your own components instead of `D2Field`? See
  [Build a form with a custom UI adapter](../how-to/custom-ui-adapter.md).
- Curious what's happening inside `formStore`? Read
  [Form state and the reactive loop](../about/form-state-and-reactive-loop.md).
