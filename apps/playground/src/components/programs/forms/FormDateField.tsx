import i18n from '@dhis2/d2-i18n'
import { InputField } from '@dhis2/ui'
import { useController } from 'react-hook-form'

type FormDateFieldProps = {
    name: string
    label: string
    disabled?: boolean
}

export function FormDateField({
    name,
    label,
    disabled = false,
}: FormDateFieldProps) {
    const { field, fieldState } = useController({
        name,
        rules: {
            required: i18n.t('This field is required'),
        },
    })

    return (
        <InputField
            name={field.name}
            type="date"
            label={label}
            disabled={disabled}
            value={String(field.value ?? '')}
            error={Boolean(fieldState.error)}
            validationText={fieldState.error?.message}
            onChange={({ value }) => {
                field.onChange(value ?? '')
            }}
            onBlur={field.onBlur}
        />
    )
}
