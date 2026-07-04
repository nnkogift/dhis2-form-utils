import type { FC } from 'react';
import {
    IconEdit16,
    IconErrorFilled16,
    IconInfo16,
    IconLink16,
    IconMail16,
    IconMessages16,
    IconStarFilled16,
    IconView16,
    IconViewOff16,
    IconWarningFilled16,
    type IconProps,
} from '@dhis2/ui';

export type EffectVisualVariant =
    | 'hide'
    | 'show'
    | 'assign'
    | 'mandatory'
    | 'warning'
    | 'error'
    | 'feedback'
    | 'message'
    | 'read'
    | 'default';

export type EffectVisual = {
    variant: EffectVisualVariant;
    tagClassName: string;
    edgeStroke: string;
    shortLabel: string;
};

const EFFECT_VARIANT: Record<string, EffectVisualVariant> = {
    HIDEFIELD: 'hide',
    HIDEOPTION: 'hide',
    HIDEOPTIONGROUP: 'hide',
    HIDESECTION: 'hide',
    HIDEPROGRAMSTAGE: 'hide',
    SHOWFIELD: 'show',
    SHOWOPTION: 'show',
    SHOWOPTIONGROUP: 'show',
    ASSIGN: 'assign',
    SETMANDATORYFIELD: 'mandatory',
    UNSETMANDATORYFIELD: 'mandatory',
    SHOWWARNING: 'warning',
    WARNINGONCOMPLETE: 'warning',
    SHOWERROR: 'error',
    ERRORONCOMPLETE: 'error',
    DISPLAYTEXT: 'feedback',
    DISPLAYKEYVALUEPAIR: 'feedback',
    SENDMESSAGE: 'message',
    SCHEDULEMESSAGE: 'message',
    read: 'read',
};

const EFFECT_VISUALS: Record<EffectVisualVariant, Omit<EffectVisual, 'variant'>> = {
    hide: {
        tagClassName: 'bg-dhis2-grey-200 text-dhis2-grey-900',
        edgeStroke: '#494949',
        shortLabel: 'hide',
    },
    show: {
        tagClassName: 'bg-dhis2-green-100 text-dhis2-green-900',
        edgeStroke: '#388e3c',
        shortLabel: 'show',
    },
    assign: {
        tagClassName: 'bg-dhis2-blue-100 text-dhis2-blue-900',
        edgeStroke: '#1565c0',
        shortLabel: 'assign',
    },
    mandatory: {
        tagClassName: 'bg-dhis2-yellow-100 text-dhis2-yellow-900',
        edgeStroke: '#e56408',
        shortLabel: 'required',
    },
    warning: {
        tagClassName: 'bg-dhis2-yellow-100 text-dhis2-yellow-900',
        edgeStroke: '#ff8302',
        shortLabel: 'warn',
    },
    error: {
        tagClassName: 'bg-dhis2-red-100 text-dhis2-red-900',
        edgeStroke: '#c62828',
        shortLabel: 'error',
    },
    feedback: {
        tagClassName: 'bg-dhis2-purple-100 text-dhis2-purple-900',
        edgeStroke: '#9c27b0',
        shortLabel: 'feedback',
    },
    message: {
        tagClassName: 'bg-dhis2-teal-100 text-dhis2-teal-900',
        edgeStroke: '#00796b',
        shortLabel: 'message',
    },
    read: {
        tagClassName: 'bg-dhis2-teal-100 text-dhis2-teal-900',
        edgeStroke: '#00796b',
        shortLabel: 'read',
    },
    default: {
        tagClassName: 'bg-dhis2-grey-100 text-dhis2-grey-800',
        edgeStroke: '#494949',
        shortLabel: 'effect',
    },
};

export const EFFECT_ICONS: Record<EffectVisualVariant, FC<IconProps>> = {
    hide: IconViewOff16,
    show: IconView16,
    assign: IconEdit16,
    mandatory: IconStarFilled16,
    warning: IconWarningFilled16,
    error: IconErrorFilled16,
    feedback: IconMessages16,
    message: IconMail16,
    read: IconLink16,
    default: IconInfo16,
};

/** @deprecated Use getEffectVisual().variant */
export type EffectTagVariant = EffectVisualVariant;

export function getEffectVariant(type: string): EffectVisualVariant {
    return EFFECT_VARIANT[type] ?? 'default';
}

export function getEffectVisual(type: string): EffectVisual {
    const variant = getEffectVariant(type);
    return { variant, ...EFFECT_VISUALS[variant] };
}

export function getEffectTagVariant(type: string): EffectVisualVariant {
    return getEffectVariant(type);
}

export type EffectTagRenderProps = {
    neutral?: boolean;
    positive?: boolean;
    negative?: boolean;
    className?: string;
};

const TAG_LAYOUT_CLASS = 'max-w-full break-words';

function tagPropsForVariant(variant: EffectVisualVariant): EffectTagRenderProps {
    switch (variant) {
        case 'show':
            return { positive: true, className: TAG_LAYOUT_CLASS };
        case 'error':
            return { negative: true, className: TAG_LAYOUT_CLASS };
        case 'assign':
            return { neutral: true, className: TAG_LAYOUT_CLASS };
        case 'hide':
        case 'mandatory':
        case 'warning':
        case 'feedback':
        case 'message':
        case 'read':
            return {
                className: `${TAG_LAYOUT_CLASS} ${EFFECT_VISUALS[variant].tagClassName}`,
            };
        default:
            return {
                className: `${TAG_LAYOUT_CLASS} ${EFFECT_VISUALS.default.tagClassName}`,
            };
    }
}

export function getEffectTagRenderProps(type: string): EffectTagRenderProps {
    return tagPropsForVariant(getEffectVariant(type));
}

export function getEffectTagRenderPropsForVariant(
    variant: EffectVisualVariant
): EffectTagRenderProps {
    return tagPropsForVariant(variant);
}

export function getEffectEdgeStroke(type: string, highlighted = true): string {
    const { edgeStroke } = getEffectVisual(type);
    if (highlighted) {
        return edgeStroke;
    }
    return '#bdbdbd';
}

export function getEffectShortLabel(type: string): string {
    return getEffectVisual(type).shortLabel;
}
