import { act, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createEmptyFieldState } from '@dhis2-form-utils/rules';
import { useFieldControl } from './useFieldControl';
import { resolveWidgetKind } from './widgetKind';
import { makeGeneratedPtea, makePsde, makePsdeWithOptionSet } from '../test/fixtures/metadata';
import { renderFieldControlHook } from '../test/renderFieldControl';

describe('useFieldControl', () => {
    it('resolves widgetKind to select when optionSet is present', () => {
        const { result } = renderFieldControlHook((control) =>
            useFieldControl({
                kind: 'dataElement',
                config: makePsdeWithOptionSet('de-select', 'INTEGER'),
                control,
            })
        );

        expect(result.current.widgetKind).toBe('select');
    });

    it('resolves widgetKind correctly for plain TEXT data element', () => {
        const { result } = renderFieldControlHook((control) =>
            useFieldControl({
                kind: 'dataElement',
                config: makePsde('de-text', 'TEXT'),
                control,
            })
        );

        expect(result.current.widgetKind).toBe('text');
        expect(result.current.field.value).toBe('');
    });

    it('marks isMandatory when program rule elevates mandatory', () => {
        const { result } = renderFieldControlHook(
            (control) =>
                useFieldControl({
                    kind: 'dataElement',
                    config: makePsde('de-text', 'TEXT'),
                    control,
                }),
            {
                fieldState: {
                    'de-text': { ...createEmptyFieldState(), mandatory: true },
                },
            }
        );

        expect(result.current.isMandatory).toBe(true);
        expect(result.current.fieldConfig.required).toBe(false);
    });

    it('sets isDisabled when generated is true on a TrackedEntityAttribute', () => {
        const { result } = renderFieldControlHook((control) =>
            useFieldControl({
                kind: 'trackedEntityAttribute',
                config: makeGeneratedPtea('tea-gen'),
                control,
            })
        );

        expect(result.current.isDisabled).toBe(true);
    });

    it('isHidden reflects fieldState.hidden from the FieldStateStore', () => {
        const { result } = renderFieldControlHook(
            (control) =>
                useFieldControl({
                    kind: 'dataElement',
                    config: makePsde('de-hidden', 'TEXT'),
                    control,
                }),
            {
                fieldState: {
                    'de-hidden': { ...createEmptyFieldState(), hidden: true },
                },
            }
        );

        expect(result.current.isHidden).toBe(true);
    });

    it('validates against Zod schema for INTEGER fields', async () => {
        const { result } = renderFieldControlHook(
            (control) =>
                useFieldControl({
                    kind: 'dataElement',
                    config: makePsde('de-int', 'INTEGER'),
                    control,
                }),
            { defaultValues: { 'de-int': '' }, formOptions: { mode: 'onBlur' } }
        );

        act(() => {
            result.current.field.onChange('not-a-number');
            result.current.field.onBlur();
        });

        await waitFor(() => {
            expect(result.current.fieldState.invalid).toBe(true);
        });
    });

    it('returns unsupported widgetKind for REFERENCE valueType', () => {
        const kind = resolveWidgetKind({
            id: 'de-ref',
            fieldKind: 'dataElement',
            label: 'Ref',
            valueType: 'REFERENCE',
            required: false,
            allowFutureDate: true,
        });
        expect(kind).toBe('unsupported');
    });
});
