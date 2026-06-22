import type {
    EffectHandlersMap,
    FeedbackMap,
    RuleEngineLike,
    SectionStateMap,
} from '@dhis2-form-utils/rules';
import { evaluateAndMap } from '@dhis2-form-utils/rules';

export type FormStateSnapshot = {
    fieldMap: ReturnType<typeof evaluateAndMap>['fieldMap'];
    sectionMap: SectionStateMap;
    feedback: FeedbackMap;
};

export function evaluateFormState(
    engine: RuleEngineLike,
    values: Record<string, unknown>,
    effectHandlers: EffectHandlersMap | undefined
): FormStateSnapshot {
    return evaluateAndMap(engine, values, effectHandlers);
}

export const emptyFormStateSnapshot = (): FormStateSnapshot => ({
    fieldMap: {},
    sectionMap: {},
    feedback: {},
});
