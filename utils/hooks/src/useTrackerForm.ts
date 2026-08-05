import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useRef } from 'react';
import { Resolver, useForm, type UseFormReturn } from 'react-hook-form';
import type {
    OptionGroupCodeMap,
    TrackerProgramMetadata,
} from '@nnkogift/dhis2-form-utils-metadata';
import { buildTrackerSchema } from '@nnkogift/dhis2-form-utils-metadata';
import type {
    BuiltRuleEngine,
    EffectHandlersMap,
    RuleEventInput,
    RuleSupplementaryDataInput,
} from '@nnkogift/dhis2-form-utils-rules';
import {
    buildEnrollmentRuleEngine,
    buildEnrollmentRuleEngineContext,
    toRuleEventFromInput,
} from '@nnkogift/dhis2-form-utils-rules';
import { FormStore } from './formStore';
import type { DefaultFormValue } from './formValue';

export type UseTrackerFormOptions = {
    programId: string;
    metadata: TrackerProgramMetadata;
    effectHandlers?: EffectHandlersMap;
    events?: RuleEventInput[];
    supplementaryData?: RuleSupplementaryDataInput;
    optionGroups?: OptionGroupCodeMap;
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
    // Reference-equality memoization only (no deep equality) — callers must keep
    // metadata / events / supplementaryData stable across renders to avoid
    // unnecessary formStore.reinit churn.
    const metadata = useMemo(() => options.metadata, [options.metadata]);
    const schema = useMemo(() => buildTrackerSchema(metadata), [metadata]);
    const form = useForm<FormValue>({
        ...(formOptions ?? {}),
        resolver: zodResolver(schema) as unknown as Resolver<FormValue>,
    });

    const ruleEngineContext = useMemo(
        () => buildEnrollmentRuleEngineContext(metadata, options.supplementaryData),
        [metadata, options.supplementaryData]
    );
    const ruleEvents = useMemo(
        () => (options.events ?? []).map(toRuleEventFromInput),
        [options.events]
    );
    const ruleEngine = useMemo(
        () => buildEnrollmentRuleEngine(ruleEngineContext, ruleEvents),
        [ruleEngineContext, ruleEvents]
    );
    const formStore = useMemo(() => new FormStore(), []);

    const effectHandlersRef = useRef(options.effectHandlers);
    const optionGroupsRef = useRef(options.optionGroups);
    optionGroupsRef.current = options.optionGroups;
    const prevEngineRef = useRef<BuiltRuleEngine | null>(null);
    if (prevEngineRef.current !== ruleEngine) {
        if (prevEngineRef.current !== null) {
            formStore.reinit(
                form as UseFormReturn<Record<string, unknown>>,
                ruleEngine,
                effectHandlersRef,
                optionGroupsRef
            );
        } else {
            formStore.init(
                form as UseFormReturn<Record<string, unknown>>,
                ruleEngine,
                effectHandlersRef,
                optionGroupsRef
            );
        }
        prevEngineRef.current = ruleEngine;
    }

    return {
        form,
        formStore,
    };
}
