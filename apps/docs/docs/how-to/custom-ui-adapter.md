# Build a form with a custom UI adapter

The three shipped UI adapters (`-dhis2-ui`, `-mantine`, `-mui`) are all built on the same headless
primitive: `useFieldControl`. If none of them fit your design system, you can build your own field
components directly against the hooks package without touching `@nnkogift/dhis2-form-utils-rules`
or `@nnkogift/dhis2-form-utils-metadata` at all.

## Use `useFieldControl` in your own field component

`useFieldControl` merges DHIS2 field metadata, React Hook Form state, and per-field program-rule
state into a single object your component can render from:

```tsx
import { useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import type { FieldControlInput } from '@nnkogift/dhis2-form-utils-hooks';

function CustomField({ field }: { field: FieldControlInput }) {
    const control = useFieldControl(field);

    if (control.isHidden) return null;

    return (
        <MyDesignSystemInput
            label={control.fieldConfig.label}
            value={control.field.value as string}
            required={control.isMandatory}
            disabled={control.isDisabled}
            error={control.hasError ? control.errorMessage : undefined}
            onChange={(value) => control.field.onChange(value)}
            onBlur={control.field.onBlur}
        />
    );
}
```

`control.widgetKind` tells you which kind of widget the field expects (`text`, `number`,
`boolean`, `select`, `date`, …) — use it to switch between your own widget implementations, the
same way `D2Field` does internally:

```tsx
function CustomField({ field }: { field: FieldControlInput }) {
    const control = useFieldControl(field);
    if (control.isHidden) return null;

    switch (control.widgetKind) {
        case 'text':
            return <MyTextInput control={control} />;
        case 'boolean':
            return <MyToggle control={control} />;
        case 'select':
            return <MySelect control={control} />;
        default:
            return <MyTextInput control={control} />;
    }
}
```

## Wire it into the form

Everything else is unchanged — `useEventForm`/`useTrackerForm` and `FormStateProvider` don't
know or care what renders the fields:

```tsx
const { form, formStore } = useEventForm({ options: { programStageId, metadata } });

return (
    <FormStateProvider formStore={formStore} form={form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            {fields.map((field) => (
                <CustomField key={field.config.dataElement.id} field={field} />
            ))}
        </form>
    </FormStateProvider>
);
```

## Reuse validation and section/feedback state

- `resolveFieldValidation(control)` (from `@nnkogift/dhis2-form-utils-hooks`) turns a field's
  warning/error rule state into a single `{ validationText, hasError, hasWarning }` object — reuse
  it instead of re-deriving validation display logic yourself.
- `useSectionState(sectionId)` gives you a section's `hidden` flag for section-aware layouts.
- `useFormFeedback()` gives you the `DISPLAYTEXT` / `DISPLAYKEYVALUEPAIR` feedback map for
  rendering feedback/indicator panels.

Looking at an existing adapter's source (`components/dhis2-ui/src/fields/D2Field.tsx` in the
repository) is the fastest way to see the full pattern end to end.
