import type { FormStore } from '@dhis2-form-utils/hooks';
import { createRuleTraceStore, type RuleTraceStore } from './traceStore';

export function attachRuleDevtools(
    formStore: FormStore,
    options?: { maxEntries?: number }
): RuleTraceStore {
    const store = createRuleTraceStore(options?.maxEntries ?? 200) as RuleTraceStore & {
        bindTraceSubscription: (unsubscribe: () => void) => void;
    };

    store.bindTraceSubscription(formStore.subscribeTrace(store.record));

    return store;
}
