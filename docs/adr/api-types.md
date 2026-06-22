# ADR: Use `@dhis2/api-types` for DHIS2 REST API shapes

## Status

Accepted

## Context

DHIS2 metadata types were hand-written in `@dhis2-form-utils/metadata`. This duplicated the
official OpenAPI schema, drifted from the API, and covered only a subset of `ValueType` values.

## Decision

1. Add `@dhis2/api-types` v43 as a dev dependency of `@dhis2-form-utils/metadata` and
   `@dhis2-form-utils/hooks`.
2. Import schema types from `@dhis2/api-types/v43` (or unversioned default, which resolves to v43).
3. Use `PickWithFieldFilters` from `@dhis2/api-types/utils` with `as const` field arrays in
   [`packages/metadata/src/fieldFilters.ts`](../../packages/metadata/src/fieldFilters.ts) so query
   `fields` parameters and TypeScript types stay aligned.
4. Re-export `ValueType` from api-types; remove the local `Dhis2ValueType` enum.
5. Keep runtime const objects for `ProgramRuleActionType` and `ProgramRuleVariableSourceType`
   where the rules package needs `Object.values()` for dispatch sets.

## When to extend manually

- Runtime rule-evaluation shapes (`FieldState`, `FieldStateMap`) in `@dhis2-form-utils/rules`.
- Normalised consumer types (`FieldConfig`) in `@dhis2-form-utils/hooks` that deliberately differ
  from API shapes.
- Fields not yet in the OpenAPI spec — document the gap and extend locally until api-types catches up.

## Consequences

- Types may mark API fields as optional; normalisers must apply defaults.
- Storybook uses `apiVersion: 41` against debug.dhis2.org while types target v43; tolerate missing
  fields at runtime.
