import { describe, expect, it } from 'vitest';
import { fromProgramStageDataElement } from './fieldConfig';
import { resolveWidgetKind } from './widgetKind';
import { makePsde, makePsdeWithOptionSet } from '../test/fixtures/metadata';

describe('resolveWidgetKind', () => {
    it('returns select when optionSet is present regardless of valueType', () => {
        const config = fromProgramStageDataElement(makePsdeWithOptionSet('de-1', 'INTEGER'));
        expect(resolveWidgetKind(config)).toBe('select');
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
