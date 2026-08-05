# `@nnkogift/dhis2-form-utils-dhis2-ui`

Field components and form building blocks for [`@dhis2/ui`](https://ui.dhis2.nu/) — the design
system used by DHIS2's own web apps. `@dhis2/ui` is a peer dependency.

```bash
pnpm add @nnkogift/dhis2-form-utils-dhis2-ui @dhis2/ui
```

## Exports

```ts
function D2Field(props: D2FieldProps): JSX.Element | null;
function D2FieldWidget(props: D2FieldWidgetProps): JSX.Element | null;

type D2FieldProps = { field: FieldControlInput };
type D2FieldWidgetProps = { control: FieldControlReturn };

function FormSection(props: FormSectionProps): JSX.Element;
type FormSectionProps = { sectionId: string; children: React.ReactNode };

function FormFeedback(): JSX.Element | null;
```

`D2Field` is a dispatcher: it calls `useFieldControl` internally and routes to the right widget
by `widgetKind`, returning `null` when the field is hidden by a rule. `D2FieldWidget` is the
lower-level piece `D2Field` delegates to — useful if you already have a `FieldControlReturn` and
just want the rendered widget.

`FormSection` wraps a group of fields and subscribes to that section's `hidden` state via
`useSectionState` — render nothing (and thus hide the whole group) when a `HIDESECTION` rule
fires for it. `FormFeedback` renders the `DISPLAYTEXT`/`DISPLAYKEYVALUEPAIR` feedback panel from
`useFormFeedback()`.

## Usage

```tsx
import { D2Field, FormSection, FormFeedback } from '@nnkogift/dhis2-form-utils-dhis2-ui';

<FormStateProvider formStore={formStore} form={form}>
    <FormSection sectionId={section.id}>
        {section.dataElements.map((psde) => (
            <D2Field key={psde.dataElement.id} field={{ kind: 'dataElement', config: psde }} />
        ))}
    </FormSection>
    <FormFeedback />
</FormStateProvider>;
```

See [Build your first event form](../tutorial/build-your-first-event-form.md) for the full setup,
and the [Storybook](https://nnkogift.github.io/dhis2-form-utils/storybook/) for every widget rendered in isolation.
