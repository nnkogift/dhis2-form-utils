import type { FormStore } from '@nnkogift/dhis2-form-utils-hooks';
import { DEFAULT_TRACE_MAX_ENTRIES } from './constants';
import { createRuleTraceStore, type RuleTraceStore } from './traceStore';

export function attachRuleDevtools(
    formStore: FormStore,
    options?: { maxEntries?: number }
): RuleTraceStore {
    const store = createRuleTraceStore(
        options?.maxEntries ?? DEFAULT_TRACE_MAX_ENTRIES
    ) as RuleTraceStore & {
        bindTraceSubscription: (unsubscribe: () => void) => void;
    };

    store.bindTraceSubscription(formStore.subscribeTrace(store.record));

    return store;
}
