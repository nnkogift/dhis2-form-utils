import { Box, Button, FormHelperText } from '@mui/material';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { resolveFieldValidation } from '@nnkogift/dhis2-form-utils-hooks';
import { useRef } from 'react';
import { visuallyHiddenInput } from './fileUploadStyles';
import { useFileFieldUpload } from './useFileFieldUpload';

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
