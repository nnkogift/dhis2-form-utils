import { type FieldControlInput, useFieldControl } from '@dhis2-form-utils/hooks';
import {
    D2AgeField,
    D2BooleanField,
    D2DateField,
    D2EmailField,
    D2IntegerField,
    D2LongTextField,
    D2NumberField,
    D2PercentageField,
    D2PhoneField,
    D2SelectField,
    D2TextField,
    D2TimeField,
    D2TrueOnlyField,
    D2UnsupportedField,
} from './widgets';

export type D2FieldProps = {
    field: FieldControlInput;
};

export function D2Field({ field }: D2FieldProps) {
    const fieldControl = useFieldControl({ ...field });

    if (fieldControl.isHidden) return null;

    switch (fieldControl.widgetKind) {
        case 'text':
            return <D2TextField control={fieldControl} />;
        case 'longText':
            return <D2LongTextField control={fieldControl} />;
        case 'email':
            return <D2EmailField control={fieldControl} />;
        case 'phone':
            return <D2PhoneField control={fieldControl} />;
        case 'number':
            return <D2NumberField control={fieldControl} />;
        case 'integer':
            return <D2IntegerField control={fieldControl} />;
        case 'percentage':
            return <D2PercentageField control={fieldControl} />;
        case 'boolean':
            return <D2BooleanField control={fieldControl} />;
        case 'trueOnly':
            return <D2TrueOnlyField control={fieldControl} />;
        case 'date':
            return <D2DateField control={fieldControl} />;
        case 'time':
            return <D2TimeField control={fieldControl} />;
        case 'age':
            return <D2AgeField control={fieldControl} />;
        case 'select':
            return <D2SelectField control={fieldControl} />;
        case 'datetime':
        case 'coordinate':
        case 'orgUnit':
        case 'file':
        case 'image':
        case 'unsupported':
            return <D2UnsupportedField control={fieldControl} />;
    }
}
