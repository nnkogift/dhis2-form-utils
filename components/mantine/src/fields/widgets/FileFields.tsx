import { useConfig } from '@dhis2/app-runtime';
import { FileInput, Image } from '@mantine/core';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { resolveFieldValidation, useFileResourceUpload } from '@nnkogift/dhis2-form-utils-hooks';
import { useState } from 'react';

function useFileFieldUpload(onChange: (id: string) => void) {
    const { upload, uploading, error } = useFileResourceUpload();
    const [uploadError, setUploadError] = useState<string | undefined>(undefined);

    const handleFile = (file: File | null) => {
        if (!file) {
            onChange('');
            return;
        }
        // fallow-ignore-next-line code-duplication
        setUploadError(undefined);
        upload(file)
            .then((result) => {
                onChange(result.id);
            })
            .catch((uploadFailure: unknown) => {
                setUploadError(
                    uploadFailure instanceof Error ? uploadFailure.message : 'Upload failed'
                );
            });
    };

    return { handleFile, uploading, uploadError: uploadError ?? error?.message };
}

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
