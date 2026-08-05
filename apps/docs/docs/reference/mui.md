# `@nnkogift/dhis2-form-utils-mui`

Field components and form building blocks for [Material UI](https://mui.com/). `@mui/material`
(and `@mui/x-date-pickers` for date fields) are peer dependencies.

```bash
pnpm add @nnkogift/dhis2-form-utils-mui @mui/material @mui/x-date-pickers @emotion/react @emotion/styled
```

## Exports

```ts
function D2Field(props: D2FieldProps): JSX.Element | null;
type D2FieldProps = { field: FieldControlInput };

function FormSection(props: FormSectionProps): JSX.Element;
type FormSectionProps = { sectionId: string; children: React.ReactNode };

function FormFeedback(): JSX.Element | null;
```

Same contract as [`@nnkogift/dhis2-form-utils-dhis2-ui`](./dhis2-ui.md) — `D2Field` dispatches to
a Material UI widget per `widgetKind`, `FormSection` hides its children when the section is
rule-hidden, `FormFeedback` renders the feedback/indicator panel.

## Usage

```tsx
import { D2Field, FormSection, FormFeedback } from '@nnkogift/dhis2-form-utils-mui';

<FormStateProvider formStore={formStore} form={form}>
    <FormSection sectionId={section.id}>
        {section.dataElements.map((psde) => (
            <D2Field key={psde.dataElement.id} field={{ kind: 'dataElement', config: psde }} />
        ))}
    </FormSection>
    <FormFeedback />
</FormStateProvider>;
```

See the [Storybook](https://nnkogift.github.io/dhis2-form-utils/storybook/) for every Material UI widget rendered in
isolation.
