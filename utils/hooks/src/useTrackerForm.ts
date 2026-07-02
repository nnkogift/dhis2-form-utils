import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useRef } from 'react';
import { Resolver, useForm, type UseFormReturn } from 'react-hook-form';
import type { TrackerProgramMetadata } from '@dhis2-form-utils/metadata';
import { buildTrackerSchema } from '@dhis2-form-utils/metadata';
import type { BuiltRuleEngine, EffectHandlersMap } from '@dhis2-form-utils/rules';
import {
    buildEnrollmentRuleEngine,
    buildEnrollmentRuleEngineContext,
} from '@dhis2-form-utils/rules';
import { FormStore } from './formStore';

export type DefaultFormValue = Record<string, string>;

export type UseTrackerFormOptions = {
    programId: string;
    metadata: TrackerProgramMetadata;
    effectHandlers?: EffectHandlersMap;
};

export type UseTrackerFormReturn<FormValue extends DefaultFormValue = DefaultFormValue> = {
    form: UseFormReturn<FormValue>;
    formStore: FormStore;
};

export function useTrackerForm<FormValue extends DefaultFormValue = DefaultFormValue>({
    options,
    formOptions,
}: {
    options: UseTrackerFormOptions;
    formOptions?: Omit<Parameters<typeof useForm<FormValue>>[0], 'resolver'>;
}): UseTrackerFormReturn<FormValue> {
    const metadata = useMemo(() => options.metadata, [options.metadata]);
    const schema = useMemo(() => buildTrackerSchema(metadata), [metadata]);
    const form = useForm<FormValue>({
        ...(formOptions ?? {}),
        resolver: zodResolver(schema) as unknown as Resolver<FormValue>,
    });

    const ruleEngineContext = useMemo(() => buildEnrollmentRuleEngineContext(metadata), [metadata]);
    const ruleEngine = useMemo(
        () => buildEnrollmentRuleEngine(ruleEngineContext),
        [ruleEngineContext]
    );
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
