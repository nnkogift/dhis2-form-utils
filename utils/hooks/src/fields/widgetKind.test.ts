import { describe, expect, it } from 'vitest';
import { fromProgramStageDataElement } from './fieldConfig';
import { resolveWidgetKind } from './widgetKind';
import { makePsde, makePsdeWithOptionSet } from '../test/fixtures/metadata';

describe('resolveWidgetKind', () => {
    it('returns select when optionSet is present for non-MULTI_TEXT valueTypes', () => {
        const config = fromProgramStageDataElement(makePsdeWithOptionSet('de-1', 'INTEGER'));
        expect(resolveWidgetKind(config)).toBe('select');
    });

    it('returns multiSelect when optionSet is present for MULTI_TEXT', () => {
        const config = fromProgramStageDataElement(makePsdeWithOptionSet('de-1', 'MULTI_TEXT'));
        expect(resolveWidgetKind(config)).toBe('multiSelect');
    });

    it('maps MULTI_TEXT without optionSet to longText', () => {
        expect(resolveWidgetKind(fromProgramStageDataElement(makePsde('de-1', 'MULTI_TEXT')))).toBe(
            'longText'
        );
    });

    it('maps TEXT to text', () => {
        expect(resolveWidgetKind(fromProgramStageDataElement(makePsde('de-1', 'TEXT')))).toBe(
            'text'
        );
    });

    it('maps unknown value types to unsupported', () => {
        const config = fromProgramStageDataElement(makePsde('de-1', 'REFERENCE'));
        expect(resolveWidgetKind(config)).toBe('unsupported');
    });
});
