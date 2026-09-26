import { FileInputField } from '@dhis2/ui';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { resolveFieldValidation } from '@nnkogift/dhis2-form-utils-hooks';
import { useFileFieldUpload } from './useFileFieldUpload';

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
