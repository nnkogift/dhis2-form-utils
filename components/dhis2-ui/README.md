# @nnkogift/dhis2-form-utils-dhis2-ui

DHIS2 UI field components and forms for dhis2-form-utils.

> Part of [dhis2-form-utils](https://github.com/nnkogift/dhis2-form-utils#readme). This package is in alpha — APIs may change between releases.

## Install

```bash
pnpm add @nnkogift/dhis2-form-utils-dhis2-ui @nnkogift/dhis2-form-utils-hooks
pnpm add react react-hook-form @dhis2/app-runtime @dhis2/ui
```

## Usage

```tsx
import { FormStateProvider, useEventForm } from '@nnkogift/dhis2-form-utils-hooks';
import { D2Field } from '@nnkogift/dhis2-form-utils-dhis2-ui';

const { form, formStore } = useEventForm({ options: { programStageId, metadata } });

return (
    <FormStateProvider formStore={formStore} form={form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            {stage.programStageDataElements.map((psde) => (
                <D2Field key={psde.dataElement.id} field={{ kind: 'dataElement', config: psde }} />
            ))}
        </form>
    </FormStateProvider>
);
```

Exports: `D2Field` (picks the right widget for each field), `FormSection` and `FormFeedback`.

## Documentation

Full documentation lives in the [dhis2-form-utils repository](https://github.com/nnkogift/dhis2-form-utils#readme) and its [docs folder](https://github.com/nnkogift/dhis2-form-utils/tree/main/docs).

## License

MIT
