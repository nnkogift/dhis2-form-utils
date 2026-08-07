import { describe, expect, it } from 'vitest';
import { joinCoordinateValue, parseCoordinateValue } from './coordinateValue';

describe('parseCoordinateValue', () => {
    it('parses a valid [lng,lat] string', () => {
        expect(parseCoordinateValue('[35.703,-5.639]')).toEqual({ lng: 35.703, lat: -5.639 });
    });

    it('returns null for an empty string', () => {
        expect(parseCoordinateValue('')).toBeNull();
    });

    it('returns null for malformed JSON', () => {
        expect(parseCoordinateValue('[35.703,')).toBeNull();
    });

    it('returns null for a non-array value', () => {
        expect(parseCoordinateValue('{"lng":35.703,"lat":-5.639}')).toBeNull();
    });

    it('returns null when the array has the wrong length', () => {
        expect(parseCoordinateValue('[35.703]')).toBeNull();
    });

    it('returns null for non-numeric entries', () => {
        expect(parseCoordinateValue('["35.703","-5.639"]')).toBeNull();
    });

    it.each([['[181,0]'], ['[-181,0]'], ['[0,91]'], ['[0,-91]']])(
        'returns null for out-of-range coordinate %s',
        (value) => {
            expect(parseCoordinateValue(value)).toBeNull();
        }
    );

    it('accepts boundary values', () => {
        expect(parseCoordinateValue('[180,90]')).toEqual({ lng: 180, lat: 90 });
        expect(parseCoordinateValue('[-180,-90]')).toEqual({ lng: -180, lat: -90 });
    });
});

describe('joinCoordinateValue', () => {
    it('serializes lng/lat to the DHIS2 wire format', () => {
        expect(joinCoordinateValue(35.703, -5.639)).toBe('[35.703,-5.639]');
    });

    it('round-trips through parseCoordinateValue', () => {
        const joined = joinCoordinateValue(10.9, 59.8);
        expect(parseCoordinateValue(joined)).toEqual({ lng: 10.9, lat: 59.8 });
    });
});
