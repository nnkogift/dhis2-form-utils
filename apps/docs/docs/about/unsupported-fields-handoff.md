# Unsupported field widgets (implementation handoff)

Specialist DHIS2 `valueType`s — `COORDINATE`, `ORGANISATION_UNIT`, `FILE_RESOURCE`, and
`IMAGE` — still render the disabled `D2UnsupportedField` stub in every UI adapter.
`REFERENCE` stays unsupported on purpose.

The full implementation handoff (value shapes, upload lifecycle, org-unit data strategy,
Storybook/MSW notes, acceptance criteria, and a copy-paste agent prompt) lives in the
repository design docs:

[`docs/unsupported-fields-handoff.md`](https://github.com/nnkogift/dhis2-form-utils/blob/main/docs/unsupported-fields-handoff.md)

Recommended slice order: **coordinate → orgUnit → file → image**.
