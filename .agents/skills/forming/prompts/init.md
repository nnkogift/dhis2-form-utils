# Writing forming skill

We are writing a skill that guides a coding agent on how to write forms, how to handle form states, fields, submission
and anything related.

# Tools

We always use latest `react-hook-form` compatible to the installed React. We use `zod` for form validation. We always
use form components (input fields, containers, buttons e.t.c) from the design system used. We only create custom
components when necessary. The custom components
should be designed to be compatible with the design system used.

# Form Layout

Wrap the form in a `<form>` component and pass in the `handleSubmit` in the form. The form should have a submit button
that triggers a submit action.

# Input Components Handling

The whole form should be wrapped in a `FormProvider` component. Only the `handleSubmit` function can be used outside of
the provider depending on the use case. The rest of the form below the provider should have their own components if they
require to use any of the form state / actions. They should use the hooks `useFormState` or `useFormContext`. The form
components should be separated to their own files to improve readability and maintainability as well as to separate
rerenders.

To interface `react-hook-form` with the input components use `Controller` component or `useController` hook. The custom
components should be separated to their own files. In cases where a single input component is reused, extract it as a
reusable component with the ability to pass in props.

If an input component or any other form component needs to read another input's value, separate it into own component in
a different file, and use the `useWatch` hook to check for the value change. Limit the use of `useEffect` in such
components. Only use it when necessary. When using `useEffect`, make sure to clean up after it to avoid memory leaks and
make sure you pass in the correct dependencies.

# Form State Handling

Input components should receive their error and other states from the `Controller` component or `useController` hook.
Depending on the input component's design, ensure the props are passed well.

In cases where the form state is needed outside of an input component, separate the component into its own file and use
the `useFormState` hook.

For submit buttons, use the `useFormState` hook to access the form state and determine whether the form is being
submitted, is valid or any other necessary state. They should be in a separate component file.

For Cancel/Back button, always check if the form is dirty, if it is, prompt the user to confirm cancelling form edit and
inform that all data will be lost. If the user accepts this, ensure to reset the form. The cancel button can co-exist
with the Submit button in one component file.

# Default values

`useForm` accepts either an object, or an async function to set the default values. If using the async function, the
form should listen to the `loading` state of the form, show a loader, and only render the form when the form is
populated,

# Things to remember

Only the `useForm` hook should be at the top level of the form component file. No other hooks should be used at the top
level.
Do not use `useEffect` hook in the form component file. If it is to be used, it should have its own component.

# Examples

These examples are not definitive; they show how to handle the requirements above.

Reusable input field

```tsx
// Should be in a different file
function RHFTextField({ name, label, ...props }: TextFieldProps) {
    const { field, fieldState } = useController({
        name,
    });

    return <TextField {...field} name={name} error={fieldState.error?.message} />;
}
```

Form actions

```tsx
function FormActions() {
    const { reset } = useFormContext();
    const { isSubmitting, isDirty } = useFormState();

    const onCancel = () => {
        if (isDirty) {
            //Prompt for confirmation
            const confirmed = window.prompt('Are you sure?');
            if (confirmed) {
                reset();
                //cancel logic here
            }
        } else {
            reset();
            //cancel logic here
        }
    };

    return (
        <div>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="submit">Submit</Button>
        </div>
    );
}
```

Form schema

```ts
const schema = z.object({
    name: z.string(),
    email: z.email(),
});
```

Form setup

```tsx
function ExampleForm({ objectId }: { objectId: string }) {
    const form = useForm({
        defaultValues: async () => {
            //default values async fetching logic
            const defaultValues = await getDefaultValues();
            return defaultValues;
        },
        resolver: zodResolver(schema),
    });

    const onSubmit = async () => {
        //Saving logic
    };

    if (form.formState.isLoading) {
        return <div>Loading...</div>;
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
