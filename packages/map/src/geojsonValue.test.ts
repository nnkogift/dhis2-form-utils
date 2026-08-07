import { describe, expect, it } from 'vitest';
import {
    isValidGeojsonGeometry,
    parseGeojsonGeometry,
    stringifyGeojsonGeometry,
} from './geojsonValue';

describe('parseGeojsonGeometry', () => {
    it('parses a valid Point geometry', () => {
        const value = '{"type":"Point","coordinates":[-11.7896,8.2593]}';
        expect(parseGeojsonGeometry(value)).toEqual({
            type: 'Point',
            coordinates: [-11.7896, 8.2593],
        });
    });

    it('parses a valid Polygon geometry', () => {
        const value = JSON.stringify({
            type: 'Polygon',
            coordinates: [
                [
                    [0, 0],
                    [1, 0],
                    [1, 1],
                    [0, 0],
                ],
            ],
        });
        expect(parseGeojsonGeometry(value)).not.toBeNull();
    });

    it('parses a valid GeometryCollection', () => {
        const value = JSON.stringify({
            type: 'GeometryCollection',
            geometries: [{ type: 'Point', coordinates: [0, 0] }],
        });
        expect(parseGeojsonGeometry(value)).not.toBeNull();
    });

    it('returns null for an empty string', () => {
        expect(parseGeojsonGeometry('')).toBeNull();
    });

    it('returns null for malformed JSON', () => {
        expect(parseGeojsonGeometry('{"type":"Point"')).toBeNull();
    });

    it('returns null for a Feature (not a bare geometry)', () => {
        const value = JSON.stringify({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [0, 0] },
            properties: {},
        });
        expect(parseGeojsonGeometry(value)).toBeNull();
    });

    it('returns null for an unrecognized type', () => {
        expect(parseGeojsonGeometry('{"type":"NotAGeometry","coordinates":[0,0]}')).toBeNull();
    });

    it('returns null when coordinates are missing', () => {
        expect(parseGeojsonGeometry('{"type":"Point"}')).toBeNull();
    });
});

describe('stringifyGeojsonGeometry', () => {
    it('round-trips through parseGeojsonGeometry', () => {
        const geometry = { type: 'Point' as const, coordinates: [10.9, 59.8] };
        expect(parseGeojsonGeometry(stringifyGeojsonGeometry(geometry))).toEqual(geometry);
    });
});

describe('isValidGeojsonGeometry', () => {
    it('returns true for valid geometry strings', () => {
        expect(isValidGeojsonGeometry('{"type":"Point","coordinates":[0,0]}')).toBe(true);
    });

    it('returns false for invalid geometry strings', () => {
        expect(isValidGeojsonGeometry('not json')).toBe(false);
        expect(isValidGeojsonGeometry('')).toBe(false);
    });
});
