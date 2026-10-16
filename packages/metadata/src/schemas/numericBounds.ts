import type { ValueTypeRenderingObject } from '@dhis2/api-types/v43';
import { z } from 'zod';
import { messageWithVars } from './friendlyMessages';

export type NumericBounds = {
    min?: number;
    max?: number;
    decimalPoints?: number;
};

type RenderTypeByDevice = {
    DESKTOP?: ValueTypeRenderingObject;
    MOBILE?: ValueTypeRenderingObject;
};

const BOUNDED_RENDER_TYPES: ReadonlySet<string> = new Set(['SPINNER', 'SLIDER', 'LINEAR_SCALE']);

/**
 * Numeric bounds configured on a numeric rendering (spinner / slider / linear scale).
 * Mirrors how widgets pick the rendering: DESKTOP first, then MOBILE.
 */
export function resolveRenderBounds(renderType?: RenderTypeByDevice): NumericBounds | undefined {
    const rendering = renderType?.DESKTOP ?? renderType?.MOBILE;
    if (!rendering || !BOUNDED_RENDER_TYPES.has(rendering.type)) return undefined;

    const { min, max, decimalPoints } = rendering;
    if (min === undefined && max === undefined && decimalPoints === undefined) return undefined;
    return { min, max, decimalPoints };
}

const countDecimals = (value: string): number => value.split('.')[1]?.length ?? 0;

export function applyNumericBounds(schema: z.ZodTypeAny, bounds?: NumericBounds): z.ZodTypeAny {
    if (!bounds) return schema;
    const { min, max, decimalPoints } = bounds;
    let bounded = schema;

    if (min !== undefined) {
        bounded = bounded.refine(
            (value: string) => Number(value) >= min,
            messageWithVars('Must be at least {{min}}', { min })
        );
    }
    if (max !== undefined) {
        bounded = bounded.refine(
            (value: string) => Number(value) <= max,
            messageWithVars('Must be at most {{max}}', { max })
        );
    }
    if (decimalPoints !== undefined) {
        bounded = bounded.refine(
            (value: string) => countDecimals(value) <= decimalPoints,
            messageWithVars('Must have at most {{decimalPoints}} decimal places', { decimalPoints })
        );
    }
    return bounded;
}
