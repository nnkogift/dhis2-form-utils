import type { ReactNode } from 'react';
import type { GraphNode } from '../buildGraph';
import { EffectLegend } from '../EffectLegend';
import type { EffectVisualVariant } from '../effectStyles';
import { getLegendSwatchClassName } from '../graphNodeStyles';
import { translate } from '../i18n';

type GraphToolbarProps = {
    nodeCount: number;
    edgeCount: number;
    headerActions?: ReactNode;
    activeEffectVariants: ReadonlySet<EffectVisualVariant>;
};

export function GraphToolbar({
    nodeCount,
    edgeCount,
    headerActions,
    activeEffectVariants,
}: GraphToolbarProps) {
    const items: Array<{ kind: GraphNode['kind']; label: string }> = [
        { kind: 'field', label: translate('Field') },
        { kind: 'rule', label: translate('Rule') },
        { kind: 'section', label: translate('Section') },
        { kind: 'feedback', label: translate('Feedback') },
    ];

    return (
        <div className="shrink-0 border-b border-dhis2-grey-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-dp8 px-dp12 py-dp8">
                <div
                    className="flex min-w-0 flex-wrap items-center gap-x-dp12 gap-y-dp8"
                    aria-hidden="true"
                >
                    {items.map((item) => (
                        <span
                            key={item.kind}
                            className="inline-flex items-center gap-dp8 text-xs text-dhis2-grey-800"
                        >
                            <span className={getLegendSwatchClassName(item.kind)} />
                            {item.label}
                        </span>
                    ))}
                </div>
                <div className="flex shrink-0 items-center gap-dp8">
                    <span className="text-xs tabular-nums text-dhis2-grey-600">
                        {translate('{{nodes}} nodes · {{edges}} edges', {
                            nodes: nodeCount,
                            edges: edgeCount,
                        })}
                    </span>
                    {headerActions}
                </div>
            </div>
            <EffectLegend activeVariants={activeEffectVariants} />
        </div>
    );
}
