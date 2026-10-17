# @nnkogift/dhis2-form-utils-hooks

Headless React hooks for the DHIS2 form lifecycle: metadata, program rules and React Hook Form composed together.

> Part of [dhis2-form-utils](https://github.com/nnkogift/dhis2-form-utils#readme). This package is in alpha — APIs may change between releases.

## Install

```bash
pnpm add @nnkogift/dhis2-form-utils-hooks @nnkogift/dhis2-form-utils-metadata
pnpm add react react-hook-form @hookform/resolvers zod @dhis2/app-runtime @dhis2/rule-engine
```

Hooks must render inside a `@dhis2/app-runtime` `Provider`.

## Usage

```tsx
import {
    FormStateProvider,
    useEventForm,
    useEventProgramMetadataQuery,
    useFieldControl,
} from '@nnkogift/dhis2-form-utils-hooks';

const { metadata } = useEventProgramMetadataQuery(programId);

const { form, formStore } = useEventForm({
    options: { programStageId, metadata },
});

return (
    <FormStateProvider formStore={formStore} form={form}>
        {/* render fields with useFieldControl, or use a UI adapter */}
    </FormStateProvider>
);
```

- `useEventForm` — program stage event forms
- `useTrackerForm` — tracker registration forms
- `useFieldControl`, `useFieldState`, `useSectionState`, `useFormFeedback` — field, section and feedback state

Want ready-made fields? See the `dhis2-ui`, `mantine` and `mui` adapter packages.

## Documentation

Full documentation lives in the [dhis2-form-utils repository](https://github.com/nnkogift/dhis2-form-utils#readme) and its [docs folder](https://github.com/nnkogift/dhis2-form-utils/tree/main/docs).

## License

MIT
