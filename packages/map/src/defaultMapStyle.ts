import type { StyleSpecification } from 'maplibre-gl';

/**
 * Free, no-API-key OpenStreetMap raster basemap used as the default `mapStyle`
 * for `CoordinateMapPicker`/`GeoJsonMapEditor`.
 *
 * OSM's tile usage policy (https://operations.osmfoundation.org/policies/tiles/)
 * disallows heavy automated/production traffic against `tile.openstreetmap.org`
 * without self-hosting or a paid provider. Swap this out via the `mapStyle` prop
 * (a full MapLibre `StyleSpecification` or a style URL) before deploying a
 * production app at scale — e.g. MapTiler, Protomaps, or a DHIS2-hosted tile
 * server. This default exists so the widgets work out of the box in
 * development, tests, and Storybook.
 */
export const defaultMapStyle: StyleSpecification = {
    version: 8,
    sources: {
        osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors',
        },
    },
    layers: [
        {
            id: 'osm',
            type: 'raster',
            source: 'osm',
        },
    ],
};
