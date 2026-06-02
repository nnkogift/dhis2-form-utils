import { zodResolver } from '@hookform/resolvers/zod';
import { useDataQuery } from '@dhis2/app-runtime';
import { debounce } from 'lodash-es';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
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
import { createFieldStateStore, type FieldStateStore } from './store/fieldStateStore';

export type UseEventFormOptions = {
    programStageId?: string;
    metadata?: ProgramStageMetadata;
    existingValues?: Record<string, unknown>;
    effectHandlers?: EffectHandlersMap;
};

export type UseEventFormReturn = {
    form: UseFormReturn<Record<string, unknown>>;
    store: FieldStateStore;
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
    const store = useMemo(() => createFieldStateStore(), []);
    const effectHandlersRef = useRef(options.effectHandlers);
    useLayoutEffect(() => {
        effectHandlersRef.current = options.effectHandlers;
    }, [options.effectHandlers]);
    const prevAssignmentsRef = useRef<Record<string, unknown>>({});

    useEffect(() => {
        const evaluate = (values: Record<string, unknown>) => {
            const nextState: FieldStateMap = evaluateAndMap(
                ruleEngine,
                values,
                effectHandlersRef.current
            );

            for (const [fieldId, state] of Object.entries(nextState)) {
                if (fieldId.startsWith('section:')) {
                    continue;
                }

                if (state.assignedValue === null || state.assignedValue === undefined) {
                    continue;
                }

                if (prevAssignmentsRef.current[fieldId] === state.assignedValue) continue;

                prevAssignmentsRef.current[fieldId] = state.assignedValue;
                form.setValue(fieldId, state.assignedValue, {
                    shouldDirty: false,
                    shouldTouch: false,
                    shouldValidate: false,
                });
            }

            store.setState(nextState);
        };

        const debounced = debounce(evaluate, 40);

        evaluate(form.getValues());

        const unsub = form.subscribe({
            formState: { values: true },
            callback: ({ values }) => {
                debounced(values);
            },
        });

        return unsub;
    }, [ruleEngine, store, form]);

    const submit = () => {
        void form.handleSubmit((values) => {
            const payload = filterPayload(values, store.getSnapshot());
            void payload;
            // Stub: real implementation will call useDataMutation
        })();
    };

    return {
        form,
        store,
        isLoading: loading,
        submit,
    };
}
