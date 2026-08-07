import { Map as MapLibreMap, NavigationControl, type StyleSpecification } from 'maplibre-gl';
import { useEffect, useRef, useState, type RefObject } from 'react';

export type UseMapLibreMapOptions = {
    style: StyleSpecification | string;
};

export type UseMapLibreMapResult = {
    containerRef: RefObject<HTMLDivElement>;
    map: MapLibreMap | null;
};

/**
 * Creates a MapLibre GL map instance on a ref'd container and tears it down
 * on unmount. Shared by `CoordinateMapPicker` and `GeoJsonMapEditor`.
 *
 * `map` stays `null` until the map's `'load'` event fires — consumers that
 * add sources/layers (e.g. terra-draw's GeoJSON source) must wait for style
 * load, or MapLibre throws "Style is not done loading".
 *
 * The `style` used is the one active when the map is first created — changing
 * `style` on a later render does not re-initialize the map (out of scope for v1).
 */
export function useMapLibreMap({ style }: UseMapLibreMapOptions): UseMapLibreMapResult {
    const containerRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<MapLibreMap | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const instance = new MapLibreMap({
            container: containerRef.current,
            style,
            center: [0, 0],
            zoom: 1,
        });
        instance.addControl(new NavigationControl(), 'top-right');
        instance.once('load', () => {
            setMap(instance);
        });

        return () => {
            instance.remove();
            setMap(null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { containerRef, map };
}
