# @nnkogift/dhis2-form-utils-rules

## 0.1.0-alpha.8

### Patch Changes

- Updated dependencies []:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.8

## 0.1.0-alpha.7

### Patch Changes

- Updated dependencies []:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.7

## 0.1.0-alpha.6

### Patch Changes

- [`39cf4c8`](https://github.com/nnkogift/dhis2-form-utils/commit/39cf4c808ddb0640304883b398d849667a80273e) Thanks [@nnkogift](https://github.com/nnkogift)! - Fetch and pass through the `programStage` target for `HIDEPROGRAMSTAGE` program rule actions. Previously `PROGRAM_RULE_ACTION_FIELDS` never requested this field and `toActionValues` never read it, so `HIDEPROGRAMSTAGE` actions reached `@dhis2/rule-engine` with no target regardless of whether the rule's condition matched.

- Updated dependencies [[`39cf4c8`](https://github.com/nnkogift/dhis2-form-utils/commit/39cf4c808ddb0640304883b398d849667a80273e)]:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.6

## 0.1.0-alpha.5

### Patch Changes

- Updated dependencies []:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.5

## 0.1.0-alpha.4

### Patch Changes

- Updated dependencies []:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.4

## 0.1.0-alpha.3

### Patch Changes

- Updated dependencies [[`12f537f`](https://github.com/nnkogift/dhis2-form-utils/commit/12f537f968a0b01e5f7264eda2c7c543b38e4154)]:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.3

## 0.1.0-alpha.2

### Patch Changes

- Updated dependencies []:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.2

## 0.1.0-alpha.1

### Patch Changes

- [#31](https://github.com/nnkogift/dhis2-form-utils/pull/31) [`2ed1bc2`](https://github.com/nnkogift/dhis2-form-utils/commit/2ed1bc2f605285daf6c44ef7330f9e07b2f61fbd) Thanks [@github-actions](https://github.com/apps/github-actions)! - Add missing `SCHEDULEEVENT`/`CREATEEVENT` to `ProgramRuleActionType`.

- Updated dependencies [[`2ed1bc2`](https://github.com/nnkogift/dhis2-form-utils/commit/2ed1bc2f605285daf6c44ef7330f9e07b2f61fbd), [`2ed1bc2`](https://github.com/nnkogift/dhis2-form-utils/commit/2ed1bc2f605285daf6c44ef7330f9e07b2f61fbd), [`2ed1bc2`](https://github.com/nnkogift/dhis2-form-utils/commit/2ed1bc2f605285daf6c44ef7330f9e07b2f61fbd), [`2ed1bc2`](https://github.com/nnkogift/dhis2-form-utils/commit/2ed1bc2f605285daf6c44ef7330f9e07b2f61fbd)]:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.1

## 0.1.0-alpha.0

### Minor Changes

- [#27](https://github.com/nnkogift/dhis2-form-utils/pull/27) [`ced4fb6`](https://github.com/nnkogift/dhis2-form-utils/commit/ced4fb6f81884f14cba7081e4de34d03e1e5bc71) Thanks [@nnkogift](https://github.com/nnkogift)! - Initial publishable package setup under `@nnkogift/dhis2-form-utils-*` with dual ESM/CJS builds, tree-shakeable core packages, and Changesets release tooling.

### Patch Changes

- Updated dependencies [[`ced4fb6`](https://github.com/nnkogift/dhis2-form-utils/commit/ced4fb6f81884f14cba7081e4de34d03e1e5bc71)]:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.0
