import { InputField } from '@dhis2/ui';
import { Controller, useFormContext } from 'react-hook-form';
import { useFieldState } from '@dhis2-form-utils/hooks';

export type TextInputProps = {
  name: string;
  label: string;
};

export function TextInput({ name, label }: TextInputProps) {
  const { control } = useFormContext();
  const state = useFieldState(name);

  if (state.hidden) return null;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: rhfState }) => {
        const errorMessage = rhfState.error?.message ?? state.error ?? undefined;
        const warningMessage = state.warning ?? undefined;
        const hasError = Boolean(errorMessage);
        const hasWarning = Boolean(warningMessage) && !hasError;

        return (
          <InputField
            name={field.name}
            value={String(field.value ?? '')}
            label={label}
            required={state.mandatory}
            warning={hasWarning}
            error={hasError}
            validationText={errorMessage ?? warningMessage}
            onChange={({ value }) => {
              field.onChange(value);
            }}
            onBlur={field.onBlur}
          />
        );
      }}
    />
  );
}
