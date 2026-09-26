// fallow-ignore-file code-duplication
import { type FieldControlInput, useFieldControl } from '@nnkogift/dhis2-form-utils-hooks';
import { D2FieldWidget } from './D2FieldWidget';

export type D2FieldProps = {
    field: FieldControlInput;
};

export function D2Field({ field }: D2FieldProps) {
    const fieldControl = useFieldControl({ ...field });

    if (fieldControl.isHidden) return null;

    return <D2FieldWidget control={fieldControl} />;
}
