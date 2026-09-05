# @nnkogift/dhis2-form-utils-hooks

## 0.1.0-alpha.8

### Patch Changes

- Updated dependencies []:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.8
    - @nnkogift/dhis2-form-utils-rules@0.1.0-alpha.8

## 0.1.0-alpha.7

### Patch Changes

- Updated dependencies []:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.7
    - @nnkogift/dhis2-form-utils-rules@0.1.0-alpha.7

## 0.1.0-alpha.6

### Patch Changes

- Updated dependencies [[`39cf4c8`](https://github.com/nnkogift/dhis2-form-utils/commit/39cf4c808ddb0640304883b398d849667a80273e)]:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.6
    - @nnkogift/dhis2-form-utils-rules@0.1.0-alpha.6

## 0.1.0-alpha.5

### Patch Changes

- Updated dependencies []:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.5
    - @nnkogift/dhis2-form-utils-rules@0.1.0-alpha.5

## 0.1.0-alpha.4

### Patch Changes

- Updated dependencies []:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.4
    - @nnkogift/dhis2-form-utils-rules@0.1.0-alpha.4

## 0.1.0-alpha.3

### Patch Changes

- Updated dependencies [[`12f537f`](https://github.com/nnkogift/dhis2-form-utils/commit/12f537f968a0b01e5f7264eda2c7c543b38e4154)]:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.3
    - @nnkogift/dhis2-form-utils-rules@0.1.0-alpha.3

## 0.1.0-alpha.2

### Patch Changes

- [`555194a`](https://github.com/nnkogift/dhis2-form-utils/commit/555194a2be7e867157959696251516bf938f9fe9) Thanks [@nnkogift](https://github.com/nnkogift)! - Fix a broken runtime import in the published ESM build: `fieldValidation.ts` imported `parseCoordinateValue`/`isValidGeojsonGeometry` from the internal, unpublished `@nnkogift/dhis2-form-utils-map` package, which tsup's `preserveModules` build left as an unresolved bare specifier in `dist/fields/fieldValidation.js` — breaking `COORDINATE`/`GEOJSON` field validation for consuming apps. The coordinate/GeoJSON validators are now duplicated locally (matching the existing pattern in `@nnkogift/dhis2-form-utils-metadata`) so `hooks` no longer depends on the map package at all.

    Internally, `@nnkogift/dhis2-form-utils-map` is now a source-only (JIT) package with no build step of its own — `dhis2-ui`/`mantine`/`mui` compile its TypeScript source directly as part of their own bundles, removing the build-order dependency on a separately-built `dist/`.

- Updated dependencies []:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.2
    - @nnkogift/dhis2-form-utils-rules@0.1.0-alpha.2

## 0.1.0-alpha.1

### Minor Changes

- [#31](https://github.com/nnkogift/dhis2-form-utils/pull/31) [`2ed1bc2`](https://github.com/nnkogift/dhis2-form-utils/commit/2ed1bc2f605285daf6c44ef7330f9e07b2f61fbd) Thanks [@github-actions](https://github.com/apps/github-actions)! - Add coordinate, geoJson, orgUnit, file, and image field widgets across all UI adapters, backed by a new internal MapLibre-based map picker.

### Patch Changes

- [#31](https://github.com/nnkogift/dhis2-form-utils/pull/31) [`2ed1bc2`](https://github.com/nnkogift/dhis2-form-utils/commit/2ed1bc2f605285daf6c44ef7330f9e07b2f61fbd) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fall back to the MOBILE render type hint when DESKTOP is not configured for a data element.

- [#31](https://github.com/nnkogift/dhis2-form-utils/pull/31) [`2ed1bc2`](https://github.com/nnkogift/dhis2-form-utils/commit/2ed1bc2f605285daf6c44ef7330f9e07b2f61fbd) Thanks [@github-actions](https://github.com/apps/github-actions)! - Add missing `SCHEDULEEVENT`/`CREATEEVENT` to `ProgramRuleActionType`.

- Updated dependencies [[`2ed1bc2`](https://github.com/nnkogift/dhis2-form-utils/commit/2ed1bc2f605285daf6c44ef7330f9e07b2f61fbd), [`2ed1bc2`](https://github.com/nnkogift/dhis2-form-utils/commit/2ed1bc2f605285daf6c44ef7330f9e07b2f61fbd), [`2ed1bc2`](https://github.com/nnkogift/dhis2-form-utils/commit/2ed1bc2f605285daf6c44ef7330f9e07b2f61fbd), [`2ed1bc2`](https://github.com/nnkogift/dhis2-form-utils/commit/2ed1bc2f605285daf6c44ef7330f9e07b2f61fbd)]:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.1
    - @nnkogift/dhis2-form-utils-rules@0.1.0-alpha.1

## 0.1.0-alpha.0

### Minor Changes

- [#27](https://github.com/nnkogift/dhis2-form-utils/pull/27) [`ced4fb6`](https://github.com/nnkogift/dhis2-form-utils/commit/ced4fb6f81884f14cba7081e4de34d03e1e5bc71) Thanks [@nnkogift](https://github.com/nnkogift)! - Initial publishable package setup under `@nnkogift/dhis2-form-utils-*` with dual ESM/CJS builds, tree-shakeable core packages, and Changesets release tooling.

### Patch Changes

- Updated dependencies [[`ced4fb6`](https://github.com/nnkogift/dhis2-form-utils/commit/ced4fb6f81884f14cba7081e4de34d03e1e5bc71)]:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.0
    - @nnkogift/dhis2-form-utils-rules@0.1.0-alpha.0
