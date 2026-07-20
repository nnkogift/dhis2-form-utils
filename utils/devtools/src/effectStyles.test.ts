import { describe, expect, it } from 'vitest';
import {
    getEffectEdgeStroke,
    getEffectShortLabel,
    getEffectTagRenderProps,
    getEffectTagRenderPropsForVariant,
    getEffectVariant,
    getEffectVisual,
} from './effectStyles';

describe('effectStyles', () => {
    it('maps hide actions to hide variant with custom tag styling', () => {
        expect(getEffectVariant('HIDEFIELD')).toBe('hide');
        expect(getEffectVariant('HIDESECTION')).toBe('hide');
        expect(getEffectTagRenderProps('HIDEFIELD').className).toContain('grey');
        expect(getEffectShortLabel('HIDEFIELD')).toBe('hide');
    });

    it('maps show actions to positive DHIS2 UI tags', () => {
        expect(getEffectVariant('SHOWFIELD')).toBe('show');
        expect(getEffectTagRenderProps('SHOWFIELD')).toEqual({
            positive: true,
            className: 'max-w-full break-words',
        });
    });

    it('separates warning and error variants', () => {
        expect(getEffectVariant('SHOWWARNING')).toBe('warning');
        expect(getEffectVariant('SHOWERROR')).toBe('error');
        expect(getEffectTagRenderProps('SHOWWARNING').className).toContain('yellow');
        expect(getEffectTagRenderProps('SHOWERROR')).toEqual({
            negative: true,
            className: 'max-w-full break-words',
        });
    });

    it('maps mandatory field actions separately from assign', () => {
        expect(getEffectVariant('SETMANDATORYFIELD')).toBe('mandatory');
        expect(getEffectVariant('ASSIGN')).toBe('assign');
        expect(getEffectTagRenderProps('ASSIGN')).toEqual({
            neutral: true,
            className: 'max-w-full break-words',
        });
        expect(getEffectVisual('SETMANDATORYFIELD').shortLabel).toBe('required');
    });

    it('provides graph edge strokes with dimmed fallback', () => {
        expect(getEffectEdgeStroke('ASSIGN', true)).toBe('#1565c0');
        expect(getEffectEdgeStroke('ASSIGN', false)).toBe('#bdbdbd');
        expect(getEffectEdgeStroke('read', true)).toBe('#00796b');
    });

    it('maps legend variants to tag render props', () => {
        expect(getEffectTagRenderPropsForVariant('read').className).toContain('teal');
        expect(getEffectTagRenderPropsForVariant('error')).toEqual({
            negative: true,
            className: 'max-w-full break-words',
        });
    });
});
