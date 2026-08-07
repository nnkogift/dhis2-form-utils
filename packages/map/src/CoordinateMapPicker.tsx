import { Marker, type MapMouseEvent } from 'maplibre-gl';
import { useEffect, useRef } from 'react';
import { joinCoordinateValue, parseCoordinateValue } from './coordinateValue';
import { defaultMapStyle } from './defaultMapStyle';
import type { MapPickerProps } from './types';
import { useMapLibreMap } from './useMapLibreMap';

export type CoordinateMapPickerProps = MapPickerProps;

/**
 * Single draggable/click-to-place marker over a MapLibre map. Renders only the
 * map canvas — the accessible numeric lng/lat inputs are adapter-owned (each
 * UI kit composes this alongside its own number inputs bound to the same
 * `value`/`onChange`).
 */
export function CoordinateMapPicker({
    value,
    onChange,
    mapStyle,
    disabled,
    className,
}: CoordinateMapPickerProps) {
    const { containerRef, map } = useMapLibreMap({ style: mapStyle ?? defaultMapStyle });
    const markerRef = useRef<Marker | null>(null);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    useEffect(() => {
        if (!map) return;

        const ensureMarker = (lng: number, lat: number) => {
            if (markerRef.current) {
                markerRef.current.setLngLat([lng, lat]);
                return markerRef.current;
            }
            const marker = new Marker({ draggable: !disabled }).setLngLat([lng, lat]).addTo(map);
            marker.on('dragend', () => {
                const lngLat = marker.getLngLat();
                onChangeRef.current(joinCoordinateValue(lngLat.lng, lngLat.lat));
            });
            markerRef.current = marker;
            return marker;
        };

        const handleClick = (event: MapMouseEvent) => {
            if (disabled) return;
            ensureMarker(event.lngLat.lng, event.lngLat.lat);
            onChangeRef.current(joinCoordinateValue(event.lngLat.lng, event.lngLat.lat));
        };

        map.on('click', handleClick);

        const parsed = parseCoordinateValue(value);
        if (parsed) {
            ensureMarker(parsed.lng, parsed.lat);
            map.setCenter([parsed.lng, parsed.lat]);
        }

        return () => {
            map.off('click', handleClick);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, disabled]);

    useEffect(() => {
        if (!markerRef.current) return;
        const parsed = parseCoordinateValue(value);
        if (parsed) {
            markerRef.current.setLngLat([parsed.lng, parsed.lat]);
        }
    }, [value]);

    useEffect(() => {
        markerRef.current?.setDraggable(!disabled);
    }, [disabled]);

    return (
        <div
            ref={containerRef}
            className={className}
            style={{ width: '100%', height: '300px' }}
            aria-hidden="true"
        />
    );
}
