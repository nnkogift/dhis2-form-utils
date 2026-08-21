# @nnkogift/dhis2-form-utils-devtools

## 0.1.0-alpha.5

### Minor Changes

- [`cd2bf5a`](https://github.com/nnkogift/dhis2-form-utils/commit/cd2bf5a4ffd83a28452daf2093756c11bfed9fce) Thanks [@nnkogift](https://github.com/nnkogift)! - Add a read-only rule details modal to the Rules panel, opened from an info button on each rule card. It lazily fetches the full `programRules/{id}` resource when opened (showing a loading spinner) — code, description, program, stage, priority, last-updated info, the raw condition with typed variable chips resolved against `programRuleVariables`, and every action's target/expression/content — so the catalog list query stays lightweight. Requires `@dhis2/app-runtime` as a peer dependency.

- [`aeec7ab`](https://github.com/nnkogift/dhis2-form-utils/commit/aeec7abf3a4cdcdfb61d97e0becb019db4dd6144) Thanks [@nnkogift](https://github.com/nnkogift)! - Sort firing rules to the top of the Rules panel list, with a FLIP-style transform animation (respecting `prefers-reduced-motion`) so cards visibly slide into place as their firing state changes.

### Patch Changes

- Updated dependencies []:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.5
    - @nnkogift/dhis2-form-utils-hooks@0.1.0-alpha.5

## 0.1.0-alpha.4

### Minor Changes

- [`ecb861a`](https://github.com/nnkogift/dhis2-form-utils/commit/ecb861aa2eb764465966b1345e39e0e8fe467d7b) Thanks [@nnkogift](https://github.com/nnkogift)! - Add an in-scope/all segmented control to the Rules panel header, so the Rules tab can be filtered down to only the current stage's rules (default) or show every rule in the program.

### Patch Changes

- Updated dependencies []:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.4
    - @nnkogift/dhis2-form-utils-hooks@0.1.0-alpha.4

## 0.1.0-alpha.3

### Patch Changes

- Updated dependencies [[`12f537f`](https://github.com/nnkogift/dhis2-form-utils/commit/12f537f968a0b01e5f7264eda2c7c543b38e4154)]:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.3
    - @nnkogift/dhis2-form-utils-hooks@0.1.0-alpha.3

## 0.1.0-alpha.2

### Patch Changes

- Updated dependencies [[`555194a`](https://github.com/nnkogift/dhis2-form-utils/commit/555194a2be7e867157959696251516bf938f9fe9)]:
    - @nnkogift/dhis2-form-utils-hooks@0.1.0-alpha.2
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.2

## 0.1.0-alpha.1

### Patch Changes

- [#31](https://github.com/nnkogift/dhis2-form-utils/pull/31) [`2ed1bc2`](https://github.com/nnkogift/dhis2-form-utils/commit/2ed1bc2f605285daf6c44ef7330f9e07b2f61fbd) Thanks [@github-actions](https://github.com/apps/github-actions)! - Bump `vitest` dev dependency to `^4.1.10`.

- Updated dependencies [[`2ed1bc2`](https://github.com/nnkogift/dhis2-form-utils/commit/2ed1bc2f605285daf6c44ef7330f9e07b2f61fbd), [`2ed1bc2`](https://github.com/nnkogift/dhis2-form-utils/commit/2ed1bc2f605285daf6c44ef7330f9e07b2f61fbd), [`2ed1bc2`](https://github.com/nnkogift/dhis2-form-utils/commit/2ed1bc2f605285daf6c44ef7330f9e07b2f61fbd), [`2ed1bc2`](https://github.com/nnkogift/dhis2-form-utils/commit/2ed1bc2f605285daf6c44ef7330f9e07b2f61fbd)]:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.1
    - @nnkogift/dhis2-form-utils-hooks@0.1.0-alpha.1

## 0.1.0-alpha.0

### Minor Changes

- [#27](https://github.com/nnkogift/dhis2-form-utils/pull/27) [`ced4fb6`](https://github.com/nnkogift/dhis2-form-utils/commit/ced4fb6f81884f14cba7081e4de34d03e1e5bc71) Thanks [@nnkogift](https://github.com/nnkogift)! - Initial publishable package setup under `@nnkogift/dhis2-form-utils-*` with dual ESM/CJS builds, tree-shakeable core packages, and Changesets release tooling.

### Patch Changes

- Updated dependencies [[`ced4fb6`](https://github.com/nnkogift/dhis2-form-utils/commit/ced4fb6f81884f14cba7081e4de34d03e1e5bc71)]:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.0
    - @nnkogift/dhis2-form-utils-hooks@0.1.0-alpha.0
