---
name: forming
description: Rules and patterns for writing React forms. ALWAYS load this skill when building forms, handling form state, adding form validation, creating input components, or using react-hook-form, zod, Controller, FormProvider, useFormState, useController, useWatch, useFieldArray, or setError.
---

# Forming

React form architecture using `react-hook-form` and `zod`. Covers tooling, component structure, state handling, and file organisation.

> Also load `../coding-standards/SKILL.md` — component rules, feature module structure, and TypeScript conventions apply to form files too.

---

## Tools

- Use the latest `react-hook-form` compatible with the installed React version
- Use `zod` for schema validation via `zodResolver`
- Use input components from the project's design system — never reach for a custom component unless the design system doesn't cover the use case
- Custom components must be compatible with the design system (same sizing, token, and prop conventions)

---

## Form Layout

Wrap the form in a `<form>` element and pass `handleSubmit` to `onSubmit`. Always include a submit button.

```tsx
<form onSubmit={form.handleSubmit(onSubmit)}>
    {/* fields */}
    <FormActions />
</form>
```

---

## FormProvider

Wrap the entire form in `FormProvider`. Sub-components access form state via `useFormContext` or `useFormState` — they never receive the form instance as a prop.

`handleSubmit` is the only value allowed to exist outside the provider when the architecture requires it.

```tsx
<FormProvider {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)}>{/* fields and actions */}</form>
</FormProvider>
```

---

## Input Components

- Interface `react-hook-form` with design system inputs via `Controller` or `useController`
- Each wrapped input lives in its own file — this limits re-renders to the component boundary
- When an input is reused across forms, extract it as a shared RHF-wrapped component that accepts pass-through props

```tsx
// RHFTextField.tsx
function RHFTextField({ name, label, ...props }: TextFieldProps) {
    const { field, fieldState } = useController({ name });

    return <TextField {...field} {...props} name={name} error={fieldState.error?.message} />;
}
```

---

## Cross-field Dependencies

When a component needs to read another field's value, move it to its own file and use `useWatch`.

- Do not use `useEffect` for this — `useWatch` re-renders automatically on change
- Only use `useEffect` when side effects are genuinely necessary; always return a cleanup function and declare correct dependencies

```tsx
// ConditionalField.tsx
function ConditionalField() {
    const type = useWatch({ name: 'type' });
    if (type !== 'advanced') return null;
    return <RHFTextField name="advancedOption" label="Advanced Option" />;
}
```

---

## Form State

- Input components receive their error and other field state from `Controller` / `useController` — do not read `formState` at the top level to pass errors down
- When form state is needed outside an input (e.g. a summary banner, a step indicator), put it in its own component and use `useFormState`
- Submit buttons live in their own component and read `isSubmitting`, `isValid`, and any other needed state via `useFormState`

---

## Cancel / Back Button

Always check `isDirty` before cancelling. If the form has unsaved changes, prompt the user to confirm and reset on acceptance. The cancel button can share a file with the submit button.

```tsx
// FormActions.tsx
function FormActions() {
    const { reset } = useFormContext();
    const { isSubmitting, isDirty } = useFormState();

    const onCancel = () => {
        if (isDirty) {
            const confirmed = window.confirm('Discard changes? All unsaved data will be lost.');
            if (!confirmed) return;
        }
        reset();
        // navigation / close logic here
    };

    return (
        <div>
            <Button onClick={onCancel} disabled={isSubmitting}>
                Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
                Submit
            </Button>
        </div>
    );
}
```

---

## Default Values

`useForm` accepts either a plain object or an async function for `defaultValues`.

When using the async form, gate the entire form render on `formState.isLoading` — show a loader until the form is populated.

```tsx
const form = useForm({
    defaultValues: async () => {
        const data = await fetchDefaults();
        return data;
    },
    resolver: zodResolver(schema),
});

if (form.formState.isLoading) {
    return <Spinner />;
}
```

---

## Top-level Rules

- Only `useForm` belongs at the top level of the form component — all other hooks go into sub-components
- Never call `useEffect` inside the form component file; if a side effect is needed, move it to a dedicated child component

---

## Validation Mode

`useForm` defaults to `mode: 'onSubmit'` — validation only runs when the form is submitted. Change this when the UX requires earlier feedback:

- `onBlur` — validate when the user leaves a field (good default for most forms)
- `onTouched` — validate on first blur, then on every change after
- `onChange` — validate on every keystroke (use sparingly; can feel aggressive)

```tsx
const form = useForm({
    mode: 'onBlur',
    resolver: zodResolver(schema),
});
```

---

## Dynamic Field Arrays

Use `useFieldArray` for repeating groups of fields (line items, phone numbers, addresses). Always use `field.id` as the React key — never the index.

- Call `useFieldArray` inside a sub-component
- Wrap each item's inputs with `Controller` or `useController` as normal

```tsx
// PhoneList.tsx
function PhoneList() {
    const { fields, append, remove } = useFieldArray({ name: 'phones' });

    return (
        <div>
            {fields.map((field, index) => (
                <div key={field.id}>
                    <RHFTextField name={`phones.${index}.number`} label="Phone" />
                    <Button type="button" onClick={() => remove(index)}>
                        Remove
                    </Button>
                </div>
            ))}
            <Button type="button" onClick={() => append({ number: '' })}>
                Add phone
            </Button>
        </div>
    );
}
```

---

## Server-side Errors

Map API validation errors back to fields using `setError` inside the `onSubmit` handler. Use `setError('root')` for form-level errors that don't belong to a specific field.

Setting any error forces `formState.isValid` to `false`.

```tsx
const onSubmit = async (data: FormValues) => {
    try {
        await saveData(data);
        // reset to new baseline so isDirty returns to false
        form.reset(data);
    } catch (err) {
        if (err.fieldErrors) {
            // field-level errors from the API
            Object.entries(err.fieldErrors).forEach(([field, message]) => {
                form.setError(field as keyof FormValues, { message: String(message) });
            });
        } else {
            // form-level error
            form.setError('root', { message: 'Something went wrong. Please try again.' });
        }
    }
};
```

Render the root error near the submit button:

```tsx
// FormActions.tsx
const { errors, isSubmitting, isDirty } = useFormState();

{
    errors.root && <p role="alert">{errors.root.message}</p>;
}
```

---

## Resetting to a New Baseline

After a successful save, call `reset(savedValues)` — not `reset()` — to update the form's internal baseline. This clears `isDirty` without wiping the fields, so the cancel-guard won't prompt the user unnecessarily.

```tsx
const onSubmit = async (data: FormValues) => {
    const saved = await saveData(data);
    form.reset(saved); // baseline = saved state; isDirty is now false
};
```

---

## Schema

Define the Zod schema outside the component, in the same file or a co-located `schema.ts`. Type `useForm` with the inferred schema type so that `Controller name`, `watch`, and `setError` are all type-checked.

```ts
const schema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
});

type FormValues = z.infer<typeof schema>;
```

```tsx
const form = useForm<FormValues>({
    resolver: zodResolver(schema),
});
```

---

## Full Example

```tsx
// ExampleForm.tsx
const schema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
});

type FormValues = z.infer<typeof schema>;

function ExampleForm({ id }: { id: string }) {
    const form = useForm<FormValues>({
        mode: 'onBlur',
        defaultValues: async () => fetchDefaults(id),
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormValues) => {
        try {
            const saved = await saveData(id, data);
            form.reset(saved);
        } catch (err) {
            form.setError('root', { message: 'Something went wrong. Please try again.' });
        }
    };

    if (form.formState.isLoading) {
        return <Spinner />;
    }

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <RHFTextField name="name" label="Name" />
                <RHFTextField name="email" label="Email" type="email" />
                <FormActions />
            </form>
        </FormProvider>
    );
}
```
