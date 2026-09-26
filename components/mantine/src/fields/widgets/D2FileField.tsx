import { FileInput } from '@mantine/core';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { resolveFieldValidation } from '@nnkogift/dhis2-form-utils-hooks';
import { useFileFieldUpload } from './useFileFieldUpload';

// fallow-ignore-next-line complexity
export function D2FileField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError } = resolveFieldValidation(control);
    const { handleFile, uploading, uploadError } = useFileFieldUpload(field.onChange);

    return (
        <FileInput
            name={field.name}
            label={fieldConfig.label}
            description={
                uploadError ??
                fieldConfig.description ??
                (uploading ? 'Uploading…' : 'Max size depends on server configuration.')
            }
            required={isMandatory}
            disabled={isDisabled || uploading}
            clearable
            error={hasError || uploadError ? (validationText ?? uploadError) : undefined}
            onChange={handleFile}
            onBlur={field.onBlur}
        />
    );
}
