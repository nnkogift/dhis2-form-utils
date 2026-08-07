import { useEffect, useRef } from 'react';
import {
    TerraDraw,
    TerraDrawLineStringMode,
    TerraDrawPointMode,
    TerraDrawPolygonMode,
    type GeoJSONStoreGeometries,
} from 'terra-draw';
import { TerraDrawMapLibreGLAdapter } from 'terra-draw-maplibre-gl-adapter';
import { defaultMapStyle } from './defaultMapStyle';
import { parseGeojsonGeometry, stringifyGeojsonGeometry } from './geojsonValue';
import type { MapPickerProps } from './types';
import { useMapLibreMap } from './useMapLibreMap';

export type GeoJsonDrawMode = 'point' | 'linestring' | 'polygon';

export type GeoJsonMapEditorProps = MapPickerProps & {
    /** Draw modes offered to the user. Defaults to all three. */
    modes?: GeoJsonDrawMode[];
};

const DEFAULT_MODES: GeoJsonDrawMode[] = ['point', 'linestring', 'polygon'];

function createDrawMode(mode: GeoJsonDrawMode) {
    switch (mode) {
        case 'point':
            return new TerraDrawPointMode();
        case 'linestring':
            return new TerraDrawLineStringMode();
        case 'polygon':
            return new TerraDrawPolygonMode();
    }
}

/**
 * MapLibre + terra-draw point/line/polygon editor for a single GeoJSON
 * geometry (DHIS2 `GEOJSON` DE/TEA value is one geometry, not a
 * FeatureCollection — starting a new draw clears any existing feature).
 * Renders only the map + draw-mode controls — the raw-JSON textarea fallback
 * is adapter-owned.
 */
export function GeoJsonMapEditor({
    value,
    onChange,
    mapStyle,
    disabled,
    className,
    modes = DEFAULT_MODES,
}: GeoJsonMapEditorProps) {
    const { containerRef, map } = useMapLibreMap({ style: mapStyle ?? defaultMapStyle });
    const drawRef = useRef<TerraDraw | null>(null);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    useEffect(() => {
        if (!map) return;

        const draw = new TerraDraw({
            adapter: new TerraDrawMapLibreGLAdapter({ map }),
            modes: modes.map(createDrawMode),
        });
        drawRef.current = draw;
        draw.start();

        const initial = parseGeojsonGeometry(value);
        if (initial) {
            draw.addFeatures([
                { type: 'Feature', geometry: initial as GeoJSONStoreGeometries, properties: {} },
            ]);
        }

        const handleFinish = (id: Parameters<typeof draw.getSnapshotFeature>[0]) => {
            const feature = draw.getSnapshotFeature(id);
            if (feature) {
                onChangeRef.current(stringifyGeojsonGeometry(feature.geometry));
            }
        };
        draw.on('finish', handleFinish);

        return () => {
            draw.off('finish', handleFinish);
            try {
                // terra-draw's adapter can throw during its own teardown if the underlying
                // MapLibre map is torn down first (e.g. rapid unmount) — a widget unmounting
                // must never crash the host app, so this is defensive, not expected to fire.
                draw.stop();
            } catch {
                // Intentionally ignored — see comment above.
            }
            drawRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map]);

    const startDrawing = (mode: GeoJsonDrawMode) => {
        const draw = drawRef.current;
        if (!draw || disabled) return;
        draw.clear();
        draw.setMode(mode);
    };

    return (
        <div className={className}>
            <div ref={containerRef} style={{ width: '100%', height: '300px' }} aria-hidden="true" />
            {!disabled ? (
                <div role="group" aria-label="Draw geometry">
                    {modes.map((mode) => (
                        <button
                            key={mode}
                            type="button"
                            onClick={() => {
                                startDrawing(mode);
                            }}
                        >
                            Draw {mode}
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
