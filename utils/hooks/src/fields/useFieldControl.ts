import { useMemo } from 'react';
import type { Control, RegisterOptions } from 'react-hook-form';
import { useController } from 'react-hook-form';
import type {
    ProgramStageDataElement,
    ProgramTrackedEntityAttribute,
} from '@dhis2-form-utils/metadata';
import { useFieldState } from '../FormStateContext';
import {
    fromProgramStageDataElement,
    fromProgramTrackedEntityAttribute,
    type FieldConfig,
} from './fieldConfig';
import { buildFieldSchema } from './fieldValidation';
import { resolveWidgetKind, type WidgetKind } from './widgetKind';

export type FieldControlInput =
    | { kind: 'dataElement'; config: ProgramStageDataElement; control: Control }
    | {
          kind: 'trackedEntityAttribute';
          config: ProgramTrackedEntityAttribute;
          control: Control;
      };

export type FieldControlReturn = {
    fieldId: string;
    fieldConfig: FieldConfig;
    widgetKind: WidgetKind;
    field: {
        value: string;
        onChange: (value: string) => void;
        onBlur: () => void;
        name: string;
        ref: React.Ref<unknown>;
    };
    fieldState: {
        invalid: boolean;
        isTouched: boolean;
        isDirty: boolean;
        error?: { message?: string };
    };
    isHidden: boolean;
    isDisabled: boolean;
    isMandatory: boolean;
    hasWarning: boolean;
    hasError: boolean;
    warningMessage?: string;
    errorMessage?: string;
};

export type WidgetProps = {
    control: FieldControlReturn;
};

export function useFieldControl(input: FieldControlInput): FieldControlReturn {
    const fieldConfig: FieldConfig = useMemo(
        () =>
            input.kind === 'dataElement'
                ? fromProgramStageDataElement(input.config)
                : fromProgramTrackedEntityAttribute(input.config),
        // eslint-disable-next-line react-hooks/exhaustive-deps -- stable per entity id
        [input.kind, input.config.id]
    );

    const widgetKind = useMemo(() => resolveWidgetKind(fieldConfig), [fieldConfig]);
    const ruleState = useFieldState(fieldConfig.id);

    const isMandatory = fieldConfig.required || ruleState.mandatory;
    const zodSchema = useMemo(
        () => buildFieldSchema({ ...fieldConfig, required: isMandatory }),
        [fieldConfig, isMandatory]
    );

    const rules: RegisterOptions = useMemo(
        () => ({
            validate: (value: string) => {
                const result = zodSchema.safeParse(value);
                return result.success ? true : (result.error.errors[0]?.message ?? 'Invalid value');
            },
        }),
        [zodSchema]
    );

    const { field: rhfField, fieldState } = useController({
        name: fieldConfig.id,
        control: input.control,
        defaultValue: '',
        rules,
    });

    const field = {
        value: (rhfField.value ?? '') as string,
        onChange: rhfField.onChange,
        onBlur: rhfField.onBlur,
        name: rhfField.name,
        ref: rhfField.ref,
    };

    return {
        fieldId: fieldConfig.id,
        fieldConfig,
        widgetKind,
        field,
        fieldState,
        isHidden: ruleState.hidden,
        isDisabled: (fieldConfig.generated ?? false) || ruleState.assignedValue != null,
        isMandatory,
        hasWarning: Boolean(ruleState.warning),
        hasError: Boolean(ruleState.error),
        warningMessage: ruleState.warning ?? undefined,
        errorMessage: ruleState.error ?? undefined,
    };
}
