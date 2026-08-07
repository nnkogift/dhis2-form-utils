# `@nnkogift/dhis2-form-utils-map`

MapLibre GL JS building blocks for the `coordinate` and `geojson` widgets — a coordinate picker
(single draggable/click-to-place marker) and a GeoJSON draw editor (point/line/polygon via
[`terra-draw`](https://github.com/JamesLMilner/terra-draw)). UI-kit-agnostic: no `@dhis2/ui`,
Mantine, or MUI dependency. Each UI adapter (`dhis2-ui`, `mantine`, `mui`) wraps these components
with its own field chrome (label, validation, accessible numeric inputs / textarea fallback).

```bash
pnpm add @nnkogift/dhis2-form-utils-map
```

## Wire formats

| `valueType`  | RHF string format                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `COORDINATE` | `"[lng,lat]"` — JSON array string, longitude before latitude (DHIS2 tracker API / GeoJSON Point convention)              |
| `GEOJSON`    | JSON-stringified GeoJSON **geometry** (`Point`/`LineString`/`Polygon`/...) — not a full `Feature` or `FeatureCollection` |

:::caution GEOJSON shape not fully verified
The `GEOJSON` value-type's exact DE/TEA-level shape (bare geometry vs. a `Feature` wrapper) was
not conclusively confirmed against a live DHIS2 instance. Verify by creating a `GEOJSON`
data element, submitting a value via Capture/Tracker Capture, and inspecting the stored/returned
JSON before relying on this in production. See `geojsonValue.ts`'s JSDoc.
:::

## Components

```ts
function CoordinateMapPicker(props: CoordinateMapPickerProps): JSX.Element;

type CoordinateMapPickerProps = {
    value: string; // "[lng,lat]" or ''
    onChange: (value: string) => void;
    mapStyle?: StyleSpecification | string; // overrides defaultMapStyle
    disabled?: boolean;
    className?: string;
};
```

Renders the map canvas and a single marker only — draggable when not `disabled`, repositioned on
map click. Does not render numeric lng/lat inputs; adapters compose those alongside it for
keyboard/screen-reader access.

```ts
function GeoJsonMapEditor(props: GeoJsonMapEditorProps): JSX.Element;

type GeoJsonMapEditorProps = {
    value: string; // geometry JSON string or ''
    onChange: (value: string) => void;
    mapStyle?: StyleSpecification | string;
    disabled?: boolean;
    className?: string;
    modes?: Array<'point' | 'linestring' | 'polygon'>; // default: all three
};
```

Renders the map plus draw-mode buttons. Supports exactly **one** geometry per field — starting a
new draw clears any existing feature (matching the DHIS2 `GEOJSON` value shape, which is a single
geometry, not a collection). Does not render a raw-JSON textarea; adapters add that as a
power-user / accessible fallback, synced bidirectionally with the map.

## Helpers

```ts
function parseCoordinateValue(value: string): { lng: number; lat: number } | null;
function joinCoordinateValue(lng: number, lat: number): string;

function parseGeojsonGeometry(value: string): Geometry | null;
function stringifyGeojsonGeometry(geometry: Geometry): string;
function isValidGeojsonGeometry(value: string): boolean;
```

`parseCoordinateValue` range-validates (`lng` ∈ [-180, 180], `lat` ∈ [-90, 90]) and returns `null`
for empty/malformed/out-of-range input. These are also importable via subpath exports
(`@nnkogift/dhis2-form-utils-map/coordinateValue`, `.../geojsonValue`) that exclude MapLibre/
terra-draw from the bundle — used internally by `buildFieldSchema` in the hooks package to avoid
pulling map-rendering code into form validation.

## Default basemap

```ts
const defaultMapStyle: StyleSpecification;
```

A free, no-API-key OpenStreetMap raster style, used when `mapStyle` isn't passed. OSM's
[tile usage policy](https://operations.osmfoundation.org/policies/tiles/) disallows heavy
production traffic against `tile.openstreetmap.org` without self-hosting or a paid provider —
swap in your own style (MapTiler, Protomaps, a DHIS2-hosted tile server, ...) via the `mapStyle`
prop before deploying at scale. The default exists so the widgets work out of the box in
development, tests, and Storybook.

Importing either component pulls in `maplibre-gl`'s stylesheet as a side effect
(`@nnkogift/dhis2-form-utils-map/style.css`) via each UI adapter — no manual CSS import needed
when using `D2Field` from `dhis2-ui`, `mantine`, or `mui`.
