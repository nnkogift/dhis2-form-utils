import { Tag } from '@dhis2/ui';
import type { ReactNode } from 'react';
import {
    EFFECT_ICONS,
    getEffectTagRenderProps,
    getEffectTagRenderPropsForVariant,
    getEffectVariant,
    type EffectVisualVariant,
} from './effectStyles';
import { translate } from './i18n';

export type EffectBadgeProps = {
    type: string;
    children?: ReactNode;
    className?: string;
};

export function EffectBadge({ type, children, className = '' }: EffectBadgeProps) {
    const variant = getEffectVariant(type);
    const Icon = EFFECT_ICONS[variant];
    const tagProps = getEffectTagRenderProps(type);
    const label = children ?? type;

    return (
        <Tag
            {...tagProps}
            icon={<Icon aria-hidden="true" />}
            className={[tagProps.className, className].filter(Boolean).join(' ')}
            maxWidth="100%"
        >
            {label}
        </Tag>
    );
}

const LEGEND_VARIANTS: Array<{ variant: EffectVisualVariant; label: string }> = [
    { variant: 'read', label: translate('Read') },
    { variant: 'hide', label: translate('Hide') },
    { variant: 'show', label: translate('Show') },
    { variant: 'assign', label: translate('Assign') },
    { variant: 'mandatory', label: translate('Required') },
    { variant: 'warning', label: translate('Warning') },
    { variant: 'error', label: translate('Error') },
    { variant: 'feedback', label: translate('Feedback') },
];

export type EffectLegendProps = {
    activeVariants: ReadonlySet<EffectVisualVariant>;
};

export function EffectLegend({ activeVariants }: EffectLegendProps) {
    const items = LEGEND_VARIANTS.filter((item) => activeVariants.has(item.variant));

    if (!items.length) {
        return null;
    }

    return (
        <div className="flex min-w-0 flex-wrap items-center gap-dp8 border-t border-dhis2-grey-200 px-dp12 py-dp8">
            {items.map((item) => {
                const Icon = EFFECT_ICONS[item.variant];
                const tagProps = getEffectTagRenderPropsForVariant(item.variant);

                return (
                    <Tag
                        key={item.variant}
                        {...tagProps}
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
