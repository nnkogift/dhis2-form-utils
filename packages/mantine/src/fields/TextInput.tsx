import { TextInput as MantineTextInput } from '@mantine/core';
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
            render={({ field, fieldState: rhfState }) => (
                <MantineTextInput
                    {...field}
                    value={String(field.value ?? '')}
                    label={label}
                    required={state.mandatory}
                    description={state.warning ?? undefined}
                    error={rhfState.error?.message ?? state.error ?? undefined}
                />
            )}
        />
    );
}
