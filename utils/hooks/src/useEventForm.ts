import { zodResolver } from '@hookform/resolvers/zod';
import { useDataQuery } from '@dhis2/app-runtime';
import { useEffect, useMemo, useState } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { buildSchema, Dhis2ValueType } from '@dhis2-form-utils/metadata';
import type { ProgramStageMetadata } from '@dhis2-form-utils/metadata';
import type { EffectHandlersMap, FieldStateMap } from '@dhis2-form-utils/rules';
import {
    buildRuleEngine,
    buildRuleEngineContext,
    evaluateAndMap,
    filterPayload,
} from '@dhis2-form-utils/rules';
import { programStageQuery } from './queries/programStage.query';

export type UseEventFormOptions = {
    programStageId?: string;
    metadata?: ProgramStageMetadata;
    existingValues?: Record<string, unknown>;
    effectHandlers?: EffectHandlersMap;
};

export type UseEventFormReturn = {
    form: UseFormReturn<Record<string, unknown>>;
    fieldState: FieldStateMap;
    isLoading: boolean;
    submit: () => void;
};

const stubMetadata: ProgramStageMetadata = {
    id: 'stub-stage',
    displayName: 'Stub Stage',
    programStageDataElements: [
        {
            dataElement: {
                id: 'sampleField',
                displayName: 'Sample Field',
                valueType: Dhis2ValueType.TEXT,
            },
        },
    ],
};

export function useEventForm(options: UseEventFormOptions = {}): UseEventFormReturn {
    const shouldFetchMetadata = !options.metadata && Boolean(options.programStageId);
    const { data, loading } = useDataQuery<{ programStage: ProgramStageMetadata }>(
        programStageQuery(options.programStageId ?? ''),
        {
            lazy: !shouldFetchMetadata,
        }
    );

    const metadata = options.metadata ?? data?.programStage ?? stubMetadata;
    const schema = useMemo(() => buildSchema(metadata), [metadata]);

    const form = useForm<Record<string, unknown>>({
        resolver: zodResolver(schema),
        defaultValues: options.existingValues ?? {},
    });

    const ruleEngineContext = useMemo(() => buildRuleEngineContext(metadata), [metadata]);
    const ruleEngine = useMemo(() => buildRuleEngine(ruleEngineContext), [ruleEngineContext]);
    const [fieldState, setFieldState] = useState<FieldStateMap>({});

    useEffect(() => {
        const applyEffects = (currentValues: Record<string, unknown>) => {
            const nextState = evaluateAndMap(ruleEngine, currentValues, options.effectHandlers);
            setFieldState(nextState);

            for (const [fieldId, state] of Object.entries(nextState)) {
                if (fieldId.startsWith('section:')) {
                    continue;
                }

                if (state.assignedValue === null || state.assignedValue === undefined) {
                    continue;
                }

                const currentValue = form.getValues(fieldId);
                if (currentValue !== state.assignedValue) {
                    form.setValue(fieldId, state.assignedValue, {
                        shouldDirty: false,
                        shouldTouch: false,
                        shouldValidate: true,
                    });
                }
            }
        };

        applyEffects(form.getValues());

        const subscription = form.watch((currentValues) => {
            applyEffects(currentValues);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [form, options.effectHandlers, ruleEngine]);

    const submit = () => {
        void form.handleSubmit((values) => {
            const payload = filterPayload(values, fieldState);
            void payload;
            // Stub: real implementation will call useDataMutation
        })();
    };

    return {
        form,
        fieldState,
        isLoading: loading,
        submit,
    };
}
