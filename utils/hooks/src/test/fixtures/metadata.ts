import type {
    ProgramStageDataElement,
    ProgramTrackedEntityAttribute,
    ValueType,
} from '@dhis2-form-utils/metadata';

export const makePsde = (
    id: string,
    valueType: ValueType,
    overrides: Partial<ProgramStageDataElement> = {}
): ProgramStageDataElement => ({
    compulsory: false,
    allowFutureDate: true,
    dataElement: {
        id,
        displayName: `Field ${id}`,
        displayFormName: `Form ${id}`,
        valueType,
    },
    ...overrides,
});

export const makePsdeWithOptionSet = (
    id: string,
    valueType: ValueType = 'TEXT'
): ProgramStageDataElement =>
    ({
        ...makePsde(id, valueType),
        dataElement: {
            id,
            displayName: `Field ${id}`,
            valueType,
            optionSet: {
                id: 'option-set-1',
                options: [
                    { id: 'opt-1', code: 'YES', displayName: 'Yes' },
                    { id: 'opt-2', code: 'NO', displayName: 'No' },
                ],
            },
        },
    }) as unknown as ProgramStageDataElement;

export const makePtea = (
    id: string,
    valueType: ValueType,
    overrides: Partial<ProgramTrackedEntityAttribute> = {}
): ProgramTrackedEntityAttribute => ({
    mandatory: false,
    allowFutureDate: true,
    trackedEntityAttribute: {
        id,
        displayName: `Attribute ${id}`,
        displayFormName: `Form ${id}`,
        valueType,
        generated: false,
        unique: false,
    },
    ...overrides,
});

export const makeGeneratedPtea = (id: string): ProgramTrackedEntityAttribute =>
    makePtea(id, 'TEXT', {
        trackedEntityAttribute: {
            id,
            displayName: `Attribute ${id}`,
            valueType: 'TEXT',
            generated: true,
            unique: false,
        },
    });
