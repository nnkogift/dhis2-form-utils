import { describe, expect, it } from 'vitest';
import { renderTemplatePlaceholders } from './renderTemplatePlaceholders';

describe('renderTemplatePlaceholders', () => {
    it('returns a single text segment when there are no placeholders', () => {
        expect(renderTemplatePlaceholders('Hello', {})).toEqual([{ kind: 'text', text: 'Hello' }]);
    });

    it('returns no segments for an empty template', () => {
        expect(renderTemplatePlaceholders('', {})).toEqual([]);
    });

    it('substitutes #{}, A{} and V{} placeholders from values', () => {
        const segments = renderTemplatePlaceholders('BP #{deBp} for A{teaName} on V{event_date}', {
            deBp: 180,
            teaName: 'Jane',
            event_date: '2026-01-02',
        });
        expect(segments).toEqual([{ kind: 'text', text: 'BP 180 for Jane on 2026-01-02' }]);
    });

    it('keeps unresolved placeholders as chips between merged text', () => {
        const segments = renderTemplatePlaceholders('Hi A{missing}, BP #{deBp}!', { deBp: '120' });
        expect(segments).toEqual([
            { kind: 'text', text: 'Hi ' },
            { kind: 'placeholder', token: 'A{missing}' },
            { kind: 'text', text: ', BP 120!' },
        ]);
    });

    it.each([undefined, null, '', { nested: true }])('treats %j as unresolved', (value) => {
        expect(renderTemplatePlaceholders('#{x}', { x: value })).toEqual([
            { kind: 'placeholder', token: '#{x}' },
        ]);
    });

    it('treats false and 0 as resolved values', () => {
        expect(renderTemplatePlaceholders('#{a}/#{b}', { a: false, b: 0 })).toEqual([
            { kind: 'text', text: 'false/0' },
        ]);
    });
});
