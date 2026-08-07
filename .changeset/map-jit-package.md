---
'@nnkogift/dhis2-form-utils-hooks': patch
---

Fix a broken runtime import in the published ESM build: `fieldValidation.ts` imported `parseCoordinateValue`/`isValidGeojsonGeometry` from the internal, unpublished `@nnkogift/dhis2-form-utils-map` package, which tsup's `preserveModules` build left as an unresolved bare specifier in `dist/fields/fieldValidation.js` — breaking `COORDINATE`/`GEOJSON` field validation for consuming apps. The coordinate/GeoJSON validators are now duplicated locally (matching the existing pattern in `@nnkogift/dhis2-form-utils-metadata`) so `hooks` no longer depends on the map package at all.

Internally, `@nnkogift/dhis2-form-utils-map` is now a source-only (JIT) package with no build step of its own — `dhis2-ui`/`mantine`/`mui` compile its TypeScript source directly as part of their own bundles, removing the build-order dependency on a separately-built `dist/`.
