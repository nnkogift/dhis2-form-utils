import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useRef } from 'react';
import { DefaultValues, Resolver, useForm, type UseFormReturn } from 'react-hook-form';
import type { ProgramStageMetadata } from '@dhis2-form-utils/metadata';
import { buildSchema } from '@dhis2-form-utils/metadata';
import type { BuiltRuleEngine, EffectHandlersMap } from '@dhis2-form-utils/rules';
import { buildRuleEngine, buildRuleEngineContext, filterPayload } from '@dhis2-form-utils/rules';
import { FormStore } from './formStore';
import type { FieldStateStore } from './store/fieldStateStore';
import type { NonFieldStateStore } from './store/nonFieldStateStore';

export type DefaultFormValue = Record<string, string>;

export type UseEventFormOptions<FormValue extends DefaultFormValue = DefaultFormValue> = {
    programStageId: string;
    metadata: ProgramStageMetadata;
    existingValues?: Partial<FormValue>;
    effectHandlers?: EffectHandlersMap;
};

export type UseEventFormReturn<FormValue extends DefaultFormValue = DefaultFormValue> = {
    form: UseFormReturn<FormValue>;
    formStore: FormStore;
    fieldStore: FieldStateStore;
    nonFieldStore: NonFieldStateStore;
    submit: () => void;
};

export function useEventForm<FormValue extends DefaultFormValue = DefaultFormValue>(
    options: UseEventFormOptions<FormValue>
): UseEventFormReturn<FormValue> {
    const metadata = useMemo(() => options.metadata, [options.metadata]);
    const schema = useMemo(() => buildSchema(metadata), [metadata]);
    const form = useForm<FormValue>({
        resolver: zodResolver(schema) as unknown as Resolver<FormValue>,
        defaultValues: options.existingValues as DefaultValues<FormValue>,
    });

    const ruleEngineContext = useMemo(() => buildRuleEngineContext(metadata), [metadata]);
    const ruleEngine = useMemo(() => buildRuleEngine(ruleEngineContext), [ruleEngineContext]);
    const formStore = useMemo(() => new FormStore(), []);

    const effectHandlersRef = useRef(options.effectHandlers);
    effectHandlersRef.current = options.effectHandlers;

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

    const submit = () => {
        void form.handleSubmit((values) => {
            const payload = filterPayload(values, formStore.fieldStore.getSnapshot());
            void payload;
            // Stub: real implementation will call useDataMutation
        })();
    };

    return {
        form,
        formStore,
        fieldStore: formStore.fieldStore,
        nonFieldStore: formStore.nonFieldStore,
        submit,
    };
}
