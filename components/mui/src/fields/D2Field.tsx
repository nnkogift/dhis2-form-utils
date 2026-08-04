import {
    type FieldControlInput,
    useFieldControl,
    type WidgetKind,
    type WidgetProps,
} from '@dhis2-form-utils/hooks';
import type { ComponentType } from 'react';
import {
    D2AgeField,
    D2BooleanField,
    D2DateField,
    D2DateTimeField,
    D2EmailField,
    D2IntegerField,
    D2LongTextField,
    D2MultiSelectField,
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

// fallow-ignore-next-line code-duplication -- mirrored dispatcher map in each UI adapter
const WIDGET_BY_KIND: Record<WidgetKind, ComponentType<WidgetProps>> = {
    text: D2TextField,
    longText: D2LongTextField,
    email: D2EmailField,
    phone: D2PhoneField,
    number: D2NumberField,
    integer: D2IntegerField,
    percentage: D2PercentageField,
    boolean: D2BooleanField,
    trueOnly: D2TrueOnlyField,
    date: D2DateField,
    time: D2TimeField,
    age: D2AgeField,
    select: D2SelectField,
    multiSelect: D2MultiSelectField,
    datetime: D2DateTimeField,
    coordinate: D2UnsupportedField,
    orgUnit: D2UnsupportedField,
    file: D2UnsupportedField,
    image: D2UnsupportedField,
    unsupported: D2UnsupportedField,
};

export function D2Field({ field }: D2FieldProps) {
    const fieldControl = useFieldControl({ ...field });

    if (fieldControl.isHidden) return null;

    const Widget = WIDGET_BY_KIND[fieldControl.widgetKind];
    return <Widget control={fieldControl} />;
}
