# Filter hidden fields before submission

Program rules can hide fields (`HIDEFIELD`), hide individual options (`HIDEOPTION`,
`HIDEOPTIONGROUP`), and programmatically assign values (`ASSIGN`). None of this is applied to the
raw values React Hook Form holds — `filterPayload` from `@nnkogift/dhis2-form-utils-rules` is what
turns raw form values into a payload that's safe to submit.

## Basic usage

```tsx
import { filterPayload } from '@nnkogift/dhis2-form-utils-rules';

const onSubmit = form.handleSubmit((values) => {
    const payload = filterPayload(values, formStore.fieldStore.getSnapshot());
    mutate(payload);
});
```

`filterPayload(values, fieldState)`:

- Removes any key whose `FieldState.hidden` is `true` — a hidden field must never be submitted,
  even if the user filled it in before a rule hid it.
- Substitutes any field's value with its `assignedValue` when a rule has set one via `ASSIGN`.

## Also filtering hidden options

If the form's metadata includes option sets governed by `HIDEOPTION`/`HIDEOPTIONGROUP` rules, pass
the resolved `optionGroups` map as a third argument so `filterPayload` can null out a submitted
value that references an option currently hidden by a rule:

```tsx
const payload = filterPayload(values, formStore.fieldStore.getSnapshot(), formStore.optionGroups);
```

Without the third argument, `filterPayload` still strips hidden _fields_ correctly — it just can't
detect a stale value pointing at a now-hidden _option_ within a still-visible field. Populate
`formStore.optionGroups` by passing `optionGroups` (from `extractReferencedOptionGroupIds` +
`optionGroupsQuery` + `resolveOptionGroups`, all from `@nnkogift/dhis2-form-utils-metadata`) into
`useEventForm`/`useTrackerForm`'s options — see the
[metadata reference](../reference/metadata.md#option-groups-for-hideoptiongroup) for the full fetch.

## Why this can't happen automatically

React Hook Form's values object is the single source of truth for what's _typed_, not what's
currently _valid to submit_ — a field can hold a value from before it was hidden, or before its
selected option was hidden. `filterPayload` is a pure function over the current values and the
current `FieldStateMap` snapshot, called once at submission time — it doesn't run on every
keystroke, so it adds no overhead to typing.
