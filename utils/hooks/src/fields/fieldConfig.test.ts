import { describe, expect, it } from 'vitest';
import { fromProgramStageDataElement, fromProgramTrackedEntityAttribute } from './fieldConfig';
import {
    makeGeneratedPtea,
    makePsde,
    makePsdeWithOptionSet,
    makePtea,
} from '../test/fixtures/metadata';

describe('fromProgramStageDataElement', () => {
    it('prefers displayFormName for label', () => {
        const config = fromProgramStageDataElement(makePsde('de-1', 'TEXT'));
        expect(config.label).toBe('Form de-1');
        expect(config.fieldKind).toBe('dataElement');
        expect(config.valueType).toBe('TEXT');
    });

    it('maps option set options to labels', () => {
        const config = fromProgramStageDataElement(makePsdeWithOptionSet('de-select', 'INTEGER'));
        expect(config.optionSet?.options[0]).toEqual({
            id: 'opt-1',
            code: 'YES',
            label: 'Yes',
        });
    });

    it('prefers DESKTOP render type hint over MOBILE', () => {
        const config = fromProgramStageDataElement({
            ...makePsde('de-1', 'TEXT'),
            renderType: {
                MOBILE: { type: 'DROPDOWN' },
                DESKTOP: { type: 'VERTICAL_RADIOBUTTONS' },
            },
        });
        expect(config.renderTypeHint).toBe('VERTICAL_RADIOBUTTONS');
    });
});

describe('fromProgramTrackedEntityAttribute', () => {
    it('maps mandatory to required', () => {
        const config = fromProgramTrackedEntityAttribute({
            ...makePtea('tea-1', 'TEXT'),
            mandatory: true,
        });
        expect(config.required).toBe(true);
        expect(config.fieldKind).toBe('trackedEntityAttribute');
    });

    it('maps generated flag', () => {
        const config = fromProgramTrackedEntityAttribute(makeGeneratedPtea('tea-gen'));
        expect(config.generated).toBe(true);
    });
});
