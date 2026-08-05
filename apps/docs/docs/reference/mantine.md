# `@nnkogift/dhis2-form-utils-mantine`

Field components and form building blocks for [Mantine](https://mantine.dev/). `@mantine/core`
(and `@mantine/dates`/`@mantine/hooks` where relevant) are peer dependencies.

```bash
pnpm add @nnkogift/dhis2-form-utils-mantine @mantine/core @mantine/hooks
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
a Mantine-specific widget per `widgetKind`, `FormSection` hides its children when the section is
rule-hidden, `FormFeedback` renders the feedback/indicator panel. Only the underlying widget
implementations differ between adapters; the hooks and rule-state contract is identical.

## Usage

```tsx
import { D2Field, FormSection, FormFeedback } from '@nnkogift/dhis2-form-utils-mantine';
import { MantineProvider } from '@mantine/core';

<MantineProvider>
    <FormStateProvider formStore={formStore} form={form}>
        <FormSection sectionId={section.id}>
            {section.dataElements.map((psde) => (
                <D2Field key={psde.dataElement.id} field={{ kind: 'dataElement', config: psde }} />
            ))}
        </FormSection>
        <FormFeedback />
    </FormStateProvider>
</MantineProvider>;
```

See the [Storybook](https://nnkogift.github.io/dhis2-form-utils/storybook/) for every Mantine widget rendered in isolation.
