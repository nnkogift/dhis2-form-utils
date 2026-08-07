import { createContext, useContext, type ReactNode } from 'react';

export type OrgUnitPickerContextValue = {
    /** Root organisation unit ids to scope `D2OrgUnitField`'s picker to. */
    roots?: string[];
};

export const OrgUnitPickerContext = createContext<OrgUnitPickerContextValue | undefined>(undefined);

export type OrgUnitPickerProviderProps = OrgUnitPickerContextValue & { children: ReactNode };

/**
 * Optional ancestor for `D2OrgUnitField` widgets. When present, its `roots`
 * scope the org-unit picker (e.g. to the host app's program org units).
 * Without a provider, widgets fall back to `useOrganisationUnitsQuery()`'s
 * default (the logged-in user's data-capture organisation units).
 */
export function OrgUnitPickerProvider({ roots, children }: OrgUnitPickerProviderProps) {
    return (
        <OrgUnitPickerContext.Provider value={{ roots }}>{children}</OrgUnitPickerContext.Provider>
    );
}

/** Returns `undefined` when no `OrgUnitPickerProvider` ancestor exists. */
export function useOrgUnitPickerContext(): OrgUnitPickerContextValue | undefined {
    return useContext(OrgUnitPickerContext);
}
