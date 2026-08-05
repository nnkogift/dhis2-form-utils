# Event / stage forms — `useEventForm`

For a single DHIS2 program stage event (one data-entry screen, no enrollment).

## Minimal setup (verified)

```tsx
import {
    FormStateProvider,
    useEventForm,
    useEventProgramMetadataQuery,
} from '@dhis2-form-utils/hooks';
import { D2Field } from '@dhis2-form-utils/dhis2-ui'; // or /mantine, /mui
import { filterPayload } from '@dhis2-form-utils/rules';
import { selectProgramStage } from '@dhis2-form-utils/metadata';

function EventEntryForm({
    programId,
    programStageId,
}: {
    programId: string;
    programStageId: string;
}) {
    const { metadata, loading } = useEventProgramMetadataQuery(programId);
    if (loading || !metadata) return null;

    const stageMetadata = selectProgramStage(metadata, programStageId);
    const { form, formStore } = useEventForm({
        options: { programStageId, metadata },
        formOptions: { defaultValues: {} },
    });

    const onSubmit = form.handleSubmit((values) => {
        const payload = filterPayload(values, formStore.fieldStore.getSnapshot());
        // POST `payload` yourself via useDataMutation — the library never submits.
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

`useEventProgramMetadataQuery` is optional sugar around `useDataQuery(eventProgramConfigQuery, { variables: { programId } })`

- `resolveEventProgramMetadata(data)`. `useEventForm` never fetches on its own — bring your
  own metadata however you like, as long as it's an `EventProgramMetadata`. See
  `metadata-and-schemas.md` for the manual, lower-level fetch pattern.

There is no `programMetadataExportQuery` export anywhere in this library — don't invent
one.

## Provider wiring — one provider, not two

```tsx
<FormStateProvider formStore={formStore} form={form}>
    <form>{/* fields */}</form>
</FormStateProvider>
```

`FormStateProvider` (from `@dhis2-form-utils/hooks`) wraps React Hook Form's own
`FormProvider` internally — do **not** render `FormProvider` yourself, it's redundant.
`FormStateProvider` alone makes both the RHF context and `formStore` available to
`useFieldState`/`useSectionState`/`useFormFeedback`/`useFieldControl` and, transitively, to
`D2Field`. Skipping it throws at render time — every companion hook and `D2Field` require
`FormStateProvider` in the tree above them.

## `useEventForm` options (verified against `utils/hooks/src/useEventForm.ts`)

```ts
type UseEventFormOptions = {
    programStageId: string;
    metadata: EventProgramMetadata;
    effectHandlers?: EffectHandlersMap;
    enrollment?: { metadata: TrackerProgramMetadata; values: Record<string, unknown> };
    events?: RuleEventInput[];
    supplementaryData?: RuleSupplementaryDataInput;
    optionGroups?: OptionGroupCodeMap;
};
```

- `enrollment` / `events` / `supplementaryData` feed the rule engine's `#{...}`/`A{...}`
  program-rule-variable resolution when the event belongs to a tracker enrollment context —
  omit them for standalone/aggregate-style events.
- `optionGroups` is required if any program rule uses `HIDEOPTIONGROUP`/`SHOWOPTIONGROUP` —
  see `metadata-and-schemas.md` for how to fetch it (`optionGroupsQuery` + `resolveOptionGroups`).
- Callers must keep `metadata`/`enrollment`/`events`/`supplementaryData` **referentially
  stable** across renders (e.g. via `useMemo` or React Query's cache) — the hook only does
  reference-equality checks and will rebuild the rule engine (`formStore.reinit`) on every
  render if you pass a fresh object literal each time.

Returns `{ form, formStore }`. `form` is a standard RHF `UseFormReturn`. `formStore` holds
the reactive rule-engine state — see `rules-engine.md`.

## Submitting

Always run `filterPayload(values, formStore.fieldStore.getSnapshot())` (from
`@dhis2-form-utils/rules`) on the RHF `values` before posting. It strips fields hidden by
`HIDEFIELD` and substitutes values set by `ASSIGN` effects. The library never performs the
actual HTTP submission — use `useDataMutation` from `@dhis2/app-runtime` yourself.

## Custom rule action handlers

Some DHIS2 implementations repurpose a standard action type (e.g. `DISPLAYTEXT`) to pass
machine-readable instructions to a custom widget. Handle those via `effectHandlers`:

```tsx
const { form, formStore } = useEventForm({
    options: {
        programStageId,
        metadata,
        effectHandlers: {
            SENDMESSAGE: (effect) => {
                // custom side-effect handling, runs after the standard evaluation pass
            },
        },
    },
});
```

## Headless / custom widgets

If you don't want `D2Field`, use `useFieldControl` directly inside your own field
component, or the lower-level `useFieldState`/`useSectionState`/`useFormFeedback` — all
require `FormStateProvider` in the tree. See `rules-engine.md` for the state shape and
`ui-adapters.md` for the `useFieldControl` contract.
