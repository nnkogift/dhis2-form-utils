# Set up a tracker registration form

Use `useTrackerForm` to build a tracked entity registration form — collecting Tracked Entity
Attribute (TEA) values plus enrollment system fields (`orgUnit`, `enrolledAt`, and optionally
`occurredAt`).

`useTrackerForm` covers **registration only**. If the program's first stage also collects data
element values, wire a separate `useEventForm` call for that stage — this library deliberately
keeps the two concerns apart (see [Tracker form design](../about/tracker-form-design.md)
for why).

## 1. Fetch tracker metadata

```tsx
import { useTrackerMetadataQuery } from '@nnkogift/dhis2-form-utils-hooks';

const { metadata, loading } = useTrackerMetadataQuery(programId);
```

## 2. Wire the hook

```tsx
import { FormStateProvider, useTrackerForm } from '@nnkogift/dhis2-form-utils-hooks';

const { form, formStore } = useTrackerForm({
    options: { programId, metadata },
});
```

`useTrackerForm` mirrors `useEventForm` in every way except what it evaluates: rules are
evaluated against TEA attributes and enrollment context (`evaluateEnrollment`) instead of data
elements, via `buildEnrollmentRuleEngineContext`.

## 3. Render TEA fields and system fields

TEA fields are keyed by TEA uid; enrollment system fields (`orgUnit`, `enrolledAt`) are always
present, and `occurredAt` appears only when `metadata.displayIncidentDate` is `true`:

```tsx
import { D2Field } from '@nnkogift/dhis2-form-utils-dhis2-ui';

<FormStateProvider formStore={formStore} form={form}>
    <form onSubmit={onSubmit}>
        {metadata.programTrackedEntityAttributes.map((ptea) => (
            <D2Field
                key={ptea.trackedEntityAttribute.id}
                field={{ kind: 'trackedEntityAttribute', config: ptea }}
            />
        ))}
        {/* orgUnit, enrolledAt, occurredAt: render with your own org-unit / date pickers,
            registered under form.register('orgUnit') etc. */}
        <button type="submit">Register</button>
    </form>
</FormStateProvider>;
```

## 4. Split the payload at submission time

The Tracker API (`POST /api/tracker`) expects TEA values on the tracked entity, and only system
fields on the enrollment. `useTrackerForm` returns a single flat values object — your app splits
it:

```tsx
import { filterPayload } from '@nnkogift/dhis2-form-utils-rules';
import { useDataMutation } from '@dhis2/app-runtime';

const [mutate] = useDataMutation({ resource: 'tracker', type: 'create' });

const handleSubmit = form.handleSubmit((values) => {
    // Strip fields hidden by rules, and null out values referencing a
    // now-hidden option
    const visibleValues = filterPayload(
        values,
        formStore.fieldStore.getSnapshot(),
        formStore.optionGroups
    );

    const teaUids = new Set(
        metadata.programTrackedEntityAttributes.map((p) => p.trackedEntityAttribute.id)
    );

    const attributes = Object.entries(visibleValues)
        .filter(([key]) => teaUids.has(key))
        .map(([attribute, value]) => ({ attribute, value }));

    mutate({
        trackedEntities: [
            {
                trackedEntityType: metadata.trackedEntityType.id,
                orgUnit: values.orgUnit,
                attributes,
            },
        ],
        enrollments: [
            {
                program: programId,
                orgUnit: values.orgUnit,
                enrolledAt: values.enrolledAt,
                ...(metadata.displayIncidentDate ? { occurredAt: values.occurredAt } : {}),
                status: 'ACTIVE',
            },
        ],
    });
});
```

`useTrackerForm` does not generate tracked entity or enrollment UIDs, and does not decide the
POST/PATCH distinction for updates — both stay caller-owned.

See the [hooks reference](../reference/hooks.md#usetrackerform) for the full options/return
signature.
