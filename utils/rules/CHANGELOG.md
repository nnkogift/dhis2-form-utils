# @nnkogift/dhis2-form-utils-rules

## 0.1.0-alpha.13

### Patch Changes

- Updated dependencies [[`aef0f8a`](https://github.com/nnkogift/dhis2-form-utils/commit/aef0f8a272576fae9a17bfb2739fc05ce8aa4f95)]:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.13

## 0.1.0-alpha.12

### Patch Changes

- [`3dad11a`](https://github.com/nnkogift/dhis2-form-utils/commit/3dad11a50b4b9a37a0a30266b9ddd4374f9185b3) Thanks [@nnkogift](https://github.com/nnkogift)! - docs: add README to each published package so it shows on npm

- Updated dependencies [[`3dad11a`](https://github.com/nnkogift/dhis2-form-utils/commit/3dad11a50b4b9a37a0a30266b9ddd4374f9185b3)]:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.12

## 0.1.0-alpha.11

### Patch Changes

- Updated dependencies [[`81c54b7`](https://github.com/nnkogift/dhis2-form-utils/commit/81c54b76af2ce130021e374d61fbd800bedc6f40)]:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.11

## 0.1.0-alpha.10

### Patch Changes

- [#47](https://github.com/nnkogift/dhis2-form-utils/pull/47) [`8ff642f`](https://github.com/nnkogift/dhis2-form-utils/commit/8ff642f96b68849e03495214e7e034ee975a0e2f) Thanks [@nnkogift](https://github.com/nnkogift)! - fix: record untargeted rule effects (SENDMESSAGE, SCHEDULEMESSAGE, SCHEDULEEVENT, CREATEEVENT) in the rule trace

- [#49](https://github.com/nnkogift/dhis2-form-utils/pull/49) [`6475a15`](https://github.com/nnkogift/dhis2-form-utils/commit/6475a1518d7e905ca85874819bd93890df40f656) Thanks [@nnkogift](https://github.com/nnkogift)! - fix: carry `programStage` onto rule effects so SCHEDULEEVENT/CREATEEVENT handlers know their target stage

- [#43](https://github.com/nnkogift/dhis2-form-utils/pull/43) [`825de03`](https://github.com/nnkogift/dhis2-form-utils/commit/825de03318ad525b8557e3784185a9745d7afb8a) Thanks [@nnkogift](https://github.com/nnkogift)! - Read the enrollment status for `V{enrollment_status}` from `currentValues.status` (`ACTIVE`, `COMPLETED` or `CANCELLED`) instead of hard-coding `ACTIVE`. Missing or unrecognised values still fall back to `ACTIVE`. This applies to both the registration engine and event forms that receive an `enrollment`. Callers must keep `status` out of submitted attribute values.

- [#41](https://github.com/nnkogift/dhis2-form-utils/pull/41) [`a10c08b`](https://github.com/nnkogift/dhis2-form-utils/commit/a10c08b6744bf05bd365eec22583aed1e415b22d) Thanks [@nnkogift](https://github.com/nnkogift)! - Resolve `V{event_date}` from `occurredAt` when `eventDate` is absent, so event forms that follow tracker API field naming no longer evaluate the event date as null.

- [#44](https://github.com/nnkogift/dhis2-form-utils/pull/44) [`2312105`](https://github.com/nnkogift/dhis2-form-utils/commit/231210546e06148259f717494acdc26a9083721b) Thanks [@nnkogift](https://github.com/nnkogift)! - Read the event status for `V{event_status}` from `currentValues.status` (`ACTIVE`, `COMPLETED`, `SCHEDULE`, `SKIPPED`, `VISITED` or `OVERDUE`) instead of hard-coding `ACTIVE`. Missing or unrecognised values still fall back to `ACTIVE`. Callers must keep `status` out of submitted data values.

- Updated dependencies []:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.10

## 0.1.0-alpha.9

### Patch Changes

- Updated dependencies []:
    - @nnkogift/dhis2-form-utils-metadata@0.1.0-alpha.9

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
