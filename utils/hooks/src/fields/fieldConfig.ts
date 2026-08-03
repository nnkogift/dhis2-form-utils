import type {
    ProgramStageDataElement,
    ProgramTrackedEntityAttribute,
    ValueType,
    ValueTypeRenderingType,
} from '@dhis2-form-utils/metadata';

export type RenderTypeHint = ValueTypeRenderingType;

export type FieldConfig = {
    id: string;
    fieldKind: 'dataElement' | 'trackedEntityAttribute';
    label: string;
    description?: string;
    valueType: ValueType;
    required: boolean;
    allowFutureDate: boolean;
    optionSet?: {
        id: string;
        options: ReadonlyArray<{
            id: string;
            code: string;
            label: string;
        }>;
    };
    generated?: boolean;
    allowProvidedElsewhere?: boolean;
    renderTypeHint?: RenderTypeHint;
};

const resolveRenderTypeHint = (
    renderType?: ProgramStageDataElement['renderType']
): RenderTypeHint | undefined => {
    if (!renderType) return undefined;
    return renderType.DESKTOP.type;
};

type OptionSetInput = {
    id?: string;
    options?: Array<{ id?: string; code?: string; displayName?: string }>;
};

const mapOptionSet = (optionSet: OptionSetInput): NonNullable<FieldConfig['optionSet']> => ({
    id: optionSet.id ?? '',
    options: (optionSet.options ?? []).map((option) => ({
        id: option.id ?? '',
        code: option.code ?? '',
        label: option.displayName ?? option.code ?? '',
    })),
});

const readOptionSet = (dataElement: { optionSet?: OptionSetInput }): FieldConfig['optionSet'] => {
    const optionSet = dataElement.optionSet;
    return optionSet ? mapOptionSet(optionSet) : undefined;
};

export function fromProgramStageDataElement(psde: ProgramStageDataElement): FieldConfig {
    const de = psde.dataElement;
    if (!de?.id) {
        throw new Error('ProgramStageDataElement is missing dataElement.id');
    }

    return {
        id: de.id,
        fieldKind: 'dataElement',
        label: de.displayFormName ?? de.displayName ?? de.id,
        description: de.description,
        valueType: de.valueType,
        required: psde.compulsory ?? false,
        allowFutureDate: psde.allowFutureDate ?? true,
        allowProvidedElsewhere: psde.allowProvidedElsewhere,
        optionSet: readOptionSet(de),
        renderTypeHint: resolveRenderTypeHint(psde.renderType),
    };
}

export function fromProgramTrackedEntityAttribute(
    ptea: ProgramTrackedEntityAttribute
): FieldConfig {
    const tea = ptea.trackedEntityAttribute;
    if (!tea?.id) {
        throw new Error('ProgramTrackedEntityAttribute is missing trackedEntityAttribute.id');
    }

    return {
        id: tea.id,
        fieldKind: 'trackedEntityAttribute',
        label: tea.displayFormName ?? tea.displayName ?? tea.id,
        description: tea.description,
        valueType: tea.valueType,
        required: ptea.mandatory ?? false,
        allowFutureDate: ptea.allowFutureDate ?? true,
        generated: tea.generated,
        optionSet: readOptionSet(tea),
        renderTypeHint: resolveRenderTypeHint(ptea.renderType),
    };
}
