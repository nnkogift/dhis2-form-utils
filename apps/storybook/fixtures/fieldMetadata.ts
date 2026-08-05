import type {
    ProgramStageDataElement,
    ProgramTrackedEntityAttribute,
    ValueType,
} from '@nnkogift/dhis2-form-utils-metadata';
import type { WidgetKind } from '@nnkogift/dhis2-form-utils-hooks';

const VALUE_TYPE_BY_WIDGET: Record<WidgetKind, ValueType> = {
    text: 'TEXT',
    longText: 'LONG_TEXT',
    number: 'NUMBER',
    integer: 'INTEGER',
    percentage: 'PERCENTAGE',
    email: 'EMAIL',
    phone: 'PHONE_NUMBER',
    boolean: 'BOOLEAN',
    trueOnly: 'TRUE_ONLY',
    date: 'DATE',
    datetime: 'DATETIME',
    time: 'TIME',
    age: 'AGE',
    select: 'TEXT',
    multiSelect: 'MULTI_TEXT',
    orgUnit: 'ORGANISATION_UNIT',
    coordinate: 'COORDINATE',
    file: 'FILE_RESOURCE',
    image: 'IMAGE',
    unsupported: 'REFERENCE',
};

const OPTION_SET_WIDGETS = new Set<WidgetKind>(['select', 'multiSelect']);

export const makeFieldPsde = (
    widgetKind: WidgetKind,
    overrides: Partial<ProgramStageDataElement> = {}
): ProgramStageDataElement => {
    const id = `field-${widgetKind}`;
    const valueType = VALUE_TYPE_BY_WIDGET[widgetKind];
    const base: ProgramStageDataElement = {
        compulsory: false,
        allowFutureDate: true,
        dataElement: {
            id,
            displayName: `${widgetKind} field`,
            displayFormName: `${widgetKind} label`,
            valueType,
            description: `Example ${widgetKind} field`,
        },
    };

    if (OPTION_SET_WIDGETS.has(widgetKind) && base.dataElement) {
        base.dataElement = {
            ...base.dataElement,
            optionSet: {
                id: 'option-set-demo',
                options: [
                    { id: 'opt-a', code: 'A', displayName: 'Option A' },
                    { id: 'opt-b', code: 'B', displayName: 'Option B' },
                ],
            },
        };
    }

    return { ...base, ...overrides };
};

export const makeFieldPtea = (
    widgetKind: WidgetKind,
    overrides: Partial<ProgramTrackedEntityAttribute> = {}
): ProgramTrackedEntityAttribute => {
    const id = `tea-${widgetKind}`;
    const valueType = VALUE_TYPE_BY_WIDGET[widgetKind];

    return {
        mandatory: false,
        allowFutureDate: true,
        trackedEntityAttribute: {
            id,
            displayName: `${widgetKind} attribute`,
            displayFormName: `${widgetKind} attribute label`,
            valueType,
            generated: false,
            unique: false,
        },
        ...overrides,
    };
};

export const TIER1_WIDGET_KINDS = [
    'text',
    'longText',
    'number',
    'integer',
    'percentage',
    'email',
    'phone',
    'boolean',
    'trueOnly',
    'select',
    'multiSelect',
    'date',
    'time',
    'datetime',
    'age',
] as const satisfies readonly WidgetKind[];

export const STUB_WIDGET_KINDS = ['orgUnit'] as const satisfies readonly WidgetKind[];
