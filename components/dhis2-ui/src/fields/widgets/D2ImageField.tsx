import { useConfig } from '@dhis2/app-runtime';
import { FileInputField } from '@dhis2/ui';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { resolveFieldValidation } from '@nnkogift/dhis2-form-utils-hooks';
import { useFileFieldUpload } from './useFileFieldUpload';
import './fieldWidgetLayout.css';

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
                    className="d2-image-preview"
                />
            ) : null}
        </div>
    );
}
