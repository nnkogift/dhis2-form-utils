import { useConfig } from '@dhis2/app-runtime';
import { Box, Button, FormHelperText } from '@mui/material';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { resolveFieldValidation, useFileResourceUpload } from '@nnkogift/dhis2-form-utils-hooks';
import { useRef, useState, type CSSProperties } from 'react';

/**
 * Visually hides the native file input without `display: none` — the
 * `hidden` attribute makes the element untestable via real-browser
 * `userEvent.upload()` (Playwright honors visibility), so this uses the same
 * clip-based technique as MUI's own file-upload-button docs example.
 */
const visuallyHiddenInput: CSSProperties = {
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
};

function useFileFieldUpload(onChange: (id: string) => void) {
    const { upload, uploading, error } = useFileResourceUpload();
    const [uploadError, setUploadError] = useState<string | undefined>(undefined);

    const handleFiles = (files: FileList | null) => {
        const file = files?.item(0);
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
    const { validationText, hasError } = resolveFieldValidation(control);
    const { handleFiles, uploading, uploadError } = useFileFieldUpload(field.onChange);
    const inputRef = useRef<HTMLInputElement>(null);
    const value = field.value as string;

    return (
        <Box sx={{ my: 2, position: 'relative' }}>
            <input
                ref={inputRef}
                type="file"
                name={field.name}
                style={visuallyHiddenInput}
                onChange={(event) => {
                    handleFiles(event.target.files);
                }}
                onBlur={field.onBlur}
            />
            <Button
                variant="outlined"
                disabled={isDisabled || uploading}
                onClick={() => inputRef.current?.click()}
            >
                {value ? 'Replace file' : 'Select file'}
                {isMandatory && !value ? ' *' : ''}
            </Button>
            <FormHelperText error={hasError || Boolean(uploadError)}>
                {uploadError ??
                    (hasError ? validationText : fieldConfig.description) ??
                    (uploading ? 'Uploading…' : 'Max size depends on server configuration.')}
            </FormHelperText>
        </Box>
    );
}

// fallow-ignore-next-line complexity
export function D2ImageField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError } = resolveFieldValidation(control);
    const { handleFiles, uploading, uploadError } = useFileFieldUpload(field.onChange);
    const { baseUrl } = useConfig();
    const inputRef = useRef<HTMLInputElement>(null);
    const value = field.value as string;

    return (
        <Box sx={{ my: 2, position: 'relative' }}>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                name={field.name}
                style={visuallyHiddenInput}
                onChange={(event) => {
                    handleFiles(event.target.files);
                }}
                onBlur={field.onBlur}
            />
            <Button
                variant="outlined"
                disabled={isDisabled || uploading}
                onClick={() => inputRef.current?.click()}
            >
                {value ? 'Replace image' : 'Select image'}
                {isMandatory && !value ? ' *' : ''}
            </Button>
            <FormHelperText error={hasError || Boolean(uploadError)}>
                {uploadError ??
                    (hasError ? validationText : fieldConfig.description) ??
                    (uploading ? 'Uploading…' : 'Max size depends on server configuration.')}
            </FormHelperText>
            {value ? (
                <Box
                    component="img"
                    src={`${baseUrl}/api/fileResources/${value}/data`}
                    alt={fieldConfig.label}
                    sx={{ display: 'block', maxWidth: 200, maxHeight: 200, mt: 1 }}
                />
            ) : null}
        </Box>
    );
}
