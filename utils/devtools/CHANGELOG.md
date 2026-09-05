# @nnkogift/dhis2-form-utils-devtools

## 0.1.0-alpha.8

### Minor Changes

- [`9c0e18d`](https://github.com/nnkogift/dhis2-form-utils/commit/9c0e18de0e8b45ff422022cbffbc911da738976c) Thanks [@nnkogift](https://github.com/nnkogift)! - Rule details modal now shows a human-readable reading of the condition expression, fetched from the same DHIS2 `programRules/condition/description` endpoint the Maintenance app uses, rather than reimplementing expression parsing client-side. Renders between the raw condition and the existing "Variables referenced" chips, with loading and malformed-expression states.

- [`9c0e18d`](https://github.com/nnkogift/dhis2-form-utils/commit/9c0e18de0e8b45ff422022cbffbc911da738976c) Thanks [@nnkogift](https://github.com/nnkogift)! - The read-only rule details modal footer now links to the actual program rule editor instead of just naming it. It resolves to the Maintenance app on DHIS2 v42 and below, or the Metadata Management app on v43+, based on the connected server's version via `useConfig`.

### Patch Changes

- Updated dependencies []:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.8
    - @nnkogift/dhis2-form-utils-hooks@0.1.0-alpha.8

## 0.1.0-alpha.7

### Patch Changes

- Updated dependencies []:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.7
    - @nnkogift/dhis2-form-utils-hooks@0.1.0-alpha.7

## 0.1.0-alpha.6

### Minor Changes

- [`c9612c9`](https://github.com/nnkogift/dhis2-form-utils/commit/c9612c9e7941c063b81c1af33ca0e49582b6a9b8) Thanks [@nnkogift](https://github.com/nnkogift)! - Code-split the Graph tab (`@xyflow/react`) behind `React.lazy`, switch the package to `preserveModules`, and add `./effect-styles` and `./scope` subpath exports so badge helpers and the scope wrapper no longer pull the graph stack.

- [`6a58a5e`](https://github.com/nnkogift/dhis2-form-utils/commit/6a58a5e9c6512d500b1103616bd0cac01ef9d66b) Thanks [@nnkogift](https://github.com/nnkogift)! - `RulesPanel`'s Rules tab gains an "In scope" / "All" segmented control that filters (or, in "All", dims and labels) rules against the form currently on screen, plus a new optional `activeProgramStageId` prop so a host app can tell the panel which slot is visible when that isn't implied by the `metadata` prop alone (e.g. a tracker/registration context navigating between stages).

    Scope is strict and form-relative, not a mirror of how the DHIS2 rule engine itself evaluates rules: a rule with no `programStage` is in scope only while the registration/enrollment slot is being viewed, and a rule with a `programStage` is in scope only while that exact stage is being viewed — never both, never everywhere. Out-of-scope cards show an "Applies to registration" or "Applies to {{stage}}" caption depending on which side of that split they're on.

### Patch Changes

- Updated dependencies [[`39cf4c8`](https://github.com/nnkogift/dhis2-form-utils/commit/39cf4c808ddb0640304883b398d849667a80273e)]:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.6
    - @nnkogift/dhis2-form-utils-hooks@0.1.0-alpha.6

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
