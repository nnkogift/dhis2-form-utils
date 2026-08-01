import {
    type FieldControlInput,
    type FieldControlReturn,
    useFieldControl,
} from '@dhis2-form-utils/hooks';
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

export type D2FieldWidgetProps = {
    control: FieldControlReturn;
};

/** Dispatches an already-resolved `FieldControlReturn` to its widget component, without re-deriving field control state. Reused by consumers that build their own chrome (labels, badges, ghost placeholders) around a field. */
export function D2FieldWidget({ control }: D2FieldWidgetProps) {
    switch (control.widgetKind) {
        case 'text':
            return <D2TextField control={control} />;
        case 'longText':
            return <D2LongTextField control={control} />;
        case 'email':
            return <D2EmailField control={control} />;
        case 'phone':
            return <D2PhoneField control={control} />;
        case 'number':
            return <D2NumberField control={control} />;
        case 'integer':
            return <D2IntegerField control={control} />;
        case 'percentage':
            return <D2PercentageField control={control} />;
        case 'boolean':
            return <D2BooleanField control={control} />;
        case 'trueOnly':
            return <D2TrueOnlyField control={control} />;
        case 'date':
            return <D2DateField control={control} />;
        case 'time':
            return <D2TimeField control={control} />;
        case 'age':
            return <D2AgeField control={control} />;
        case 'select':
            return <D2SelectField control={control} />;
        case 'datetime':
        case 'coordinate':
        case 'orgUnit':
        case 'file':
        case 'image':
        case 'unsupported':
            return <D2UnsupportedField control={control} />;
    }
}

export function D2Field({ field }: D2FieldProps) {
    const fieldControl = useFieldControl({ ...field });

    if (fieldControl.isHidden) return null;

    return <D2FieldWidget control={fieldControl} />;
}
