---
'@nnkogift/dhis2-form-utils-dhis2-ui': minor
'@nnkogift/dhis2-form-utils-mantine': minor
'@nnkogift/dhis2-form-utils-mui': minor
---

`D2CoordinateField` and `D2GeoJsonField` now open the map in a modal instead of rendering it inline. The form shows a compact value summary (labeled Lat/Lng for coordinates; a geometry-type badge with a vertex count for GeoJSON) plus a "Set/Change location" or "Set/Edit geometry" button. Opening the modal edits a draft — Cancel discards it, Update commits it via `field.onChange`. The underlying `@nnkogift/dhis2-form-utils-map` building blocks (`CoordinateMapPicker`, `GeoJsonMapEditor`, value parsing helpers) are unchanged.
