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

    it('maps COORDINATE to coordinate', () => {
        expect(resolveWidgetKind(fromProgramStageDataElement(makePsde('de-1', 'COORDINATE')))).toBe(
            'coordinate'
        );
    });

    it('maps GEOJSON to geojson', () => {
        expect(resolveWidgetKind(fromProgramStageDataElement(makePsde('de-1', 'GEOJSON')))).toBe(
            'geojson'
        );
    });

    it('maps ORGANISATION_UNIT to orgUnit', () => {
        expect(
            resolveWidgetKind(fromProgramStageDataElement(makePsde('de-1', 'ORGANISATION_UNIT')))
        ).toBe('orgUnit');
    });

    it('maps FILE_RESOURCE to file', () => {
        expect(
            resolveWidgetKind(fromProgramStageDataElement(makePsde('de-1', 'FILE_RESOURCE')))
        ).toBe('file');
    });

    it('maps IMAGE to image', () => {
        expect(resolveWidgetKind(fromProgramStageDataElement(makePsde('de-1', 'IMAGE')))).toBe(
            'image'
        );
    });
});
