import type { ReactNode } from 'react';

export function DetailLine({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="flex flex-col gap-dp4">
            <span className="text-xs font-medium text-dhis2-grey-600">{label}</span>
            {children}
        </div>
    );
}
