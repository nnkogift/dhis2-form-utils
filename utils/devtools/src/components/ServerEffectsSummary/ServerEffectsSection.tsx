import type { ReactNode } from 'react';

export type ServerEffectsSectionProps = {
    title: string;
    count: number;
    children: ReactNode;
};

export function ServerEffectsSection({ title, count, children }: ServerEffectsSectionProps) {
    if (count === 0) {
        return null;
    }

    return (
        <section>
            <h3 className="mb-dp8 mt-0 text-sm font-semibold text-dhis2-grey-900">
                {title} ({count})
            </h3>
            <ul className="m-0 flex list-none flex-col gap-dp12 p-0">{children}</ul>
        </section>
    );
}
