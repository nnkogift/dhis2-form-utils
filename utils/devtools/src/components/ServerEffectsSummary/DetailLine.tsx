import type { ReactNode } from 'react';

/** One term/description pair; render inside a `<dl>`. */
export function DetailLine({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="flex flex-col gap-dp4">
            <dt className="text-xs font-medium text-dhis2-grey-700">{label}</dt>
            <dd className="m-0 text-[0.8125rem] leading-[1.45]">{children}</dd>
        </div>
    );
}
