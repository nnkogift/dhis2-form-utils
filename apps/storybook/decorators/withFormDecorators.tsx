import { Provider } from '@dhis2/app-runtime';
import { FieldStateProvider } from '@dhis2-form-utils/hooks';
import type { FieldStateMap } from '@dhis2-form-utils/rules';
import { createEmptyFieldState } from '@dhis2-form-utils/rules';
import type { Decorator } from '@storybook/react';
import { FormProvider, useForm } from 'react-hook-form';

const runtimeConfig = {
  baseUrl: 'https://debug.dhis2.org',
  apiVersion: 41,
};

export type FormDecoratorOptions = {
  defaultValues?: Record<string, unknown>;
  fieldState?: FieldStateMap;
};

function FormWrapper({
  children,
  defaultValues = {},
  fieldState = {},
}: {
  children: React.ReactNode;
  defaultValues?: Record<string, unknown>;
  fieldState?: FieldStateMap;
}) {
  const form = useForm({ defaultValues });

  return (
    <Provider
      config={runtimeConfig}
      userInfo={undefined}
      plugin={false}
      parentAlertsAdd={undefined}
      showAlertsInPlugin={false}
    >
      <FieldStateProvider value={fieldState}>
        <FormProvider {...form}>
          <div style={{ maxWidth: 400, padding: 16 }}>{children}</div>
        </FormProvider>
      </FieldStateProvider>
    </Provider>
  );
}

export const withFormDecorators =
  (options: FormDecoratorOptions = {}): Decorator =>
  (Story) => (
    <FormWrapper defaultValues={options.defaultValues} fieldState={options.fieldState}>
      <Story />
    </FormWrapper>
  );

export const fieldStateFor = (
  name: string,
  overrides: Partial<ReturnType<typeof createEmptyFieldState>>
): FieldStateMap => ({
  [name]: { ...createEmptyFieldState(), ...overrides },
});
