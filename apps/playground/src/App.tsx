import { TextInput } from '@dhis2-form-utils/dhis2-ui';
import { FieldStateProvider } from '@dhis2-form-utils/hooks';
import type { FieldStateMap } from '@dhis2-form-utils/rules';
import { FormProvider, useForm } from 'react-hook-form';

const playgroundFieldState: FieldStateMap = {
  sampleField: {
    hidden: false,
    mandatory: false,
    warning: null,
    error: null,
    assignedValue: null,
    hiddenOptions: new Set(),
    hiddenOptionGroups: new Set(),
  },
};

export function App() {
  const form = useForm({
    defaultValues: { sampleField: '' },
  });

  return (
    <main style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>dhis2-form-utils Playground</h1>
      <p>Dev sandbox for @dhis2-form-utils/dhis2-ui components.</p>
      <FieldStateProvider value={playgroundFieldState}>
        <FormProvider {...form}>
          <form
            onSubmit={(event) => {
              void form.handleSubmit((data) => {
                console.log('submit', data);
              })(event);
            }}
          >
            <TextInput name="sampleField" label="Sample Field" />
            <button type="submit" style={{ marginTop: '1rem' }}>
              Submit
            </button>
          </form>
        </FormProvider>
      </FieldStateProvider>
    </main>
  );
}
