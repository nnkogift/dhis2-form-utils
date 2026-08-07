import { useConfig } from '@dhis2/app-runtime';
import { FileInputField } from '@dhis2/ui';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { resolveFieldValidation, useFileResourceUpload } from '@nnkogift/dhis2-form-utils-hooks';
import { useState } from 'react';

function useFileFieldUpload(onChange: (id: string) => void) {
    const { upload, uploading, error } = useFileResourceUpload();
    const [uploadError, setUploadError] = useState<string | undefined>(undefined);

    const handleFiles = (files: FileList) => {
        const file = files.item(0);
        if (!file) return;
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

    return { handleFiles, uploading, uploadError: uploadError ?? error?.message };
}

// fallow-ignore-next-line complexity
export function D2FileField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError, hasWarning } = resolveFieldValidation(control);
    const { handleFiles, uploading, uploadError } = useFileFieldUpload(field.onChange);

    return (
        <FileInputField
            name={field.name}
            label={fieldConfig.label}
            helpText={
                uploadError ??
                fieldConfig.description ??
                (uploading ? 'Uploading…' : 'Max size depends on server configuration.')
            }
            required={isMandatory}
            disabled={isDisabled || uploading}
            warning={hasWarning}
            error={hasError || Boolean(uploadError)}
            validationText={validationText}
            buttonLabel={(field.value as string) ? 'Replace file' : 'Select file'}
            onChange={({ files }) => {
                handleFiles(files);
            }}
            onBlur={field.onBlur}
        />
    );
}

// fallow-ignore-next-line complexity
export function D2ImageField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError, hasWarning } = resolveFieldValidation(control);
    const { handleFiles, uploading, uploadError } = useFileFieldUpload(field.onChange);
    const { baseUrl } = useConfig();
    const value = field.value as string;

    return (
        <div>
            <FileInputField
                name={field.name}
                label={fieldConfig.label}
                accept="image/*"
                helpText={
                    uploadError ??
                    fieldConfig.description ??
                    (uploading ? 'Uploading…' : 'Max size depends on server configuration.')
                }
                required={isMandatory}
                disabled={isDisabled || uploading}
                warning={hasWarning}
                error={hasError || Boolean(uploadError)}
                validationText={validationText}
                buttonLabel={value ? 'Replace image' : 'Select image'}
                onChange={({ files }) => {
                    handleFiles(files);
                }}
                onBlur={field.onBlur}
            />
            {value ? (
                <img
                    src={`${baseUrl}/api/fileResources/${value}/data`}
                    alt={fieldConfig.label}
                    style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '8px' }}
                />
            ) : null}
        </div>
    );
}
