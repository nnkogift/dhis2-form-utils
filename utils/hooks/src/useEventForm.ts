import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useRef } from 'react';
import { Resolver, useForm, type UseFormReturn } from 'react-hook-form';
import type { ProgramStageMetadata } from '@dhis2-form-utils/metadata';
import { buildSchema } from '@dhis2-form-utils/metadata';
import type { BuiltRuleEngine, EffectHandlersMap } from '@dhis2-form-utils/rules';
import { buildRuleEngine, buildRuleEngineContext } from '@dhis2-form-utils/rules';
import { FormStore } from './formStore';

export type DefaultFormValue = Record<string, string>;

export type UseEventFormOptions = {
    programStageId: string;
    metadata: ProgramStageMetadata;
    effectHandlers?: EffectHandlersMap;
};

export type UseEventFormReturn<FormValue extends DefaultFormValue = DefaultFormValue> = {
    form: UseFormReturn<FormValue>;
    formStore: FormStore;
};

export function useEventForm<FormValue extends DefaultFormValue = DefaultFormValue>({
    options,
    formOptions,
}: {
    options: UseEventFormOptions;
    formOptions?: Omit<Parameters<typeof useForm<FormValue>>[0], 'resolver'>;
}): UseEventFormReturn<FormValue> {
    const metadata = useMemo(() => options.metadata, [options.metadata]);
    const schema = useMemo(() => buildSchema(metadata), [metadata]);
    const form = useForm<FormValue>({
        ...(formOptions ?? {}),
        resolver: zodResolver(schema) as unknown as Resolver<FormValue>,
    });

    const ruleEngineContext = useMemo(() => buildRuleEngineContext(metadata), [metadata]);
    const ruleEngine = useMemo(() => buildRuleEngine(ruleEngineContext), [ruleEngineContext]);
    const formStore = useMemo(() => new FormStore(), []);

    const effectHandlersRef = useRef(options.effectHandlers);
    const prevEngineRef = useRef<BuiltRuleEngine | null>(null);
    if (prevEngineRef.current !== ruleEngine) {
        if (prevEngineRef.current !== null) {
            formStore.reinit(
                form as UseFormReturn<Record<string, unknown>>,
                ruleEngine,
                effectHandlersRef
            );
        } else {
            formStore.init(
                form as UseFormReturn<Record<string, unknown>>,
                ruleEngine,
                effectHandlersRef
            );
        }
        prevEngineRef.current = ruleEngine;
    }

    return {
        form,
        formStore,
    };
}
