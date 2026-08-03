import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useRef } from 'react';
import { Resolver, useForm, type UseFormReturn } from 'react-hook-form';
import type {
    EventProgramMetadata,
    OptionGroupCodeMap,
    TrackerProgramMetadata,
} from '@dhis2-form-utils/metadata';
import { buildSchema, selectProgramStage } from '@dhis2-form-utils/metadata';
import type {
    BuiltRuleEngine,
    EffectHandlersMap,
    RuleEventInput,
    RuleSupplementaryDataInput,
} from '@dhis2-form-utils/rules';
import {
    buildRuleEngine,
    buildRuleEngineContext,
    toRuleEnrollment,
    toRuleEventFromInput,
} from '@dhis2-form-utils/rules';
import { FormStore } from './formStore';
import type { DefaultFormValue } from './formValue';

export type UseEventFormOptions = {
    programStageId: string;
    metadata: EventProgramMetadata;
    effectHandlers?: EffectHandlersMap;
    enrollment?: { metadata: TrackerProgramMetadata; values: Record<string, unknown> };
    events?: RuleEventInput[];
    supplementaryData?: RuleSupplementaryDataInput;
    optionGroups?: OptionGroupCodeMap;
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
    // Reference-equality memoization only (no deep equality) — callers must keep
    // metadata / enrollment / events / supplementaryData stable across renders to
    // avoid unnecessary formStore.reinit churn.
    const metadata = useMemo(() => options.metadata, [options.metadata]);
    const programStageId = options.programStageId;
    const stageMetadata = useMemo(
        () => selectProgramStage(metadata, programStageId),
        [metadata, programStageId]
    );
    const resolvedStageMetadata = useMemo(
        () =>
            stageMetadata ?? {
                id: programStageId,
                programStageDataElements: [],
            },
        [stageMetadata, programStageId]
    );
    const schema = useMemo(() => buildSchema(resolvedStageMetadata), [resolvedStageMetadata]);
    const form = useForm<FormValue>({
        ...(formOptions ?? {}),
        resolver: zodResolver(schema) as unknown as Resolver<FormValue>,
    });

    const ruleEngineContext = useMemo(
        () =>
            buildRuleEngineContext({
                stageMetadata: resolvedStageMetadata,
                programRules: metadata.programRules,
                programRuleVariables: metadata.programRuleVariables,
                programStageId,
                constants: metadata.constants,
                supplementaryData: options.supplementaryData,
            }),
        [metadata, programStageId, resolvedStageMetadata, options.supplementaryData]
    );

    const enrollmentContext = useMemo(
        () => ({
            enrollment: options.enrollment
                ? toRuleEnrollment(options.enrollment.metadata, options.enrollment.values)
                : null,
            events: (options.events ?? []).map(toRuleEventFromInput),
        }),
        [options.enrollment, options.events]
    );

    const ruleEngine = useMemo(
        () => buildRuleEngine(ruleEngineContext, enrollmentContext),
        [ruleEngineContext, enrollmentContext]
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
