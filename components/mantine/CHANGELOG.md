# @nnkogift/dhis2-form-utils-mantine

## 0.1.0-alpha.7

### Minor Changes

- [#38](https://github.com/nnkogift/dhis2-form-utils/pull/38) [`52e5ba8`](https://github.com/nnkogift/dhis2-form-utils/commit/52e5ba80f766d29e4c7b5f6012ee97587ea9d002) Thanks [@github-actions](https://github.com/apps/github-actions)! - `D2CoordinateField` and `D2GeoJsonField` now open the map in a modal instead of rendering it inline. The form shows a compact value summary (labeled Lat/Lng for coordinates; a geometry-type badge with a vertex count for GeoJSON) plus a "Set/Change location" or "Set/Edit geometry" button. Opening the modal edits a draft — Cancel discards it, Update commits it via `field.onChange`. The underlying `@nnkogift/dhis2-form-utils-map` building blocks (`CoordinateMapPicker`, `GeoJsonMapEditor`, value parsing helpers) are unchanged.

### Patch Changes

- Updated dependencies []:
    - @nnkogift/dhis2-form-utils-hooks@0.1.0-alpha.7

## 0.1.0-alpha.6

### Patch Changes

- Updated dependencies []:
    - @nnkogift/dhis2-form-utils-hooks@0.1.0-alpha.6

## 0.1.0-alpha.5

### Patch Changes

- Updated dependencies []:
    - @nnkogift/dhis2-form-utils-hooks@0.1.0-alpha.5

## 0.1.0-alpha.4

### Patch Changes

- Updated dependencies []:
    - @nnkogift/dhis2-form-utils-hooks@0.1.0-alpha.4

## 0.1.0-alpha.3

### Patch Changes

- Updated dependencies []:
    - @nnkogift/dhis2-form-utils-hooks@0.1.0-alpha.3

## 0.1.0-alpha.2

### Patch Changes

- Updated dependencies [[`555194a`](https://github.com/nnkogift/dhis2-form-utils/commit/555194a2be7e867157959696251516bf938f9fe9)]:
    - @nnkogift/dhis2-form-utils-hooks@0.1.0-alpha.2

## 0.1.0-alpha.1

### Minor Changes

- [#31](https://github.com/nnkogift/dhis2-form-utils/pull/31) [`2ed1bc2`](https://github.com/nnkogift/dhis2-form-utils/commit/2ed1bc2f605285daf6c44ef7330f9e07b2f61fbd) Thanks [@github-actions](https://github.com/apps/github-actions)! - Add coordinate, geoJson, orgUnit, file, and image field widgets across all UI adapters, backed by a new internal MapLibre-based map picker.

### Patch Changes

- Updated dependencies [[`2ed1bc2`](https://github.com/nnkogift/dhis2-form-utils/commit/2ed1bc2f605285daf6c44ef7330f9e07b2f61fbd), [`2ed1bc2`](https://github.com/nnkogift/dhis2-form-utils/commit/2ed1bc2f605285daf6c44ef7330f9e07b2f61fbd), [`2ed1bc2`](https://github.com/nnkogift/dhis2-form-utils/commit/2ed1bc2f605285daf6c44ef7330f9e07b2f61fbd)]:
    - @nnkogift/dhis2-form-utils-hooks@0.1.0-alpha.1

## 0.1.0-alpha.0

### Minor Changes

- [#27](https://github.com/nnkogift/dhis2-form-utils/pull/27) [`ced4fb6`](https://github.com/nnkogift/dhis2-form-utils/commit/ced4fb6f81884f14cba7081e4de34d03e1e5bc71) Thanks [@nnkogift](https://github.com/nnkogift)! - Initial publishable package setup under `@nnkogift/dhis2-form-utils-*` with dual ESM/CJS builds, tree-shakeable core packages, and Changesets release tooling.

### Patch Changes

- Updated dependencies [[`ced4fb6`](https://github.com/nnkogift/dhis2-form-utils/commit/ced4fb6f81884f14cba7081e4de34d03e1e5bc71)]:
    - @nnkogift/dhis2-form-utils-hooks@0.1.0-alpha.0
