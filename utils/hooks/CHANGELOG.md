# @nnkogift/dhis2-form-utils-hooks

## 0.1.0-alpha.14

### Patch Changes

- Updated dependencies []:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.14
    - @nnkogift/dhis2-form-utils-rules@0.1.0-alpha.14

## 0.1.0-alpha.13

### Patch Changes

- Updated dependencies [[`aef0f8a`](https://github.com/nnkogift/dhis2-form-utils/commit/aef0f8a272576fae9a17bfb2739fc05ce8aa4f95)]:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.13
    - @nnkogift/dhis2-form-utils-rules@0.1.0-alpha.13

## 0.1.0-alpha.12

### Patch Changes

- [`3dad11a`](https://github.com/nnkogift/dhis2-form-utils/commit/3dad11a50b4b9a37a0a30266b9ddd4374f9185b3) Thanks [@nnkogift](https://github.com/nnkogift)! - docs: add README to each published package so it shows on npm

- Updated dependencies [[`3dad11a`](https://github.com/nnkogift/dhis2-form-utils/commit/3dad11a50b4b9a37a0a30266b9ddd4374f9185b3)]:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.12
    - @nnkogift/dhis2-form-utils-rules@0.1.0-alpha.12

## 0.1.0-alpha.11

### Minor Changes

- [#50](https://github.com/nnkogift/dhis2-form-utils/pull/50) [`81c54b7`](https://github.com/nnkogift/dhis2-form-utils/commit/81c54b76af2ce130021e374d61fbd800bedc6f40) Thanks [@nnkogift](https://github.com/nnkogift)! - Field schemas are now derived from the full field configuration through one shared `buildFieldSchema` used by `buildSchema` and `buildTrackerSchema`. It enforces `compulsory` / `mandatory` (not for `generated` TEAs), `allowFutureDate`, option-set codes and numeric `renderType` bounds (`min`, `max`, `decimalPoints`).

    Behaviour change: form inputs stay strings, but the schema output is now typed (numbers, booleans, strings; `undefined` when empty) instead of using `z.coerce`. Use the new `toPayloadValues` to serialize parsed values back to the strings DHIS2 expects. `buildFieldSchema` in the hooks package is now a thin adapter over the metadata one.

    Schema error messages are now human-friendly (for example "Enter a valid number" instead of "Expected number, received nan") and translated at validation time via `@dhis2/d2-i18n`, which becomes a peer dependency of `@nnkogift/dhis2-form-utils-metadata`.

### Patch Changes

- Updated dependencies [[`81c54b7`](https://github.com/nnkogift/dhis2-form-utils/commit/81c54b76af2ce130021e374d61fbd800bedc6f40)]:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.11
    - @nnkogift/dhis2-form-utils-rules@0.1.0-alpha.11

## 0.1.0-alpha.10

### Patch Changes

- [#47](https://github.com/nnkogift/dhis2-form-utils/pull/47) [`8ff642f`](https://github.com/nnkogift/dhis2-form-utils/commit/8ff642f96b68849e03495214e7e034ee975a0e2f) Thanks [@nnkogift](https://github.com/nnkogift)! - fix: record untargeted rule effects (SENDMESSAGE, SCHEDULEMESSAGE, SCHEDULEEVENT, CREATEEVENT) in the rule trace

- Updated dependencies [[`8ff642f`](https://github.com/nnkogift/dhis2-form-utils/commit/8ff642f96b68849e03495214e7e034ee975a0e2f), [`6475a15`](https://github.com/nnkogift/dhis2-form-utils/commit/6475a1518d7e905ca85874819bd93890df40f656), [`825de03`](https://github.com/nnkogift/dhis2-form-utils/commit/825de03318ad525b8557e3784185a9745d7afb8a), [`a10c08b`](https://github.com/nnkogift/dhis2-form-utils/commit/a10c08b6744bf05bd365eec22583aed1e415b22d), [`2312105`](https://github.com/nnkogift/dhis2-form-utils/commit/231210546e06148259f717494acdc26a9083721b)]:
    - @nnkogift/dhis2-form-utils-rules@0.1.0-alpha.10
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.10

## 0.1.0-alpha.9

### Patch Changes

- Updated dependencies []:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.9
    - @nnkogift/dhis2-form-utils-rules@0.1.0-alpha.9

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
