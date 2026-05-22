import TextField from '@mui/material/TextField';
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
                <TextField
                    name={field.name}
                    value={String(field.value ?? '')}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    inputRef={field.ref}
                    label={label}
                    required={state.mandatory}
                    helperText={
                        state.warning ?? rhfState.error?.message ?? state.error ?? undefined
                    }
                    error={Boolean(rhfState.error ?? state.error)}
                    fullWidth
                    margin="normal"
                />
            )}
        />
    );
}
