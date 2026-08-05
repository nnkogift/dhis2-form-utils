# Tracker registration forms — `useTrackerForm`

`useTrackerForm` is fully implemented and exported from `@dhis2-form-utils/hooks` (verified
in `utils/hooks/src/index.ts` and `utils/hooks/src/useTrackerForm.ts`, backed by
`docs/use-tracker-form.md`). It covers **registration only** — the tracked entity attributes (TEAs) and
enrollment system fields (`orgUnit`, `enrolledAt`, optional `occurredAt`). It does **not**
cover the first program stage's data entry — use a separate `useEventForm` call for that
(see `event-forms.md`), and assemble both into the same Tracker API payload yourself.

## Minimal setup (verified)

```tsx
import {
    FormStateProvider,
    useTrackerForm,
    useTrackerMetadataQuery,
} from '@dhis2-form-utils/hooks';

function RegistrationForm({ programId }: { programId: string }) {
    const { metadata, loading } = useTrackerMetadataQuery(programId);
    if (loading || !metadata) return null;

    const { form, formStore } = useTrackerForm({
        options: { programId, metadata },
    });

    return (
        <FormStateProvider formStore={formStore} form={form}>
            <form
                onSubmit={form.handleSubmit((values) => {
                    /* assemble payload, see below */
                })}
            >
                {/* render TEA fields + orgUnit/enrolledAt/occurredAt fields */}
            </form>
        </FormStateProvider>
    );
}
```

Same provider wiring rule as event forms: `FormStateProvider` alone is enough — it wraps
React Hook Form's `FormProvider` internally, so don't render `FormProvider` yourself. See
`event-forms.md` for details.

## `useTrackerForm` options (verified against `utils/hooks/src/useTrackerForm.ts`)

```ts
type UseTrackerFormOptions = {
    programId: string;
    metadata: TrackerProgramMetadata;
    effectHandlers?: EffectHandlersMap;
    events?: RuleEventInput[];
    supplementaryData?: RuleSupplementaryDataInput;
    optionGroups?: OptionGroupCodeMap;
};
```

Same stability requirement as `useEventForm`: keep `metadata`/`events`/`supplementaryData`
referentially stable across renders to avoid unnecessary rule-engine rebuilds.

Returns `{ form, formStore }` — identical shape to `useEventForm`.

## Metadata fetch

- Convenience: `useTrackerMetadataQuery(programId)` from `@dhis2-form-utils/hooks`.
- Manual: `useDataQuery(trackerConfigQuery, { variables: { programId } })` +
  `resolveTrackerProgramMetadata(data)`, both from `@dhis2-form-utils/metadata`.

## Domain model (from `docs/use-tracker-form.md`)

- Registration is a distinct layer from the tracked entity's events — `useTrackerForm`
  handles TrackedEntity + Enrollment, not Event.
- The **caller** assembles the final Tracker API payload: split the flat RHF `values` into
  `trackedEntities[].attributes` (keyed by TEA uid) and `enrollments[]` system fields
  (`orgUnit`, `enrolledAt`, and `occurredAt` when the program requires it). Run
  `filterPayload(values, formStore.fieldStore.getSnapshot())` first to strip TEAs hidden by
  program rules, same as event forms.
- The caller also owns tracked-entity/enrollment UID generation and linking a subsequent
  first-stage `useEventForm` submission back to the enrollment created here — the library
  does not orchestrate multi-step tracker flows for you.

## Real worked examples in this repo

- `apps/storybook/decorators/withTrackerForm.tsx` — minimal decorator wiring, same shape as
  above.
- `apps/storybook/components/ProgrammeRegistrationForm.tsx` — a fuller, sectioned example.
- `apps/playground/src/components/programs/forms/ProgramRegistrationForm.tsx` and
  `TrackerProgramShell.tsx` — a full production-style screen, including the handoff from
  registration to first-stage event entry.

For the complete architecture (why registration is separate from event evaluation, the
`EnrollmentContext` shape, etc.), read `docs/use-tracker-form.md`.
