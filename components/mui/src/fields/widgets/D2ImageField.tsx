import { useConfig } from '@dhis2/app-runtime';
import { Box, Button, FormHelperText } from '@mui/material';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { resolveFieldValidation } from '@nnkogift/dhis2-form-utils-hooks';
import { useRef } from 'react';
import { visuallyHiddenInput } from './fileUploadStyles';
import { useFileFieldUpload } from './useFileFieldUpload';

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
