import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { attachRuleDevtools, type TraceAttachableFormStore } from '../lib/attach';
import type { RuleTraceStore } from '../lib/traceStore';

const RuleTraceContext = createContext<RuleTraceStore | null>(null);

export type RuleDevtoolsScopeProps = {
    formStore: TraceAttachableFormStore;
    children: ReactNode;
};

export function RuleDevtoolsScope({ formStore, children }: RuleDevtoolsScopeProps) {
    const traceStore = useMemo(() => attachRuleDevtools(formStore), [formStore]);

    useEffect(() => {
        return () => {
            traceStore.dispose();
        };
    }, [traceStore]);

    return <RuleTraceContext.Provider value={traceStore}>{children}</RuleTraceContext.Provider>;
}

export function useRuleTraceStore(): RuleTraceStore {
    const store = useContext(RuleTraceContext);
    if (!store) {
        throw new Error('useRuleTraceStore must be used within RuleDevtoolsScope');
    }
    return store;
}
