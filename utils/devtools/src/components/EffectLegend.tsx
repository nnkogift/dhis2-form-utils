import { Tag } from '@dhis2/ui';
import type { EffectVisualVariant } from '../styles/effectStyles';
import { EFFECT_LEGEND } from '../constants/legend';

export type EffectLegendProps = {
    activeVariants: ReadonlySet<EffectVisualVariant>;
};

export function EffectLegend({ activeVariants }: EffectLegendProps) {
    const items = EFFECT_LEGEND.filter((item) => activeVariants.has(item.variant));

    if (!items.length) {
        return null;
    }

    return (
        <div className="flex min-w-0 flex-wrap items-center gap-dp8 border-t border-dhis2-grey-200 px-dp12 py-dp8">
            {items.map((item) => {
                const Icon = item.icon;

                return (
                    <Tag
                        key={item.variant}
                        {...item.tagProps}
                        dataTest={`devtools-legend-${item.variant}`}
                        icon={<Icon aria-hidden="true" />}
                        maxWidth="100%"
                    >
                        {item.label}
                    </Tag>
                );
            })}
        </div>
    );
}
