import { useMemo } from 'react';
import { ControllerFieldState, ControllerRenderProps, useController } from 'react-hook-form';
import type {
    ProgramStageDataElement,
    ProgramTrackedEntityAttribute,
} from '@dhis2-form-utils/metadata';
import { useFieldState } from '../FormStateContext';
import {
    type FieldConfig,
    fromProgramStageDataElement,
    fromProgramTrackedEntityAttribute,
} from './fieldConfig';
import { resolveWidgetKind, type WidgetKind } from './widgetKind';

export type FieldControlInput =
    | { kind: 'dataElement'; config: ProgramStageDataElement }
    | {
          kind: 'trackedEntityAttribute';
          config: ProgramTrackedEntityAttribute;
      };

export type FieldControlReturn = {
    fieldId: string;
    fieldConfig: FieldConfig;
    widgetKind: WidgetKind;
    field: ControllerRenderProps;
    fieldState: ControllerFieldState;
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
    const isMandatory = useMemo(
        () => fieldConfig.required || ruleState.mandatory,
        [fieldConfig, ruleState]
    );
    const { field, fieldState } = useController({
        name: fieldConfig.id,
    });

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
