import { createContext, type ReactNode, useContext } from 'react'
import type { DevtoolsLabelLookup } from '@dhis2-form-utils/devtools'

type RuleDisplayContextValue = {
    ghostsEnabled: boolean
    labelLookup: DevtoolsLabelLookup
}

const RuleDisplayContext = createContext<RuleDisplayContextValue | null>(null)

type RuleDisplayProviderProps = RuleDisplayContextValue & {
    children: ReactNode
}

export function RuleDisplayProvider({
    ghostsEnabled,
    labelLookup,
    children,
}: RuleDisplayProviderProps) {
    return (
        <RuleDisplayContext.Provider value={{ ghostsEnabled, labelLookup }}>
            {children}
        </RuleDisplayContext.Provider>
    )
}

export function useRuleDisplay(): RuleDisplayContextValue {
    const ctx = useContext(RuleDisplayContext)
    if (!ctx) {
        throw new Error(
            'useRuleDisplay must be used inside RuleDisplayProvider'
        )
    }
    return ctx
}
