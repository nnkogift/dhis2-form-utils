import { useConfig } from '@dhis2/app-runtime';
import { FileInput, Image } from '@mantine/core';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { resolveFieldValidation } from '@nnkogift/dhis2-form-utils-hooks';
import { useFileFieldUpload } from './useFileFieldUpload';

// fallow-ignore-next-line complexity
export function D2ImageField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError } = resolveFieldValidation(control);
    const { handleFile, uploading, uploadError } = useFileFieldUpload(field.onChange);
    const { baseUrl } = useConfig();
    const value = field.value as string;

    return (
        <div>
            <FileInput
                name={field.name}
                label={fieldConfig.label}
                accept="image/*"
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
            {value ? (
                <Image
                    src={`${baseUrl}/api/fileResources/${value}/data`}
                    alt={fieldConfig.label}
                    w={200}
                    fit="contain"
                    mt="xs"
                />
            ) : null}
        </div>
    );
}
