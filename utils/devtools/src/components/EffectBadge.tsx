import { Tag } from '@dhis2/ui';
import type { ReactNode } from 'react';
import { EFFECT_ICONS, getEffectTagRenderProps, getEffectVariant } from '../styles/effectStyles';

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
